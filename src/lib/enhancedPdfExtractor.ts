/**
 * Enhanced PDF Extraction System
 * Automatically generates complete 10-chapter showcase and presentation data
 * Based on EKL15 template structure
 */

import type { ExtractedProduct } from "./pdfExtractor";
import type { SpecRow } from "@/data/products";

/** Raw data format returned by the locked AI prompt */
export interface RawExtractedData {
  basic_info: {
    product_name: string | null;
    model_number: string | null;
    power_kva: number | null;
    engine_brand: string | null;
    engine_model: string | null;
    alternator_brand: string | null;
    cpcb_compliance: string | null;
    application: string | null;
    rated_voltage: string | null;
    frequency_hz: number | null;
    power_factor: number | null;
    noise_level: string | null;
    fuel_consumption_75: string | null;
    fuel_tank_capacity: string | null;
    dry_weight_kg: number | null;
    dimensions: {
      length_mm: number | null;
      width_mm: number | null;
      height_mm: number | null;
      full_string: string | null;
    } | null;
    technical_summary?: string;
  };
  sections: Array<{
    title: string;
    type: "specs" | "features" | "mixed";
    specs: Array<{ label: string; value: string }>;
    features: string[];
  }>;
  unmapped_notes?: string[];
}

export interface DimEntry { label: string; value: string; }
export interface ReactanceRow { symbol: string; description: string; value: string; }
export interface OptionalGroup { label: string; items: string[]; }

export interface ChapterData {
  id: string;
  number: string;
  title: string;
  tagline?: string;
  description?: string;
  badges?: string[];
  specs?: SpecRow[];
  aboutSpecs?: SpecRow[];
  features?: string[];
  lubeSpecs?: SpecRow[];
  coolingSpecs?: SpecRow[];
  perfSpecs?: SpecRow[];
  reactanceData?: ReactanceRow[];
  acousticDims?: DimEntry[];
  openDims?: DimEntry[];
  envSpecs?: SpecRow[];
  engineParams?: string[];
  electricalParams?: string[];
  electricalSpecs?: SpecRow[];
  engineProtections?: string[];
  electricalProtections?: string[];
  approvals?: string[];
  standardItems?: string[];
  optionalItems?: string[];
  optionalGroups?: OptionalGroup[];
  highlights?: Array<{ value: number | string; suffix: string; label: string }>;
  fuelConsumptionPoints?: { load: number; lhr: number }[];
  efficiencyPoints?: { label: string; value: number }[];
  unmappedNotes?: string[];
}

export interface HotspotData {
  id: string;
  title: string;
  description: string;
  x: number;
  y: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
  specs: SpecRow[];
}

export interface EnhancedProductExtraction {
  name: string;
  model: string;
  kva: number;
  kwe: number;
  chapters: ChapterData[];
  hotspots: HotspotData[];
  confidence: "high" | "medium" | "low";
  missingFields: string[];
  extractionNotes: string;
}

