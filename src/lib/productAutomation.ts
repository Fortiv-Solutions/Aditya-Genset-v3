import enclosureFallback from "@/assets/products/parts/enclosure.jpg";
import engineFallback from "@/assets/products/parts/engine-real.jpg";
import escort15kva from "@/assets/products/escorts/escort_15kva.jpg";
import escort15kva2 from "@/assets/products/escorts/escort_15kva_2.jpg";
import escort20kva1 from "@/assets/products/escorts/escort_20kva_1.jpg";
import escort30kva from "@/assets/products/escorts/escort_30kva.jpg";
import escort40kvaMain from "@/assets/products/escorts/escort_40kva_main.jpg";
import cinematicFallback from "@/assets/products/showcase/cinematic-view-optimized.jpg";
import mainViewFallback from "@/assets/products/showcase/main-view-optimized.jpg";
import type { ShowcaseProduct, ShowcaseSection, Hotspot, SpecRow } from "@/data/products";
import type { ExtractedProduct } from "@/lib/pdfExtractor";
import { enhanceProductExtraction } from "@/lib/enhancedPdfExtractor";
import { supabase } from "@/lib/supabase";
import { generateEscortsProduct, type EscortsProductData } from "@/lib/templates/escortsProductTemplate";

type ProductType = "silent" | "open";

type FormLike = {
  name: string;
  model: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  engineBrand: string;
  type: string;
  kva: string;
  cpcb: string;
  seoTitle: string;
  metaDesc: string;
};

type MediaLike = {
  primaryImage: string;
  galleryUrls: string;
  datasheetUrl: string;
  videoUrl: string;
};

type CategoryConfig = {
  slug: string;
  name: string;
  description: string;
  parentSlug?: string;
};

export type EngineBrandKey =
  | "baudouin"
  | "escorts-kubota"
  | "kubota"
  | "kohler"
  | "cummins"
  | "mahindra"
  | "other";

export type ProductAutomationResult = {
  brandKey: EngineBrandKey;
  brandLabel: string;
  categorySlug: string;
  type: ProductType;
  showcaseData: Record<string, unknown>;
  presentationData: Record<string, unknown>;
};

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  "dg-sets": {
    slug: "dg-sets",
    name: "DG Sets",
    description: "Diesel generator sets by engine family.",
  },
  "dg-sets-escort": {
    slug: "dg-sets-escort",
    name: "Escort",
    description: "Escorts and Escorts-Kubota DG sets.",
    parentSlug: "dg-sets",
  },
  "dg-sets-baudouin": {
    slug: "dg-sets-baudouin",
    name: "Baudouin",
    description: "Baudouin-powered DG sets.",
    parentSlug: "dg-sets",
  },
  "silent-dg-sets": {
    slug: "silent-dg-sets",
    name: "Silent DG Sets",
    description: "Acoustic enclosure generator sets.",
  },
  "open-dg-sets": {
    slug: "open-dg-sets",
    name: "Open DG Sets",
    description: "Open-frame generator sets.",
  },
  industrial: {
    slug: "industrial",
    name: "Industrial DG Sets",
    description: "Industrial application power systems.",
  },
  accessories: {
    slug: "accessories",
    name: "Accessories & Parts",
    description: "Accessories, spares, and related parts.",
  },
};

type ProductSource = {
  form: FormLike;
  specs: SpecRow[];
  media: MediaLike;
  extracted?: ExtractedProduct | null;
};

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function normalizeEngineBrandKey(raw?: string | null): EngineBrandKey {
  const value = (raw || "").trim().toLowerCase();

  if (!value) return "other";
  if (value.includes("baudouin")) return "baudouin";
  if (value.includes("escort")) return "escorts-kubota";
  if (value.includes("ekl")) return "escorts-kubota";
  if (value.includes("kubota")) return "kubota";
  if (value.includes("kohler")) return "kohler";
  if (value.includes("cummins")) return "cummins";
  if (value.includes("mahindra")) return "mahindra";

  return "other";
}

export function getEngineBrandLabel(brandKey: EngineBrandKey, fallback?: string) {
  switch (brandKey) {
    case "baudouin":
      return "Baudouin";
    case "escorts-kubota":
    case "kubota":
      return "Escorts";
    case "kohler":
      return "Kohler";
    case "cummins":
      return "Cummins";
    case "mahindra":
      return "Mahindra";
    default:
      return fallback?.trim() ? titleCase(fallback) : "Generator";
  }
}

