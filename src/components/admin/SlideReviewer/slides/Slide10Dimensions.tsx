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

export function Slide10Dimensions({ data, section, onChange, onSectionChange }: Props) {
  const update = (patch: Partial<ChapterDataInput>) => onChange({ ...data, ...patch });

  return (
    <div className="space-y-5">
      <SectionHeaderEditor
        title={section?.title ?? "Dimensions & Weight"}
        tagline={section?.tagline ?? ""}
        onTitleChange={(v) => onSectionChange({ title: v })}
        onTaglineChange={(v) => onSectionChange({ tagline: v })}
      />

      <SpecTableEditor
        label="Acoustic Set Dimensions"
        specs={data.acousticDims || []}
        onChange={(acousticDims) => update({ acousticDims })}
      />

      <SpecTableEditor
        label="Open Set Dimensions"
        specs={data.openDims || []}
        onChange={(openDims) => update({ openDims })}
      />

      <SpecTableEditor
        label="General Specs"
        specs={data.specs || []}
        onChange={(specs) => update({ specs })}
      />

      <SlideImagePicker
        label="Dimensions Diagram / Photo"
        value={section?.imageUrl || ""}
        onChange={(url) => onSectionChange({ imageUrl: url })}
        hint="Technical drawing or dimensional photo"
      />
    </div>
  );
}
