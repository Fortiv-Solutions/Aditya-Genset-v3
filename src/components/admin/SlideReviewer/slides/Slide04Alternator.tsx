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

export function Slide04Alternator({ data, section, onChange, onSectionChange }: Props) {
  const update = (patch: Partial<ChapterDataInput>) => onChange({ ...data, ...patch });

  return (
    <div className="space-y-5">
      <SectionHeaderEditor
        title={section?.title ?? "Alternator"}
        tagline={section?.tagline ?? ""}
        onTitleChange={(v) => onSectionChange({ title: v })}
        onTaglineChange={(v) => onSectionChange({ tagline: v })}
      />

      <SpecTableEditor
        label="Alternator Specs"
        specs={data.specs || []}
        onChange={(specs) => update({ specs })}
      />

      <SpecTableEditor
        label="Performance Specs"
        specs={data.perfSpecs || []}
        onChange={(perfSpecs) => update({ perfSpecs })}
      />

      <StringListEditor
        label="Alternator Features"
        items={data.features || []}
        onChange={(features) => update({ features })}
        placeholder="e.g. Brushless, screen protected..."
      />

      <SlideImagePicker
        label="Alternator Image"
        value={section?.imageUrl || ""}
        onChange={(url) => onSectionChange({ imageUrl: url })}
      />
    </div>
  );
}
