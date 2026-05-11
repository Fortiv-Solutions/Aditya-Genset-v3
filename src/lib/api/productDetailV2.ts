/**
 * productDetailV2.ts
 * Database-driven product detail fetching.
 * Replaces static imports from data/products.ts, data/ekl15Data.ts, data/ekl20Data.ts.
 */
import { supabase } from "../supabase";
import { EKL15_SHOWCASE } from "../../data/products";

// ── Types matching the frontend ShowcaseProduct interface ────────────────────
export interface V2SpecRow {
  label: string;
  value: string;
}

export interface V2ShowcaseSection {
  id: string;
  number: string;
  title: string;
  tagline?: string;
  image: string;
  alt: string;
  specs: V2SpecRow[];
  highlight?: { value: number | string; suffix?: string; label: string }[];
  videoUrl?: string;
}

export interface V2Hotspot {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
  specs: V2SpecRow[];
  subImage?: string;
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
}

export interface V2ChapterData {
  specs?: V2SpecRow[];
  features?: string[];
  badges?: string[];
  description?: string;
  aboutSpecs?: V2SpecRow[];
  lubeSpecs?: V2SpecRow[];
  coolingSpecs?: V2SpecRow[];
  perfSpecs?: V2SpecRow[];
  reactanceData?: { symbol: string; description: string; value: string }[];
  acousticDims?: V2SpecRow[];
  openDims?: V2SpecRow[];
  envSpecs?: V2SpecRow[];
  engineParams?: string[];
  electricalParams?: string[];
  electricalSpecs?: V2SpecRow[];
  engineProtections?: string[];
  electricalProtections?: string[];
  approvals?: string[];
  standardItems?: string[];
  optionalItems?: string[];
  optionalGroups?: { label: string; items: string[] }[];
  fuelConsumptionPoints?: { load: number; lhr: number }[];
  efficiencyPoints?: { label: string; value: number }[];
  highlights?: { value: number | string; suffix: string; label: string }[];
}

export interface V2ShowcaseProduct {
  id: string;
  slug: string;
  name: string;
  kva: number;
  range: string;
  status: "active";
  thumbnail: string;
  hero: string;
  engineBrand?: string;
  sections: V2ShowcaseSection[];
  hotspots: V2Hotspot[];
  chapterDataMap: Record<string, V2ChapterData>;
  presentationConfig?: {
    mainImage1: string | null;
    mainImage2: string | null;
    videoUrl: string | null;
    videoThumbUrl: string | null;
    chapterCount: number;
    useTwoImage: boolean;
  };
}

