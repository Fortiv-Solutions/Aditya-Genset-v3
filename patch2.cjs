const fs = require('fs');

const file = 'src/pages/admin/AddProduct.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Import ExtractedSection
content = content.replace(
  /import type { ExtractedProduct, PdfImportPayload } from "@\/lib\/pdfExtractor";/,
  `import type { ExtractedProduct, PdfImportPayload, ExtractedSection } from "@/lib/pdfExtractor";`
);

// 2. Add state variable
content = content.replace(
  /const \[extractedData, setExtractedData\] = useState<ExtractedProduct \| null>\(null\);/,
  `const [extractedData, setExtractedData] = useState<ExtractedProduct | null>(null);\n  const [advancedSections, setAdvancedSections] = useState<ExtractedSection[]>([]);`
);

// 3. Update handleExtracted to populate state
content = content.replace(
  /if \(extractedSpecs.length > 0\) \{\n      setSpecs\(extractedSpecs\);\n    \}/,
  `if (extractedSpecs.length > 0) {\n      setSpecs(extractedSpecs);\n    }\n\n    if (data.advancedSections && data.advancedSections.length > 0) {\n      setAdvancedSections(data.advancedSections);\n    }`
);

// 4. Rename old sections and insert the new "Advanced AI Specifications" section
content = content.replace(
  /title="C\. Pricing & Availability"/,
  `title="D. Pricing & Availability"`
);
content = content.replace(
  /title="D\. Media"/,
  `title="E. Media"`
);
content = content.replace(
  /title="E\. SEO \(Optional\)"/,
  `title="F. SEO (Optional)"`
);

const advancedSectionUI = `      {advancedSections.length > 0 && (
        <FormSection title="C. Advanced AI Specifications" icon={Sparkles}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advancedSections.map((sec, i) => (
              <div key={i} className="bg-secondary/30 rounded-xl p-4 border border-border/50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-accent">{sec.title}</h4>
                  <button type="button" onClick={() => setAdvancedSections(current => current.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-red-400 p-1 transition-colors"><Trash2 size={14}/></button>
                </div>
                {sec.features && sec.features.length > 0 && (
                  <ul className="space-y-1 mb-3">
                    {sec.features.map((feat, j) => (
                      <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-accent/60 mt-[2px]">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {sec.specs && sec.specs.length > 0 && (
                  <div className="space-y-2">
                    {sec.specs.map((spec, j) => (
                      <div key={j} className="flex justify-between gap-4 text-xs border-b border-border/30 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-muted-foreground">{spec.label}</span>
                        <span className="text-foreground font-medium text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 italic text-amber-500/80">
            Note: These advanced sections will be automatically appended to the Full Description when published.
          </p>
        </FormSection>
      )}

      <FormSection title="D. Pricing & Availability"`;

content = content.replace(
  /<FormSection title="D\. Pricing & Availability"/,
  advancedSectionUI
);

// 5. Inject advancedSections into full_desc when saving
const saveReplacement = `        short_desc: form.shortDesc || null,
        full_desc: (() => {
          let desc = form.fullDesc || "";
          if (advancedSections.length > 0) {
            desc += "\\n\\n### Detailed Specifications\\n\\n";
            desc += advancedSections.map(sec => {
              let secStr = \`#### \${sec.title}\\n\`;
              if (sec.features && sec.features.length > 0) {
                secStr += sec.features.map(f => \`- \${f}\`).join("\\n") + "\\n";
              }
              if (sec.specs && sec.specs.length > 0) {
                secStr += sec.specs.map(s => \`- **\${s.label}**: \${s.value}\`).join("\\n") + "\\n";
              }
              return secStr;
            }).join("\\n");
          }
          return desc || null;
        })(),`;

content = content.replace(
  /short_desc: form\.shortDesc \|\| null,\n\s*full_desc: form\.fullDesc \|\| null,/,
  saveReplacement
);

fs.writeFileSync(file, content);
console.log("Patched AddProduct.tsx successfully!");
