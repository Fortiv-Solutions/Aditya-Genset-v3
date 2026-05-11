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

export function Slide03Fuel({ data, section, onChange, onSectionChange }: Props) {
  const update = (patch: Partial<ChapterDataInput>) => onChange({ ...data, ...patch });

  return (
    <div className="space-y-5">
      <SectionHeaderEditor
        title={section?.title ?? "Fuel, Lube & Cooling"}
        tagline={section?.tagline ?? ""}
        onTitleChange={(v) => onSectionChange({ title: v })}
        onTaglineChange={(v) => onSectionChange({ tagline: v })}
      />

      <SpecTableEditor
        label="Fuel System"
        specs={data.specs || []}
        onChange={(specs) => update({ specs })}
      />

      <SpecTableEditor
        label="Lubrication Specs"
        specs={data.lubeSpecs || []}
        onChange={(lubeSpecs) => update({ lubeSpecs })}
      />

      <SpecTableEditor
        label="Cooling System"
        specs={data.coolingSpecs || []}
        onChange={(coolingSpecs) => update({ coolingSpecs })}
      />

      <SlideImagePicker
        label="Fuel / Lube Image"
        value={section?.imageUrl || ""}
        onChange={(url) => onSectionChange({ imageUrl: url })}
      />
    </div>
  );
}
