import type { ChapterDataInput, SectionInput } from "@/lib/api/productPublisher";
import { StringListEditor, SlideImagePicker, SectionHeaderEditor } from "../SlideEditorPrimitives";

interface Props {
  chapterKey: string;
  data: ChapterDataInput;
  section?: SectionInput;
  productName: string;
  onChange: (d: ChapterDataInput) => void;
  onSectionChange: (s: Partial<SectionInput>) => void;
}

export function Slide08Protection({ data, section, onChange, onSectionChange }: Props) {
  const update = (patch: Partial<ChapterDataInput>) => onChange({ ...data, ...patch });

  return (
    <div className="space-y-5">
      <SectionHeaderEditor
        title={section?.title ?? "Protection & Approvals"}
        tagline={section?.tagline ?? ""}
        onTitleChange={(v) => onSectionChange({ title: v })}
        onTaglineChange={(v) => onSectionChange({ tagline: v })}
      />

      <StringListEditor
        label="Engine Protections"
        items={data.engineProtections || []}
        onChange={(engineProtections) => update({ engineProtections })}
        placeholder="e.g. High Water Temp shutdown"
      />

      <StringListEditor
        label="Electrical Protections"
        items={data.electricalProtections || []}
        onChange={(electricalProtections) => update({ electricalProtections })}
        placeholder="e.g. Under/Over Voltage"
      />

      <StringListEditor
        label="Approvals & Certifications"
        items={data.approvals || []}
        onChange={(approvals) => update({ approvals })}
        placeholder="e.g. CPCB IV+, ISO 8528, CE"
      />

      <SlideImagePicker
        label="Protection / Certifications Image"
        value={section?.imageUrl || ""}
        onChange={(url) => onSectionChange({ imageUrl: url })}
      />
    </div>
  );
}
