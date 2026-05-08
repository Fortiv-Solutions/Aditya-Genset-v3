const fs = require('fs');
let content = fs.readFileSync('src/components/admin/PDFImportZone.tsx', 'utf8');
const replacement = `              ))}
            </div>

            {result.data.advancedSections && result.data.advancedSections.length > 0 && (
              <div className="mt-2 pb-4 px-4 bg-background">
                <div className="py-2 border-b border-border/50 overflow-x-auto no-scrollbar flex gap-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center">
                    Detailed Sections
                  </p>
                </div>
                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {result.data.advancedSections.map((sec, i) => (
                    <div key={i} className="bg-secondary/50 rounded-lg p-3 border border-border/50">
                      <h4 className="text-xs font-bold text-accent mb-2 uppercase tracking-wide">{sec.title}</h4>
                      {sec.features && sec.features.length > 0 && (
                        <ul className="space-y-1 mb-3">
                          {sec.features.map((feat, j) => (
                            <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5 leading-tight">
                              <span className="text-accent/60 mt-[1px]">•</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {sec.specs && sec.specs.length > 0 && (
                        <div className="space-y-1.5">
                          {sec.specs.map((spec, j) => (
                            <div key={j} className="flex items-start justify-between gap-4 text-xs border-b border-border/30 pb-1.5 last:border-0 last:pb-0">
                              <span className="text-muted-foreground">{spec.label}</span>
                              <span className="text-foreground font-medium text-right">{spec.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          )}`;
content = content.replace(/              \)\)}\r?\n            <\/div>\r?\n          \)}/, replacement);
fs.writeFileSync('src/components/admin/PDFImportZone.tsx', content);
console.log("Patched successfully!");