// ── Fetch complete product detail from v2 tables ────────────────────────────
export async function fetchProductDetailV2(slug: string): Promise<V2ShowcaseProduct | null> {
  // 1. Get core product
  const { data: product, error: productErr } = await supabase
    .from("products")
    .select(`
      id, slug, name, kva, engine_brand, status,
      product_brands ( name ),
      product_media ( kind, public_url, alt_text, display_order )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (productErr || !product) {
    console.error("❌ fetchProductDetailV2: product not found", slug, productErr);
    return null;
  }

  const productId = product.id;

  // 2. Fetch all related data in parallel
  const [sectionsRes, chapterRes, hotspotsRes, configRes] = await Promise.all([
    supabase
      .from("product_showcase_sections")
      .select(`
        id, chapter_key, chapter_number, title, tagline,
        image_url, video_url, alt_text, display_order, highlight,
        product_showcase_section_specs ( spec_label, spec_value, display_order )
      `)
      .eq("product_id", productId)
      .eq("is_active", true)
      .order("display_order"),

    supabase
      .from("product_chapter_data")
      .select("*")
      .eq("product_id", productId),

    supabase
      .from("product_hotspots")
      .select(`
        id, hotspot_key, x, y, title, description,
        sub_image_url, zoom, offset_x, offset_y, display_order,
        product_hotspot_specs ( spec_label, spec_value, display_order )
      `)
      .eq("product_id", productId)
      .eq("is_active", true)
      .order("display_order"),

    supabase
      .from("product_presentation_config")
      .select("*")
      .eq("product_id", productId)
      .maybeSingle(),
  ]);

  // 3. Transform sections → ShowcaseSection[]
  const sections: V2ShowcaseSection[] = (sectionsRes.data || []).map((s: any) => {
    // Apply EKL15 baseline image when no chapter-specific image was uploaded
    const eklFallback = EKL15_SHOWCASE.sections.find((es) => es.id === s.chapter_key);
    
    let imageUrl = s.image_url;
    if (imageUrl && (imageUrl.startsWith('/assets/') || imageUrl.startsWith('/src/assets/'))) imageUrl = null;
    
    let videoUrl = s.video_url;
    if (videoUrl && (videoUrl.startsWith('/assets/') || videoUrl.startsWith('/src/assets/'))) videoUrl = null;

    return {
      id: s.chapter_key,
      number: s.chapter_number,
      title: s.title,
      tagline: s.tagline || undefined,
      image: imageUrl || eklFallback?.image || "",
      alt: s.alt_text || s.title,
      videoUrl: videoUrl || eklFallback?.videoUrl || undefined,
      highlight: s.highlight || undefined,
      specs: (s.product_showcase_section_specs || [])
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .map((spec: any) => ({ label: spec.spec_label, value: spec.spec_value })),
    };
  });

  // 4. Transform chapter data → Record<string, V2ChapterData>
  const chapterDataMap: Record<string, V2ChapterData> = {};
  for (const row of chapterRes.data || []) {
    // Synthesize highlights for overview if not stored (legacy products)
    let highlights = row.highlights || undefined;
    if (row.chapter_key === "overview" && !highlights?.length) {
      highlights = [
        { value: product.kva, suffix: "kVA", label: "PRIME POWER" },
        { value: 70, suffix: "dB(A)", label: "SOUND @ 1M" },
        { value: "27", suffix: " +yrs", label: "HERITAGE" },
      ];
    }
    chapterDataMap[row.chapter_key] = {
      specs: row.specs || undefined,
      features: row.features || undefined,
      badges: row.badges || undefined,
      description: row.description || undefined,
      aboutSpecs: row.about_specs || undefined,
      lubeSpecs: row.lube_specs || undefined,
      coolingSpecs: row.cooling_specs || undefined,
      perfSpecs: row.perf_specs || undefined,
      reactanceData: row.reactance_data || undefined,
      acousticDims: row.acoustic_dims || undefined,
      openDims: row.open_dims || undefined,
      envSpecs: row.env_specs || undefined,
      engineParams: row.engine_params || undefined,
      electricalParams: row.electrical_params || undefined,
      electricalSpecs: row.electrical_specs || undefined,
      engineProtections: row.engine_protections || undefined,
      electricalProtections: row.electrical_protections || undefined,
      approvals: row.approvals || undefined,
      standardItems: row.standard_items || undefined,
      optionalItems: row.optional_items || undefined,
      optionalGroups: row.optional_groups || undefined,
      fuelConsumptionPoints: row.fuel_curve_data || undefined,
      efficiencyPoints: row.efficiency_data || undefined,
      highlights,
    };
  }

  // 5. Transform hotspots → Hotspot[]
  const hotspots: V2Hotspot[] = (hotspotsRes.data || []).map((h: any) => ({
    id: h.hotspot_key,
    x: Number(h.x),
    y: Number(h.y),
    title: h.title,
    description: h.description || "",
    subImage: h.sub_image_url || undefined,
    zoom: Number(h.zoom) || 1,
    offsetX: Number(h.offset_x) || 0,
    offsetY: Number(h.offset_y) || 0,
    specs: (h.product_hotspot_specs || [])
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((spec: any) => ({ label: spec.spec_label, value: spec.spec_value })),
  }));

  // 6. Primary image
  const media = (product as any).product_media || [];
  let primaryMediaUrl = media.find((m: any) => m.kind === "primary" || m.kind === "hero")?.public_url;
  if (primaryMediaUrl && (primaryMediaUrl.startsWith('/assets/') || primaryMediaUrl.startsWith('/src/assets/'))) {
    primaryMediaUrl = null;
  }
  const primaryImage = primaryMediaUrl || sections[0]?.image || "";

  // 7. Presentation config
  const pc = configRes.data;
  const presentationConfig = pc
    ? {
        mainImage1: pc.main_image_1,
        mainImage2: pc.main_image_2,
        videoUrl: pc.video_url,
        videoThumbUrl: pc.video_thumb_url,
        chapterCount: pc.chapter_count,
        useTwoImage: pc.use_two_image,
      }
    : undefined;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    kva: product.kva,
    range: product.kva <= 62.5 ? "15-62.5" : product.kva <= 200 ? "75-200" : "250-500",
    status: "active",
    thumbnail: primaryImage,
    hero: primaryImage,
    engineBrand: product.engine_brand || (product as any).product_brands?.name || undefined,
    sections,
    hotspots,
    chapterDataMap,
    presentationConfig,
  };
}
