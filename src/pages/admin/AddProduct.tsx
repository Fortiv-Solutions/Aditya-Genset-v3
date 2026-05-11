/**
 * AddProduct V2 — 3-phase workflow:
 * Phase A: Upload PDF or manual entry
 * Phase B: 11-slide review
 * Phase C: Publish
 */
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, FileText, PenLine, Loader2, AlertCircle, 
  CheckCircle2, Eye, Save, Upload, Trash2, Plus 
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { extractTextFromPdf, extractPdfAssets, extractProductDataWithAI, blobToBase64 } from "@/lib/pdfExtractor";
import { enhanceProductExtraction } from "@/lib/enhancedPdfExtractor";
import { detectTemplateFromText, detectTemplateFromBrand, getChapterKeys } from "@/lib/templateRegistry";
import { publishProductV2, getTemplateAssets } from "@/lib/api/productPublisher";
import { uploadImage } from "@/lib/api/storage";
import { SlideReviewer } from "@/components/admin/SlideReviewer/SlideReviewer";
import { EKL15_SHOWCASE } from "@/data/products";
import type { ChapterDataInput, SectionInput, PublishMediaInput, PublishFormInput } from "@/lib/api/productPublisher";
import type { TemplateId } from "@/lib/templateRegistry";

type Phase = "upload" | "review" | "publishing" | "done";

const DEFAULT_MEDIA: PublishMediaInput = {
  primaryImage: "", galleryImages: [], datasheetUrl: "",
  videoUrl: "", videoFile: null, videoThumbUrl: "",
};

const DEFAULT_FORM: PublishFormInput = {
  name: "", model: "", category: "silent-dg-sets", shortDesc: "", fullDesc: "",
  engineBrand: "escorts-kubota", type: "silent", kva: "", cpcb: "iv-plus",
  price: "", priceOnRequest: false, moq: "1", deliveryTime: "21",
  stock: "in_stock", seoTitle: "", metaDesc: "", tags: [],
};

const ESCORTS_CHAPTER_LABELS: Record<string, string> = {
  overview: "Overview", engine: "Engine", fuel: "Fuel, Lube & Cooling",
  alternator: "Alternator", electrical: "Electrical Performance", enclosure: "Enclosure & Sound",
  control: "Control Panel", protection: "Protection & Approvals", supply: "Standard Supply",
  dimensions: "Dimensions & Weight", video: "Product Video",
};

function buildDefaultSections(keys: readonly string[], form: PublishFormInput): SectionInput[] {
  return keys.map((k, i) => {
    const eklBaseline = EKL15_SHOWCASE.sections.find(s => s.id === k);
    return {
      id: k,
      number: String(i + 1).padStart(2, "0"),
      title: (k === "overview" && form.name) ? form.name : (ESCORTS_CHAPTER_LABELS[k] || k),
      imageUrl: eklBaseline?.image || "",
      videoUrl: eklBaseline?.videoUrl || "",
      altText: eklBaseline?.alt || "",
      tagline: eklBaseline?.tagline || "",
      displayOrder: i,
    };
  });
}

function buildChapterMapFromExtraction(enhanced: ReturnType<typeof enhanceProductExtraction>): Record<string, ChapterDataInput> {
  const map: Record<string, ChapterDataInput> = {};
  for (const ch of enhanced.chapters) {
    map[ch.id] = {
      specs: ch.specs, features: ch.features, badges: ch.badges,
      description: ch.description, aboutSpecs: ch.aboutSpecs, lubeSpecs: ch.lubeSpecs,
      coolingSpecs: ch.coolingSpecs, perfSpecs: ch.perfSpecs, reactanceData: ch.reactanceData,
      acousticDims: ch.acousticDims, openDims: ch.openDims, envSpecs: ch.envSpecs,
      engineParams: ch.engineParams, electricalParams: ch.electricalParams,
      electricalSpecs: ch.electricalSpecs, engineProtections: ch.engineProtections,
      electricalProtections: ch.electricalProtections, approvals: ch.approvals,
      standardItems: ch.standardItems, optionalItems: ch.optionalItems,
      optionalGroups: ch.optionalGroups, highlights: ch.highlights,
    };
  }
  map["video"] = {};
  return map;
}

