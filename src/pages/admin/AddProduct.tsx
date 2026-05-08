import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  Cpu,
  Eye,
  Film,
  Image as ImageIcon,
  IndianRupee,
  Package,
  Plus,
  Save,
  Search as SearchIcon,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PDFImportZone } from "@/components/admin/PDFImportZone";
import type { ExtractedProduct, PdfImportPayload } from "@/lib/pdfExtractor";
import { supabase } from "@/lib/supabase";
import { updateCMSSection } from "@/lib/api/cms";
import {
  ensureProductCategory,
  generateProductAutomation,
  getEngineBrandLabel,
  inferCategorySlug,
  inferProductType,
  normalizeEngineBrandKey,
} from "@/lib/productAutomation";
import { uploadExtractedPdfAssets, uploadProductMediaFile } from "@/lib/productMediaUpload";

type ProductFormState = {
  name: string;
  model: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  engineBrand: string;
  type: string;
  kva: string;
  cpcb: string;
  price: string;
  moq: string;
  deliveryTime: string;
  stock: string;
  seoTitle: string;
  metaDesc: string;
  tags: string[];
};

type MediaState = {
  primaryImage: string;
  galleryUrls: string;
  datasheetUrl: string;
  videoUrl: string;
};

type SpecRow = {
  label: string;
  value: string;
};

const DEFAULT_SPECS: SpecRow[] = [
  { label: "Power Output (kVA)", value: "" },
  { label: "Engine Make & Model", value: "" },
  { label: "Alternator Brand", value: "" },
  { label: "Frequency (Hz)", value: "50 Hz" },
  { label: "Voltage Output", value: "415V / 3-phase" },
  { label: "Fuel Consumption (L/hr)", value: "" },
  { label: "Noise Level (dB @ 1m)", value: "" },
  { label: "Dimensions (LxWxH mm)", value: "" },
  { label: "Dry Weight (kg)", value: "" },
  { label: "CPCB Compliance", value: "IV+" },
  { label: "Warranty", value: "12 months" },
];

const DEFAULT_FORM: ProductFormState = {
  name: "",
  model: "",
  category: "silent-dg-sets",
  shortDesc: "",
  fullDesc: "",
  engineBrand: "baudouin",
  type: "silent",
  kva: "",
  cpcb: "iv-plus",
  price: "",
  moq: "1",
  deliveryTime: "21",
  stock: "in_stock",
  seoTitle: "",
  metaDesc: "",
  tags: [],
};

const DEFAULT_MEDIA: MediaState = {
  primaryImage: "",
  galleryUrls: "",
  datasheetUrl: "",
  videoUrl: "",
};

const CATEGORY_OPTIONS = [
  { value: "dg-sets-baudouin", label: "DG Sets / Baudouin" },
  { value: "dg-sets-escort", label: "DG Sets / Escort" },
  { value: "silent-dg-sets", label: "Silent DG Sets" },
  { value: "open-dg-sets", label: "Open DG Sets" },
  { value: "industrial", label: "Industrial DG Sets" },
  { value: "accessories", label: "Accessories & Parts" },
];

const TAG_OPTIONS = ["Hospital Grade", "CPCB IV+", "Weatherproof", "Export Quality", "AMF Ready", "Soundproof"];
const MAX_VIDEO_UPLOAD_BYTES = 50 * 1024 * 1024;
const MAX_VIDEO_UPLOAD_MB = Math.round(MAX_VIDEO_UPLOAD_BYTES / 1024 / 1024);

function FormSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card shadow-sm border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-secondary">
        <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
          <Icon size={14} className="text-accent" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Input({
  label,
  type = "text",
  placeholder,
  required,
  hint,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-all read-only:text-muted-foreground"
      />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Select({
  label,
  options,
  value,
  onChange,
  required,
}: {
  label: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/60 appearance-none cursor-pointer transition-all"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

function Textarea({
  label,
  placeholder,
  rows = 3,
  maxLen,
  hint,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  rows?: number;
  maxLen?: number;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
        {maxLen && (
          <span className={`text-[11px] ${value.length > maxLen * 0.9 ? "text-accent" : "text-muted-foreground"}`}>
            {value.length}/{maxLen}
          </span>
        )}
      </div>
      <textarea
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLen}
        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-all resize-none"
      />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SpecBuilder({
  specs,
  setSpecs,
}: {
  specs: SpecRow[];
  setSpecs: React.Dispatch<React.SetStateAction<SpecRow[]>>;
}) {
  const updateSpec = (index: number, field: "label" | "value", nextValue: string) => {
    setSpecs((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: nextValue } : row)));
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        <span>Specification Label</span>
        <span>Value</span>
      </div>
      {specs.map((spec, index) => (
        <div key={`${spec.label}-${index}`} className="flex gap-2 items-center group">
          <input
            type="text"
            value={spec.label}
            onChange={(event) => updateSpec(index, "label", event.target.value)}
            placeholder="e.g. Power Output"
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-all"
          />
          <input
            type="text"
            value={spec.value}
            onChange={(event) => updateSpec(index, "value", event.target.value)}
            placeholder="e.g. 62.5 kVA"
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-all"
          />
          <button
            type="button"
            onClick={() => setSpecs((current) => current.filter((_, rowIndex) => rowIndex !== index))}
            className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setSpecs((current) => [...current, { label: "", value: "" }])}
        className="flex items-center gap-2 px-3 py-2 text-xs text-accent border border-dashed border-accent/30 hover:border-accent/60 rounded-lg w-full justify-center transition-colors"
      >
        <Plus size={13} /> Add Specification Row
      </button>
    </div>
  );
}

import { uploadImage } from "@/lib/api/storage";

// ─── Image Upload Zone ────────────────────────────────────────────────────────
function ImageUploadZone({ 
  label, 
  hint, 
  value, 
  onChange,
  multiple = false 
}: { 
  label: string; 
  hint?: string;
  value?: string | string[];
  onChange: (v: string | string[]) => void;
  multiple?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      if (multiple) {
        const uploadPromises = Array.from(files).map(file => uploadImage(file));
        const urls = await Promise.all(uploadPromises);
        const currentUrls = Array.isArray(value) ? value : [];
        onChange([...currentUrls, ...urls]);
        toast.success(`Successfully uploaded ${urls.length} images`);
      } else {
        const url = await uploadImage(files[0]);
        onChange(url);
        toast.success("Primary image uploaded successfully");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      
      {/* Previews */}
      {!multiple && typeof value === "string" && value && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 group">
          <img src={value} alt="Primary" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={() => onChange("")}
              className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}

      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-3">
          {value.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-border">
              <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => onChange((value as string[]).filter((_, idx) => idx !== i))}
                  className="p-1.5 bg-red-500 rounded text-white hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className={`
        border-2 border-dashed border-border hover:border-accent/40 rounded-xl p-8 text-center transition-colors cursor-pointer group block
        ${isUploading ? "opacity-50 pointer-events-none" : ""}
      `}>
        <input 
          type="file" 
          className="hidden" 
          accept="image/*" 
          multiple={multiple}
          onChange={handleFileChange}
        />
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/10 transition-colors">
          <Upload size={18} className={`${isUploading ? "animate-bounce" : ""} text-muted-foreground group-hover:text-accent transition-colors`} />
        </div>
        <p className="text-sm text-muted-foreground group-hover:text-muted-foreground transition-colors">
          {isUploading ? "Uploading images..." : multiple ? "Add gallery images" : "Select primary image"}
        </p>
        {!isUploading && (
          <p className="text-xs text-muted-foreground mt-1">
            Drop images here or <span className="text-accent">browse</span>
          </p>
        )}
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </label>
    </div>
  );
}
export default function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const [priceOnRequest, setPriceOnRequest] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [specs, setSpecs] = useState<SpecRow[]>(DEFAULT_SPECS);
  const [media, setMedia] = useState<MediaState>(DEFAULT_MEDIA);
  const [form, setForm] = useState<ProductFormState>(DEFAULT_FORM);
  const [extractedData, setExtractedData] = useState<ExtractedProduct | null>(null);
  const [importPayload, setImportPayload] = useState<PdfImportPayload | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  const updateForm = (key: keyof ProductFormState, value: string | string[]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleTag = (tag: string) => {
    setForm((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((item) => item !== tag)
        : [...current.tags, tag],
    }));
  };

  const slugify = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleVideoFileChange = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a valid video file.");
      return;
    }

    if (file.size > MAX_VIDEO_UPLOAD_BYTES) {
      toast.error(`Video must be ${MAX_VIDEO_UPLOAD_MB} MB or smaller.`);
      return;
    }

    setVideoFile(file);
    setMedia((current) => ({ ...current, videoUrl: "" }));
  };

  const clearVideoFile = () => {
    setVideoFile(null);
  };

<<<<<<< HEAD
  useEffect(() => {
    if (!videoFile) {
      setVideoPreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(videoFile);
    setVideoPreviewUrl(nextPreviewUrl);

    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [videoFile]);

  useEffect(() => {
    if (!id) return;

    async function loadProduct() {
      try {
        const { data: product, error } = await supabase
          .from("products")
          .select("*, product_categories(slug), product_specs(spec_label, spec_value, display_order), product_media(kind, public_url, display_order)")
          .eq("id", id)
          .single();

        if (error) throw error;

        setPriceOnRequest(Boolean(product.price_on_request));
        setForm({
          name: product.name || "",
          model: product.model || "",
          category: product.product_categories?.slug || "silent-dg-sets",
          shortDesc: product.short_desc || "",
          fullDesc: product.full_desc || "",
          engineBrand: normalizeEngineBrandKey(product.engine_brand) === "other" ? "baudouin" : normalizeEngineBrandKey(product.engine_brand),
          type: product.type || "silent",
          kva: product.kva ? String(product.kva) : "",
          cpcb: product.cpcb === "II" || product.cpcb === "ii" ? "ii" : "iv-plus",
          price: product.price ? String(product.price) : "",
          moq: product.moq ? String(product.moq) : "1",
          deliveryTime: product.lead_time_days ? String(product.lead_time_days) : "21",
          stock: product.stock || "in_stock",
          seoTitle: product.seo_title || "",
          metaDesc: product.meta_desc || "",
          tags: Array.isArray(product.tags) ? product.tags : [],
        });

        const loadedSpecs = [...(product.product_specs || [])]
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
          .map((spec) => ({ label: spec.spec_label || "", value: spec.spec_value || "" }));
        if (loadedSpecs.length > 0) setSpecs(loadedSpecs);

        const productMedia = [...(product.product_media || [])].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        setMedia({
          primaryImage: productMedia.find((item) => item.kind === "primary")?.public_url || "",
          galleryUrls: productMedia
            .filter((item) => item.kind === "gallery")
            .map((item) => item.public_url)
            .filter(Boolean)
            .join("\n"),
          datasheetUrl: productMedia.find((item) => item.kind === "datasheet")?.public_url || "",
          videoUrl: productMedia.find((item) => item.kind === "video")?.public_url || "",
        });
      } catch (error) {
        console.error(error);
        toast.error("Unable to load product for editing");
        navigate("/admin/products");
      }
    }

    void loadProduct();
  }, [id, navigate]);

  const handleExtracted = (payload: PdfImportPayload) => {
    const data = payload.data;
    setImportPayload(payload);
    setExtractedData(data);
    const inferredBrand = normalizeEngineBrandKey(data.engineBrand || form.engineBrand);
    const inferredType = inferProductType(data.category, form.type);
    const inferredCategory = inferCategorySlug({
      brandKey: inferredBrand,
      type: inferredType,
      extractedCategory: data.category,
      selectedCategory: form.category,
    });

    setForm((current) => ({
      ...current,
      name: data.name || current.name,
      model: data.model || current.model,
      category: inferredCategory,
      kva: data.kva || current.kva,
      engineBrand: inferredBrand === "other" ? current.engineBrand : inferredBrand,
      type: inferredType,
      shortDesc: data.shortDesc || current.shortDesc,
      fullDesc: data.fullDesc || current.fullDesc,
      cpcb: data.cpcb === "ii" ? "ii" : "iv-plus",
      seoTitle: data.name ? `${data.name} | Aditya Tech Mech` : current.seoTitle,
      metaDesc: data.shortDesc || current.metaDesc,
    }));

    const extractedSpecs: SpecRow[] = [];
    if (data.engineModel) extractedSpecs.push({ label: "Engine Model", value: data.engineModel });
    if (data.alternatorBrand) extractedSpecs.push({ label: "Alternator Brand", value: data.alternatorBrand });
    if (data.application) extractedSpecs.push({ label: "Application", value: data.application });
    if (data.fuelConsumption) extractedSpecs.push({ label: "Fuel Consumption", value: data.fuelConsumption });
    if (data.fuelTankCapacity) extractedSpecs.push({ label: "Fuel Tank Capacity", value: data.fuelTankCapacity });
    if (data.noiseLevel) extractedSpecs.push({ label: "Noise Level", value: data.noiseLevel });
    if (data.dimensions) extractedSpecs.push({ label: "Dimensions (LxWxH)", value: data.dimensions });
    if (data.dryWeight) extractedSpecs.push({ label: "Dry Weight", value: data.dryWeight });
    if (data.voltage) extractedSpecs.push({ label: "Voltage Output", value: data.voltage });
    if (data.frequency) extractedSpecs.push({ label: "Frequency", value: data.frequency });
    if (data.phase) extractedSpecs.push({ label: "Phase", value: data.phase });
    if (data.powerFactor) extractedSpecs.push({ label: "Power Factor", value: data.powerFactor });
    if (data.coolingType) extractedSpecs.push({ label: "Cooling", value: data.coolingType });
    if (data.controllerModel) extractedSpecs.push({ label: "Controller", value: data.controllerModel });
    if (data.specs?.length) extractedSpecs.push(...data.specs);

    if (extractedSpecs.length > 0) {
      setSpecs(extractedSpecs);
    }

    toast.success(
      data.extractionSource === "local-fallback"
        ? "PDF extraction applied with local fallback. Review the fields before publishing."
        : "AI extraction applied. Review the fields and publish when ready."
    );
  };

  const saveProduct = async (status: "draft" | "published") => {
    if (!form.name || !form.model || !form.kva) {
      toast.error("Please fill in all required fields (Name, Model, kVA)");
      return;
    }

    const setLoading = status === "draft" ? setSavingDraft : setPublishing;
    setLoading(true);

    try {
      const slug = slugify(form.model || form.name);
      const draftAutomation = generateProductAutomation({
        form,
        specs,
        media,
        extracted: extractedData,
      });
      const categoryId = await ensureProductCategory(draftAutomation.categorySlug);

      const payload = {
        category_id: categoryId || null,
        status,
        type: draftAutomation.type,
        name: form.name.trim(),
        model: form.model.trim(),
        slug,
        kva: Number(form.kva),
        engine_brand: draftAutomation.brandLabel || getEngineBrandLabel(normalizeEngineBrandKey(form.engineBrand), form.engineBrand),
        cpcb: form.cpcb === "ii" ? "II" : "IV+",
        price: priceOnRequest || !form.price ? null : Number(form.price),
        price_on_request: priceOnRequest,
        moq: Number(form.moq || 1),
        lead_time_days: Number(form.deliveryTime || 21),
        stock: form.stock,
        short_desc: form.shortDesc || null,
        full_desc: form.fullDesc || null,
        tags: form.tags,
        seo_title: form.seoTitle || null,
        meta_desc: form.metaDesc || null,
        published_at: status === "published" ? new Date().toISOString() : null,
      };

      const query = id
        ? supabase.from("products").update(payload).eq("id", id).select("id").single()
        : supabase.from("products").insert(payload).select("id").single();

      const { data: savedProduct, error } = await query;
      if (error) throw error;

      const productId = savedProduct.id;
      const shouldUploadImportedAssets =
        Boolean(importPayload) &&
        (
          !media.primaryImage.trim() ||
          media.primaryImage.startsWith("blob:") ||
          !media.galleryUrls
            .split(/\r?\n/)
            .map((url) => url.trim())
            .filter(Boolean)
            .some((url) => !url.startsWith("blob:")) ||
          !media.datasheetUrl.trim() ||
          media.datasheetUrl.startsWith("blob:")
        );

      const uploadedAssets = shouldUploadImportedAssets && importPayload
        ? await uploadExtractedPdfAssets({
            productId,
            slug,
            assets: importPayload.assets,
          })
        : null;
      const uploadedVideo = videoFile
        ? await uploadProductMediaFile({
            productId,
            slug,
            file: videoFile,
            kind: "video",
          })
        : null;

      const resolvedMedia: MediaState = {
        primaryImage:
          media.primaryImage.trim() && !media.primaryImage.startsWith("blob:")
            ? media.primaryImage.trim()
            : uploadedAssets?.primaryImage?.publicUrl || media.primaryImage.trim(),
        galleryUrls: (() => {
          const manualGallery = media.galleryUrls
            .split(/\r?\n/)
            .map((url) => url.trim())
            .filter(Boolean)
            .filter((url) => !url.startsWith("blob:"));

          if (manualGallery.length > 0) return manualGallery.join("\n");
          return (uploadedAssets?.galleryImages || []).map((asset) => asset.publicUrl).join("\n");
        })(),
        datasheetUrl:
          media.datasheetUrl.trim() && !media.datasheetUrl.startsWith("blob:")
            ? media.datasheetUrl.trim()
            : uploadedAssets?.datasheet?.publicUrl || media.datasheetUrl.trim(),
        videoUrl: uploadedVideo?.publicUrl || media.videoUrl.trim(),
      };

      const { error: specDeleteError } = await supabase.from("product_specs").delete().eq("product_id", productId);
      if (specDeleteError) throw specDeleteError;

      const cleanSpecs = specs
        .filter((spec) => spec.label.trim() && spec.value.trim())
        .map((spec, index) => ({
          product_id: productId,
          spec_label: spec.label.trim(),
          spec_value: spec.value.trim(),
          display_order: index,
        }));

      if (cleanSpecs.length > 0) {
        const { error: specInsertError } = await supabase.from("product_specs").insert(cleanSpecs);
        if (specInsertError) throw specInsertError;
      }

      const { error: mediaDeleteError } = await supabase.from("product_media").delete().eq("product_id", productId);
      if (mediaDeleteError) throw mediaDeleteError;

      const mediaRows: Array<{
        product_id: string;
        kind: string;
        public_url: string;
        storage_path?: string | null;
        mime_type?: string | null;
        alt_text: string;
        display_order: number;
      }> = [];

      if (resolvedMedia.primaryImage.trim()) {
        mediaRows.push({
          product_id: productId,
          kind: "primary",
          public_url: resolvedMedia.primaryImage.trim(),
          storage_path: uploadedAssets?.primaryImage?.storagePath || null,
          mime_type: uploadedAssets?.primaryImage?.mimeType || null,
          alt_text: form.name.trim(),
          display_order: 0,
        });
      }

      resolvedMedia.galleryUrls
        .split(/\r?\n/)
        .map((url) => url.trim())
        .filter(Boolean)
        .forEach((url, index) => {
          const uploadedMatch = uploadedAssets?.galleryImages.find((asset) => asset.publicUrl === url);
          mediaRows.push({
            product_id: productId,
            kind: "gallery",
            public_url: url,
            storage_path: uploadedMatch?.storagePath || null,
            mime_type: uploadedMatch?.mimeType || null,
            alt_text: `${form.name.trim()} gallery ${index + 1}`,
            display_order: index + 1,
          });
        });

      if (resolvedMedia.datasheetUrl.trim()) {
        mediaRows.push({
          product_id: productId,
          kind: "datasheet",
          public_url: resolvedMedia.datasheetUrl.trim(),
          storage_path: uploadedAssets?.datasheet?.storagePath || null,
          mime_type: uploadedAssets?.datasheet?.mimeType || null,
          alt_text: `${form.name.trim()} datasheet`,
          display_order: 100,
        });
      }

      if (resolvedMedia.videoUrl.trim()) {
        mediaRows.push({
          product_id: productId,
          kind: "video",
          public_url: resolvedMedia.videoUrl.trim(),
          storage_path: uploadedVideo?.storagePath || null,
          mime_type: uploadedVideo?.mimeType || null,
          alt_text: `${form.name.trim()} video`,
          display_order: 101,
        });
      }

      if (mediaRows.length > 0) {
        const { error: mediaInsertError } = await supabase.from("product_media").insert(mediaRows);
        if (mediaInsertError) throw mediaInsertError;
      }

      const finalAutomation = generateProductAutomation({
        form,
        specs,
        media: resolvedMedia,
        extracted: extractedData,
      });

      await Promise.all([
        updateCMSSection("showcaseData", finalAutomation.showcaseData, "product", productId),
        updateCMSSection("presentationData", finalAutomation.presentationData, "product", productId),
      ]);

      toast.success(status === "published" ? "Product published successfully" : "Product saved as draft");
      navigate("/admin/products");
    } catch (error) {
      console.error(error);
      toast.error("Unable to save product");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="admin-page admin-page-narrow space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/products")}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Product Catalogue</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground font-display">{isEditing ? "Edit Product" : "Add New Product"}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isEditing ? "Update generator listing details" : "Create a new generator listing for the catalogue"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void saveProduct("draft")}
            disabled={savingDraft}
            className="flex items-center gap-1.5 px-4 py-2 bg-secondary border border-border rounded-lg text-sm font-medium text-muted-foreground transition-colors disabled:opacity-50"
          >
            <Save size={15} />
            {savingDraft ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={() => void saveProduct("published")}
            disabled={publishing}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 rounded-lg text-sm font-bold text-accent-foreground transition-colors disabled:opacity-70"
          >
            <Eye size={15} />
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      <div className="bg-card shadow-sm border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-secondary">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Sparkles size={14} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI PDF Import</h3>
            <p className="text-[11px] text-muted-foreground">Drop a client datasheet PDF to auto-fill the product form.</p>
          </div>
        </div>
        <div className="p-5">
          <PDFImportZone onExtracted={handleExtracted} />
          {importPayload && (
            <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-border bg-secondary/40 px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  PDF media automation is enabled for this product
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {importPayload.assets.pageImages.length} rendered page image{importPayload.assets.pageImages.length === 1 ? "" : "s"} and the source datasheet will upload on save/publish unless you switch back to manual media.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setImportPayload(null)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Use manual media instead
              </button>
            </div>
          )}
        </div>
      </div>

      <FormSection title="A. Basic Information" icon={Package}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Product Name" placeholder="e.g. 250 kVA Silent DG Set" required value={form.name} onChange={(value) => updateForm("name", value)} />
          <Input label="Model Number" placeholder="e.g. ATM-250S" required hint="Used to generate the public slug" value={form.model} onChange={(value) => updateForm("model", value)} />
          <Select
            label="Category"
            required
            value={form.category}
            onChange={(value) => updateForm("category", value)}
            options={CATEGORY_OPTIONS}
          />
          <Select
            label="Type"
            required
            value={form.type}
            onChange={(value) => updateForm("type", value)}
            options={[
              { value: "silent", label: "Silent (Acoustic Enclosure)" },
              { value: "open", label: "Open Frame" },
            ]}
          />
        </div>
        <div className="mt-4">
          <Textarea
            label="Short Description"
            placeholder="Industrial-grade reliability, whisper-quiet by design."
            maxLen={160}
            hint="Used for product cards and search snippets."
            value={form.shortDesc}
            onChange={(value) => updateForm("shortDesc", value)}
          />
        </div>
        <div className="mt-4">
          <Textarea
            label="Full Description"
            placeholder="Write a detailed product description..."
            rows={5}
            hint="Describe applications, features, and commercial positioning."
            value={form.fullDesc}
            onChange={(value) => updateForm("fullDesc", value)}
          />
        </div>
        <div className="mt-4 space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Tags</label>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                  form.tags.includes(tag)
                    ? "border-accent/60 bg-accent/10 text-accent"
                    : "border-border text-muted-foreground hover:border-accent/40 hover:text-accent hover:bg-accent/5"
                }`}
              >
                <Tag size={10} /> {tag}
              </button>
            ))}
          </div>
        </div>
      </FormSection>

      <FormSection title="B. Technical Specifications" icon={Cpu}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
          <Input label="Power Output (kVA)" placeholder="e.g. 250" required type="number" value={form.kva} onChange={(value) => updateForm("kva", value)} />
          <Select
            label="Engine Brand"
            required
            value={form.engineBrand}
            onChange={(value) => updateForm("engineBrand", value)}
            options={[
              { value: "baudouin", label: "Baudouin" },
              { value: "kubota", label: "Kubota" },
              { value: "escorts-kubota", label: "Escorts-Kubota" },
              { value: "kohler", label: "Kohler" },
              { value: "mahindra", label: "Mahindra" },
              { value: "cummins", label: "Cummins" },
            ]}
          />
          <Select
            label="CPCB Compliance"
            required
            value={form.cpcb}
            onChange={(value) => updateForm("cpcb", value)}
            options={[
              { value: "iv-plus", label: "CPCB IV+" },
              { value: "ii", label: "CPCB II" },
            ]}
          />
        </div>
        <SpecBuilder specs={specs} setSpecs={setSpecs} />
      </FormSection>

      <FormSection title="C. Pricing & Availability" icon={IndianRupee}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Base Price (INR, Ex-Works) <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rs</span>
              <input
                type="number"
                placeholder="695000"
                disabled={priceOnRequest}
                value={form.price}
                onChange={(event) => updateForm("price", event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 transition-all disabled:opacity-40"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={priceOnRequest}
                onChange={(event) => setPriceOnRequest(event.target.checked)}
                className="rounded border-border accent-amber-500"
              />
              <span className="text-xs text-muted-foreground">Price on Request</span>
            </label>
          </div>
          <Select
            label="Availability"
            required
            value={form.stock}
            onChange={(value) => updateForm("stock", value)}
            options={[
              { value: "in_stock", label: "In Stock" },
              { value: "on_order", label: "On Order" },
              { value: "discontinued", label: "Discontinued" },
            ]}
          />
          <Input label="Delivery Time (days)" placeholder="21" type="number" hint="Days from order to delivery" value={form.deliveryTime} onChange={(value) => updateForm("deliveryTime", value)} />
          <Input label="Minimum Order Quantity" placeholder="1" type="number" value={form.moq} onChange={(value) => updateForm("moq", value)} />
        </div>
      </FormSection>

      <FormSection title="D. Media" icon={ImageIcon}>
        <div className="space-y-5">
          <ImageUploadZone
            label="Primary Image *"
            hint="JPG, PNG, WebP — min 800×600px, max 5MB. This is the main product card image."
            value={media.primaryImage}
            onChange={(v) => setMedia(prev => ({ ...prev, primaryImage: v as string }))}
          />
          <ImageUploadZone
            label="Image Gallery (up to 12)"
            hint="Select multiple images. Supported: JPG, PNG, WebP"
            value={media.galleryUrls.split('\n').filter(Boolean)}
            onChange={(v) => setMedia(prev => ({ ...prev, galleryUrls: (v as string[]).join('\n') }))}
            multiple
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="PDF Datasheet URL"
              placeholder="https://cdn.adityagenset.com/specs/atm-250s.pdf"
              value={media.datasheetUrl}
              onChange={(value) => setMedia((current) => ({ ...current, datasheetUrl: value }))}
              hint="Saved as product datasheet media."
            />
            <Input
              label="Product Video URL"
              placeholder="https://youtube.com/watch?v=..."
              value={media.videoUrl}
              onChange={(value) => setMedia((current) => ({ ...current, videoUrl: value }))}
              hint={videoFile ? "A selected upload will be used instead of this URL." : "Optional external video URL."}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="E. SEO (Optional)" icon={SearchIcon}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="SEO Title" placeholder="250 kVA Silent DG Set | Aditya Tech Mech" hint="Optional. Leave blank to use the product name." value={form.seoTitle} onChange={(value) => updateForm("seoTitle", value)} />
            <Input label="Canonical URL" value={`/products/${slugify(form.model || form.name)}`} hint="Generated from the product slug" readOnly />
          </div>
          <Textarea
            label="Meta Description"
            placeholder="Buy 250 kVA CPCB IV+ silent diesel generator set from Aditya Tech Mech..."
            maxLen={160}
            hint="Optional. Leave blank to use the product description."
            value={form.metaDesc}
            onChange={(value) => updateForm("metaDesc", value)}
          />
          <p className="text-xs text-muted-foreground">
            SEO fields can be skipped. Search visibility and featured placement still use the saved product content, tags, and category.
          </p>
        </div>
      </FormSection>

      <div className="sticky bottom-0 flex justify-end gap-3 py-4 bg-gradient-to-t from-background via-background to-transparent mt-2">
        <button
          onClick={() => navigate("/admin/products")}
          className="px-5 py-2.5 bg-secondary border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => void saveProduct("draft")}
          disabled={savingDraft}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-secondary border border-border rounded-lg text-sm font-medium text-muted-foreground transition-colors disabled:opacity-50"
        >
          <Save size={15} /> {savingDraft ? "Saving..." : "Save Draft"}
        </button>
        <button
          onClick={() => void saveProduct("published")}
          disabled={publishing}
          className="flex items-center gap-1.5 px-6 py-2.5 bg-accent hover:bg-accent/90 rounded-lg text-sm font-bold text-accent-foreground transition-colors disabled:opacity-70"
        >
          <Eye size={15} /> {publishing ? "Publishing..." : "Publish Product"}
        </button>
      </div>
    </div>
  );
}
