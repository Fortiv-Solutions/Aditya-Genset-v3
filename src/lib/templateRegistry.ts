/**
 * templateRegistry.ts
 * Detects which product template to use based on PDF text / engine brand,
 * and exports the canonical chapter key ordering per template.
 */

export type TemplateId = "escorts" | "baudouin" | "generic";

export interface TemplateDetectionResult {
  templateId: TemplateId;
  confidence: "high" | "medium" | "low";
  reason: string;
}

// ── Ordered chapter keys per template ────────────────────────────────────────

export const ESCORTS_CHAPTER_KEYS = [
  "overview",
  "engine",
  "fuel",
  "alternator",
  "enclosure",
  "control",
  "protection",
  "supply",
  "dimensions",
  "electrical",
  "video",
] as const;

export const ESCORTS_CHAPTER_LABELS: Record<string, string> = {
  overview:    "01 — Overview",
  engine:      "02 — Engine",
  fuel:        "03 — Fuel, Lube & Cooling",
  alternator:  "04 — Alternator",
  electrical:  "05 — Electrical",
  enclosure:   "06 — Enclosure",
  control:     "07 — Control Panel",
  protection:  "08 — Protection",
  supply:      "09 — Standard Supply",
  dimensions:  "10 — Dimensions",
  video:       "11 — Video",
};

export const ESCORTS_HOTSPOT_POSITIONS: Record<
  string,
  { x: number; y: number; zoom: number; offsetX: number; offsetY: number }
> = {
  overview:   { x: 50, y: 50, zoom: 1,   offsetX: 0,   offsetY: 0   },
  engine:     { x: 42, y: 55, zoom: 1.8, offsetX: 8,   offsetY: 2   },
  fuel:       { x: 58, y: 65, zoom: 1.4, offsetX: -5,  offsetY: -5  },
  alternator: { x: 25, y: 48, zoom: 1.6, offsetX: 15,  offsetY: -5  },
  enclosure:  { x: 85, y: 58, zoom: 1.5, offsetX: -15, offsetY: 5   },
  control:    { x: 75, y: 35, zoom: 2.0, offsetX: -20, offsetY: 15  },
  protection: { x: 70, y: 38, zoom: 2.2, offsetX: -15, offsetY: 12  },
  supply:     { x: 50, y: 50, zoom: 1.2, offsetX: 0,   offsetY: 0   },
  dimensions: { x: 50, y: 78, zoom: 1.2, offsetX: 0,   offsetY: -10 },
  electrical: { x: 35, y: 48, zoom: 1.6, offsetX: 15,  offsetY: -5  },
  video:      { x: 50, y: 50, zoom: 1,   offsetX: 0,   offsetY: 0   },
};

export const BAUDOUIN_CHAPTER_KEYS = [
  "overview",
  "engine",
  "fuel",
  "alternator",
  "enclosure",
  "control",
  "protection",
  "supply",
  "dimensions",
  "video",
] as const;

export const GENERIC_CHAPTER_KEYS = [
  "overview",
  "engine",
  "alternator",
  "enclosure",
  "supply",
  "video",
] as const;

// ── Template detection ────────────────────────────────────────────────────────

const ESCORTS_SIGNALS = [
  "escorts kubota",
  "escorts-kubota",
  "escorts",
  "ekl15",
  "ekl20",
  "ekl 15",
  "ekl 20",
  "ekl 30",
  "ekl 40",
  "ekl 62",
  "g15-iv",
  "g20-iv",
  "g30-iv",
  "g40-iv",
  "aditya tech mech",
  "atm ekl",
];

const BAUDOUIN_SIGNALS = [
  "baudouin",
  "m series",
  "m22g",
  "m33g",
  "4m06",
  "6m11",
  "6m16",
  "6m21",
];

export function detectTemplateFromText(
  text: string,
  filename?: string
): TemplateDetectionResult {
  const combined = `${text} ${filename || ""}`.toLowerCase();

  // Count Escorts signals
  const escortsHits = ESCORTS_SIGNALS.filter((s) => combined.includes(s)).length;
  if (escortsHits >= 2) {
    return { templateId: "escorts", confidence: "high", reason: `Escorts signals found: ${escortsHits}` };
  }
  if (escortsHits === 1) {
    return { templateId: "escorts", confidence: "medium", reason: "Single Escorts signal found" };
  }

  // Count Baudouin signals
  const baudouinHits = BAUDOUIN_SIGNALS.filter((s) => combined.includes(s)).length;
  if (baudouinHits >= 1) {
    return { templateId: "baudouin", confidence: baudouinHits >= 2 ? "high" : "medium", reason: `Baudouin signals found: ${baudouinHits}` };
  }

  return { templateId: "generic", confidence: "low", reason: "No brand signals detected" };
}

export function detectTemplateFromBrand(engineBrand: string): TemplateDetectionResult {
  const b = engineBrand.toLowerCase();
  if (b.includes("escort") || b.includes("ekl") || b.includes("kubota")) {
    return { templateId: "escorts", confidence: "high", reason: `Brand: ${engineBrand}` };
  }
  if (b.includes("baudouin")) {
    return { templateId: "baudouin", confidence: "high", reason: `Brand: ${engineBrand}` };
  }
  return { templateId: "generic", confidence: "low", reason: `Unknown brand: ${engineBrand}` };
}

export function getChapterKeys(templateId: TemplateId): readonly string[] {
  switch (templateId) {
    case "escorts":  return ESCORTS_CHAPTER_KEYS;
    case "baudouin": return BAUDOUIN_CHAPTER_KEYS;
    default:         return GENERIC_CHAPTER_KEYS;
  }
}

export function getChapterLabels(templateId: TemplateId): Record<string, string> {
  // For now Escorts labels are the reference; extend per template later
  return ESCORTS_CHAPTER_LABELS;
}