export function inferProductType(extractedCategory?: string | null, fallbackType?: string | null): ProductType {
  const category = (extractedCategory || "").toLowerCase();
  const type = (fallbackType || "").toLowerCase();

  if (category.includes("open")) return "open";
  if (type === "open") return "open";
  return "silent";
}

export function inferCategorySlug(params: {
  brandKey: EngineBrandKey;
  type: ProductType;
  extractedCategory?: string | null;
  selectedCategory?: string | null;
}) {
  const selected = params.selectedCategory || "";
  const extracted = (params.extractedCategory || "").toLowerCase();

  if (selected && selected !== "silent-dg-sets") {
    return selected;
  }

  if (extracted === "accessories" || selected === "accessories") return "accessories";
  if (extracted === "industrial" || selected === "industrial") return "industrial";
  if (params.type === "open" || extracted === "open-dg-sets") return "open-dg-sets";
  if (params.brandKey === "escorts-kubota" || params.brandKey === "kubota") return "dg-sets-escort";
  if (params.brandKey === "baudouin") return "dg-sets-baudouin";
  return "silent-dg-sets";
}

export async function ensureProductCategory(categorySlug: string) {
  const config = CATEGORY_CONFIG[categorySlug];
  if (!config) return null;

  let parentId: string | null = null;

  if (config.parentSlug) {
    parentId = await ensureProductCategory(config.parentSlug);
  }

  const { data: existing, error: existingError } = await supabase
    .from("product_categories")
    .select("id")
    .eq("slug", config.slug)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing?.id) return existing.id as string;

  const { data: created, error: createError } = await supabase
    .from("product_categories")
    .insert({
      parent_id: parentId,
      slug: config.slug,
      name: config.name,
      description: config.description,
      is_active: true,
    })
    .select("id")
    .single();

  if (createError) throw createError;
  return created.id as string;
}

