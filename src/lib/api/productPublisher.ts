/**
 * productPublisher.ts
 * Single atomic pipeline: writes all 5 Supabase v2 tables at once.
 * Called when admin clicks Publish or Save Draft in the new AddProduct workflow.
 */

import { supabase } from "@/lib/supabase";
import { updateCMSSection } from "@/lib/api/cms";
import { ensureProductCategory, generateProductAutomation, getEngineBrandLabel, normalizeEngineBrandKey } from "@/lib/productAutomation";
import { uploadProductMediaFile } from "@/lib/productMediaUpload";
import { uploadImage } from "@/lib/api/storage";
import type { TemplateId } from "@/lib/templateRegistry";
import { ESCORTS_HOTSPOT_POSITIONS } from "@/lib/templateRegistry";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PublishMediaInput {
  primaryImage: string;          // URL or empty
  galleryImages: string[];       // array of URLs
  datasheetUrl: string;
  videoUrl: string;              // external URL
  videoFile: File | null;        // local upload
  videoThumbUrl: string;
}

export interface PublishFormInput {
  name: string;
  model: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  engineBrand: string;
  type: string;
  kva: string;
  cpcb: string;
  price: string;
  priceOnRequest: boolean;
  moq: string;
  deliveryTime: string;
  stock: string;
  seoTitle: string;
  metaDesc: string;
  tags: string[];
}

export interface ChapterDataInput {
  specs?: { label: string; value: string }[];
  features?: string[];
  badges?: string[];
  description?: string;
  aboutSpecs?: { label: string; value: string }[];
  lubeSpecs?: { label: string; value: string }[];
  coolingSpecs?: { label: string; value: string }[];
  perfSpecs?: { label: string; value: string }[];
  reactanceData?: { symbol: string; description: string; value: string }[];
  acousticDims?: { label: string; value: string }[];
  openDims?: { label: string; value: string }[];
  envSpecs?: { label: string; value: string }[];
  engineParams?: string[];
  electricalParams?: string[];
  electricalSpecs?: { label: string; value: string }[];
  engineProtections?: string[];
  electricalProtections?: string[];
  approvals?: string[];
  standardItems?: string[];
  optionalItems?: string[];
  optionalGroups?: { label: string; items: string[] }[];
  highlights?: { value: number | string; suffix: string; label: string }[];
  fuelConsumptionPoints?: { load: number; lhr: number }[];
  efficiencyPoints?: { label: string; value: number }[];
  // Metadata and technical extras
  kva?: string;
  unmappedNotes?: string[];
  tagline?: string;
  // Video slide extras
  videoUrl?: string;
  videoThumbUrl?: string;
  duration?: string;
  resolution?: string;
  views?: string;
}

export interface SectionInput {
  id: string;
  number: string;
  title: string;
  tagline: string;
  imageUrl: string;
  altText: string;
  displayOrder: number;
  highlight?: { value: number | string; suffix?: string; label: string }[];
  videoUrl?: string;
}

export interface PublishPayload {
  form: PublishFormInput;
  media: PublishMediaInput;
  templateId: TemplateId;
  chapterDataMap: Record<string, ChapterDataInput>;
  sections: SectionInput[];
  status: "draft" | "published";
  existingProductId?: string;  // if editing
}

export interface PublishResult {
  success: boolean;
  productId: string | null;
  slug: string | null;
  error?: string;
}

// ── Slug helper ───────────────────────────────────────────────────────────────

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Upload gallery images that are still blob: URLs ───────────────────────────

async function resolveImageUrl(url: string): Promise<string> {
  if (!url || !url.startsWith("blob:")) return url;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const file = new File([blob], `product-image-${Date.now()}.jpg`, { type: blob.type });
    return await uploadImage(file);
  } catch {
    return url;
  }
}

// ── Core publisher ────────────────────────────────────────────────────────────