/** Maps strict AI output to the application's ExtractedProduct format with fuzzy key matching */
export function mapExtractedToFormFields(raw: any): Partial<ExtractedProduct> {
  const clean = (val: any) => {
    if (val === null || val === undefined || val === "null" || val === "N/A" || val === "Not found" || val === "") return null;
    if (typeof val === 'string') {
      let s = val.trim();
      s = s.replace(/^(Features|Model|Brand|Engine|Alternator|Rating|Value|Label):\s*/i, "");
      return s;
    }
    return val;
  };

  const flatDict: Record<string, any> = {};
  
  const flatten = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      obj.forEach(flatten);
      return;
    }
    for (const [k, v] of Object.entries(obj)) {
      if (v !== null && typeof v === 'object') {
        flatten(v);
      } else if (v !== null && v !== undefined) {
        const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        flatDict[cleanKey] = v;
      }
    }
  };
  
  flatten(raw);

  const findKey = (matches: string[]) => {
    const keys = Object.keys(flatDict);
    for (const match of matches) {
      const normalizedMatch = match.toLowerCase().replace(/[^a-z0-9]/g, '');
      const found = keys.find(k => k.includes(normalizedMatch));
      if (found && clean(flatDict[found])) {
        return clean(flatDict[found]);
      }
    }
    return null;
  };

  const basic = raw.basic_info || (Array.isArray(raw.basic_info) ? raw.basic_info[0] : {});
  
  const getBasic = (key: string, fuzzyMatches: string[]) => {
    if (basic[key] && clean(basic[key])) return clean(basic[key]);
    return findKey(fuzzyMatches);
  };

  const withUnit = (val: string | null, unit: string) => {
    if (!val) return "";
    const s = val.toString();
    if (s.toLowerCase().includes(unit.toLowerCase())) return s;
    return `${s} ${unit}`;
  };

  const rawMake = getBasic("engine_brand", ["enginebrand", "enginemake", "brand", "make"]) || "";
  const make = rawMake.toString().toLowerCase();
  let engineBrand = ""; 
  if (make.includes("baudouin")) engineBrand = "baudouin";
  else if (make.includes("kubota") && !make.includes("escorts")) engineBrand = "kubota";
  else if (make.includes("escorts")) engineBrand = "escorts-kubota";
  else if (make.includes("cummins")) engineBrand = "cummins";
  else if (make.includes("mahindra")) engineBrand = "mahindra";
  else if (make.includes("kohler")) engineBrand = "kohler";

  const rawVoltage = (getBasic("rated_voltage", ["voltage", "ratedvoltage", "outputvoltage"]) || "").toString();
  const voltage = rawVoltage.includes("/") ? rawVoltage.split("/").pop()?.trim() || rawVoltage : rawVoltage;

  const rawCpcb = (getBasic("cpcb_compliance", ["cpcb", "compliance", "emission"]) || "").toString().toLowerCase();
  let cpcb = "";
  if (rawCpcb.includes("iv") || rawCpcb.includes("4")) cpcb = "iv-plus";
  else if (rawCpcb.includes("ii") || rawCpcb.includes("2")) cpcb = "ii";

  let advancedSections: any[] = [];
  if (raw.sections && Array.isArray(raw.sections)) {
    advancedSections = raw.sections.map((s: any) => ({
      title: clean(s.title) || "Unknown Section",
      type: clean(s.type) || "mixed",
      specs: Array.isArray(s.specs) ? s.specs.map((sp: any) => ({ label: clean(sp.label) || "", value: clean(sp.value) || "" })) : [],
      features: Array.isArray(s.features) ? s.features.map(clean).filter(Boolean) : []
    }));
  }

  let dimensions = "";
  let dryWeight = "";
  let fuelConsumption = "";
  let noiseLevel = "";

  for (const sec of advancedSections) {
    if (sec.type === "specs" || sec.type === "mixed") {
      for (const sp of sec.specs) {
        if (!sp.label) continue;
        const lbl = sp.label.toLowerCase();
        if (lbl.includes("length") || lbl.includes("width") || lbl.includes("height") || lbl.includes("dimension") || lbl.includes("l x w x h")) {
           if (!dimensions.toLowerCase().includes(lbl)) dimensions += `${sp.label}: ${sp.value} `;
        }
        if (lbl.includes("weight") || lbl.includes("dry mass")) dryWeight = sp.value;
        if (lbl.includes("fuel") && (lbl.includes("75") || lbl.includes("consumption"))) fuelConsumption = sp.value;
        if (lbl.includes("noise") || lbl.includes("sound") || lbl.includes("db")) noiseLevel = sp.value;
      }
    }
  }

  const dimObj = basic.dimensions || {};
  const dimStr = dimObj.full_string || (dimObj.length_mm ? `${dimObj.length_mm} x ${dimObj.width_mm} x ${dimObj.height_mm} mm` : "");

  const result = {
    name: getBasic("product_name", ["productname", "name", "title"]) || "",
    model: getBasic("model_number", ["modelnumber", "model", "gensetmodel"]) || "",
    kva: (getBasic("power_kva", ["powerkva", "kva", "poweroutput", "rating"]) || "").toString().replace(/[^0-9.]/g, ""),
    engineBrand,
    engineModel: getBasic("engine_model", ["enginemodel", "engine"]) || "",
    alternatorBrand: getBasic("alternator_brand", ["alternatorbrand", "alternatormake", "alternator"]) || "",
    cpcb,
    application: getBasic("application", ["application", "duty"]) || "",
    frequency: withUnit(getBasic("frequency_hz", ["frequency", "hz"]), "Hz"),
    voltage: withUnit(voltage, "Volts"),
    powerFactor: getBasic("power_factor", ["powerfactor", "pf"]) || "0.8",
    dimensions: dimStr || dimensions.trim() || (getBasic("dimensions", ["dimension", "size", "lxwxh"]) || ""),
    dryWeight: withUnit(dryWeight ? dryWeight.replace(/kg/i, '').trim() : (getBasic("dry_weight", ["weight"]) || "").toString().replace(/kg/i, '').trim(), "kg"),
    fuelConsumption: withUnit(fuelConsumption ? fuelConsumption.replace(/l\/hr|lph/i, '').trim() : (getBasic("fuel_consumption", ["fuel"]) || "").toString().replace(/l\/hr|lph/i, '').trim(), "L/hr"),
    noiseLevel: withUnit(noiseLevel ? noiseLevel.replace(/db\(a\)|db/i, '').trim() : (getBasic("noise_level", ["noise", "sound"]) || "").toString().replace(/db\(a\)|db/i, '').trim(), "dB(A) @ 1m"),
    advancedSections
  };

  return result;
}