export default function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [phase, setPhase] = useState<Phase>("upload");
  const [extracting, setExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId>("escorts");
  const [form, setForm] = useState<PublishFormInput>(DEFAULT_FORM);
  const [media, setMedia] = useState<PublishMediaInput>(DEFAULT_MEDIA);
  const [chapterDataMap, setChapterDataMap] = useState<Record<string, ChapterDataInput>>({});
  const [sections, setSections] = useState<SectionInput[]>([]);
  const [publishStatus, setPublishStatus] = useState<"idle"|"publishing"|"done"|"error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAndApplyEKL15Defaults = async (forceUpdateSections = false) => {
    try {
      const dbAssets = await getTemplateAssets("EKL 15");
      if (dbAssets) {
        setMedia(prev => ({
          ...prev,
          primaryImage: dbAssets.primaryImage || prev.primaryImage,
          galleryImages: dbAssets.galleryImages.length > 0 ? dbAssets.galleryImages : prev.galleryImages,
          videoUrl: dbAssets.videoUrl || prev.videoUrl,
          videoThumbUrl: dbAssets.videoThumbUrl || prev.videoThumbUrl,
        }));

        if (forceUpdateSections) {
          setSections(prev => prev.map(s => ({
            ...s,
            imageUrl: s.imageUrl || dbAssets.primaryImage || ""
          })));
        }
      } else {
        // Fallback to static EKL15_SHOWCASE data
        setMedia(prev => ({
          ...prev,
          primaryImage: EKL15_SHOWCASE.hero || prev.primaryImage,
          videoUrl: EKL15_SHOWCASE.sections.find(s => s.id === "video")?.videoUrl || prev.videoUrl,
        }));
        
        if (forceUpdateSections) {
          setSections(prev => prev.map(s => {
            const staticMatch = EKL15_SHOWCASE.sections.find(ss => ss.id === s.id);
            return { ...s, imageUrl: s.imageUrl || staticMatch?.image || "" };
          }));
        }
      }
    } catch (err) {
      console.warn("Failed to apply EKL 15 defaults:", err);
    }
  };

  // Pre-load EKL 15 assets as global baseline on mount
  useEffect(() => {
    fetchAndApplyEKL15Defaults();
  }, []);

  const applyDefaultAssetsIfFound = async (modelName: string, kva: string) => {
    const isEKL15 = modelName.toLowerCase().includes("ekl 15") || kva === "15";
    if (isEKL15) {
      setExtractProgress("Applying EKL 15 baseline assets...");
      await fetchAndApplyEKL15Defaults(true);
    }
  };

  const handlePdfDrop = useCallback(async (file: File) => {
    if (!file.name.endsWith(".pdf")) { toast.error("Please upload a PDF file."); return; }
    setExtracting(true);
    setExtractProgress("Reading PDF...");
    try {
      const [rawText, assets] = await Promise.all([
        extractTextFromPdf(file),
        extractPdfAssets(file, 6),
      ]);

      setExtractProgress("Detecting template...");
      const detection = detectTemplateFromText(rawText, file.name);
      setTemplateId(detection.templateId);

      setExtractProgress("Running AI extraction...");
      const pageB64 = await Promise.all(assets.pageImages.slice(0, 4).map(img => blobToBase64(img.blob)));
      const extracted = await extractProductDataWithAI(rawText, file.name, pageB64, 3, setExtractProgress);

      setExtractProgress("Building showcase chapters...");
      const enhanced = enhanceProductExtraction(extracted, extracted.specs || []);

      const newForm: PublishFormInput = {
        ...DEFAULT_FORM,
        name: extracted.name || "",
        model: extracted.model || "",
        kva: extracted.kva || "",
        engineBrand: extracted.engineBrand || "escorts-kubota",
        cpcb: extracted.cpcb || "iv-plus",
        shortDesc: extracted.shortDesc || "",
        fullDesc: extracted.fullDesc || "",
        category: extracted.engineBrand?.includes("escort") ? "dg-sets-escort" : "silent-dg-sets",
      };

      const chapterKeys = getChapterKeys(detection.templateId);
      const chapterMap = buildChapterMapFromExtraction(enhanced);
      const defaultSections = buildDefaultSections(chapterKeys, newForm);

      setForm(newForm);
      setChapterDataMap(chapterMap);
      setSections(defaultSections);
      
      // Apply defaults if EKL 15
      await applyDefaultAssetsIfFound(newForm.model, newForm.kva);

      setPhase("review");
      toast.success(`Template detected: ${detection.templateId} (${detection.confidence} confidence)`);
    } catch (err: any) {
      toast.error(err.message || "Extraction failed");
    } finally {
      setExtracting(false);
      setExtractProgress("");
    }
  }, []);

  const handleManualStart = async () => {
    const det = detectTemplateFromBrand(form.engineBrand);
    setTemplateId(det.templateId);
    const keys = getChapterKeys(det.templateId);
    const defaultSections = buildDefaultSections(keys, form);
    
    setSections(defaultSections);
    setChapterDataMap({ video: {} });
    
    // Apply defaults if EKL 15
    await applyDefaultAssetsIfFound(form.model, form.kva);
    
    setPhase("review");
  };

  const handlePublish = async (status: "draft" | "published") => {
    setPublishStatus("publishing");
    const result = await publishProductV2({
      form, media, templateId, chapterDataMap, sections, status,
      existingProductId: id,
    });
    if (result.success) {
      setPublishStatus("done");
      toast.success(status === "published" ? "Product published!" : "Draft saved!");
      setTimeout(() => navigate("/admin/products"), 1200);
    } else {
      setPublishStatus("error");
      setErrorMsg(result.error || "Unknown error");
      toast.error(result.error || "Failed to publish");
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Unified Thin Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
        
        {/* Left Side: Back button & Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button onClick={() => navigate("/admin/products")}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-accent leading-none mb-0.5">Product Catalogue</p>
            <h1 className="text-sm font-bold text-foreground font-display leading-none">
              {id ? "Edit Product" : "Add New Product"}
            </h1>
          </div>
        </div>

        {/* Middle: Phases */}
        <div className="flex items-center justify-center gap-0 flex-1 min-w-0">
          {(["upload","review","done"] as Phase[]).map((p, i) => (
            <div key={p} className="flex items-center gap-0">
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                phase === p ? "text-accent bg-accent/10" : (["upload","review","done"].indexOf(phase) > i) ? "text-emerald-500" : "text-muted-foreground"
              }`}>
                {["upload","review","done"].indexOf(phase) > i
                  ? <CheckCircle2 size={12} />
                  : <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[8px]">{i+1}</span>
                }
                {p === "upload" ? "1. Upload / Setup" : p === "review" ? "2. Review Slides" : "3. Published"}
              </div>
              {i < 2 && <div className="w-4 h-px bg-border mx-1" />}
            </div>
          ))}
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
          {phase === "review" && (
            <>
              <button onClick={() => void handlePublish("draft")} disabled={publishStatus === "publishing"}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary border border-border rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors">
                <Save size={13} /> Save Draft
              </button>
              <button onClick={() => void handlePublish("published")} disabled={publishStatus === "publishing"}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-accent hover:bg-accent/90 rounded-md text-[11px] font-bold text-accent-foreground disabled:opacity-70 transition-colors shadow-sm">
                {publishStatus === "publishing" ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
                {publishStatus === "publishing" ? "Publishing..." : "Publish"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {phase === "upload" && (
            <motion.div key="upload" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="h-full overflow-y-auto p-8">
              <UploadPhase
                form={form}
                setForm={setForm}
                extracting={extracting}
                extractProgress={extractProgress}
                onPdfDrop={handlePdfDrop}
                onManualStart={handleManualStart}
                media={media}
                setMedia={setMedia}
              />
            </motion.div>
          )}

          {phase === "review" && (
            <motion.div key="review" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full">
              <SlideReviewer
                templateId={templateId}
                chapterDataMap={chapterDataMap}
                sections={sections}
                media={media}
                productName={form.name}
                onChapterChange={(key, data) => setChapterDataMap(prev => ({ ...prev, [key]: data }))}
                onSectionChange={(key, patch) =>
                  setSections(prev => prev.map(s => s.id === key ? { ...s, ...patch } : s))
                }
                onMediaChange={(patch) => setMedia(prev => ({ ...prev, ...patch }))}
              />
            </motion.div>
          )}

          {publishStatus === "done" && (
            <motion.div key="done" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
              className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
                <p className="text-xl font-bold text-foreground">Product Published!</p>
                <p className="text-sm text-muted-foreground">Redirecting to products list...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Phase A upload component ───────────────────────────────────────────────────
function UploadPhase({
  form, setForm, extracting, extractProgress, onPdfDrop, onManualStart, media, setMedia
}: {
  form: PublishFormInput;
  setForm: (f: PublishFormInput) => void;
  extracting: boolean;
  extractProgress: string;
  onPdfDrop: (f: File) => void;
  onManualStart: () => void;
  media: PublishMediaInput;
  setMedia: (m: PublishMediaInput) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState<"pdf"|"manual">("pdf");
  const [uploading, setUploading] = useState(false);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "primary" | "gallery") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const toastId = toast.loading("Uploading to Supabase...");
    
    try {
      if (type === "primary") {
        const url = await uploadImage(files[0]);
        setMedia({ ...media, primaryImage: url });
        toast.success("Hero image uploaded", { id: toastId });
      } else {
        const urls = await Promise.all(Array.from(files).map(f => uploadImage(f)));
        setMedia({ ...media, galleryImages: [...media.galleryImages, ...urls] });
        toast.success(`${urls.length} images added to gallery`, { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onPdfDrop(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground font-display">How would you like to add this product?</h2>
        <p className="text-sm text-muted-foreground">Upload a PDF datasheet for AI-powered extraction, or start manually.</p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-3">
        {[{id:"pdf",icon:FileText,title:"Upload PDF Datasheet",desc:"AI extracts all data automatically"},{id:"manual",icon:PenLine,title:"Enter Manually",desc:"Fill in product data yourself"}].map(opt => (
          <button key={opt.id} onClick={() => setMode(opt.id as any)}
            className={`flex flex-col items-start gap-3 p-5 rounded-xl border-2 text-left transition-all ${
              mode === opt.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"
            }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode === opt.id ? "bg-accent/15" : "bg-secondary"}`}>
              <opt.icon size={20} className={mode === opt.id ? "text-accent" : "text-muted-foreground"} />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{opt.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {mode === "pdf" && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
            dragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"
          } ${extracting ? "opacity-60 pointer-events-none" : ""}`}
        >
          {extracting ? (
            <div className="space-y-4">
              <Loader2 size={32} className="animate-spin text-accent mx-auto" />
              <p className="text-sm font-medium text-foreground">{extractProgress}</p>
              <p className="text-xs text-muted-foreground">This may take 15–30 seconds...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
                <FileText size={24} className="text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Drop your PDF datasheet here</p>
                <p className="text-sm text-muted-foreground mt-1">or <label className="text-accent cursor-pointer hover:underline">
                  browse
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if(f) onPdfDrop(f); }} />
                </label></p>
              </div>
              <p className="text-xs text-muted-foreground">Gemini AI will extract product name, specs, features, and generate all 11 showcase chapters automatically.</p>
            </div>
          )}
        </div>
      )}

      {mode === "manual" && (
        <div className="space-y-4 bg-card border border-border rounded-xl p-5">
          <p className="text-sm font-semibold text-foreground">Basic Info</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {key:"name",label:"Product Name",ph:"e.g. 15 kVA Silent DG Set"},
              {key:"model",label:"Model Number",ph:"e.g. EKL 15-IV"},
              {key:"kva",label:"kVA Rating",ph:"15"},
              {key:"engineBrand",label:"Engine Brand",ph:"escorts-kubota"},
            ].map(f => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => setForm({...form,[f.key]:e.target.value})}
                  placeholder={f.ph}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 transition-all" />
              </div>
            ))}
          </div>
          <button onClick={onManualStart}
            className="w-full py-3 bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-xl text-sm transition-colors">
            Continue to Review Slides →
          </button>
        </div>
      )}

      {/* Global Media Assets (Hero & Gallery) */}
      <div className="space-y-4 bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Hero & Gallery Assets</p>
            <p className="text-xs text-muted-foreground mt-0.5">Stored securely in Supabase product-assets bucket</p>
          </div>
          {uploading && <Loader2 size={16} className="animate-spin text-accent" />}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Primary Hero Image */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Primary Hero Image</label>
            <div className="relative group aspect-video rounded-xl border border-border bg-muted/20 overflow-hidden flex items-center justify-center">
              {media.primaryImage ? (
                <>
                  <img src={media.primaryImage} className="w-full h-full object-cover" alt="Hero" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold border border-white/30 hover:bg-white/30 transition-all">
                      Change Image
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleMediaUpload(e, "primary")} />
                    </label>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                  <Upload size={20} />
                  <span className="text-[10px] font-medium">Upload Hero</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleMediaUpload(e, "primary")} />
                </label>
              )}
            </div>
          </div>

          {/* Gallery Images */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Product Gallery ({media.galleryImages.length})</label>
            <div className="grid grid-cols-3 gap-2">
              {media.galleryImages.map((url, i) => (
                <div key={i} className="aspect-square rounded-lg border border-border bg-muted/10 overflow-hidden relative group">
                  <img src={url} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                  <button onClick={() => setMedia({ ...media, galleryImages: media.galleryImages.filter((_, idx) => idx !== i) })}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-accent/40 flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground transition-all">
                <Plus size={16} />
                <span className="text-[9px] font-bold">Add</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleMediaUpload(e, "gallery")} />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