export async function publishProductV2(payload: PublishPayload): Promise<PublishResult> {
  const { form, media, templateId, chapterDataMap, sections, status, existingProductId } = payload;

  try {
    // 1. Ensure category exists
    const brandKey = normalizeEngineBrandKey(form.engineBrand);
    const automation = generateProductAutomation({
      form: {
        name: form.name,
        model: form.model,
        category: form.category,
        shortDesc: form.shortDesc,
        fullDesc: form.fullDesc,
        engineBrand: form.engineBrand,
        type: form.type,
        kva: form.kva,
        cpcb: form.cpcb,
        seoTitle: form.seoTitle,
        metaDesc: form.metaDesc,
      },
      specs: [],
      media: {
        primaryImage: media.primaryImage,
        galleryUrls: media.galleryImages.join("\n"),
        datasheetUrl: media.datasheetUrl,
        videoUrl: media.videoUrl,
      },
    });

    const categoryId = await ensureProductCategory(automation.categorySlug);
    const slug = slugify(form.model || form.name);

    // 2. Upsert core product row
    const productPayload = {
      category_id: categoryId || null,
      status,
      type: form.type === "open" ? "open" : "silent",
      name: form.name.trim(),
      model: form.model.trim(),
      slug,
      kva: Number(form.kva),
      engine_brand: getEngineBrandLabel(brandKey, form.engineBrand),
      cpcb: form.cpcb === "ii" ? "II" : "IV+",
      price: form.priceOnRequest || !form.price ? null : Number(form.price),
      price_on_request: form.priceOnRequest,
      moq: Number(form.moq || 1),
      lead_time_days: Number(form.deliveryTime || 21),
      stock: form.stock,
      short_desc: form.shortDesc || null,
      full_desc: form.fullDesc || null,
      tags: form.tags,
      seo_title: form.seoTitle || null,
      meta_desc: form.metaDesc || null,
      published_at: status === "published" ? new Date().toISOString() : null,
    };

    let productId: string;

    if (existingProductId) {
      const { data, error } = await supabase
        .from("products")
        .update(productPayload)
        .eq("id", existingProductId)
        .select("id")
        .single();
      if (error) throw error;
      productId = data.id;
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(productPayload)
        .select("id")
        .single();
      if (error) throw error;
      productId = data.id;
    }

    // 3. Resolve primary image
    const resolvedPrimaryImage = await resolveImageUrl(media.primaryImage);

    // 4. Upload video if file selected
    let resolvedVideoUrl = media.videoUrl;
    let resolvedVideoThumb = media.videoThumbUrl;
    let videoStoragePath: string | null = null;
    let videoMimeType: string | null = null;

    if (media.videoFile) {
      const uploaded = await uploadProductMediaFile({
        productId,
        slug,
        file: media.videoFile,
        kind: "video",
      });
      if (uploaded) {
        resolvedVideoUrl = uploaded.publicUrl;
        videoStoragePath = uploaded.storagePath;
        videoMimeType = uploaded.mimeType;
      }
    }

    // 5. Resolve gallery
    const resolvedGallery = await Promise.all(
      (media.galleryImages || []).filter(Boolean).map(resolveImageUrl)
    );

    // 6. Upsert product_specs (comparison-ready)
    await supabase.from("product_specs").delete().eq("product_id", productId);

    const specRows = buildComparisonSpecs(form, chapterDataMap);
    if (specRows.length > 0) {
      await supabase.from("product_specs").insert(
        specRows.map((s, i) => ({
          product_id: productId,
          spec_label: s.label,
          spec_value: s.value,
          display_order: i,
        }))
      );
    }

    // 7. Upsert product_media
    await supabase.from("product_media").delete().eq("product_id", productId);

    const mediaRows: any[] = [];
    if (resolvedPrimaryImage) {
      mediaRows.push({ product_id: productId, kind: "primary", public_url: resolvedPrimaryImage, storage_path: null, mime_type: null, alt_text: form.name.trim(), display_order: 0 });
    }
    resolvedGallery.forEach((url, i) => {
      mediaRows.push({ product_id: productId, kind: "gallery", public_url: url, storage_path: null, mime_type: null, alt_text: `${form.name.trim()} gallery ${i + 1}`, display_order: i + 1 });
    });
    if (media.datasheetUrl?.trim()) {
      mediaRows.push({ product_id: productId, kind: "datasheet", public_url: media.datasheetUrl.trim(), storage_path: null, mime_type: null, alt_text: `${form.name.trim()} datasheet`, display_order: 100 });
    }
    if (resolvedVideoUrl?.trim()) {
      mediaRows.push({ product_id: productId, kind: "video", public_url: resolvedVideoUrl.trim(), storage_path: videoStoragePath, mime_type: videoMimeType, alt_text: `${form.name.trim()} video`, display_order: 101 });
    }
    if (resolvedVideoThumb?.trim()) {
      mediaRows.push({ product_id: productId, kind: "thumbnail", public_url: resolvedVideoThumb.trim(), storage_path: null, mime_type: null, alt_text: `${form.name.trim()} video thumbnail`, display_order: 102 });
    }
    if (mediaRows.length > 0) {
      await supabase.from("product_media").insert(mediaRows);
    }

    // 8. Upsert product_chapter_data (all chapters as JSONB)
    await supabase.from("product_chapter_data").delete().eq("product_id", productId);

    const chapterRows = Object.entries(chapterDataMap).map(([key, data]) => ({
      product_id: productId,
      chapter_key: key,
      interaction_type: inferInteractionType(key),
      specs: data.specs || null,
      features: data.features || null,
      badges: data.badges || null,
      description: data.description || null,
      about_specs: data.aboutSpecs || null,
      lube_specs: data.lubeSpecs || null,
      cooling_specs: data.coolingSpecs || null,
      perf_specs: data.perfSpecs || null,
      reactance_data: data.reactanceData || null,
      acoustic_dims: data.acousticDims || null,
      open_dims: data.openDims || null,
      env_specs: data.envSpecs || null,
      engine_params: data.engineParams || null,
      electrical_params: data.electricalParams || null,
      electrical_specs: data.electricalSpecs || null,
      engine_protections: data.engineProtections || null,
      electrical_protections: data.electricalProtections || null,
      approvals: data.approvals || null,
      standard_items: data.standardItems || null,
      optional_items: data.optionalItems || null,
      optional_groups: data.optionalGroups || null,
    }));

    if (chapterRows.length > 0) {
      const { error } = await supabase.from("product_chapter_data").insert(chapterRows);
      if (error) console.warn("chapter_data insert warning:", error.message);
    }

    // 9. Upsert product_showcase_sections
    await supabase.from("product_showcase_sections").delete().eq("product_id", productId);

    const sectionRows = sections.map((s) => ({
      product_id: productId,
      chapter_key: s.id,
      chapter_number: s.number,
      title: s.title,
      tagline: s.tagline || null,
      image_url: s.imageUrl || resolvedPrimaryImage || null,
      video_url: s.videoUrl || (s.id === "video" ? resolvedVideoUrl : null) || null,
      alt_text: s.altText || s.title,
      display_order: s.displayOrder,
      highlight: s.highlight || null,
      is_active: true,
    }));

    if (sectionRows.length > 0) {
      const { error } = await supabase.from("product_showcase_sections").insert(sectionRows);
      if (error) console.warn("showcase_sections insert warning:", error.message);
    }

    // 10. Upsert product_hotspots
    await supabase.from("product_hotspots").delete().eq("product_id", productId);

    const hotspotKeys = Object.keys(chapterDataMap).filter((k) => k !== "video");
    const hotspotRows = hotspotKeys.map((key, i) => {
      const pos = ESCORTS_HOTSPOT_POSITIONS[key] || { x: 50, y: 50, zoom: 1, offsetX: 0, offsetY: 0 };
      const section = sections.find((s) => s.id === key);
      const chapter = chapterDataMap[key];
      return {
        product_id: productId,
        hotspot_key: key,
        x: pos.x,
        y: pos.y,
        title: section?.title || key,
        description: chapter?.description || section?.tagline || "",
        sub_image_url: section?.imageUrl || resolvedPrimaryImage || null,
        zoom: pos.zoom,
        offset_x: pos.offsetX,
        offset_y: pos.offsetY,
        display_order: i,
        is_active: true,
      };
    });

    if (hotspotRows.length > 0) {
      const { error } = await supabase.from("product_hotspots").insert(hotspotRows);
      if (error) console.warn("hotspots insert warning:", error.message);
    }

    // 11. Upsert presentation_config
    const overviewSection = sections.find((s) => s.id === "overview");
    const engineSection = sections.find((s) => s.id === "engine");

    await supabase.from("product_presentation_config").delete().eq("product_id", productId);
    await supabase.from("product_presentation_config").insert({
      product_id: productId,
      main_image_1: overviewSection?.imageUrl || resolvedPrimaryImage || null,
      main_image_2: engineSection?.imageUrl || resolvedGallery[0] || null,
      video_url: resolvedVideoUrl || null,
      video_thumb_url: resolvedVideoThumb || null,
      chapter_count: sections.length,
      use_two_image: resolvedGallery.length > 0,
      config: {},
    });

    // 12. Write CMS sections (legacy support)
    try {
      await Promise.all([
        updateCMSSection("showcaseData", automation.showcaseData, "product", productId),
        updateCMSSection("presentationData", automation.presentationData, "product", productId),
      ]);
    } catch (cmsErr) {
      console.warn("CMS section write skipped:", cmsErr);
    }

    return { success: true, productId, slug };
  } catch (err: any) {
    console.error("publishProductV2 failed:", err);
    return { success: false, productId: null, slug: null, error: err?.message || String(err) };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function inferInteractionType(chapterKey: string): string {
  const map: Record<string, string> = {
    overview:    "tab_switcher",
    engine:      "tab_switcher",
    fuel:        "fuel_slider",
    alternator:  "tab_switcher",
    electrical:  "reactance_table",
    enclosure:   "dimension_toggle",
    control:     "tab_switcher",
    protection:  "certification_badges",
    supply:      "checklist",
    dimensions:  "dimension_toggle",
    video:       "none",
  };
  return map[chapterKey] || "tab_switcher";
}

function buildComparisonSpecs(
  form: PublishFormInput,
  chapterDataMap: Record<string, ChapterDataInput>
): { label: string; value: string }[] {
  const kva = Number(form.kva) || 0;
  const kwe = Math.round(kva * 0.8 * 10) / 10;
  const overview = chapterDataMap["overview"];
  const enclosure = chapterDataMap["enclosure"];
  const engine = chapterDataMap["engine"];
  const fuel = chapterDataMap["fuel"];
  const alternator = chapterDataMap["alternator"];

  const findSpec = (
    chapter: ChapterDataInput | undefined,
    ...keywords: string[]
  ): string => {
    if (!chapter) return "";
    const all = [...(chapter.specs || []), ...(chapter.acousticDims || []), ...(chapter.envSpecs || [])];
    for (const kw of keywords) {
      const found = all.find((s) => s.label.toLowerCase().includes(kw.toLowerCase()));
      if (found?.value) return found.value;
    }
    return "";
  };

  return [
    { label: "Power Output", value: `${kwe} kWe` },
    { label: "kVA Rating", value: `${kva} kVA` },
    { label: "Application", value: "Prime Power" },
    { label: "Power Factor", value: "0.8" },
    { label: "Engine Brand", value: getEngineBrandLabel(normalizeEngineBrandKey(form.engineBrand), form.engineBrand) },
    { label: "Engine Model", value: findSpec(engine, "model") || "" },
    { label: "Cylinders", value: findSpec(engine, "cylinder") || "" },
    { label: "Cooling System", value: findSpec(fuel, "cooling") || "Radiator (Water Cooled)" },
    { label: "Starting System", value: "12V DC Electric" },
    { label: "Fuel Consumption (100% Load)", value: findSpec(fuel, "100%", "100 %") || "" },
    { label: "Fuel Consumption (75% Load)", value: findSpec(fuel, "75%", "75 %") || "" },
    { label: "Fuel Tank Capacity", value: findSpec(enclosure, "tank", "fuel") || "" },
    { label: "Voltage", value: findSpec(overview, "voltage") || "415 V" },
    { label: "Frequency", value: findSpec(overview, "frequency") || "50 Hz" },
    { label: "Alternator", value: `${findSpec(alternator, "make")} ${findSpec(alternator, "frame")}`.trim() || "" },
    { label: "Control Panel", value: findSpec(chapterDataMap["control"], "controller", "model") || "DEIF SGC 120" },
    { label: "Dimensions (L×W×H)", value: `${findSpec(enclosure, "length")} × ${findSpec(enclosure, "width")} × ${findSpec(enclosure, "height")}`.replace(/× ×/g, "×").trim() || "" },
    { label: "Noise Level", value: findSpec(enclosure, "noise") || "" },
    { label: "Enclosure Type", value: "Acoustic Silent" },
    { label: "Compliance", value: form.cpcb === "ii" ? "CPCB II" : "CPCB IV+" },
  ].filter((s) => s.value.trim() !== "");
}
export async function getTemplateAssets(searchTerm: string) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        product_media(kind, public_url),
        product_presentation_config(video_url, video_thumb_url)
      `)
      .ilike("model", `%${searchTerm}%`)
      .limit(1)
      .single();

    if (error || !data) return null;

    const media = data.product_media || [];
    const config = data.product_presentation_config?.[0];

    return {
      primaryImage: media.find((m: any) => m.kind === "primary")?.public_url || "",
      galleryImages: media.filter((m: any) => m.kind === "gallery").map((m: any) => m.public_url),
      videoUrl: config?.video_url || media.find((m: any) => m.kind === "video")?.public_url || "",
      videoThumbUrl: config?.video_thumb_url || media.find((m: any) => m.kind === "thumbnail")?.public_url || "",
    };
  } catch (err) {
    console.warn("Failed to fetch template assets:", err);
    return null;
  }
}
