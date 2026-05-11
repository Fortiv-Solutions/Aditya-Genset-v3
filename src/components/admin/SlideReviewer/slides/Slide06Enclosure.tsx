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

export function Slide06Enclosure({ data, section, onChange, onSectionChange }: Props) {
  const update = (patch: Partial<ChapterDataInput>) => onChange({ ...data, ...patch });

  return (
    <div className="space-y-5">
      <SectionHeaderEditor
        title={section?.title ?? "Enclosure & Sound"}
        tagline={section?.tagline ?? ""}
        onTitleChange={(v) => onSectionChange({ title: v })}
        onTaglineChange={(v) => onSectionChange({ tagline: v })}
      />

      <SpecTableEditor
        label="Acoustic (Silent) Dimensions"
        specs={data.acousticDims || []}
        onChange={(acousticDims) => update({ acousticDims })}
      />

      <SpecTableEditor
        label="Open Set Dimensions"
        specs={data.openDims || []}
        onChange={(openDims) => update({ openDims })}
      />

      <SpecTableEditor
        label="Environmental / Sound Specs"
        specs={data.envSpecs || []}
        onChange={(envSpecs) => update({ envSpecs })}
      />

      <SlideImagePicker
        label="Enclosure Image"
        value={section?.imageUrl || ""}
        onChange={(url) => onSectionChange({ imageUrl: url })}
        hint="Photo of the acoustic enclosure"
      />
    </div>
  );
}
