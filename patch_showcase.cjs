const fs = require('fs');
const file = 'src/lib/productAutomation.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Rename buildEscortsTemplateContent to buildEnhancedTemplateContent and add parameters
content = content.replace(
  /function buildEscortsTemplateContent\(source: ProductSource\): ProductAutomationResult \{/,
  `function buildEnhancedTemplateContent(source: ProductSource, brandKey: EngineBrandKey, brandLabel: string, type: ProductType): ProductAutomationResult {`
);

// 2. Replace hardcoded "Escorts" string in getShowcaseSubtitle inside buildEnhancedTemplateContent
content = content.replace(
  /pageSubtitle: `\$\{sections.length\}-chapter walkthrough of the Escorts-powered generator. \$\{enhanced.extractionNotes\}`/,
  `pageSubtitle: \`\${sections.length}-chapter walkthrough of the \${brandLabel}-powered generator. \${enhanced.extractionNotes}\``
);

// 3. Replace hardcoded "Escorts" in getFullDescription
content = content.replace(
  /description: getFullDescription\(source, "Escorts"\)/g,
  `description: getFullDescription(source, brandLabel)`
);

// 4. Replace hardcoded brandKey return
content = content.replace(
  /brandKey: "escorts-kubota",\s*brandLabel: "Escorts",\s*categorySlug: inferCategorySlug\(\{\s*brandKey: "escorts-kubota",/g,
  `brandKey,\n    brandLabel,\n    categorySlug: inferCategorySlug({\n      brandKey,`
);

// 5. Replace hardcoded "Escorts" in getShowcaseSubtitle fallback
content = content.replace(
  /pageSubtitle: getShowcaseSubtitle\("Escorts", inferProductType\(source.extracted\?\.category, source\.form\.type\), sections\.length\)/,
  `pageSubtitle: getShowcaseSubtitle(brandLabel, type, sections.length)`
);

// 6. Fix engineMake hardcoding in generateEscortsProduct input
content = content.replace(
  /engineMake: "Escorts",/,
  `engineMake: brandLabel,`
);

// 7. Update generateProductAutomation routing logic
const oldRouting = `export function generateProductAutomation(source: ProductSource): ProductAutomationResult {
  const brandKey = normalizeEngineBrandKey(source.extracted?.engineBrand || source.form.engineBrand);
  const type = inferProductType(source.extracted?.category, source.form.type);
  const brandLabel = getEngineBrandLabel(brandKey, source.form.engineBrand);

  if (brandKey === "escorts-kubota" || brandKey === "kubota") {
    return buildEscortsTemplateContent({
      ...source,
      form: {
        ...source.form,
        type,
        engineBrand: "escorts-kubota",
      },
    });
  }

  return buildGenericContent(
    {
      ...source,
      form: {
        ...source.form,
        type,
      },
    },
    brandLabel,
    type,
  );
}`;

const newRouting = `export function generateProductAutomation(source: ProductSource): ProductAutomationResult {
  const brandKey = normalizeEngineBrandKey(source.extracted?.engineBrand || source.form.engineBrand);
  const type = inferProductType(source.extracted?.category, source.form.type);
  const brandLabel = getEngineBrandLabel(brandKey, source.form.engineBrand);

  // If we have AI extraction data, or if it's an Escorts product, ALWAYS generate the full 10-slide enhanced layout
  if (source.extracted || brandKey === "escorts-kubota" || brandKey === "kubota") {
    return buildEnhancedTemplateContent({
      ...source,
      form: {
        ...source.form,
        type,
        engineBrand: brandKey,
      },
    }, brandKey, brandLabel, type);
  }

  // Fallback for manual entry non-escorts
  return buildGenericContent(
    {
      ...source,
      form: {
        ...source.form,
        type,
      },
    },
    brandLabel,
    type,
  );
}`;

content = content.replace(oldRouting, newRouting);

fs.writeFileSync(file, content);
console.log("Patched productAutomation.ts to generate 10 slides universally");