function parseNumeric(value?: string | number | null, fallback = 0) {
  if (typeof value === "number") return value;
  if (!value) return fallback;
  const parsed = Number(String(value).replace(/[^\d.]+/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanText(value?: string | null, fallback = "") {
  return value?.trim() || fallback;
}

function cleanGallery(galleryUrls: string) {
  return galleryUrls
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function findSpecValue(specs: SpecRow[], patterns: string[]) {
  const matched = specs.find((spec) => {
    const label = spec.label.toLowerCase();
    return patterns.every((pattern) => label.includes(pattern.toLowerCase()));
  });

  if (matched?.value?.trim()) return matched.value.trim();

  const looser = specs.find((spec) => {
    const label = spec.label.toLowerCase();
    return patterns.some((pattern) => label.includes(pattern.toLowerCase()));
  });

  return looser?.value?.trim() || "";
}

function getOverviewDescription(source: ProductSource, brandLabel: string) {
  return (
    cleanText(source.extracted?.shortDesc) ||
    cleanText(source.form.shortDesc) ||
    `${source.form.kva} kVA ${brandLabel} ${source.form.type === "open" ? "open-frame" : "silent"} DG set for industrial and commercial duty.`
  );
}

function getFullDescription(source: ProductSource, brandLabel: string) {
  return (
    cleanText(source.extracted?.fullDesc) ||
    cleanText(source.form.fullDesc) ||
    `${source.form.name} is a ${source.form.kva} kVA ${brandLabel}-powered diesel generator built for reliable standby and prime-power applications.`
  );
}

function getShowcaseSubtitle(brandLabel: string, type: ProductType, chapterCount: number) {
  const descriptor = type === "open" ? "open-frame generator" : "silent generator";
  return `${chapterCount}-chapter walkthrough of the ${brandLabel}-powered ${descriptor}.`;
}

function resolveAssetBank(source: ProductSource, escortsTemplate: boolean) {
  const gallery = cleanGallery(source.media.galleryUrls);
  const primary = cleanText(source.media.primaryImage, gallery[0] || (escortsTemplate ? escort15kva : mainViewFallback));

  const showcaseImages = escortsTemplate
    ? {
        overview: primary || escort15kva,
        engine: gallery[0] || engineFallback,
        fuel: gallery[1] || escort20kva1,
        alternator: gallery[2] || engineFallback,
        electrical: gallery[3] || escort30kva,
        enclosure: gallery[4] || enclosureFallback,
        control: gallery[5] || escort15kva2,
        protection: gallery[6] || escort30kva,
        supply: gallery[7] || escort20kva1,
        dimensions: gallery[8] || escort40kvaMain,
      }
    : {
        overview: primary || cinematicFallback,
        engine: gallery[0] || engineFallback,
        power: gallery[1] || engineFallback,
        sound: gallery[2] || enclosureFallback,
        control: gallery[3] || enclosureFallback,
        dimensions: gallery[4] || primary || mainViewFallback,
        video: gallery[5] || primary || mainViewFallback,
      };

  return {
    primary,
    gallery,
    showcaseImages,
    mainImage1: primary || mainViewFallback,
    mainImage2: gallery[0] || gallery[1] || primary || mainViewFallback,
  };
}

function flattenShowcaseContent(base: {
  productName: string;
  pageSubtitle: string;
  presentModeBtn?: string;
  sections: ShowcaseSection[];
  hotspots: Hotspot[];
  extra?: Record<string, unknown>;
}) {
  const content: Record<string, unknown> = {
    productName: base.productName,
    pageLabel: "Showcase",
    pageSubtitle: base.pageSubtitle,
    presentModeBtn: base.presentModeBtn || "Present Mode",
    sections: base.sections,
    hotspots: base.hotspots,
    ...(base.extra || {}),
  };

  base.sections.forEach((section, sectionIndex) => {
    content[`chapter_${sectionIndex}_title`] = section.title;
    if (section.tagline) content[`chapter_${sectionIndex}_tagline`] = section.tagline;

    section.highlight?.forEach((highlight, highlightIndex) => {
      content[`chapter_${sectionIndex}_h${highlightIndex}_label`] = highlight.label;
      content[`chapter_${sectionIndex}_h${highlightIndex}_value`] = String(highlight.value);
      if (highlight.suffix) {
        content[`chapter_${sectionIndex}_h${highlightIndex}_suffix`] = highlight.suffix;
      }
    });

    section.specs.forEach((spec, specIndex) => {
      content[`chapter_${sectionIndex}_spec${specIndex}_label`] = spec.label;
      content[`chapter_${sectionIndex}_spec${specIndex}_value`] = spec.value;
    });
  });

  base.hotspots.forEach((hotspot, hotspotIndex) => {
    content[`hotspot_${hotspotIndex}_title`] = hotspot.title;
    content[`hotspot_${hotspotIndex}_desc`] = hotspot.description;
    content[`hotspot_${hotspotIndex}_x`] = String(hotspot.x);
    content[`hotspot_${hotspotIndex}_y`] = String(hotspot.y);
    if (hotspot.subImage) content[`hotspot_${hotspotIndex}_image`] = hotspot.subImage;
    hotspot.specs.forEach((spec, specIndex) => {
      content[`hotspot_${hotspotIndex}_spec${specIndex}_label`] = spec.label;
      content[`hotspot_${hotspotIndex}_spec${specIndex}_value`] = spec.value;
    });
  });

  return content;
}

function flattenPresentationContent(mainImage1: string, mainImage2: string, hotspots: Hotspot[]) {
  const content: Record<string, unknown> = {
    mainImages: {
      image1: mainImage1,
      image2: mainImage2,
    },
    "mainImages.image1": mainImage1,
    "mainImages.image2": mainImage2,
    hotspots,
  };

  hotspots.forEach((hotspot, hotspotIndex) => {
    content[`hotspot_${hotspotIndex}_title`] = hotspot.title;
    content[`hotspot_${hotspotIndex}_desc`] = hotspot.description;
    content[`hotspot_${hotspotIndex}_x`] = String(hotspot.x);
    content[`hotspot_${hotspotIndex}_y`] = String(hotspot.y);
    if (hotspot.subImage) content[`hotspot_${hotspotIndex}_image`] = hotspot.subImage;
    hotspot.specs.forEach((spec, specIndex) => {
      content[`hotspot_${hotspotIndex}_spec${specIndex}_label`] = spec.label;
      content[`hotspot_${hotspotIndex}_spec${specIndex}_value`] = spec.value;
    });
  });

  return content;
}

function buildGenericContent(source: ProductSource, brandLabel: string, type: ProductType): ProductAutomationResult {
  const assets = resolveAssetBank(source, false);
  const specs = source.specs.filter((spec) => spec.label.trim() && spec.value.trim());
  const kva = parseNumeric(source.form.kva, parseNumeric(source.extracted?.kva, 0));
  const rating = findSpecValue(specs, ["rating"]) || `${source.form.kva} kVA`;
  const voltage = cleanText(source.extracted?.voltage, findSpecValue(specs, ["voltage"]) || "415 V");
  const frequency = cleanText(source.extracted?.frequency, findSpecValue(specs, ["frequency"]) || "50 Hz");
  const engineModel = cleanText(source.extracted?.engineModel, findSpecValue(specs, ["engine", "model"]) || "Refer datasheet");
  const alternatorBrand = cleanText(source.extracted?.alternatorBrand, findSpecValue(specs, ["alternator"]) || "Industrial alternator");
  const fuelConsumption = cleanText(source.extracted?.fuelConsumption, findSpecValue(specs, ["fuel"]) || "Refer datasheet");
  const noiseLevel = cleanText(source.extracted?.noiseLevel, findSpecValue(specs, ["noise"]) || "Refer datasheet");
  const dimensions = cleanText(source.extracted?.dimensions, findSpecValue(specs, ["dimension"]) || "Refer datasheet");
  const dryWeight = cleanText(source.extracted?.dryWeight, findSpecValue(specs, ["weight"]) || "Refer datasheet");
  const cpcb = source.form.cpcb === "ii" ? "CPCB II" : "CPCB IV+";
  const description = getOverviewDescription(source, brandLabel);

  const sections: ShowcaseSection[] = [
    {
      id: "overview",
      number: "01",
      title: source.form.name,
      tagline: description,
      image: assets.showcaseImages.overview,
      alt: `${source.form.name} overview`,
      specs: [
        { label: "Model", value: source.form.model },
        { label: "Rating", value: rating },
        { label: "Engine", value: brandLabel },
        { label: "Compliance", value: cpcb },
      ],
      highlight: [
        { value: kva, suffix: " kVA", label: "Prime power" },
        { value: parseNumeric(noiseLevel, 0), suffix: " dB(A)", label: "Noise" },
        { value: parseNumeric(findSpecValue(specs, ["fuel"]), 0), suffix: " L/h", label: "Fuel" },
      ],
    },
    {
      id: "engine",
      number: "02",
      title: "Engine",
      tagline: `${brandLabel} ${engineModel} tuned for dependable duty cycles.`,
      image: assets.showcaseImages.engine,
      alt: `${brandLabel} engine`,
      specs: [
        { label: "Brand", value: brandLabel },
        { label: "Model", value: engineModel },
        { label: "Cooling", value: cleanText(source.extracted?.coolingType, findSpecValue(specs, ["cooling"]) || "Water-cooled") },
        { label: "Application", value: cleanText(source.extracted?.application, findSpecValue(specs, ["application"]) || "Prime / Standby") },
      ],
    },
    {
      id: "power",
      number: "03",
      title: "Power Output",
      tagline: "Stable output for industrial and commercial loads.",
      image: assets.showcaseImages.power,
      alt: "Power output section",
      specs: [
        { label: "Rating", value: rating },
        { label: "Voltage", value: voltage },
        { label: "Frequency", value: frequency },
        { label: "Alternator", value: alternatorBrand },
      ],
    },
    {
      id: "sound",
      number: "04",
      title: type === "open" ? "Frame & Protection" : "Sound & Enclosure",
      tagline: type === "open" ? "Robust frame build with service-ready access." : "Acoustic treatment and compliance-ready enclosure design.",
      image: assets.showcaseImages.sound,
      alt: type === "open" ? "Open frame generator" : "Sound enclosure",
      specs: [
        { label: "Noise", value: noiseLevel },
        { label: "Compliance", value: cpcb },
        { label: "Fuel Use", value: fuelConsumption },
        { label: "Weight", value: dryWeight },
      ],
    },
    {
      id: "control",
      number: "05",
      title: "Control Panel",
      tagline: "Operational visibility and protection logic for field use.",
      image: assets.showcaseImages.control,
      alt: "Control panel",
      specs: [
        { label: "Controller", value: cleanText(source.extracted?.controllerModel, findSpecValue(specs, ["controller"]) || "AMF-ready controller") },
        { label: "Power Factor", value: cleanText(source.extracted?.powerFactor, findSpecValue(specs, ["power factor"]) || "0.8 lagging") },
        { label: "Phase", value: cleanText(source.extracted?.phase, findSpecValue(specs, ["phase"]) || "3-phase") },
        { label: "Protection", value: findSpecValue(specs, ["protection"]) || "Under / Over voltage, overload" },
      ],
    },
    {
      id: "dimensions",
      number: "06",
      title: "Dimensions & Weight",
      tagline: "Key installation and logistics dimensions at a glance.",
      image: assets.showcaseImages.dimensions,
      alt: "Dimensions and weight",
      specs: [
        { label: "Dimensions", value: dimensions },
        { label: "Dry Weight", value: dryWeight },
        { label: "Fuel Tank", value: cleanText(source.extracted?.fuelTankCapacity, findSpecValue(specs, ["fuel", "tank"]) || "Refer datasheet") },
        { label: "Datasheet", value: source.media.datasheetUrl.trim() ? "Available" : "Not linked" },
      ],
    },
  ];

  if (source.media.videoUrl.trim()) {
    sections.push({
      id: "video",
      number: "07",
      title: "Product Video",
      tagline: "Walkthrough media for the unit in action.",
      image: assets.showcaseImages.video,
      alt: "Product video preview",
      videoUrl: source.media.videoUrl.trim(),
      specs: [
        { label: "Format", value: "Video" },
        { label: "Source", value: "Linked media" },
      ],
    });
  }

  const hotspots: Hotspot[] = [
    {
      id: "overview",
      x: 50,
      y: 50,
      title: source.form.name,
      description,
      subImage: assets.primary,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      specs: sections[0].specs,
    },
    {
      id: "engine",
      x: 42,
      y: 48,
      title: `${brandLabel} Engine`,
      description: `${brandLabel} ${engineModel} powerplant configured for dependable duty.`,
      subImage: assets.showcaseImages.engine,
      zoom: 1.7,
      offsetX: 8,
      offsetY: 2,
      specs: sections[1].specs,
    },
    {
      id: "power",
      x: 35,
      y: 54,
      title: "Power Output",
      description: `Rated at ${rating} with ${voltage} / ${frequency} output.`,
      subImage: assets.showcaseImages.power,
      zoom: 1.5,
      offsetX: 14,
      offsetY: -4,
      specs: sections[2].specs,
    },
    {
      id: "sound",
      x: 65,
      y: 46,
      title: sections[3].title,
      description: sections[3].tagline || "",
      subImage: assets.showcaseImages.sound,
      zoom: 1.4,
      offsetX: -12,
      offsetY: 4,
      specs: sections[3].specs,
    },
    {
      id: "dimensions",
      x: 50,
      y: 75,
      title: "Dimensions & Weight",
      description: "Installation footprint, service access, and logistics-ready sizing.",
      subImage: assets.showcaseImages.dimensions,
      zoom: 1.2,
      offsetX: 0,
      offsetY: -8,
      specs: sections[5].specs,
    },
  ];

  const showcaseData = flattenShowcaseContent({
    productName: source.form.name,
    pageSubtitle: getShowcaseSubtitle(brandLabel, type, sections.length),
    sections,
    hotspots,
    extra: {
      description: getFullDescription(source, brandLabel),
    },
  });

  const presentationData = flattenPresentationContent(assets.mainImage1, assets.mainImage2, hotspots);

  return {
    brandKey: normalizeEngineBrandKey(source.form.engineBrand),
    brandLabel,
    categorySlug: inferCategorySlug({
      brandKey: normalizeEngineBrandKey(source.form.engineBrand),
      type,
      extractedCategory: source.extracted?.category,
      selectedCategory: source.form.category,
    }),
    type,
    showcaseData,
    presentationData,
  };
}

function buildEnhancedTemplateContent(source: ProductSource, brandKey: EngineBrandKey, brandLabel: string, type: ProductType): ProductAutomationResult {
  const assets = resolveAssetBank(source, true);
  const specs = source.specs.filter((spec) => spec.label.trim() && spec.value.trim());
  
  // Use enhanced extraction if we have extracted data
  if (source.extracted) {
    const enhanced = enhanceProductExtraction(source.extracted, specs);
    
    // Map enhanced chapters to showcase sections with images
    const sections: ShowcaseSection[] = enhanced.chapters.map((chapter) => {
      const section: ShowcaseSection = {
        id: chapter.id,
        number: chapter.number,
        title: chapter.title,
        tagline: chapter.tagline,
        image: (assets.showcaseImages as any)[chapter.id] || assets.primary || escort15kva,
        alt: `${chapter.title} section`,
        specs: chapter.specs,
        highlight: chapter.highlights,
      };

      // Inject video URL if this is the video chapter
      if (chapter.id === "video" && source.media.videoUrl.trim()) {
        section.videoUrl = source.media.videoUrl.trim();
      }

      return section;
    });
    
    // Map enhanced hotspots with images
    const hotspots: Hotspot[] = enhanced.hotspots.map((hotspot) => ({
      id: hotspot.id,
      x: hotspot.x,
      y: hotspot.y,
      title: hotspot.title,
      description: hotspot.description,
      subImage: (assets.showcaseImages as any)[hotspot.id] || assets.primary || escort15kva,
      zoom: hotspot.zoom,
      offsetX: hotspot.offsetX,
      offsetY: hotspot.offsetY,
      specs: hotspot.specs,
    }));
    
    // Remove the following lines (manual video push):
    if (false as boolean) {
      // Logic moved into the map above
    }
    
    const showcaseData = flattenShowcaseContent({
      productName: source.form.name,
      pageSubtitle: `${sections.length}-chapter walkthrough of the ${brandLabel}-powered generator. ${enhanced.extractionNotes}`,
      sections,
      hotspots,
      extra: {
        description: getFullDescription(source, brandLabel),
        extractionConfidence: enhanced.confidence,
        missingFields: enhanced.missingFields,
      },
    });
    
    const presentationData = flattenPresentationContent(assets.mainImage1, assets.mainImage2, hotspots);
    
    return {
      brandKey,
    brandLabel,
    categorySlug: inferCategorySlug({
      brandKey,
        type: inferProductType(source.extracted?.category, source.form.type),
        extractedCategory: source.extracted?.category,
        selectedCategory: source.form.category,
      }),
      type: inferProductType(source.extracted?.category, source.form.type),
      showcaseData,
      presentationData,
    };
  }
  
  // Fallback to original template-based generation if no extracted data
  const kva = parseNumeric(source.form.kva, parseNumeric(source.extracted?.kva, 15));
  const kwe = Math.max(1, Math.round(kva * 0.8 * 10) / 10);
  const cpcb = source.form.cpcb === "ii" ? "CPCB II" : "CPCB IV+";
  const engineModel = cleanText(source.extracted?.engineModel, findSpecValue(specs, ["engine", "model"]) || "Refer datasheet");
  const alternatorMake = cleanText(source.extracted?.alternatorBrand, findSpecValue(specs, ["alternator"]) || "Stamford");
  const voltage = cleanText(source.extracted?.voltage, findSpecValue(specs, ["voltage"]) || "415 V, 3-Phase");
  const frequency = parseNumeric(source.extracted?.frequency, parseNumeric(findSpecValue(specs, ["frequency"]), 50));
  const fuelConsumption = cleanText(source.extracted?.fuelConsumption, findSpecValue(specs, ["fuel"]) || "Refer datasheet");
  const noiseLevel = cleanText(source.extracted?.noiseLevel, findSpecValue(specs, ["noise"]) || "Refer datasheet");
  const dimensions = cleanText(source.extracted?.dimensions, findSpecValue(specs, ["dimension"]) || "");
  const [length = "Refer datasheet", width = "Refer datasheet", height = "Refer datasheet"] =
    dimensions
      .split(/[x×]/i)
      .map((part) => part.trim())
      .filter(Boolean);

  const templateInput: EscortsProductData = {
    model: source.form.model,
    name: source.form.name,
    kva,
    kwe,
    slug: source.form.model.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    engineMake: brandLabel,
    engineModel,
    cylinders: parseNumeric(findSpecValue(specs, ["cylinder"]), 3),
    displacement: findSpecValue(specs, ["displacement"]) || "Refer datasheet",
    boreStroke: findSpecValue(specs, ["bore"]) || "Refer datasheet",
    grossPower: findSpecValue(specs, ["gross", "power"]) || `${Math.round(kva * 0.9)} kWm`,
    speed: parseNumeric(findSpecValue(specs, ["speed"]), 1500),
    voltage,
    frequency,
    phases: cleanText(source.extracted?.phase, findSpecValue(specs, ["phase"]) || "3-Phase"),
    powerFactor: parseNumeric(source.extracted?.powerFactor, parseNumeric(findSpecValue(specs, ["power factor"]), 0.8)),
    ratedCurrent: findSpecValue(specs, ["current"]) || "Refer datasheet",
    alternatorMake,
    alternatorFrame: findSpecValue(specs, ["frame"]) || "Refer datasheet",
    avrModel: findSpecValue(specs, ["avr"]) || "AVR",
    fuelConsumption,
    noiseLevel,
    length,
    width,
    height,
    fuelTankCapacity: cleanText(source.extracted?.fuelTankCapacity, findSpecValue(specs, ["fuel", "tank"]) || "Refer datasheet"),
    cpcb,
    isoCompliance: findSpecValue(specs, ["iso"]) || "ISO 8528",
    cardImage: assets.primary || escort15kva,
    showcaseImages: {
      overview: assets.showcaseImages.overview,
      engine: assets.showcaseImages.engine,
      fuel: assets.showcaseImages.fuel,
      alternator: assets.showcaseImages.alternator,
      electrical: assets.showcaseImages.electrical,
      enclosure: assets.showcaseImages.enclosure,
      control: assets.showcaseImages.control,
      protection: assets.showcaseImages.protection,
      supply: assets.showcaseImages.supply,
      dimensions: assets.showcaseImages.dimensions,
    },
    presentationMainImage1: assets.mainImage1,
    presentationMainImage2: assets.mainImage2,
    presentationSubImages: {
      overview: assets.showcaseImages.overview,
      engine: assets.showcaseImages.engine,
      fuel: assets.showcaseImages.fuel,
      alternator: assets.showcaseImages.alternator,
      electrical: assets.showcaseImages.electrical,
      enclosure: assets.showcaseImages.enclosure,
      control: assets.showcaseImages.control,
      protection: assets.showcaseImages.protection,
      supply: assets.showcaseImages.supply,
      dimensions: assets.showcaseImages.dimensions,
    },
  };

  const generated = generateEscortsProduct(templateInput);
  const sections = [...generated.showcase.sections];
  const hotspots = generated.showcase.hotspots.map((hotspot, index) => ({
    ...hotspot,
    specs: sections[index]?.specs?.slice(0, 5) || hotspot.specs || [],
  }));

  if (source.media.videoUrl.trim()) {
    sections.push({
      id: "video",
      number: String(sections.length + 1).padStart(2, "0"),
      title: "Product Video",
      tagline: "Walkthrough media and product footage for review.",
      image: assets.primary || escort15kva,
      videoUrl: source.media.videoUrl.trim(),
      alt: `${source.form.name} product video`,
      specs: [
        { label: "Format", value: "Video" },
        { label: "Source", value: "Linked media" },
      ],
    });
  }

  const showcaseData = flattenShowcaseContent({
    productName: source.form.name,
    pageSubtitle: getShowcaseSubtitle(brandLabel, type, sections.length),
    sections,
    hotspots,
    extra: {
      description: getFullDescription(source, brandLabel),
    },
  });

  const presentationData = flattenPresentationContent(assets.mainImage1, assets.mainImage2, hotspots);

  return {
    brandKey,
    brandLabel,
    categorySlug: inferCategorySlug({
      brandKey,
      type: inferProductType(source.extracted?.category, source.form.type),
      extractedCategory: source.extracted?.category,
      selectedCategory: source.form.category,
    }),
    type: inferProductType(source.extracted?.category, source.form.type),
    showcaseData,
    presentationData,
  };
}

export function generateProductAutomation(source: ProductSource): ProductAutomationResult {
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
}
