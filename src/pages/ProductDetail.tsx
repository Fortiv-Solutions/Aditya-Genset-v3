import { Link, useParams, useNavigate } from "react-router-dom";
import { SEO } from "@/components/site/SEO";
import { ScrollStory } from "@/components/site/ScrollStory";
import { ArrowLeft, Monitor, Loader2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { EditableText } from "@/components/cms/EditableText";
import { useCMSState } from "@/components/cms/CMSEditorProvider";
import { fetchProductShowcase } from "@/lib/api/cms";
import { ShowcaseProduct, getProductBySlug } from "@/data/products";
import { useCompare } from "@/context/CompareContext";
import { BarChart2 } from "lucide-react";

// Import core showcase assets to ensure they are bundled correctly
import escortVideo from "@/assets/products/showcase/product-video.mp4";
import escortVideoThumb from "@/assets/products/showcase/main-view.png";

// Height of the absolute header overlay in px — used to offset first chapter
export const SHOWCASE_HEADER_H = 230;

export default function ProductDetail() {
  const { slug, pageId } = useParams();
  const navigate = useNavigate();
  const scrollStoryRef = useRef<{ enterPresentMode: () => void }>(null);
  const { content, loadProductCMS } = useCMSState();
  const [activeChapter, setActiveChapter] = useState(0);
  const [product, setProduct] = useState<ShowcaseProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();

  const isCMSPreview = !!pageId?.startsWith("showcaseData") || !!pageId?.startsWith("ekl15ShowcaseData");

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setLoading(true);
      try {
        console.log("Fetching product showcase for slug:", slug);
        const data = await fetchProductShowcase(slug);
        console.log("Data received:", !!data);
        
        const staticData = getProductBySlug(slug);
        
        if (data && data.product) {
          const productMedia = (data.product as any).product_media || [];
          const primaryImage =
            productMedia.find((m: any) => m.kind === 'primary' || m.kind === 'hero')?.public_url ||
            data.showcase?.sections?.[0]?.image ||
            staticData?.thumbnail ||
            "";

          let finalProduct: ShowcaseProduct = {
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

          // Ensure Electrical section exists for consistency
          if (!finalProduct.sections.find(s => s.id === "electrical")) {
            const videoIdx = finalProduct.sections.findIndex(s => s.id === "video");
            const newElectrical = {
              id: "electrical",
              number: "10",
              title: "Electrical Performance",
              tagline: "Comprehensive electrical specifications and reactance data.",
              image: "/assets/products/parts/enclosure.jpg",
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
            // Renumber subsequent sections
            finalProduct.sections.forEach((s, idx) => {
              s.number = String(idx + 1).padStart(2, '0');
            });
          }

          // Ensure video slide exists
          if (!finalProduct.sections.find(s => s.id === "video")) {
            const lastNum = finalProduct.sections.length > 0 
              ? parseInt(finalProduct.sections[finalProduct.sections.length - 1].number) 
              : 0;
            finalProduct.sections.push({
              id: "video",
              number: String(lastNum + 1).padStart(2, '0'),
              title: "Product Video",
              tagline: "Escort DG Set — Multiple views and 360° product showcase.",
              image: escortVideoThumb,
              videoUrl: escortVideo,
              alt: `${finalProduct.name} 360 degree showcase`,
              specs: [
                { label: "Duration", value: "8 sec" },
                { label: "Format", value: "MP4" },
                { label: "Source", value: "360° View" },
              ],
            });
          } else {
            // Force videoUrl for the existing video section if missing or incorrect
            const videoSec = finalProduct.sections.find(s => s.id === "video");
            if (videoSec && !videoSec.videoUrl) {
              videoSec.videoUrl = escortVideo;
            }
            if (videoSec && !videoSec.image) {
              videoSec.image = escortVideoThumb;
            }
          }
          if (!finalProduct.hotspots.find(h => h.id === "video")) {
            finalProduct.hotspots.push({
              id: "video",
              x: 50, y: 50,
              title: "Product Video",
              description: `Experience the ${finalProduct.name} in action with our official 360° showcase film.`,
              specs: [{ label: "Showcase", value: "360° View" }],
              zoom: 1, offsetX: 0, offsetY: 0,
            });
          }

          setProduct(finalProduct);
          console.log("Product state set, loading CMS...");
          await loadProductCMS(data.product.id);
          console.log("CMS loaded.");
        } else if (staticData) {
          // Fallback to static data if DB is empty for this slug
          console.log("Using static data fallback for:", slug);
          
          // Apply same safety check for static data
          const finalProduct = { ...staticData };
          
          // Ensure Electrical section exists
          if (!finalProduct.sections.find(s => s.id === "electrical")) {
            const videoIdx = finalProduct.sections.findIndex(s => s.id === "video");
            const newElectrical = {
              id: "electrical",
              number: "10",
              title: "Electrical Performance",
              tagline: "Comprehensive electrical specifications and reactance data.",
              image: "/assets/products/parts/enclosure.jpg",
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
            // Renumber
            finalProduct.sections.forEach((s, idx) => s.number = String(idx + 1).padStart(2, '0'));
          }

          if (!finalProduct.sections.find(s => s.id === "video")) {
            finalProduct.sections = [...finalProduct.sections, {
              id: "video",
              number: String(finalProduct.sections.length + 1).padStart(2, '0'),
              title: "Product Video",
              tagline: "Escort DG Set — Multiple views and 360° product showcase.",
              image: escortVideoThumb,
              videoUrl: escortVideo,
              alt: `${finalProduct.name} 360 degree showcase`,
              specs: [
                { label: "Duration", value: "8 sec" },
                { label: "Format", value: "MP4" },
                { label: "Source", value: "360° View" },
              ],
            }];
          } else {
            // Force videoUrl for the existing video section if missing or incorrect
            const videoSec = finalProduct.sections.find(s => s.id === "video");
            if (videoSec && !videoSec.videoUrl) {
              videoSec.videoUrl = escortVideo;
            }
            if (videoSec && !videoSec.image) {
              videoSec.image = escortVideoThumb;
            }
          }
          if (!finalProduct.hotspots.find(h => h.id === "video")) {
            finalProduct.hotspots = [...finalProduct.hotspots, {
              id: "video",
              x: 50, y: 50,
              title: "Product Video",
              description: `Experience the ${finalProduct.name} in action with our official 360° showcase film.`,
              specs: [{ label: "Showcase", value: "360° View" }],
              zoom: 1, offsetX: 0, offsetY: 0,
            }];
          }
          setProduct(finalProduct);
        }
      } catch (err) {
        console.error("Failed to load product detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Safety timeout to prevent stuck loading
    const timer = setTimeout(() => setLoading(false), 10000);
    return () => clearTimeout(timer);
  }, [slug, loadProductCMS]);

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
  const isEscorts = activeProduct.engineBrand === "Escorts";
  
  // Decide which CMS section to use for editing (dynamic products use showcaseData as base)
  const sectionId = isCMSPreview ? pageId : (isEscorts ? "ekl15ShowcaseData" : "showcaseData");
  const sectionKey = sectionId as "showcaseData";
  
  // If the DB CMS row is missing, content falls back to global defaults.
  // We want to detect if we are seeing default template text for a product that isn't the template's subject.
  const isBaudouinFallback = content?.showcaseData?.productName === "62.5 kVA Silent DG Set" && activeProduct.slug !== "silent-62-5";
  const isEscortFallback = content?.ekl15ShowcaseData?.productName === "EKL 15 kVA (2 Cyl) DG Set" && activeProduct.slug !== "ekl-15-2cyl";
  
  const isFallback = isEscorts ? isEscortFallback : isBaudouinFallback;
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
        {/* Row 1 — Navigation: back ← ............... → Present Mode */}
        <div className="flex items-start justify-between">
          <button
            onClick={() => navigate(-1)}
            className="pointer-events-auto inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors story-link mt-1"
          >
            <ArrowLeft size={12} /> <EditableText section={sectionKey} contentKey="backLabel" as="span" override={isFallback ? "Back to category" : undefined} />
          </button>

          <div className="flex items-center gap-3 mt-3">
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
        <div className="mt-5">
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
            className="mt-1.5 font-display text-3xl font-semibold leading-tight md:text-4xl block"
            as="h1"
          />
          <EditableText
            section={sectionKey}
            contentKey="pageSubtitle"
            override={isFallback ? `A 10-chapter walkthrough of the ${activeProduct.engineBrand}-powered ${activeProduct.kva} kVA generator.` : undefined}
            fallback={isFallback ? `A 10-chapter walkthrough of the ${activeProduct.engineBrand}-powered ${activeProduct.kva} kVA generator.` : undefined}
            className="mt-1.5 max-w-xl text-sm text-muted-foreground block"
            as="p"
          />
        </div>
      </div>


      {/* ── Full-height scroll story — first chapter respects header height ── */}
      <ScrollStory
        ref={scrollStoryRef}
        product={activeProduct}
        sectionId={sectionKey}
        onChapterChange={setActiveChapter}
      />
    </div>
  );
}