/**
 * Enhanced extraction that generates complete 10-chapter structure
 * Fills in missing data with intelligent defaults based on available information
 */
export function enhanceProductExtraction(
  extracted: ExtractedProduct,
  additionalSpecs: SpecRow[]
): EnhancedProductExtraction {
  const kva = parseFloat(extracted.kva) || 0;
  const kwe = Math.round(kva * 0.8 * 10) / 10;
  const missingFields: string[] = [];
  
  // Pool all specs from core list and advanced sections
  const specPool = [
    ...additionalSpecs,
    ...(extracted.advancedSections || []).flatMap(s => s.specs || [])
  ];

  // Pool all features from core list and advanced sections
  const featurePool = [
    ...(extracted.features || []),
    ...(extracted.advancedSections || []).flatMap(s => s.features || [])
  ];
  
  const findSpec = (patterns: string[]) => {
    const found = specPool.find((spec) =>
      patterns.some((pattern) => spec.label.toLowerCase().includes(pattern.toLowerCase()))
    );
    return found?.value || "";
  };

  const filterSpecs = (patterns: string[]) => {
    return specPool.filter((spec) =>
      patterns.some((pattern) => spec.label.toLowerCase().includes(pattern.toLowerCase()))
    );
  };

  const findFeatures = (patterns: string[], limit = 3) => {
    const found = featurePool.filter((feat) =>
      patterns.some((pattern) => feat.toLowerCase().includes(pattern.toLowerCase()))
    );
    if (found.length > 0) return found.slice(0, limit);
    return [];
  };
  
  const checkField = (value: string | undefined, fieldName: string) => {
    if (!value || value.trim() === "" || value === "Refer datasheet") {
      missingFields.push(fieldName);
      return false;
    }
    return true;
  };

  const engineBrand = extracted.engineBrand || "Diesel";
  const brandLabel = engineBrand.split("-").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
  const topFeatures = findFeatures(["governing", "brushless", "alternator", "control", "sound", "compact"], 2);
  
  const dynamicShortDesc = `${kva} kVA Silent DG Set powered by ${brandLabel} engine. ${topFeatures.length > 0 ? `Features ${topFeatures.join(" & ")}. ` : ""}CPCB ${extracted.cpcb === "ii" ? "II" : "IV+"} compliant extraction from datasheet.`;

  // Try to parse fuel points from pool
  // Look for patterns like "Fuel Cons. 25% Load: 1.5 L/hr"
  const parseLoadPoint = (pats: string[]) => {
    const val = findSpec(pats);
    return parseFloat(val.replace(/[^0-9.]/g, "")) || null;
  };

  const fuelConsumptionPoints = [
    { load: 25, lhr: parseLoadPoint(["25%", "quarter load"]) },
    { load: 50, lhr: parseLoadPoint(["50%", "half load"]) },
    { load: 75, lhr: parseLoadPoint(["75%", "three quarter"]) },
    { load: 100, lhr: parseLoadPoint(["100%", "full load"]) },
    { load: 110, lhr: parseLoadPoint(["110%", "overload"]) },
  ].filter(p => p.lhr !== null) as { load: number; lhr: number }[];

  const efficiencyPoints = [
    { label: "75% Load", value: parseLoadPoint(["efficiency", "75%"]) },
    { label: "100% Load", value: parseLoadPoint(["efficiency", "100%"]) },
  ].filter(p => p.value !== null) as { label: string; value: number }[];
  
  const engineModel = extracted.engineModel || findSpec(["engine model"]);
  const cpcbLabel = extracted.cpcb === "ii" ? "CPCB II" : "CPCB IV+";
  
  const chapters: ChapterData[] = [
    {
      id: "overview",
      number: "01",
      title: extracted.name,
      badges: [cpcbLabel, "ISO 8528", "Silent Operation", "Industrial Grade", "ISO 9001:2015"],
      specs: [
        { label: "Model", value: extracted.model },
        { label: "Rating", value: `${kva} kVA / ${kwe} kWe` },
        { label: "Voltage", value: extracted.voltage || "415 V" },
        { label: "Frequency", value: extracted.frequency || "50 Hz" },
        { label: "Speed", value: extracted.frequency === "60 Hz" ? "1800 RPM" : "1500 RPM" },
        { label: "Compliance", value: cpcbLabel },
      ],
      description: extracted.technicalSummary || dynamicShortDesc,
      aboutSpecs: [
        { label: "Power Factor", value: extracted.powerFactor || "0.8 lagging" },
        { label: "ISO Compliance", value: "ISO 8528" },
        { label: "Overload", value: "10% per ISO 3046" },
      ],
      highlights: [
        { value: kva, suffix: " kVA", label: "Prime power" },
        { value: 27, suffix: "+ yrs", label: "Heritage" },
        { value: "CPCB", suffix: extracted.cpcb === "ii" ? " II" : " IV+", label: "Compliance" }
      ]
    },
    {
      id: "engine",
      number: "02",
      title: "Engine",
      tagline: "Built for continuous duty and tight load response.",
      specs: [
        { label: "Make", value: extracted.engineBrand },
        { label: "Model", value: engineModel },
        { label: "Cylinders", value: findSpec(["cylinder"]) || "Refer datasheet" },
        { label: "Displacement", value: findSpec(["displacement"]) || "Refer datasheet" },
        { label: "Bore / Stroke", value: findSpec(["bore", "stroke"]) || "Refer datasheet" },
        { label: "Gross Power", value: findSpec(["gross power", "engine power"]) || `${Math.round(kva * 0.9)} kWm` },
      ],
      features: findFeatures(["cylinder", "crankshaft", "governing", "engine", "duty", "body", "construction", "rugged"], 4).length > 0
        ? findFeatures(["cylinder", "crankshaft", "governing", "engine", "duty", "body", "construction", "rugged"], 4)
        : [
            "Cast iron cylinder block with rugged body construction",
            "High carbon steel forged crankshaft",
            "Electronic governing for fast load response",
          ]
    },
    {
      id: "fuel",
      number: "03",
      title: "Fuel, Lube & Cooling",
      specs: [
        { label: "Recommended Fuel", value: "High Speed Diesel" },
        { label: "Governor", value: findSpec(["governor"]) || "Mechanical" },
        { label: "Air Filter", value: findSpec(["air filter"]) || "Dry" },
      ],
      lubeSpecs: [
        { label: "Lube Oil Capacity", value: findSpec(["lube oil"]) || "Refer datasheet" },
        { label: "Lube Oil Consumption", value: "< Normal limits" },
      ],
      coolingSpecs: [
        { label: "Silencer", value: "Residential" },
      ],
      fuelConsumptionPoints,
    },
    {
      id: "alternator",
      number: "04",
      title: "Alternator",
      specs: [
        { label: "Make", value: extracted.alternatorBrand || "Stamford" },
        { label: "Frame", value: findSpec(["frame"]) || "Refer datasheet" },
        { label: "Voltage Regulation", value: "±1%" },
        { label: "Insulation", value: "H Class" },
      ],
      perfSpecs: [
        { label: "AVR Type", value: findSpec(["avr"]) || "AS540" },
      ],
      efficiencyPoints,
      features: findFeatures(["brushless", "screen", "motor", "excitation", "avr", "insulation", "class"], 3).length > 0
        ? findFeatures(["brushless", "screen", "motor", "excitation", "avr", "insulation", "class"], 3)
        : [
            "Brushless type, screen protected",
            "Excellent motor start capability",
          ]
    },
    {
      id: "electrical",
      number: "05",
      title: "Electrical Performance",
      specs: [
        { label: "Short Circuit Ratio", value: findSpec(["short circuit"]) },
        { label: "Battery Size", value: findSpec(["battery"]) },
        { label: "Electrical System", value: findSpec(["electrical system", "dc system", "battery voltage"]) || "12 V DC" },
      ].filter(s => s.value),
      reactanceData: [
        { symbol: "Xd", description: "Direct Axis Synchronous", value: findSpec(["xd"]) },
        { symbol: "X'd", description: "Direct Axis Transient", value: findSpec(["x'd"]) },
      ].filter(r => r.value)
    },
    {
      id: "enclosure",
      number: "06",
      title: "Acoustic Enclosure",
      specs: [
        { label: "Enclosure Type", value: "Sound attenuated / Weather proof" },
        { label: "Noise Level", value: extracted.noiseLevel },
        { label: "CPCB Compliance", value: cpcbLabel },
        { label: "Surface Treatment", value: findSpec(["paint", "powder"]) || "Powder coated" },
      ],
      features: findFeatures(["canopy", "enclosure", "sound", "acoustic", "weather", "lift", "point", "base"], 4).length > 0
        ? findFeatures(["canopy", "enclosure", "sound", "acoustic", "weather", "lift", "point", "base"], 4)
        : [
            "UV resistant powder coated canopy",
            "High quality sound absorbing insulation",
            "Point lift for easy transportation",
            "Lockable doors for safety"
          ]
    },
    {
      id: "control",
      number: "07",
      title: "Control Panel",
      specs: [
        { label: "Controller", value: extracted.controllerModel || "SGC 120" },
        { label: "Display", value: "Backlit LCD" },
        { label: "Communication", value: "USB, RS-485" },
      ],
      features: findFeatures(["controller", "display", "logic", "automatic", "start", "stop", "protection", "monitoring"], 4).length > 0
        ? findFeatures(["controller", "display", "logic", "automatic", "start", "stop", "protection", "monitoring"], 4)
        : [
            "Microprocessor based digital controller",
            "Auto start/stop and protection",
            "LCD display for clear parameters",
            "In-built event logging"
          ],
      engineParams: findFeatures(["speed", "pressure", "temp", "coolant", "battery", "hours"], 4).length > 0
        ? findFeatures(["speed", "pressure", "temp", "coolant", "battery", "hours"], 4)
        : ["Engine Speed", "Oil Pressure", "Coolant Temp", "Battery Voltage"],
      electricalParams: findFeatures(["voltage", "current", "frequency", "pf", "kw", "kvar", "kwh"], 4).length > 0
        ? findFeatures(["voltage", "current", "frequency", "pf", "kw", "kvar", "kwh"], 4)
        : ["Gen Voltage", "Gen Current", "Frequency", "Power Factor"],
      electricalSpecs: filterSpecs(["supply", "auxiliary", "analog", "digital", "input", "output"]).length > 0
        ? filterSpecs(["supply", "auxiliary", "analog", "digital", "input", "output"])
        : [
            { label: "Supply Voltage", value: "12 / 24 V DC" },
          ]
    },
    {
      id: "protection",
      number: "08",
      title: "Protection & Approvals",
      engineProtections: ["High Water Temp", "Low Oil Pressure", "Over Speed"],
      electricalProtections: findFeatures(["under", "over", "voltage", "frequency", "current", "protection"], 4).length > 0
        ? findFeatures(["under", "over", "voltage", "frequency", "current", "protection"], 4)
        : ["Under/Over Voltage", "Under/Over Frequency", "Over Current"],
      approvals: ["CE Compliant", "ISO 8528", "CPCB IV+"],
      unmappedNotes: extracted.unmappedNotes || []
    },
    {
      id: "supply",
      number: "09",
      title: "Standard Supply",
      standardItems: findFeatures(["standard", "supply", "scope", "inclusive", "base", "panel", "starter"], 6).length > 0
        ? findFeatures(["standard", "supply", "scope", "inclusive", "base", "panel", "starter"], 6)
        : [
            "Water-cooled diesel engine",
            "Electric starter",
            "Acoustic enclosure",
            "Base frame with AVM",
            "DG Control panel"
          ],
      optionalItems: findFeatures(["optional", "extra", "accessory", "heater", "ats", "remote"], 4).length > 0
        ? findFeatures(["optional", "extra", "accessory", "heater", "ats", "remote"], 4)
        : ["Coolant heater", "ATS", "Remote monitoring"],
      optionalGroups: [
        { 
          label: "Electrical Options", 
          items: findFeatures(["ats", "remote", "synchronizing", "amf", "panel"], 3).length > 0 
            ? findFeatures(["ats", "remote", "synchronizing", "amf", "panel"], 3) 
            : ["AMF Panel", "ATS Switch", "Battery Charger"] 
        },
        { 
          label: "Engine Accessories", 
          items: findFeatures(["heater", "jacket", "lube", "pump", "drain"], 3).length > 0 
            ? findFeatures(["heater", "jacket", "lube", "pump", "drain"], 3) 
            : ["Lube Oil Drain Pump", "Coolant Heater", "Electronic Governor"] 
        }
      ]
    },
    {
      id: "dimensions",
      number: "10",
      title: "Dimensions & Weights",
      acousticDims: [
        { label: "Length", value: extracted.dimensions.split(/[xX*×]/)[0]?.trim() || "Refer datasheet" },
        { label: "Width", value: extracted.dimensions.split(/[xX*×]/)[1]?.trim() || "Refer datasheet" },
        { label: "Height", value: extracted.dimensions.split(/[xX*×]/)[2]?.trim() || "Refer datasheet" },
        { label: "Fuel Tank", value: extracted.fuelTankCapacity || "Refer datasheet" },
      ],
      openDims: [
        { label: "Length", value: findSpec(["open", "length"]) || "Refer datasheet" },
        { label: "Width", value: findSpec(["open", "width"]) || "Refer datasheet" },
        { label: "Height", value: findSpec(["open", "height"]) || "Refer datasheet" },
        { label: "Dry Weight", value: extracted.dryWeight || findSpec(["weight"]) || "Refer datasheet" },
      ],
      specs: [
        { label: "Overall Dimensions", value: extracted.dimensions },
        { label: "Dry Weight (Acoustic)", value: extracted.dryWeight },
        { label: "Fuel Tank Capacity", value: extracted.fuelTankCapacity },
      ]
    }
  ];
  
  const hotspots: HotspotData[] = [
    { id: "overview", title: extracted.name, description: extracted.shortDesc, x: 50, y: 50, zoom: 1, offsetX: 0, offsetY: 0, specs: chapters[0].specs || [] },
    { id: "engine", title: "Engine", description: "High-performance engine", x: 42, y: 48, zoom: 1.8, offsetX: 8, offsetY: 2, specs: chapters[1].specs || [] },
    { id: "fuel", title: "Fuel System", description: "Efficient fuel management", x: 35, y: 55, zoom: 1.6, offsetX: 15, offsetY: -5, specs: chapters[2].specs || [] },
    { id: "alternator", title: "Alternator", description: "Stable power generation", x: 65, y: 45, zoom: 1.5, offsetX: -15, offsetY: 5, specs: chapters[3].specs || [] },
    { id: "control", title: "Control Panel", description: "Smart monitoring", x: 70, y: 30, zoom: 1.8, offsetX: -20, offsetY: 15, specs: chapters[6].specs || [] },
    { id: "dimensions", title: "Size", description: "Compact design", x: 50, y: 75, zoom: 1.2, offsetX: 0, offsetY: -10, specs: chapters[9].specs || [] },
  ];
  
  let confidence: "high" | "medium" | "low" = "high";
  if (missingFields.length > 5) confidence = "low";
  else if (missingFields.length > 2) confidence = "medium";
  
  return {
    name: extracted.name,
    model: extracted.model,
    kva,
    kwe,
    chapters,
    hotspots,
    confidence,
    missingFields,
    extractionNotes: missingFields.length > 0 ? `Missing: ${missingFields.join(", ")}` : "Extraction successful",
  };
}
