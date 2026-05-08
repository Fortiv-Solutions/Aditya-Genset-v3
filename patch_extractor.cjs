const fs = require('fs');
const file = 'src/lib/enhancedPdfExtractor.ts';
let content = fs.readFileSync(file, 'utf8');

const replacement = `export function mapExtractedToFormFields(raw: any): Partial<ExtractedProduct> {
  const clean = (val: any) => {
    if (val === null || val === undefined || val === "null" || val === "N/A" || val === "Not found" || val === "") return null;
    return val;
  };

  const basicInfo = raw.basic_info || {};

  // Extremely fuzzy key matcher to handle Gemini's unpredictable JSON casing
  const findKey = (matches: string[]) => {
    const keys = Object.keys(basicInfo);
    for (const match of matches) {
      const normalizedMatch = match.toLowerCase().replace(/[^a-z0-9]/g, '');
      const found = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normalizedMatch));
      if (found && clean(basicInfo[found])) {
        return clean(basicInfo[found]);
      }
    }
    return null;
  };

  // 1. Normalize Engine Brand
  const rawMake = findKey(["enginebrand", "enginemake", "brand", "make"]) || "";
  const make = rawMake.toString().toLowerCase();
  let engineBrand = ""; 
  if (make.includes("baudouin")) engineBrand = "baudouin";
  else if (make.includes("kubota") && !make.includes("escorts")) engineBrand = "kubota";
  else if (make.includes("escorts")) engineBrand = "escorts-kubota";
  else if (make.includes("cummins")) engineBrand = "cummins";
  else if (make.includes("mahindra")) engineBrand = "mahindra";
  else if (make.includes("kohler")) engineBrand = "kohler";

  // 2. Clean Voltage
  const rawVoltage = (findKey(["voltage", "ratedvoltage", "outputvoltage"]) || "").toString();
  const voltage = rawVoltage.includes("/") ? rawVoltage.split("/").pop()?.trim() || rawVoltage : rawVoltage;

  // 3. Normalize CPCB
  const rawCpcb = (findKey(["cpcb", "compliance", "emission"]) || "").toString().toLowerCase();
  let cpcb = "";
  if (rawCpcb.includes("iv") || rawCpcb.includes("4")) cpcb = "iv-plus";
  else if (rawCpcb.includes("ii") || rawCpcb.includes("2")) cpcb = "ii";

  // 4. Parse Advanced Sections
  const advancedSections = Array.isArray(raw.sections) ? raw.sections.map((s: any) => ({
    title: clean(s.title) || "Unknown Section",
    type: clean(s.type) || "mixed",
    specs: Array.isArray(s.specs) ? s.specs.map((sp: any) => ({ label: clean(sp.label) || "", value: clean(sp.value) || "" })) : [],
    features: Array.isArray(s.features) ? s.features.map(clean).filter(Boolean) : []
  })) : [];

  // 5. Try to extract common legacy fields from sections for the basic table
  let dimensions = "";
  let dryWeight = "";
  let fuelConsumption = "";
  let noiseLevel = "";

  for (const sec of advancedSections) {
    if (sec.type === "specs" || sec.type === "mixed") {
      for (const sp of sec.specs) {
        const lbl = sp.label.toLowerCase();
        if (lbl.includes("length") || lbl.includes("width") || lbl.includes("height") || lbl.includes("dimension")) dimensions += \`\${sp.label}: \${sp.value} \`;
        if (lbl.includes("weight") || lbl.includes("dry mass")) dryWeight = sp.value;
        if (lbl.includes("fuel") && (lbl.includes("75") || lbl.includes("consumption"))) fuelConsumption = sp.value;
        if (lbl.includes("noise") || lbl.includes("sound") || lbl.includes("db")) noiseLevel = sp.value;
      }
    }
  }

  return {
    name: findKey(["productname", "name", "title"]) || "",
    model: findKey(["modelnumber", "model", "gensetmodel"]) || "",
    kva: (findKey(["powerkva", "kva", "poweroutput", "rating"]) || "").toString().replace(/[^0-9.]/g, ""),
    engineBrand,
    engineModel: findKey(["enginemodel"]) || "",
    alternatorBrand: findKey(["alternatorbrand", "alternatormake", "alternator"]) || "",
    cpcb,
    application: findKey(["application", "duty"]) || "",
    frequency: findKey(["frequency", "hz"]) ? \`\${findKey(["frequency", "hz"])} Hz\` : "",
    voltage,
    dimensions: dimensions.trim() || (findKey(["dimension", "size"]) || ""),
    dryWeight: dryWeight ? \`\${dryWeight.replace(/kg/i, '').trim()} kg\` : (findKey(["weight"]) || ""),
    fuelConsumption: fuelConsumption ? \`\${fuelConsumption.replace(/l\\/hr/i, '').trim()} L/hr\` : (findKey(["fuel"]) || ""),
    noiseLevel: noiseLevel ? \`\${noiseLevel.replace(/db/i, '').trim()} dB(A) @ 1m\` : (findKey(["noise", "sound"]) || ""),
    advancedSections
  };
}`;

const startIndex = content.indexOf('export function mapExtractedToFormFields');
const endIndex = content.indexOf('export interface EnhancedProductExtraction');

if (startIndex !== -1 && endIndex !== -1) {
  content = content.slice(0, startIndex) + replacement + '\n\n' + content.slice(endIndex);
  fs.writeFileSync(file, content);
  console.log("Patched enhancedPdfExtractor.ts successfully");
} else {
  console.error("Could not find bounds");
}
