import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, Eye, Package, Cpu, IndianRupee,
  Image as ImageIcon, Search as SearchIcon, Tag, ChevronDown, Plus, Trash2, Upload, Sparkles, FileText,
} from "lucide-react";
import { toast } from "sonner";
import { PDFImportZone } from "@/components/admin/PDFImportZone";
import type { ExtractedProduct } from "@/lib/pdfExtractor";
import { generateShowcaseFromTemplate, saveDynamicProduct } from "@/lib/productGenerator";

// ─── Form Section Wrapper ────────────────────────────────────────────────────
function FormSection({ title, icon: Icon, children }: {
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

// ─── Input ───────────────────────────────────────────────────────────────────
function Input({
  label, type = "text", placeholder, required, hint, value, onChange,
}: {
  label: string; type?: string; placeholder?: string; required?: boolean;
  hint?: string; value?: string; onChange?: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}{required && <span className="text-accent ml-1">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-all"
      />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────────────────────
function Select({
  label, options, value, onChange, required,
}: {
  label: string; options: { value: string; label: string }[];
  value?: string; onChange?: (v: string) => void; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}{required && <span className="text-accent ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/60 appearance-none cursor-pointer transition-all"
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Textarea ────────────────────────────────────────────────────────────────
function Textarea({ label, placeholder, rows = 3, maxLen, hint }: {
  label: string; placeholder?: string; rows?: number; maxLen?: number; hint?: string;
}) {
  const [val, setVal] = useState("");
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
        {maxLen && <span className={`text-[11px] ${val.length > maxLen * 0.9 ? "text-accent" : "text-muted-foreground"}`}>{val.length}/{maxLen}</span>}
      </div>
      <textarea
        placeholder={placeholder}
        rows={rows}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        maxLength={maxLen}
        className="w-full px-3.5 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-all resize-none"
      />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

// ─── Spec Builder ────────────────────────────────────────────────────────────
const DEFAULT_SPECS = [
  { label: "Power Output (kVA)", value: "" },
  { label: "Engine Make & Model", value: "" },
  { label: "Alternator Brand", value: "" },
  { label: "Frequency (Hz)", value: "50 Hz" },
  { label: "Voltage Output", value: "415V / 3-phase" },
  { label: "Fuel Consumption (L/hr)", value: "" },
  { label: "Noise Level (dB @ 1m)", value: "" },
  { label: "Dimensions (L×W×H mm)", value: "" },
  { label: "Dry Weight (kg)", value: "" },
  { label: "CPCB Compliance", value: "IV+" },
  { label: "Warranty", value: "12 months" },
];

function SpecBuilder({ specs, setSpecs }: {
  specs: { label: string; value: string }[];
  setSpecs: React.Dispatch<React.SetStateAction<{ label: string; value: string }[]>>;
}) {
  const updateSpec = (i: number, field: "label" | "value", val: string) => {
    setSpecs((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };
  const addSpec = () => setSpecs((prev) => [...prev, { label: "", value: "" }]);
  const removeSpec = (i: number) => setSpecs((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        <span>Specification Label</span>
        <span>Value</span>
      </div>
      {specs.map((spec, i) => (
        <div key={i} className="flex gap-2 items-center group">
          <input
            type="text"
            value={spec.label}
            onChange={(e) => updateSpec(i, "label", e.target.value)}
            placeholder="e.g. Power Output"
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-muted-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-all"
          />
          <input
            type="text"
            value={spec.value}
            onChange={(e) => updateSpec(i, "value", e.target.value)}
            placeholder="e.g. 62.5 kVA"
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-muted-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-all"
          />
          <button
            type="button"
            onClick={() => removeSpec(i)}
            className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addSpec}
        className="flex items-center gap-2 px-3 py-2 text-xs text-accent hover:text-accent border border-dashed border-accent/30 hover:border-accent/60 rounded-lg w-full justify-center transition-colors"
      >
        <Plus size={13} /> Add Specification Row
      </button>
    </div>
  );
}

// ─── Image Upload Zone ────────────────────────────────────────────────────────
function ImageUploadZone({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="border-2 border-dashed border-border hover:border-accent/40 rounded-xl p-8 text-center transition-colors cursor-pointer group">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/10 transition-colors">
          <Upload size={18} className="text-muted-foreground group-hover:text-accent transition-colors" />
        </div>
        <p className="text-sm text-muted-foreground group-hover:text-muted-foreground transition-colors">
          Drop images here or <span className="text-accent">browse</span>
        </p>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>
    </div>
  );
}

// ─── Main Add Product Page ─────────────────────────────────────────────────
export default function AddProduct() {
  const navigate = useNavigate();
  const [priceOnRequest, setPriceOnRequest] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [specs, setSpecs] = useState(DEFAULT_SPECS);
  const [extractedData, setExtractedData] = useState<ExtractedProduct | null>(null);

  const [form, setForm] = useState({
    name: "",
    model: "",
    category: "silent-dg-sets",
    shortDesc: "",
    engineBrand: "baudouin",
    type: "silent",
    kva: "",
    cpcb: "iv-plus",
    price: "",
    moq: "1",
    leadTime: "21",
    stock: "in_stock",
    seoTitle: "",
    metaDesc: "",
  });

  const updateForm = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  /** Called when admin clicks "Apply to Form" after PDF extraction */
  const handleExtracted = (data: ExtractedProduct) => {
    setExtractedData(data);
    setForm((prev) => ({
      ...prev,
      name: data.name || prev.name,
      model: data.model || prev.model,
      kva: data.kva || prev.kva,
      engineBrand: data.engineBrand || prev.engineBrand,
      shortDesc: data.shortDesc || prev.shortDesc,
      cpcb: data.cpcb === "ii" ? "ii" : "iv-plus",
      seoTitle: data.name ? `${data.name} | Aditya Tech Mech` : prev.seoTitle,
    }));

    // Merge extracted specs into the spec builder
    const extractedRows: { label: string; value: string }[] = [];
    if (data.engineModel) extractedRows.push({ label: "Engine Model", value: data.engineModel });
    if (data.alternatorBrand) extractedRows.push({ label: "Alternator Brand", value: data.alternatorBrand });
    if (data.fuelConsumption) extractedRows.push({ label: "Fuel Consumption", value: data.fuelConsumption });
    if (data.noiseLevel) extractedRows.push({ label: "Noise Level", value: data.noiseLevel });
    if (data.dimensions) extractedRows.push({ label: "Dimensions (L×W×H)", value: data.dimensions });
    if (data.dryWeight) extractedRows.push({ label: "Dry Weight", value: data.dryWeight });
    if (data.voltage) extractedRows.push({ label: "Voltage Output", value: data.voltage });
    if (data.frequency) extractedRows.push({ label: "Frequency", value: data.frequency });
    if (data.specs?.length) extractedRows.push(...data.specs);

    if (extractedRows.length > 0) {
      setSpecs(extractedRows);
    }

    toast.success("AI extraction applied! Review the fields and publish when ready.");
  };

  const handleSaveDraft = () => {
    setSavingDraft(true);
    setTimeout(() => {
      setSavingDraft(false);
      toast.success("Product saved as draft");
    }, 800);
  };

  const handlePublish = () => {
    if (!form.name || !form.model || !form.kva) {
      toast.error("Please fill in all required fields");
      return;
    }
    setPublishing(true);
    setTimeout(() => {
      // If it's an Escort product, generate and save the dynamic showcase data
      if (extractedData) {
        try {
          const dynamicShowcase = generateShowcaseFromTemplate(extractedData);
          saveDynamicProduct(dynamicShowcase);
          console.log("Generated dynamic showcase:", dynamicShowcase);
        } catch (err) {
          console.error("Failed to generate dynamic showcase:", err);
        }
      }

      setPublishing(false);
      toast.success("Product published successfully! Showcase generated.");
      navigate("/admin/products");
    }, 1000);
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/products")}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-display">Add New Product</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Create a new generator listing for the catalogue</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={savingDraft}
            className="flex items-center gap-1.5 px-4 py-2 bg-secondary hover:bg-secondary border border-border rounded-lg text-sm font-medium text-muted-foreground transition-colors disabled:opacity-50"
          >
            <Save size={15} />
            {savingDraft ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 rounded-lg text-sm font-bold text-accent-foreground transition-colors disabled:opacity-70"
          >
            <Eye size={15} />
            {publishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      {/* ── AI PDF Import Zone ── */}
      <div className="bg-card shadow-sm border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-secondary">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Sparkles size={14} className="text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI PDF Import</h3>
            <p className="text-[11px] text-muted-foreground">Drop a client datasheet PDF — AI will auto-fill all fields below</p>
          </div>
        </div>
        <div className="p-5">
          <PDFImportZone onExtracted={handleExtracted} />
        </div>
      </div>

      {/* ── Section A: Basic Information ── */}
      <FormSection title="A. Basic Information" icon={Package}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Product Name" placeholder="e.g. 250 kVA Silent DG Set" required
            value={form.name} onChange={(v) => updateForm("name", v)} />
          <Input label="Model Number" placeholder="e.g. ATM-250S" required
            hint="Auto-generates URL slug" value={form.model} onChange={(v) => updateForm("model", v)} />
          <Select label="Category" required
            value={form.category} onChange={(v) => updateForm("category", v)}
            options={[
              { value: "silent-dg-sets", label: "Silent DG Sets" },
              { value: "open-dg-sets", label: "Open DG Sets" },
              { value: "industrial", label: "Industrial DG Sets" },
              { value: "accessories", label: "Accessories & Parts" },
            ]} />
          <Select label="Type" required value={form.type} onChange={(v) => updateForm("type", v)}
            options={[
              { value: "silent", label: "Silent (Acoustic Enclosure)" },
              { value: "open", label: "Open Frame" },
            ]} />
        </div>
        <div className="mt-4">
          <Textarea label="Short Description" placeholder="Industrial-grade reliability, whisper-quiet by design."
            maxLen={160} hint="Used for product cards and meta description (max 160 chars)" />
        </div>
        <div className="mt-4">
          <Textarea label="Full Description" placeholder="Write a detailed product description..."
            rows={5} hint="Supports rich text. Describe the key features, applications, and advantages." />
        </div>

        {/* Tags */}
        <div className="mt-4 space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Tags</label>
          <div className="flex flex-wrap gap-2">
            {["Hospital Grade", "CPCB IV+", "Weatherproof", "Export Quality", "AMF Ready", "Soundproof"].map((tag) => (
              <button
                key={tag}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:border-accent/40 hover:text-accent hover:bg-accent/5 transition-colors"
              >
                <Tag size={10} /> {tag}
              </button>
            ))}
            <button className="px-3 py-1.5 rounded-lg text-xs border border-dashed border-border text-muted-foreground hover:text-muted-foreground transition-colors">
              + Custom Tag
            </button>
          </div>
        </div>
      </FormSection>

      {/* ── Section B: Technical Specifications ── */}
      <FormSection title="B. Technical Specifications" icon={Cpu}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
          <Input label="Power Output (kVA)" placeholder="e.g. 250" required type="number"
            value={form.kva} onChange={(v) => updateForm("kva", v)} />
          <Select label="Engine Brand" required value={form.engineBrand} onChange={(v) => updateForm("engineBrand", v)}
            options={[
              { value: "baudouin", label: "Baudouin" },
              { value: "kubota", label: "Kubota" },
              { value: "escorts-kubota", label: "Escorts-Kubota" },
              { value: "kohler", label: "Kohler" },
              { value: "mahindra", label: "Mahindra" },
              { value: "cummins", label: "Cummins" },
            ]} />
          <Select label="CPCB Compliance" required value={form.cpcb} onChange={(v) => updateForm("cpcb", v)}
            options={[
              { value: "iv-plus", label: "CPCB IV+" },
              { value: "ii", label: "CPCB II" },
            ]} />
        </div>
        <SpecBuilder specs={specs} setSpecs={setSpecs} />
      </FormSection>

      {/* ── Section C: Pricing & Availability ── */}
      <FormSection title="C. Pricing & Availability" icon={IndianRupee}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Base Price (INR, Ex-Works) <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
              <input
                type="number"
                placeholder="695000"
                disabled={priceOnRequest}
                value={form.price}
                onChange={(e) => updateForm("price", e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 transition-all disabled:opacity-40"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={priceOnRequest}
                onChange={(e) => setPriceOnRequest(e.target.checked)}
                className="rounded border-border accent-amber-500"
              />
              <span className="text-xs text-muted-foreground">Price on Request (shows "Get Quote" button)</span>
            </label>
          </div>

          <Select label="Availability" required value={form.stock} onChange={(v) => updateForm("stock", v)}
            options={[
              { value: "in_stock", label: "In Stock" },
              { value: "on_order", label: "On Order" },
              { value: "discontinued", label: "Discontinued" },
            ]} />

          <Input label="Lead Time (days)" placeholder="21" type="number" hint="Days from order to delivery"
            value={form.leadTime} onChange={(v) => updateForm("leadTime", v)} />
        </div>

        {/* kVA Sub-category */}
        <div className="mt-4">
          <Select label="kVA Range (for filtering)" required value="7.5-62.5" onChange={() => {}}
            options={[
              { value: "7.5-62.5", label: "7.5 – 62.5 kVA" },
              { value: "63-200", label: "63 – 200 kVA" },
              { value: "201-500", label: "201 – 500 kVA" },
              { value: "501-2500", label: "501 – 2500 kVA" },
            ]} />
        </div>
      </FormSection>

      {/* ── Section D: Media ── */}
      <FormSection title="D. Media" icon={ImageIcon}>
        <div className="space-y-5">
          <ImageUploadZone
            label="Primary Image *"
            hint="JPG, PNG, WebP — min 800×600px, max 5MB. This is the main product card image."
          />
          <ImageUploadZone
            label="Image Gallery (up to 12)"
            hint="Drag to reorder after upload. Supported: JPG, PNG, WebP"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="PDF Datasheet URL" placeholder="https://cdn.adityagenset.com/specs/atm-250s.pdf"
              hint="Or upload a PDF directly" value="" onChange={() => {}} />
            <Input label="Product Video URL" placeholder="https://youtube.com/watch?v=..."
              hint="YouTube or Vimeo embed" value="" onChange={() => {}} />
          </div>
        </div>
      </FormSection>

      {/* ── Section E: SEO ── */}
      <FormSection title="E. SEO & Visibility" icon={SearchIcon}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="SEO Title" placeholder="250 kVA Silent DG Set | Aditya Tech Mech"
              hint="Optimal: 50–60 characters" value={form.seoTitle} onChange={(v) => updateForm("seoTitle", v)} />
            <Input label="Canonical URL" placeholder="/products/atm-250s"
              hint="Auto-filled from model number" value="" onChange={() => {}} />
          </div>
          <Textarea label="Meta Description" placeholder="Buy 250 kVA CPCB IV+ silent diesel generator set from Aditya Tech Mech..."
            maxLen={160} hint="Optimal: 140–160 characters" />

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Industry Vertical Tags (for filtering)
            </label>
            <div className="flex flex-wrap gap-2">
              {["Hospital", "Hotel", "Textile", "IT Park", "Cold Storage", "Construction", "Pharmaceutical", "Data Centre", "Mall"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-xs border border-border text-muted-foreground hover:border-accent/40 hover:text-accent hover:bg-accent/5 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility */}
          <div className="flex gap-4 pt-2">
            {[
              { label: "Indexed by Search Engines", hint: "Recommended for all published products" },
              { label: "Show on Homepage Featured", hint: "Appears in featured products section" },
              { label: "Featured in Category Page", hint: "Pinned at top of category listing" },
            ].map(({ label, hint }) => (
              <label key={label} className="flex items-start gap-2.5 cursor-pointer flex-1">
                <input type="checkbox" defaultChecked className="rounded mt-0.5 border-border accent-amber-500" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </FormSection>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 flex justify-end gap-3 py-4 bg-gradient-to-t from-background via-background to-transparent mt-2">
        <button
          onClick={() => navigate("/admin/products")}
          className="px-5 py-2.5 bg-secondary hover:bg-secondary border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveDraft}
          disabled={savingDraft}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-secondary hover:bg-secondary border border-border rounded-lg text-sm font-medium text-muted-foreground transition-colors disabled:opacity-50"
        >
          <Save size={15} /> {savingDraft ? "Saving..." : "Save Draft"}
        </button>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="flex items-center gap-1.5 px-6 py-2.5 bg-accent hover:bg-accent/90 rounded-lg text-sm font-bold text-accent-foreground transition-colors disabled:opacity-70"
        >
          <Eye size={15} /> {publishing ? "Publishing..." : "Publish Product"}
        </button>
      </div>
    </div>
  );
}
