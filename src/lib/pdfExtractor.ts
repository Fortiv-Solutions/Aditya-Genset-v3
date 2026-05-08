/**
 * PDF → Structured Product Data Extractor
 * Uses pdf.js (browser-native) to read text, then calls Gemini to extract structured data.
 *
 * FIX: AI JSON keys (product_name, power_kva, etc.) are now mapped to form keys
 * (name, kva, engineBrand, etc.) via mapExtractedToFormFields before returning.
 */

import { mapExtractedToFormFields } from "./enhancedPdfExtractor";
import type { RawExtractedData } from "./enhancedPdfExtractor";

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
    mod.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
    pdfjsLib = mod;
  }
  return pdfjsLib;
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

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

export async function extractPdfAssets(file: File, maxPages = 15): Promise<ExtractedPdfAssets> {
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

    await page.render({ canvasContext: context, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) => {
          if (value) resolve(value);
          else reject(new Error(`Unable to render preview image for PDF page ${i}.`));
        },
        "image/jpeg",
        0.8
      );
    });

    pageImages.push({
      pageNumber: i,
      blob,
      previewUrl: URL.createObjectURL(blob),
      width: canvas.width,
      height: canvas.height,
      mimeType: "image/jpeg",
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

export interface ExtractedSection {
  title: string;
  type: "specs" | "features" | "mixed";
  specs: { label: string; value: string }[];
  features: string[];
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
  highlights: string[];
  features: string[];
  advancedSections: ExtractedSection[];
  confidence: "high" | "medium" | "low";
  rawNotes: string;
  extractionSource?: "ai" | "local-fallback";
}

// ─── Schema sent to Gemini ────────────────────────────────────────────────────
const EXTRACTION_SYSTEM_PROMPT = `
You are an advanced Data Extraction AI for Aditya Tech Mech (Escorts-Kubota) DG sets.
Your task is to comprehensively parse the ENTIRE PDF and extract ALL technical data, features, highlights, and specifications.

You MUST return ONLY a valid JSON object following this EXACT structure:

{
  "basic_info": {
    "product_name": "string or null",
    "model_number": "string or null",
    "power_kva": "number or null",
    "engine_brand": "string or null (e.g., 'Escorts Kubota', 'Baudouin', 'Cummins')",
    "engine_model": "string or null",
    "alternator_brand": "string or null (e.g., 'Stamford', 'Leroy Somer')",
    "cpcb_compliance": "string or null (e.g., 'iv-plus' or 'ii')",
    "application": "string or null (e.g., 'prime', 'standby')",
    "rated_voltage": "string or null (e.g., '415V')",
    "frequency_hz": "number or null (e.g., 50)",
    "power_factor": "number or null (e.g., 0.8)",
    "noise_level": "string or null (e.g., '75 dB(A)')",
    "fuel_consumption_75": "string or null (e.g., '2.5 L/hr')",
    "fuel_tank_capacity": "string or null (e.g., '60 Litres')",
    "dry_weight_kg": "number or null",
    "dimensions": {
      "length_mm": "number or null",
      "width_mm": "number or null",
      "height_mm": "number or null",
      "full_string": "string or null (e.g., '1450 x 850 x 1100 mm')"
    }
  },
  "sections": [
    {
      "title": "string (e.g., 'Engine Features', 'Alternator Data', 'DG Control Panel')",
      "type": "string (MUST BE exactly 'specs' OR 'features' OR 'mixed')",
      "specs": [
        { "label": "string", "value": "string" }
      ],
      "features": [
        "string (bullet points or textual descriptions)"
      ]
    }
  ]
}

CRITICAL RULES:
1. CAPTURE EVERYTHING: Do not summarize. If there is a table (e.g., Cooling System, Fuel System, Alternator Options), extract every row into the "specs" array of a new section.
2. EXTRACT FEATURES: Look for bullet points under headings like "Product Highlights", "Engine Features", "DG Control Panel", etc., and put them in the "features" array of that section.
3. SILENT/ACOUSTIC PRIORITY: If there is data for both "Open" and "Acoustic/Silent" sets (like Dimensions & Weights), prioritize the Acoustic/Silent data in the main basic_info.
4. CLEAN STRINGS: For models and brands, extract ONLY the model name (e.g., 'EKL15-IV') and not descriptive text.
5. NO CONVERSATION: Return ONLY the JSON object. Do not wrap in markdown fences if possible.
`;

const EMPTY_PRODUCT: ExtractedProduct = {
  name: "",
  model: "",
  category: "silent-dg-sets",
  shortDesc: "",
  fullDesc: "",
  kva: "",
  engineBrand: "",
  engineModel: "",
  application: "prime",
  fuelConsumption: "",
  fuelTankCapacity: "",
  noiseLevel: "",
  dimensions: "",
  dryWeight: "",
  cpcb: "iv-plus",
  voltage: "",
  frequency: "50 Hz",
  phase: "",
  powerFactor: "0.8",
  coolingType: "",
  controllerModel: "",
  alternatorBrand: "",
  specs: [],
  highlights: [],
  features: [],
  advancedSections: [],
  confidence: "low",
  rawNotes: "",
  extractionSource: "local-fallback",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
  if (lower.includes("escorts")) return "escorts-kubota"; // "Escorts" alone → brand slug
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
  return "silent-dg-sets";
}

function inferCpcbFromText(text: string, sourceFileName?: string) {
  const combined = `${text} ${sourceFileName || ""}`.toLowerCase();
  if (/\bcpcb\s*(ii|2)\b/.test(combined)) return "ii";
  return "iv-plus";
}

// ─── Local fallback (no API key / API down) ───────────────────────────────────

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
      /\bmodel\s*(?:no\.?|number)?\s*[:\-]?\s*([A-Z0-9][A-Z0-9 -]{2,20})\b/i,
      /\b(EKL\s*[-/]?\s*\d+(?:\.\d+)?\s*(?:IV|II|4|2)?)\b/i,
      /\b(ATM[A-Z0-9 ./_-]{3,30})\b/i,
    ]) ||
    fileStem ||
    "";

  const engineBrand = inferBrandFromText(text) || inferBrandFromText(fileStem || "");
  const engineLabel = engineBrand
    ? engineBrand.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("-")
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
    /75%\s*[Ll]oad\s*[:\-]?\s*([0-9.]+)/i,
    /\bfuel\s*cons(?:umption)?\s*(?:@\s*75%)?\s*[:\-]?\s*([0-9.]+\s*(?:l\/h|ltr\/hr|lph)[^,;]*)/i,
    /\b([0-9.]+\s*(?:l\/h|ltr\/hr|lph))\b/i,
  ]);

  const fuelTankCapacity = firstMatch(text, [
    /\bfuel\s*tank\s*(?:capacity)?\s*[:\-]?\s*([0-9.]+\s*(?:l|ltr|litre|liter)s?)\b/i,
    /\b([0-9.]+\s*(?:l|ltr))\s*(?:fuel|day)\s*tank\b/i,
  ]);

  const noiseLevel = firstMatch(text, [
    /\bnoise\s*(?:level)?\s*[:\-]?\s*([0-9.]+\s*dB(?:\(A\))?(?:\s*@\s*[0-9.]+\s*m)?)/i,
    /\b([0-9.]+\s*dB(?:\(A\))?)\b/i,
  ]);

  // Acoustic dimensions: look for the acoustic/silent row specifically
  const dimensions =
    firstMatch(text, [
      /acoustic\s*(?:set)?\s*(?:length|l)\s*[=:\-]?\s*([0-9]{3,5})\s*.*?width.*?([0-9]{3,5})\s*.*?height.*?([0-9]{3,5})/i,
    ]) ||
    firstMatch(text, [
      /([0-9]{3,5}\s*[x×]\s*[0-9]{3,5}\s*[x×]\s*[0-9]{3,5}\s*mm?)/i,
    ]);

  // Prefer acoustic weight
  const dryWeight = firstMatch(text, [
    /acoustic\b.*?\b([0-9]{3,4})\s*kg/i,
    /weight\s*,?\s*dry\s*[:\-]?\s*([0-9]{3,4})\s*kg/i,
    /\b([0-9]{3,4})\s*kg\b/i,
  ]);

  const phase = firstMatch(text, [
    /\b(3\s*phase(?:\s*,?\s*4\s*wire)?)\b/i,
    /\b(single\s*phase)\b/i,
  ]);

  const powerFactor = firstMatch(text, [
    /\bpower\s*factor\s*[:\-]?\s*([0-9.]+)\b/i,
    /\bpf\s*[:\-]?\s*([0-9.]+)\b/i,
  ]);

  const coolingType = firstMatch(text, [
    /\b(radiator\s*cooled|water\s*cooled|air\s*cooled|liquid\s*cooled)\b/i,
  ]);

  const controllerModel = firstMatch(text, [
    /\bcontroller\s*(?:model)?\s*[:\-]?\s*([A-Z0-9][A-Z0-9 ./_-]{2,30})\b/i,
    /\b(DEIF\s*[A-Z0-9 ._-]{2,20}|Deep\s*Sea\s*[A-Z0-9 ._-]{2,20})\b/i,
  ]);

  const application = /\bstandby\b/i.test(text) ? "standby" : "prime";

  const name = kva
    ? `${kva} kVA ${engineLabel} DG Set`
    : model
      ? `${model} DG Set`
      : "Diesel Generator Set";

  const fuelDisplay = fuelConsumption.match(/[0-9.]+/)?.[0]
    ? `${fuelConsumption.match(/[0-9.]+/)![0]} L/hr`
    : fuelConsumption;

  const specs = uniqueSpecs([
    { label: "Power Output (kVA)", value: kva ? `${kva} kVA` : "" },
    { label: "Engine Make & Model", value: [engineLabel === "Diesel" ? "" : engineLabel, engineModel].filter(Boolean).join(" ") },
    { label: "Alternator Brand", value: alternatorBrand },
    { label: "Frequency", value: frequency },
    { label: "Voltage Output", value: voltage },
    { label: "Phase", value: phase },
    { label: "Power Factor", value: powerFactor },
    { label: "Fuel Consumption (75%)", value: fuelDisplay },
    { label: "Fuel Tank Capacity", value: fuelTankCapacity },
    { label: "Noise Level", value: noiseLevel },
    { label: "Dimensions (L×W×H)", value: dimensions },
    { label: "Dry Weight", value: dryWeight ? `${dryWeight} kg` : "" },
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
    shortDesc: kva
      ? `${kva} kVA diesel generator set — extracted from uploaded datasheet. Review before publishing.`
      : "Diesel generator set extracted from uploaded datasheet. Review before publishing.",
    fullDesc: `${name} — fields extracted locally from the uploaded PDF because the AI service was unavailable. Please verify and update before publishing.`,
    kva,
    engineBrand,
    engineModel,
    application,
    fuelConsumption: fuelDisplay,
    fuelTankCapacity,
    noiseLevel,
    dimensions,
    dryWeight: dryWeight ? `${dryWeight} kg` : "",
    cpcb,
    voltage,
    frequency: frequency || "50 Hz",
    phase,
    powerFactor: powerFactor || "0.8",
    coolingType,
    controllerModel,
    alternatorBrand,
    specs,
    confidence: filledCoreFields >= 5 ? "medium" : "low",
    rawNotes: fallbackReason
      ? `AI extraction unavailable — local parsing used. Reason: ${fallbackReason}`
      : "Local PDF parsing used. Please review before publishing.",
    extractionSource: "local-fallback",
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function extractProductDataWithAI(
  rawText: string,
  sourceFileName?: string,
  pageImages?: string[],
  retries = 2
): Promise<ExtractedProduct> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return buildLocalProductFromText(rawText, sourceFileName, "VITE_GEMINI_API_KEY is not set.");
  }

  const prompt = `${EXTRACTION_SYSTEM_PROMPT}

PDF FILENAME: ${sourceFileName || "unknown"}
PDF TEXT CONTENT:
${rawText.slice(0, 15000)}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  // Send up to 4 page images so Gemini can see table layouts,
                  // badges, and multi-column data that plain text extraction misses
                  ...(pageImages || []).slice(0, 4).map((img) => ({
                    inline_data: {
                      mime_type: "image/jpeg",
                      data: img.includes(",") ? img.split(",")[1] : img,
                    },
                  })),
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 8192,
            },
          }),
        }
      );

      if (response.status === 503 && attempt < retries) {
        await new Promise((res) => setTimeout(res, 1500 * (attempt + 1)));
        continue;
      }

      if (!response.ok) {
        const err = await response.text();
        return buildLocalProductFromText(
          rawText,
          sourceFileName,
          `Gemini API error ${response.status}: ${normalizeWhitespace(err).slice(0, 260)}`
        );
      }

      const data = await response.json();
      const rawJson: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Strip markdown fences if Gemini adds them despite the instruction
      const stripped = rawJson
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/, "")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'")
        .trim();

      const firstBrace = stripped.indexOf("{");
      const lastBrace = stripped.lastIndexOf("}");

      if (firstBrace === -1 || lastBrace === -1) {
        return buildLocalProductFromText(rawText, sourceFileName, "Gemini returned no JSON object.");
      }

      const cleaned = stripped.slice(firstBrace, lastBrace + 1);

      let rawAiData: RawExtractedData;
      try {
        rawAiData = JSON.parse(cleaned) as RawExtractedData;
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "\nRaw response:", cleaned);
        return buildLocalProductFromText(rawText, sourceFileName, "Gemini returned malformed JSON.");
      }

      // ─── THE KEY FIX ──────────────────────────────────────────────────────
      // mapExtractedToFormFields converts AI key names (product_name, power_kva…)
      // into the form field names (name, kva, engineBrand…) your form expects.
      // Without this step, spreading rawAiData onto EMPTY_PRODUCT fills no fields.
      const mappedFields = mapExtractedToFormFields(rawAiData);

      // Build specs table from the mapped data
      const specs = uniqueSpecs([
        { label: "Power Output (kVA)", value: mappedFields.kva ? `${mappedFields.kva} kVA` : "" },
        { label: "Engine Make & Model", value: [mappedFields.engineBrand, mappedFields.engineModel].filter(Boolean).join(" ") },
        { label: "Alternator Brand", value: mappedFields.alternatorBrand || "" },
        { label: "Frequency", value: mappedFields.frequency || "" },
        { label: "Voltage Output", value: mappedFields.voltage || "" },
        { label: "Power Factor", value: mappedFields.powerFactor || "" },
        { label: "Fuel Consumption (75%)", value: mappedFields.fuelConsumption || "" },
        { label: "Dimensions (L×W×H)", value: mappedFields.dimensions || "" },
        { label: "Dry Weight", value: mappedFields.dryWeight || "" },
        { label: "Noise Level", value: mappedFields.noiseLevel || "" },
        { label: "CPCB Compliance", value: mappedFields.cpcb === "ii" ? "CPCB II" : "CPCB IV+" },
      ]);

      const kvaNum = parseFloat(mappedFields.kva || "0") || 0;
      const engineLabel = (mappedFields.engineBrand || "Diesel")
        .split("-")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join("-");

      const filledFields = Object.values(mappedFields).filter(
        (v) => v !== "" && v !== null && v !== undefined
      ).length;

      return {
        ...EMPTY_PRODUCT,
        name: mappedFields.name || (kvaNum ? `${kvaNum} kVA ${engineLabel} DG Set` : "Diesel Generator Set"),
        model: mappedFields.model || "",
        category: inferCategoryFromText(rawText),
        shortDesc: kvaNum
          ? `${kvaNum} kVA ${engineLabel} silent diesel generator set. CPCB ${mappedFields.cpcb === "ii" ? "II" : "IV+"} compliant.`
          : "Diesel generator set.",
        fullDesc: `The ${mappedFields.model || "DG Set"} is a ${kvaNum} kVA silent diesel generator powered by ${engineLabel}. Designed to comply with ISO 8528 and CPCB ${mappedFields.cpcb === "ii" ? "II" : "IV+"} norms.`,
        ...mappedFields,
        specs,
        highlights: [],
        features: [],
        confidence: filledFields >= 8 ? "high" : filledFields >= 5 ? "medium" : "low",
        rawNotes: `AI keys found: ${Object.keys(rawAiData).join(", ")}`,
        extractionSource: "ai",
      };
    } catch (err) {
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, 1500 * (attempt + 1)));
        continue;
      }
      return buildLocalProductFromText(
        rawText,
        sourceFileName,
        `Connection failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return buildLocalProductFromText(rawText, sourceFileName, "Max retries reached.");
}
