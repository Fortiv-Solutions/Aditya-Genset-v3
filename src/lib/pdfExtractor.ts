/**
 * PDF → Structured Product Data Extractor
 * Uses pdf.js (browser-native) to read text, then calls Gemini to extract structured data.
 */

// Lazy-load pdfjs to avoid bundling its worker in the main thread
let pdfjsLib: any = null;

export interface ExtractedPdfImage {
  pageNumber: number;
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  mimeType: string;
}

export interface ExtractedPdfAssets {
  sourcePdf: File;
  sourcePdfPreviewUrl: string;
  pageImages: ExtractedPdfImage[];
}

export interface PdfImportPayload {
  data: ExtractedProduct;
  assets: ExtractedPdfAssets;
}

async function getPdfjsLib() {
  if (!pdfjsLib) {
    const mod = await import("pdfjs-dist");
    // Use a CDN-hosted worker so we don't need to copy it to public/
    mod.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    pdfjsLib = mod;
  }
  return pdfjsLib;
}

/** Extracts all raw text from a PDF File object */
export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjs = await getPdfjsLib();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(" ");
    fullText += `\n--- Page ${i} ---\n${pageText}`;
  }

  return fullText.trim();
}

export async function extractPdfAssets(file: File, maxPages = 8): Promise<ExtractedPdfAssets> {
  const pdfjs = await getPdfjsLib();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const pageImages: ExtractedPdfImage[] = [];
  const pageCount = Math.min(pdf.numPages, maxPages);

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => {
        if (value) resolve(value);
        else reject(new Error(`Unable to render preview image for PDF page ${i}.`));
      }, "image/png");
    });

    pageImages.push({
      pageNumber: i,
      blob,
      previewUrl: URL.createObjectURL(blob),
      width: canvas.width,
      height: canvas.height,
      mimeType: "image/png",
    });

    canvas.width = 0;
    canvas.height = 0;
  }

  return {
    sourcePdf: file,
    sourcePdfPreviewUrl: URL.createObjectURL(file),
    pageImages,
  };
}

export interface ExtractedProduct {
  name: string;
  model: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  kva: string;
  engineBrand: string;
  engineModel: string;
  application: string;
  fuelConsumption: string;
  fuelTankCapacity: string;
  noiseLevel: string;
  dimensions: string;
  dryWeight: string;
  cpcb: string;
  voltage: string;
  frequency: string;
  phase: string;
  powerFactor: string;
  coolingType: string;
  controllerModel: string;
  alternatorBrand: string;
  specs: { label: string; value: string }[];
  confidence: "high" | "medium" | "low";
  rawNotes: string;
  extractionSource?: "ai" | "local-fallback";
}

const SCHEMA = `{
  "name": "full product name e.g. 250 kVA Silent DG Set",
  "model": "model number e.g. ATM-250S or ATMBD250",
  "category": "one of: silent-dg-sets | open-dg-sets | industrial",
  "shortDesc": "one-sentence product description (max 160 chars)",
  "fullDesc": "2-4 sentence detailed product description for the product page",
  "kva": "numeric kVA value only e.g. 250",
  "engineBrand": "one of: baudouin | escorts-kubota | kubota | kohler | cummins | mahindra",
  "engineModel": "engine model number e.g. 6M11G165/5",
  "application": "prime | standby | continuous or closest matching application label from the PDF",
  "fuelConsumption": "fuel consumption in L/h e.g. 52.5 L/h",
  "fuelTankCapacity": "fuel tank capacity e.g. 120 L",
  "noiseLevel": "noise level e.g. 75 dB(A) @ 1m",
  "dimensions": "L×W×H in mm",
  "dryWeight": "dry weight in kg",
  "cpcb": "one of: iv-plus | ii",
  "voltage": "output voltage e.g. 415V / 3-phase",
  "frequency": "frequency e.g. 50 Hz",
  "phase": "phase configuration e.g. 3-phase, 4-wire",
  "powerFactor": "power factor e.g. 0.8 lagging",
  "coolingType": "cooling system e.g. water-cooled or radiator cooled",
  "controllerModel": "controller or control panel model if present",
  "alternatorBrand": "alternator brand e.g. Stamford or Leroy Somer",
  "specs": [
    { "label": "any additional spec label", "value": "corresponding value" }
  ],
  "confidence": "your confidence level: high | medium | low",
  "rawNotes": "brief note on anything unclear or missing from the PDF"
}`;

const EMPTY_PRODUCT: ExtractedProduct = {
  name: "",
  model: "",
  category: "silent-dg-sets",
  shortDesc: "",
  fullDesc: "",
  kva: "",
  engineBrand: "",
  engineModel: "",
  application: "",
  fuelConsumption: "",
  fuelTankCapacity: "",
  noiseLevel: "",
  dimensions: "",
  dryWeight: "",
  cpcb: "iv-plus",
  voltage: "",
  frequency: "",
  phase: "",
  powerFactor: "",
  coolingType: "",
  controllerModel: "",
  alternatorBrand: "",
  specs: [],
  confidence: "low",
  rawNotes: "",
  extractionSource: "local-fallback",
};

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const firstMatch = (text: string, patterns: RegExp[]) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return normalizeWhitespace(match[1]);
  }
  return "";
};

