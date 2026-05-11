import type { ChapterDataInput, SectionInput } from "@/lib/api/productPublisher";
import { SpecTableEditor, SlideImagePicker, SectionHeaderEditor } from "../SlideEditorPrimitives";

interface Props {
  chapterKey: string;
  data: ChapterDataInput;
  section?: SectionInput;
  productName: string;
  onChange: (d: ChapterDataInput) => void;
  onSectionChange: (s: Partial<SectionInput>) => void;
}

export function Slide09Supply({ data, section, onChange, onSectionChange }: Props) {
  const update = (patch: Partial<ChapterDataInput>) => onChange({ ...data, ...patch });

  return (
    <div className="space-y-5">
      <SectionHeaderEditor
        title={section?.title ?? "Standard Supply"}
        tagline={section?.tagline ?? ""}
        onTitleChange={(v) => onSectionChange({ title: v })}
        onTaglineChange={(v) => onSectionChange({ tagline: v })}
      />

      <SpecTableEditor
        label="Standard Items (as specs)"
        specs={(data.standardItems || []).map((item) => ({ label: item, value: "✓ Included" }))}
        onChange={(rows) => update({ standardItems: rows.map((r) => r.label) })}
      />

      <SpecTableEditor
        label="Optional Items"
        specs={(data.optionalItems || []).map((item) => ({ label: item, value: "Optional" }))}
        onChange={(rows) => update({ optionalItems: rows.map((r) => r.label) })}
      />

      <SlideImagePicker
        label="Supply Image"
        value={section?.imageUrl || ""}
        onChange={(url) => onSectionChange({ imageUrl: url })}
      />
    </div>
  );
}
