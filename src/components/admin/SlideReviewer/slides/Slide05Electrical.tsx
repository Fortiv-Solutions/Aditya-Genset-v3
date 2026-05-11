import type { ChapterDataInput, SectionInput } from "@/lib/api/productPublisher";
import { SpecTableEditor, SlideImagePicker, SectionHeaderEditor } from "../SlideEditorPrimitives";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  chapterKey: string;
  data: ChapterDataInput;
  section?: SectionInput;
  productName: string;
  onChange: (d: ChapterDataInput) => void;
  onSectionChange: (s: Partial<SectionInput>) => void;
}

export function Slide05Electrical({ data, section, onChange, onSectionChange }: Props) {
  const update = (patch: Partial<ChapterDataInput>) => onChange({ ...data, ...patch });

  const reactance = data.reactanceData || [];
  const updateReactance = (i: number, field: "symbol" | "description" | "value", v: string) => {
    const next = reactance.map((r, idx) => (idx === i ? { ...r, [field]: v } : r));
    update({ reactanceData: next });
  };

  return (
    <div className="space-y-5">
      <SectionHeaderEditor
        title={section?.title ?? "Electrical Performance"}
        tagline={section?.tagline ?? ""}
        onTitleChange={(v) => onSectionChange({ title: v })}
        onTaglineChange={(v) => onSectionChange({ tagline: v })}
      />

      <SpecTableEditor
        label="Electrical Specs"
        specs={data.electricalSpecs || []}
        onChange={(electricalSpecs) => update({ electricalSpecs })}
      />

      {/* Reactance table */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Reactance Data
        </label>
        <div className="grid grid-cols-[80px,1fr,100px,auto] gap-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
          <span>Symbol</span><span>Description</span><span>Value</span><span />
        </div>
        {reactance.map((row, i) => (
          <div key={i} className="grid grid-cols-[80px,1fr,100px,auto] gap-2 items-center group">
            <input value={row.symbol} onChange={(e) => updateReactance(i, "symbol", e.target.value)}
              className="px-2 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/50"
              placeholder="Xd" />
            <input value={row.description} onChange={(e) => updateReactance(i, "description", e.target.value)}
              className="px-2 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/50"
              placeholder="Direct Axis Synchronous" />
            <input value={row.value} onChange={(e) => updateReactance(i, "value", e.target.value)}
              className="px-2 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/50"
              placeholder="1.942" />
            <button type="button" onClick={() => update({ reactanceData: reactance.filter((_, idx) => idx !== i) })}
              className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button type="button"
          onClick={() => update({ reactanceData: [...reactance, { symbol: "", description: "", value: "" }] })}
          className="flex items-center gap-2 px-3 py-2 text-xs text-accent border border-dashed border-accent/30 hover:border-accent/60 rounded-lg w-full justify-center">
          <Plus size={13} /> Add Reactance Row
        </button>
      </div>

      <SpecTableEditor
        label="General Specs"
        specs={data.specs || []}
        onChange={(specs) => update({ specs })}
      />

      <SlideImagePicker
        label="Electrical Image"
        value={section?.imageUrl || ""}
        onChange={(url) => onSectionChange({ imageUrl: url })}
      />
    </div>
  );
}
