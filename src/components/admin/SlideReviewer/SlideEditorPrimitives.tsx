/**
 * Shared slide editor primitives reused across all 11 slides.
 */
import { useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/lib/api/storage";
import { toast } from "sonner";

// ── Inline text field ─────────────────────────────────────────────────────────
export function SlideField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 resize-none transition-all"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-all"
        />
      )}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ── Spec table editor ─────────────────────────────────────────────────────────
export function SpecTableEditor({
  label = "Specifications",
  specs,
  onChange,
}: {
  label?: string;
  specs: { label: string; value: string }[];
  onChange: (specs: { label: string; value: string }[]) => void;
}) {
  const update = (i: number, field: "label" | "value", v: string) => {
    const next = specs.map((s, idx) => (idx === i ? { ...s, [field]: v } : s));
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <div className="grid grid-cols-[1fr,1fr,auto] gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
        <span>Label</span><span>Value</span><span />
      </div>
      {specs.map((spec, i) => (
        <div key={i} className="grid grid-cols-[1fr,1fr,auto] gap-2 items-center group">
          <input
            value={spec.label}
            onChange={(e) => update(i, "label", e.target.value)}
            placeholder="e.g. Power Output"
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-all"
          />
          <input
            value={spec.value}
            onChange={(e) => update(i, "value", e.target.value)}
            placeholder="e.g. 15 kVA"
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-all"
          />
          <button
            type="button"
            onClick={() => onChange(specs.filter((_, idx) => idx !== i))}
            className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...specs, { label: "", value: "" }])}
        className="flex items-center gap-2 px-3 py-2 text-xs text-accent border border-dashed border-accent/30 hover:border-accent/60 rounded-lg w-full justify-center transition-colors"
      >
        <Plus size={13} /> Add Row
      </button>
    </div>
  );
}

// ── String list editor (features, protections, etc.) ──────────────────────────
export function StringListEditor({
  label,
  items,
  onChange,
  placeholder = "Add item...",
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    if (!draft.trim()) return;
    onChange([...items, draft.trim()]);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 group">
            <input
              value={item}
              onChange={(e) => {
                const next = items.map((v, idx) => (idx === i ? e.target.value : v));
                onChange(next);
              }}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/50 transition-all"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 mt-0.5"
            >
              <Trash2 size={13} />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-background border border-dashed border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-all"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 bg-accent/10 border border-accent/30 text-accent rounded-lg text-xs hover:bg-accent/20 transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Image picker with upload ──────────────────────────────────────────────────
export function SlideImagePicker({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {value && (
        <div className="relative rounded-xl overflow-hidden aspect-video mb-2 group">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => onChange("")}
              className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
      <label className={cn(
        "flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-accent/40 transition-colors",
        uploading && "opacity-50 pointer-events-none"
      )}>
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <Upload size={16} className={cn("text-muted-foreground", uploading && "animate-bounce")} />
        <span className="text-xs text-muted-foreground">
          {uploading ? "Uploading..." : value ? "Replace image" : "Upload image"}
        </span>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </label>
      {!value && (
        <div className="space-y-1">
          <input
            type="url"
            placeholder="Or paste image URL..."
            onBlur={(e) => e.target.value && onChange(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-all"
          />
        </div>
      )}
    </div>
  );
}

// ── Section header editor ─────────────────────────────────────────────────────
export function SectionHeaderEditor({
  title,
  tagline,
  onTitleChange,
  onTaglineChange,
}: {
  title: string;
  tagline: string;
  onTitleChange: (v: string) => void;
  onTaglineChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3 pb-4 border-b border-border">
      <SlideField label="Section Title" value={title} onChange={onTitleChange} placeholder="e.g. Engine" />
      <SlideField label="Tagline / Subtitle" value={tagline} onChange={onTaglineChange} placeholder="e.g. Built for continuous duty..." multiline rows={2} />
    </div>
  );
}
