import { Link, useParams, useNavigate } from "react-router-dom";
import { SEO } from "@/components/site/SEO";
import { ScrollStory } from "@/components/site/ScrollStory";
import { ArrowLeft, Monitor, Loader2, BarChart2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { EditableText } from "@/components/cms/EditableText";
import { useCMSState } from "@/components/cms/CMSEditorProvider";
import { fetchProductShowcase } from "@/lib/api/cms";
import { fetchProductDetailV2 } from "@/lib/api/productDetailV2";
import type { V2ShowcaseProduct } from "@/lib/api/productDetailV2";
import { ShowcaseProduct, getProductBySlug } from "@/data/products";
import { useCompare } from "@/context/CompareContext";
import videoThumb from "@/assets/products/showcase/main-view-optimized.jpg";
import showcaseVideo from "@/assets/products/showcase/product-video.mp4";
import escortVideo from "@/assets/products/showcase/product-video.mp4";
import escortVideoThumb from "@/assets/products/showcase/main-view-optimized.jpg";
import enclosureThumb from "@/assets/products/parts/enclosure.jpg";

// Height of the absolute header overlay in px — used to offset first chapter
export const SHOWCASE_HEADER_H = 230;

export default function ProductDetail() {
  const { slug, pageId } = useParams();
  const navigate = useNavigate();
  const scrollStoryRef = useRef<{ enterPresentMode: () => void }>(null);
  const { content, loadProductCMS } = useCMSState();
  const [activeChapter, setActiveChapter] = useState(0);
  const isCMSPreview = !!pageId?.startsWith("showcaseData") || !!pageId?.startsWith("ekl15ShowcaseData");
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const { data: queryData, isLoading: loading } = useQuery({
    queryKey: ['product-detail', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      let finalProduct: ShowcaseProduct | null = null;
      let loadCmsId: string | null = null;

      // ── V2 path: fetch from new relational tables ──────────────────────
      const v2Data = await fetchProductDetailV2(slug);
      if (v2Data && v2Data.sections.length > 0) {
        console.log("✅ V2 data loaded for:", slug);
        const videoSec = v2Data.sections.find(s => s.id === "video");
        if (videoSec) {
          if (!videoSec.videoUrl) videoSec.videoUrl = escortVideo;
          if (!videoSec.image)    videoSec.image    = escortVideoThumb;
        } else {
          v2Data.sections.push({
            id: "video",
            number: String(v2Data.sections.length + 1).padStart(2, "0"),
            title: "Product Video",
            tagline: "Escort DG Set — Multiple views and 360° product showcase.",
            image: escortVideoThumb,
            videoUrl: escortVideo,
            alt: `${v2Data.name} 360 degree showcase`,
            specs: [
              { label: "Duration", value: "8 sec" },
              { label: "Format",   value: "MP4" },
              { label: "Source",   value: "360° View" },
            ],
          });
        }
        if (!v2Data.hotspots.find(h => h.id === "video")) {
          v2Data.hotspots.push({
            id: "video", x: 50, y: 50,
            title: "Product Video",
            description: `Experience the ${v2Data.name} in action with our official 360° showcase film.`,
            specs: [{ label: "Showcase", value: "360° View" }],
            zoom: 1, offsetX: 0, offsetY: 0,
          });
        }
        return { finalProduct: v2Data as any, v2Data: v2Data, loadCmsId: v2Data.id };
      }

      // ── Legacy path: CMS + static fallback ────────────────────────────
      console.log("⚠️ V2 data empty, falling back to legacy for:", slug);
      const data = await fetchProductShowcase(slug);
      const staticData = getProductBySlug(slug);

      if (data && data.product) {
        const productMedia = (data.product as any).product_media || [];
        let primaryImage = productMedia.find((m: any) => m.kind === "primary" || m.kind === "hero")?.public_url;
        if (primaryImage && (primaryImage.startsWith('/assets/') || primaryImage.startsWith('/src/assets/'))) {
          primaryImage = null;
        }
        primaryImage = primaryImage ||
          data.showcase?.sections?.[0]?.image ||
          staticData?.thumbnail ||
          "";

        finalProduct = {
          id: data.product.id,
          slug: data.product.slug,
          name: data.product.name,
          kva: data.product.kva,
          engineBrand: (data.product as any).engine_brand || staticData?.engineBrand,
          range: "15-62.5",
          status: "active",
          thumbnail: primaryImage,
          hero: primaryImage,
          sections: data.showcase?.sections || staticData?.sections || [],
          hotspots: (data.showcase?.hotspots?.length >= 8)
            ? data.showcase.hotspots
            : (staticData?.hotspots || []),
        };

        if (!finalProduct.sections.find(s => s.id === "electrical")) {
          const videoIdx = finalProduct.sections.findIndex(s => s.id === "video");
          const newElectrical = {
            id: "electrical",
            number: "10",
            title: "Electrical Performance",
            tagline: "Comprehensive electrical specifications and reactance data.",
            image: enclosureThumb,
            alt: "Electrical performance",
            specs: [
              { label: "Short Circuit Ratio", value: finalProduct.engineBrand === "Escorts" ? (Number(finalProduct.kva) === 15 ? "0.515" : "0.410") : "0.450" },
              { label: "Voltage Regulation", value: "±1%" },
              { label: "Battery", value: "60 Ah" },
            ],
          };
          if (videoIdx !== -1) {
            finalProduct.sections.splice(videoIdx, 0, newElectrical);
          } else {
            finalProduct.sections.push(newElectrical);
          }
          finalProduct.sections.forEach((s, idx) => { s.number = String(idx + 1).padStart(2, "0"); });
        }

        if (!finalProduct.sections.find(s => s.id === "video")) {
          finalProduct.sections.push({
            id: "video",
            number: String(finalProduct.sections.length + 1).padStart(2, "0"),
            title: "Product Video",
            tagline: "Escort DG Set — Multiple views and 360° product showcase.",
            image: videoThumb,
            videoUrl: showcaseVideo,
            alt: `${finalProduct.name} 360 degree showcase`,
            specs: [
              { label: "Duration", value: "8 sec" },
              { label: "Format",   value: "MP4" },
              { label: "Source",   value: "360° View" },
            ],
          });
        } else {
          const videoSec = finalProduct.sections.find(s => s.id === "video");
          if (videoSec && !videoSec.videoUrl) videoSec.videoUrl = escortVideo;
          if (videoSec && !videoSec.image)    videoSec.image    = escortVideoThumb;
        }
        if (!finalProduct.hotspots.find(h => h.id === "video")) {
          finalProduct.hotspots.push({
            id: "video", x: 50, y: 50,
            title: "Product Video",
            description: `Experience the ${finalProduct.name} in action with our official 360° showcase film.`,
            specs: [{ label: "Showcase", value: "360° View" }],
            zoom: 1, offsetX: 0, offsetY: 0,
          });
        }

        return { finalProduct, v2Data: null, loadCmsId: data.product.id };
      } else if (staticData) {
        console.log("Using static fallback for:", slug);
        return { finalProduct: staticData, v2Data: null, loadCmsId: null };
      }
      return null;
    },
    enabled: !!slug
  });

  const product = queryData?.finalProduct || null;
  const v2Product = queryData?.v2Data || null;

  useEffect(() => {
    if (queryData?.loadCmsId) {
      loadProductCMS(queryData.loadCmsId);
    }
  }, [queryData?.loadCmsId, loadProductCMS]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isCMSPreview && !product) {
    return (
      <section className="container-x py-32 text-center">
        <SEO title="Coming soon | Adityagenset" />
        <div className="font-display text-xs uppercase tracking-[0.3em] text-accent">Coming soon</div>
        <h1 className="mt-3 font-display text-5xl font-semibold">This story is on its way.</h1>
        <p className="mt-4 text-muted-foreground">Verified specs and imagery for this product are being prepared.</p>
        <Link to="/products" className="mt-8 inline-flex items-center gap-2 story-link">
          <ArrowLeft size={14} /> Back to catalog
        </Link>
      </section>
    );
  }

  const activeProduct = product!;
  // V2 engine_brand is stored as full label e.g. "Escorts Kubota" - use partial match
  const isEscorts = !!(activeProduct.engineBrand?.toLowerCase().includes("escort"));
  // V2 products have authoritative DB data - always override any CMS template text
  const isV2 = !!v2Product;

  // Decide which CMS section to use for editing
  const sectionId = isCMSPreview ? pageId : (isEscorts ? "ekl15ShowcaseData" : "showcaseData");
  const sectionKey = sectionId as "showcaseData";

  // Detect stale CMS template text being shown for wrong product
  const isBaudouinFallback = content?.showcaseData?.productName === "62.5 kVA Silent DG Set" && activeProduct.slug !== "silent-62-5";
  const isEscortFallback   = content?.ekl15ShowcaseData?.productName === "EKL 15 kVA (2 Cyl) DG Set" && activeProduct.slug !== "ekl-15-2cyl";

  // V2 products always use their own data — never show wrong CMS content
  const isFallback = isV2 || (isEscorts ? isEscortFallback : isBaudouinFallback);
  const productName = isFallback ? activeProduct.name : (content?.[sectionKey]?.productName || activeProduct.name);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    brand: { "@type": "Brand", name: "Adityagenset" },
    description: `${activeProduct.kva} kVA silent diesel generator set, CPCB IV+ compliant.`,
    category: "Diesel generator set",
  };

  return (
    <div className="relative">
      <SEO title={`${productName} | Adityagenset`} description={`Explore the ${activeProduct.kva} kVA Silent DG Set: engine, power, sound, dimensions — a guided scroll story.`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      {/* ── Header overlay — visible only on chapter 1 ── */}
      <div
        className="absolute top-0 left-0 right-0 z-30 container-showcase pt-8 pointer-events-none transition-all duration-500"
        style={{
          height: SHOWCASE_HEADER_H,
          opacity: activeChapter === 0 ? 1 : 0,
          transform: activeChapter === 0 ? "translateY(0)" : "translateY(-14px)",
          pointerEvents: activeChapter === 0 ? undefined : "none",
        }}
      >
        {/* Row 1 — Navigation */}
        <div className="flex min-w-0 items-start justify-between gap-4 md:pr-[236px]">
          <button
            onClick={() => navigate(-1)}
            className="pointer-events-auto inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors story-link mt-1"
          >
            <ArrowLeft size={12} /> <EditableText section={sectionKey} contentKey="backLabel" as="span" override={isFallback ? "Back to category" : undefined} />
          </button>

          <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
            <button
              onClick={() => {
                if (activeProduct.id) {
                  if (isInCompare(activeProduct.id)) removeFromCompare(activeProduct.id);
                  else addToCompare(activeProduct.id);
                }
              }}
              className={`pointer-events-auto flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold border-2 transition-all duration-300 ${
                activeProduct.id && isInCompare(activeProduct.id)
                  ? "bg-accent/10 border-accent text-accent"
                  : "bg-white border-gray-200 text-foreground hover:border-accent"
              }`}
            >
              <BarChart2 size={15} className="shrink-0" />
              <EditableText section={sectionKey} contentKey={activeProduct.id && isInCompare(activeProduct.id) ? "compareActiveLabel" : "compareLabel"} as="span" override={isFallback ? (activeProduct.id && isInCompare(activeProduct.id) ? "In Compare" : "Compare") : undefined} />
            </button>

            <button
              onClick={() => scrollStoryRef.current?.enterPresentMode()}
              className="pointer-events-auto cms-clickable inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-navy-deep hover:scale-[1.03] hover:shadow-lg active:scale-95"
            >
              <Monitor size={15} className="shrink-0" />
              <EditableText section={sectionKey} contentKey="presentModeBtn" as="span" override={isFallback ? "Present Mode" : undefined} />
            </button>
          </div>
        </div>

        {/* Row 2 — Product identity */}
        <div className="mt-5 min-w-0 lg:max-w-[calc(50%-7rem)] xl:max-w-[calc(50%-6rem)]">
          {activeProduct.sections && activeProduct.sections.length > 0 && (
            <div className="font-display text-[10px] uppercase tracking-[0.4em] text-accent">
              {activeProduct.sections[0]?.number} / {activeProduct.sections[0]?.id}
            </div>
          )}
          <EditableText
            section={sectionKey}
            contentKey="productName"
            override={isFallback ? productName : undefined}
            fallback={productName}
            className="mt-1.5 block break-words font-display text-2xl font-semibold leading-tight md:text-3xl xl:text-4xl"
            as="h1"
          />
          <EditableText
            section={sectionKey}
            contentKey="pageSubtitle"
            override={isFallback ? `A ${activeProduct.sections?.length || 11}-chapter walkthrough of the ${activeProduct.engineBrand}-powered ${activeProduct.kva} kVA generator.` : undefined}
            fallback={isFallback ? `A ${activeProduct.sections?.length || 11}-chapter walkthrough of the ${activeProduct.engineBrand}-powered ${activeProduct.kva} kVA generator.` : undefined}
            className="mt-1.5 block max-w-sm break-words text-sm text-muted-foreground"
            as="p"
          />
        </div>
      </div>

      {/* ── Full-height scroll story ── */}
      <ScrollStory
        ref={scrollStoryRef}
        product={activeProduct}
        sectionId={isFallback ? undefined : sectionKey}
        firstChapterOffset={112}
        onChapterChange={setActiveChapter}
        chapterDataMap={v2Product?.chapterDataMap}
      />
    </div>
  );
}