const uniqueSpecs = (specs: { label: string; value: string }[]) => {
  const seen = new Set<string>();
  return specs.filter((spec) => {
    const label = normalizeWhitespace(spec.label);
    const value = normalizeWhitespace(spec.value);
    if (!label || !value) return false;

    const key = `${label.toLowerCase()}::${value.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

function inferBrandFromText(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("escorts kubota") || lower.includes("escort kubota")) return "escorts-kubota";
  if (lower.includes("kubota")) return "kubota";
  if (lower.includes("baudouin")) return "baudouin";
  if (lower.includes("cummins")) return "cummins";
  if (lower.includes("kohler")) return "kohler";
  if (lower.includes("mahindra")) return "mahindra";
  return "";
}

function inferCategoryFromText(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("open") && !lower.includes("acoustic")) return "open-dg-sets";
  if (lower.includes("silent") || lower.includes("acoustic") || lower.includes("canopy")) return "silent-dg-sets";
  return "silent-dg-sets";
}

function inferCpcbFromText(text: string, sourceFileName?: string) {
  const combined = `${text} ${sourceFileName || ""}`.toLowerCase();
  if (/\bcpcb\s*(ii|2)\b/.test(combined)) return "ii";
  if (/\bcpcb\s*(iv|4)\s*\+?/.test(combined) || /\biv\s*\+?\b/.test(combined)) return "iv-plus";
  return "iv-plus";
}

function buildLocalProductFromText(
  rawText: string,
  sourceFileName?: string,
  fallbackReason?: string
): ExtractedProduct {
  const text = normalizeWhitespace(rawText);
  const fileStem = sourceFileName?.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ");
  const kva = firstMatch(text, [
    /\b(\d+(?:\.\d+)?)\s*kva\b/i,
    /\bpower\s*(?:output|rating|prime)?\s*[:\-]?\s*(\d+(?:\.\d+)?)\b/i,
  ]);
  const model =
    firstMatch(text, [
      /\bmodel\s*(?:no\.?|number)?\s*[:\-]?\s*([A-Z0-9][A-Z0-9 ./_-]{2,35})\b/i,
      /\b(EKL\s*[-/]?\s*\d+(?:\.\d+)?\s*KVA\s*[-/]?\s*(?:IV|II|4|2)?)\b/i,
      /\b(ATM[A-Z0-9 ./_-]{3,30})\b/i,
    ]) ||
    fileStem ||
    "";
  const engineBrand = inferBrandFromText(text) || inferBrandFromText(fileStem || "");
  const engineLabel = engineBrand
    ? engineBrand
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("-")
    : "Diesel";
  const category = inferCategoryFromText(text);
  const cpcb = inferCpcbFromText(text, sourceFileName);
  const engineModel = firstMatch(text, [
    /\bengine\s*(?:model|type)\s*[:\-]?\s*([A-Z0-9][A-Z0-9 ./_-]{2,35})\b/i,
    /\bengine\s*[:\-]?\s*([A-Z0-9][A-Z0-9 ./_-]{2,35})\b/i,
  ]);
  const alternatorBrand = firstMatch(text, [
    /\balternator\s*(?:make|brand)?\s*[:\-]?\s*([A-Z][A-Z0-9 &./_-]{2,30})\b/i,
  ]);
  const frequency = firstMatch(text, [/\b(50\s*hz)\b/i, /\b(60\s*hz)\b/i]);
  const voltage = firstMatch(text, [
    /\b(415\s*v(?:olts?)?(?:\s*\/?\s*3\s*phase)?)\b/i,
    /\b(230\s*v(?:olts?)?)\b/i,
  ]);
  const fuelConsumption = firstMatch(text, [
    /\bfuel\s*consumption\s*[:\-]?\s*([0-9.]+\s*(?:l\/h|ltr\/hr|litre\/hr|lph|liter\/hour)[^,;]*)/i,
  ]);
  const fuelTankCapacity = firstMatch(text, [
    /\bfuel\s*tank\s*(?:capacity)?\s*[:\-]?\s*([0-9.]+\s*(?:l|ltr|litre|liter)s?)\b/i,
  ]);
  const noiseLevel = firstMatch(text, [
    /\bnoise\s*(?:level)?\s*[:\-]?\s*([0-9.]+\s*dB(?:\(A\))?(?:\s*@\s*[0-9.]+\s*m)?)/i,
    /\b([0-9.]+\s*dB(?:\(A\))?(?:\s*@\s*[0-9.]+\s*m)?)\b/i,
  ]);
  const dimensions = firstMatch(text, [
    /\bdimensions?\s*(?:\(?.*?mm\)?)?\s*[:\-]?\s*([0-9]{3,5}\s*[x×]\s*[0-9]{3,5}\s*[x×]\s*[0-9]{3,5}\s*mm?)/i,
    /\b([0-9]{3,5}\s*[x×]\s*[0-9]{3,5}\s*[x×]\s*[0-9]{3,5}\s*mm?)\b/i,
  ]);
  const dryWeight = firstMatch(text, [
    /\b(?:dry\s*)?weight\s*[:\-]?\s*([0-9.]+\s*kg)\b/i,
  ]);
  const phase = firstMatch(text, [
    /\b(3\s*phase(?:\s*,?\s*4\s*wire)?)\b/i,
    /\b(single\s*phase)\b/i,
  ]);
  const powerFactor = firstMatch(text, [
    /\bpower\s*factor\s*[:\-]?\s*([0-9.]+\s*(?:lagging)?)\b/i,
    /\bpf\s*[:\-]?\s*([0-9.]+\s*(?:lagging)?)\b/i,
  ]);
  const coolingType = firstMatch(text, [
    /\b(radiator\s*cooled|water\s*cooled|air\s*cooled|liquid\s*cooled)\b/i,
  ]);
  const controllerModel = firstMatch(text, [
    /\bcontroller\s*(?:model)?\s*[:\-]?\s*([A-Z0-9][A-Z0-9 ./_-]{2,30})\b/i,
    /\bcontrol\s*panel\s*[:\-]?\s*([A-Z0-9][A-Z0-9 ./_-]{2,30})\b/i,
  ]);
  const application = firstMatch(text, [
    /\bapplication\s*[:\-]?\s*([A-Z][A-Z &/,-]{2,40})\b/i,
    /\b(prime|standby|continuous)\s*(?:power|rating)?\b/i,
  ]);

  const name = kva
    ? `${kva} kVA ${engineLabel} DG Set`
    : model
      ? `${model} DG Set`
      : "Diesel Generator Set";
  const shortDesc = kva
    ? `${kva} kVA diesel generator set extracted from the uploaded datasheet for admin review.`
    : "Diesel generator set extracted from the uploaded datasheet for admin review.";
  const fullDesc = `${name} details were extracted from the uploaded PDF using local parsing because AI extraction was unavailable. Please review the generated fields, specifications, and media before publishing.`;

  const specs = uniqueSpecs([
    { label: "Power Output (kVA)", value: kva ? `${kva} kVA` : "" },
    { label: "Engine Make", value: engineLabel === "Diesel" ? "" : engineLabel },
    { label: "Engine Model", value: engineModel },
    { label: "Alternator Brand", value: alternatorBrand },
    { label: "Frequency", value: frequency },
    { label: "Voltage Output", value: voltage },
    { label: "Phase", value: phase },
    { label: "Power Factor", value: powerFactor },
    { label: "Fuel Consumption", value: fuelConsumption },
    { label: "Fuel Tank Capacity", value: fuelTankCapacity },
    { label: "Noise Level", value: noiseLevel },
    { label: "Dimensions", value: dimensions },
    { label: "Dry Weight", value: dryWeight },
    { label: "Cooling", value: coolingType },
    { label: "Controller", value: controllerModel },
    { label: "CPCB Compliance", value: cpcb === "ii" ? "CPCB II" : "CPCB IV+" },
  ]);

  const filledCoreFields = [kva, model, engineBrand, engineModel, alternatorBrand, frequency, voltage].filter(Boolean).length;

  return {
    ...EMPTY_PRODUCT,
    name,
    model,
    category,
    shortDesc,
    fullDesc,
    kva,
    engineBrand,
    engineModel,
    application,
    fuelConsumption,
    fuelTankCapacity,
    noiseLevel,
    dimensions,
    dryWeight,
    cpcb,
    voltage,
    frequency,
    phase,
    powerFactor,
    coolingType,
    controllerModel,
    alternatorBrand,
    specs,
    confidence: filledCoreFields >= 5 ? "medium" : "low",
    rawNotes: fallbackReason
      ? `Gemini extraction was unavailable, so local PDF parsing filled a draft. Reason: ${fallbackReason}`
      : "Local PDF parsing filled a draft. Please review before publishing.",
    extractionSource: "local-fallback",
  };
}

/** Uses Gemini first, then falls back to local text parsing when the API is unavailable. */
export async function extractProductDataWithAI(rawText: string, sourceFileName?: string): Promise<ExtractedProduct> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return buildLocalProductFromText(rawText, sourceFileName, "VITE_GEMINI_API_KEY is not set.");
  }

  const prompt = `You are a technical data extraction specialist for industrial diesel generator sets.
Extract product specifications from the following PDF text and return ONLY valid JSON matching the exact schema below.
If a field cannot be found, use null. Do not add any text outside the JSON.

SCHEMA:
${SCHEMA}

PDF TEXT:
${rawText.slice(0, 12000)}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1500,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    return buildLocalProductFromText(
      rawText,
      sourceFileName,
      `Gemini API error ${response.status}. ${normalizeWhitespace(err).slice(0, 260)}`
    );
  }

  const data = await response.json();
  const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Strip markdown code fences if present
  const cleaned = rawJson.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return {
      ...EMPTY_PRODUCT,
      ...JSON.parse(cleaned),
      extractionSource: "ai",
    } as ExtractedProduct;
  } catch {
    return buildLocalProductFromText(rawText, sourceFileName, "Gemini returned invalid JSON.");
  }
}
