import { useState, useRef, useCallback } from "react";
import { FileText, Sparkles, AlertCircle, CheckCircle2, Loader2, X, ChevronDown, ChevronUp } from "lucide-react";
import { extractPdfAssets, extractTextFromPdf, extractProductDataWithAI, type PdfImportPayload } from "@/lib/pdfExtractor";
import { cn } from "@/lib/utils";

interface PDFImportZoneProps {
  onExtracted: (payload: PdfImportPayload) => void;
}

type Stage = "idle" | "reading" | "extracting" | "done" | "error";

const STAGE_LABELS: Record<Stage, string> = {
  idle: "Drop your datasheet PDF here",
  reading: "Reading PDF...",
  extracting: "Extracting product data...",
  done: "Extraction complete - review below",
  error: "Extraction failed",
};

const CONFIDENCE_COLORS = {
  high: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-red-400 bg-red-500/10 border-red-500/20",
};

export function PDFImportZone({ onExtracted }: PDFImportZoneProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<PdfImportPayload | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      setStage("error");
      return;
    }

    setFileName(file.name);
    setError(null);
    setResult(null);
    setShowPreview(false);

    try {
      setStage("reading");
      const [text, assets] = await Promise.all([
        extractTextFromPdf(file),
        extractPdfAssets(file),
      ]);

      setStage("extracting");
      
      // Convert first 3 page blobs to base64 for Gemini Vision
      const { blobToBase64 } = await import("@/lib/pdfExtractor");
      const pageBase64Promises = assets.pageImages
        .slice(0, 3)
        .map(img => blobToBase64(img.blob));
      
      const pageBase64s = await Promise.all(pageBase64Promises);

      const mappedData = await extractProductDataWithAI(text, file.name, pageBase64s);

      setResult({
        data: mappedData as any,
        assets,
      });
      setStage("done");
      setShowPreview(true);
    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
      setStage("error");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleApply = () => {
    if (result) {
      onExtracted(result);
    }
  };

  const handleReset = () => {
    setStage("idle");
    setError(null);
    setFileName(null);
    setResult(null);
    setShowPreview(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const isLoading = stage === "reading" || stage === "extracting";

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isLoading && inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group",
          dragging && "border-accent bg-accent/5 scale-[1.01]",
          stage === "done" && "border-emerald-500/40 bg-emerald-500/5",
          stage === "error" && "border-red-500/40 bg-red-500/5",
          stage === "idle" && "border-border hover:border-accent/50 hover:bg-accent/5",
          isLoading && "pointer-events-none border-accent/30 bg-accent/5"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFile}
        />

        {/* Icon */}
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all",
          stage === "done" ? "bg-emerald-500/15" : stage === "error" ? "bg-red-500/15" : "bg-secondary group-hover:bg-accent/10"
        )}>
          {isLoading ? (
            <Loader2 size={24} className="text-accent animate-spin" />
          ) : stage === "done" ? (
            <CheckCircle2 size={24} className="text-emerald-400" />
          ) : stage === "error" ? (
            <AlertCircle size={24} className="text-red-400" />
          ) : (
            <div className="relative">
              <FileText size={22} className="text-muted-foreground group-hover:text-accent transition-colors" />
              <Sparkles size={10} className="absolute -top-1 -right-1 text-amber-400" />
            </div>
          )}
        </div>

        {/* Label */}
        <p className={cn(
          "text-sm font-medium transition-colors",
          stage === "done" && "text-emerald-400",
          stage === "error" && "text-red-400",
          stage === "idle" && "text-muted-foreground group-hover:text-foreground",
          isLoading && "text-accent"
        )}>
          {STAGE_LABELS[stage]}
        </p>

        {/* Sub-text */}
        {stage === "idle" && (
          <p className="text-xs text-muted-foreground mt-1.5">
            Click or drag a PDF - product fields will auto-fill below
          </p>
        )}
        {fileName && stage !== "idle" && (
          <p className="text-xs text-muted-foreground mt-1.5 truncate max-w-xs mx-auto">
            {fileName}
          </p>
        )}
        {error && (
          <p className="text-xs text-red-400 mt-2 max-w-sm mx-auto">{error}</p>
        )}

        {/* Animated progress bar when loading */}
        {isLoading && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border rounded-b-xl overflow-hidden">
            <div className="h-full bg-accent animate-[shimmer_1.5s_ease-in-out_infinite] w-1/3" />
          </div>
        )}
      </div>

      {/* Result Preview + Action Bar */}
      {stage === "done" && result && (
        <div className="border border-border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-secondary border-b border-border">
            <div className="flex items-center gap-3">
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-sm font-semibold text-foreground">
                {result.data.extractionSource === "local-fallback" ? "PDF Extracted Fields" : "AI Extracted Fields"}
              </span>
              {result.data.extractionSource === "local-fallback" && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-300">
                  local fallback
                </span>
              )}
              <span className={cn(
                "text-[11px] font-bold px-2 py-0.5 rounded-full border capitalize",
                CONFIDENCE_COLORS[result.data.confidence] || CONFIDENCE_COLORS.medium
              )}>
                {result.data.confidence} confidence
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                title={showPreview ? "Collapse" : "Expand"}
              >
                {showPreview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Reset"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {showPreview && result.assets.pageImages.length > 0 && (
            <div className="px-4 pt-4 bg-background">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  PDF Media Capture
                </p>
                <p className="text-xs text-muted-foreground">
                  {result.assets.pageImages.length} page image{result.assets.pageImages.length === 1 ? "" : "s"} ready for upload
                </p>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {result.assets.pageImages.map((image) => (
                  <div key={image.pageNumber} className="overflow-hidden rounded-lg border border-border bg-muted/30">
                    <img src={image.previewUrl} alt={`PDF page ${image.pageNumber}`} className="h-24 w-full object-cover" />
                    <div className="px-2 py-1 text-[10px] text-muted-foreground border-t border-border">
                      Page {image.pageNumber}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted field preview */}
          {showPreview && (
            <div className="bg-background">
              <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3 border-b border-border/50">
              {[
                { label: "Product Name", key: "name", value: result.data.name },
                { label: "Model Number", key: "model", value: result.data.model },
                { label: "Power Output", key: "kva", value: result.data.kva },
                { label: "Engine Brand", key: "engineBrand", value: result.data.engineBrand },
                { label: "Engine Model", key: "engineModel", value: result.data.engineModel },
                { label: "Application", key: "application", value: result.data.application },
                { label: "Fuel Consumption", key: "fuelConsumption", value: result.data.fuelConsumption },
                { label: "Noise Level", key: "noiseLevel", value: result.data.noiseLevel },
                { label: "CPCB", key: "cpcb", value: result.data.cpcb },
                { label: "Alternator", key: "alternatorBrand", value: result.data.alternatorBrand },
                { label: "Voltage", key: "voltage", value: result.data.voltage },
                { label: "Dimensions", key: "dimensions", value: result.data.dimensions },
              ].map(({ label, key, value }) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => {
                      const newVal = e.currentTarget.textContent || "";
                      setResult(prev => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          data: { ...prev.data, [key]: newVal }
                        };
                      });
                    }}
                    className={cn(
                      "text-sm font-medium truncate outline-none focus:bg-accent/10 focus:ring-1 focus:ring-accent/30 rounded px-1 -mx-1 transition-all",
                      value ? "text-foreground" : "text-muted-foreground/40 italic"
                    )}
                  >
                    {value || (key === "kva" ? "" : "Not found")}
                    {key === "kva" && value && " kVA"}
                  </div>
                </div>
              ))}
            </div>

            {result.data.advancedSections && result.data.advancedSections.length > 0 && (
              <div className="mt-2 pb-4 px-4 bg-background">
                <div className="py-2 border-b border-border/50 overflow-x-auto no-scrollbar flex gap-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center">
                    Detailed Sections
                  </p>
                </div>
                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {result.data.advancedSections.map((sec, i) => (
                    <div key={i} className="bg-secondary/50 rounded-lg p-3 border border-border/50 group/section relative">
                      <h4
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => {
                          const next = [...result.data.advancedSections];
                          next[i] = { ...next[i], title: e.currentTarget.textContent || "" };
                          setResult(prev => prev ? { ...prev, data: { ...prev.data, advancedSections: next } } : prev);
                        }}
                        className="text-xs font-bold text-accent mb-2 uppercase tracking-wide outline-none focus:bg-accent/10 focus:ring-1 focus:ring-accent/30 rounded px-1 -mx-1"
                      >
                        {sec.title}
                      </h4>
                      {sec.features && sec.features.length > 0 && (
                        <ul className="space-y-1 mb-3">
                          {sec.features.map((feat, j) => (
                            <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5 leading-tight group/feat">
                              <span className="text-accent/60 mt-[1px]">•</span>
                              <span
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={e => {
                                  const next = [...result.data.advancedSections];
                                  const nextFeats = [...next[i].features];
                                  nextFeats[j] = e.currentTarget.textContent || "";
                                  next[i] = { ...next[i], features: nextFeats };
                                  setResult(prev => prev ? { ...prev, data: { ...prev.data, advancedSections: next } } : prev);
                                }}
                                className="outline-none focus:bg-accent/10 focus:ring-1 focus:ring-accent/30 rounded px-1 -mx-1 flex-1"
                              >
                                {feat}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {sec.specs && sec.specs.length > 0 && (
                        <div className="space-y-1.5">
                          {sec.specs.map((spec, j) => (
                            <div key={j} className="flex items-start justify-between gap-4 text-xs border-b border-border/30 pb-1.5 last:border-0 last:pb-0 group/spec">
                              <span
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={e => {
                                  const next = [...result.data.advancedSections];
                                  const nextSpecs = [...next[i].specs];
                                  nextSpecs[j] = { ...nextSpecs[j], label: e.currentTarget.textContent || "" };
                                  next[i] = { ...next[i], specs: nextSpecs };
                                  setResult(prev => prev ? { ...prev, data: { ...prev.data, advancedSections: next } } : prev);
                                }}
                                className="text-muted-foreground outline-none focus:bg-accent/10 focus:ring-1 focus:ring-accent/30 rounded px-1 -mx-1"
                              >
                                {spec.label}
                              </span>
                              <span
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={e => {
                                  const next = [...result.data.advancedSections];
                                  const nextSpecs = [...next[i].specs];
                                  nextSpecs[j] = { ...nextSpecs[j], value: e.currentTarget.textContent || "" };
                                  next[i] = { ...next[i], specs: nextSpecs };
                                  setResult(prev => prev ? { ...prev, data: { ...prev.data, advancedSections: next } } : prev);
                                }}
                                className="text-foreground font-medium text-right outline-none focus:bg-accent/10 focus:ring-1 focus:ring-accent/30 rounded px-1 -mx-1"
                              >
                                {spec.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          )}

          {/* AI notes & extra specs */}
          {showPreview && result.data.rawNotes && (
            <div className="px-4 pb-3 bg-background">
              <p className="text-[11px] text-amber-400/80 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2">
                Extraction note: {result.data.rawNotes}
              </p>
            </div>
          )}

          {/* Apply button */}
          <div className="flex items-center justify-between px-4 py-3 bg-secondary border-t border-border">
            <p className="text-xs text-muted-foreground">
              Review the fields below, then click <strong>Publish</strong> when ready.
            </p>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <Sparkles size={12} />
              Apply to Form
            </button>
          </div>
        </div>
      )}

      {/* API Key hint */}
      {!import.meta.env.VITE_GEMINI_API_KEY && stage === "idle" && (
        <p className="text-[11px] text-amber-500/70 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2">
          Add <code className="font-mono">VITE_GEMINI_API_KEY=your_key</code> to your <code className="font-mono">.env</code> file to enable AI extraction. Local PDF parsing still works without it.{" "}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-amber-400 hover:text-amber-300"
          >
            Get a free key
          </a>
        </p>
      )}
    </div>
  );
}
