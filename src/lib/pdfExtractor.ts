/**
 * PDF → Structured Product Data Extractor
 * Uses pdf.js (browser-native) to read text, then calls Gemini to extract structured data.
 */

// Lazy-load pdfjs to avoid bundling its worker in the main thread
let pdfjsLib: any = null;

async function getPdfjsLib() {
  if (!pdfjsLib) {
    const mod = await import("pdfjs-dist");
    // Use a CDN-hosted worker so we don't need to copy it to public/
    mod.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${mod.version}/pdf.worker.min.js`;
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

export interface ExtractedProduct {
  name: string;
  model: string;
  category: string;
  shortDesc: string;
  kva: string;
  engineBrand: string;
  engineModel: string;
  fuelConsumption: string;
  noiseLevel: string;
  dimensions: string;
  dryWeight: string;
  cpcb: string;
  voltage: string;
  frequency: string;
  alternatorBrand: string;
  specs: { label: string; value: string }[];
  confidence: "high" | "medium" | "low";
  rawNotes: string;
}

const SCHEMA = `{
  "name": "full product name e.g. 250 kVA Silent DG Set",
  "model": "model number e.g. ATM-250S or ATMBD250",
  "category": "one of: silent-dg-sets | open-dg-sets | industrial",
  "shortDesc": "one-sentence product description (max 160 chars)",
  "kva": "numeric kVA value only e.g. 250",
  "engineBrand": "one of: baudouin | escorts-kubota | kubota | kohler | cummins | mahindra",
  "engineModel": "engine model number e.g. 6M11G165/5",
  "fuelConsumption": "fuel consumption in L/h e.g. 52.5 L/h",
  "noiseLevel": "noise level e.g. 75 dB(A) @ 1m",
  "dimensions": "L×W×H in mm",
  "dryWeight": "dry weight in kg",
  "cpcb": "one of: iv-plus | ii",
  "voltage": "output voltage e.g. 415V / 3-phase",
  "frequency": "frequency e.g. 50 Hz",
  "alternatorBrand": "alternator brand e.g. Stamford or Leroy Somer",
  "specs": [
    { "label": "any additional spec label", "value": "corresponding value" }
  ],
  "confidence": "your confidence level: high | medium | low",
  "rawNotes": "brief note on anything unclear or missing from the PDF"
}`;

/** Uses the Gemini API (free tier) to extract structured product data from raw PDF text */
export async function extractProductDataWithAI(rawText: string): Promise<ExtractedProduct> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "VITE_GEMINI_API_KEY is not set. Add it to your .env file to use AI extraction."
    );
  }

  const prompt = `You are a technical data extraction specialist for industrial diesel generator sets.
Extract product specifications from the following PDF text and return ONLY valid JSON matching the exact schema below.
If a field cannot be found, use null. Do not add any text outside the JSON.

SCHEMA:
${SCHEMA}

PDF TEXT:
${rawText.slice(0, 12000)}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
    throw new Error(`Gemini API error: ${response.status} — ${err}`);
  }

  const data = await response.json();
  const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Strip markdown code fences if present
  const cleaned = rawJson.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(cleaned) as ExtractedProduct;
  } catch {
    throw new Error("AI returned invalid JSON. Try a clearer PDF or check your API key.");
  }
}
