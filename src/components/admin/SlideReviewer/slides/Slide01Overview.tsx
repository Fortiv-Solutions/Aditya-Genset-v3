import type { ChapterDataInput, SectionInput } from "@/lib/api/productPublisher";
import { SlideField, SpecTableEditor, StringListEditor, SlideImagePicker, SectionHeaderEditor } from "../SlideEditorPrimitives";

interface Props {
  chapterKey: string;
  data: ChapterDataInput;
  section?: SectionInput;
  productName: string;
  onChange: (d: ChapterDataInput) => void;
  onSectionChange: (s: Partial<SectionInput>) => void;
}

export function Slide01Overview({ data, section, productName, onChange, onSectionChange }: Props) {
  const update = (patch: Partial<ChapterDataInput>) => onChange({ ...data, ...patch });

  return (
    <div className="space-y-5">
      <SectionHeaderEditor
        title={section?.title ?? productName}
        tagline={section?.tagline ?? ""}
        onTitleChange={(v) => onSectionChange({ title: v })}
        onTaglineChange={(v) => onSectionChange({ tagline: v })}
      />

      <SlideField
        label="Product Description"
        value={data.description || ""}
        onChange={(v) => update({ description: v })}
        multiline
        rows={4}
        placeholder="Describe the product in detail..."
      />

      <SpecTableEditor
        label="Overview Specs"
        specs={data.specs || []}
        onChange={(specs) => update({ specs })}
      />

      <SpecTableEditor
        label="About Specs (second tab)"
        specs={data.aboutSpecs || []}
        onChange={(aboutSpecs) => update({ aboutSpecs })}
      />

      <StringListEditor
        label="Compliance Badges"
        items={data.badges || []}
        onChange={(badges) => update({ badges })}
        placeholder="e.g. CPCB IV+"
      />

      <SlideImagePicker
        label="Overview Image"
        value={section?.imageUrl || ""}
        onChange={(url) => onSectionChange({ imageUrl: url })}
        hint="Main showcase image for this chapter"
      />
    </div>
  );
}
