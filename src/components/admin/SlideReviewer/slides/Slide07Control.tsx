import type { ChapterDataInput, SectionInput } from "@/lib/api/productPublisher";
import { SpecTableEditor, StringListEditor, SlideImagePicker, SectionHeaderEditor } from "../SlideEditorPrimitives";

interface Props {
  chapterKey: string;
  data: ChapterDataInput;
  section?: SectionInput;
  productName: string;
  onChange: (d: ChapterDataInput) => void;
  onSectionChange: (s: Partial<SectionInput>) => void;
}

export function Slide07Control({ data, section, onChange, onSectionChange }: Props) {
  const update = (patch: Partial<ChapterDataInput>) => onChange({ ...data, ...patch });

  return (
    <div className="space-y-5">
      <SectionHeaderEditor
        title={section?.title ?? "Control Panel"}
        tagline={section?.tagline ?? ""}
        onTitleChange={(v) => onSectionChange({ title: v })}
        onTaglineChange={(v) => onSectionChange({ tagline: v })}
      />

      <SpecTableEditor
        label="Controller Specs"
        specs={data.specs || []}
        onChange={(specs) => update({ specs })}
      />

      <SpecTableEditor
        label="Electrical Supply Specs"
        specs={data.electricalSpecs || []}
        onChange={(electricalSpecs) => update({ electricalSpecs })}
      />

      <StringListEditor
        label="Engine Parameters Monitored"
        items={data.engineParams || []}
        onChange={(engineParams) => update({ engineParams })}
        placeholder="e.g. Oil Pressure"
      />

      <StringListEditor
        label="Electrical Parameters Monitored"
        items={data.electricalParams || []}
        onChange={(electricalParams) => update({ electricalParams })}
        placeholder="e.g. Gen Voltage"
      />

      <SlideImagePicker
        label="Control Panel Image"
        value={section?.imageUrl || ""}
        onChange={(url) => onSectionChange({ imageUrl: url })}
      />
    </div>
  );
}
