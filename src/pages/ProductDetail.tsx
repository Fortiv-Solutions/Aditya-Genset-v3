import { Link, useParams, useNavigate } from "react-router-dom";
import { SEO } from "@/components/site/SEO";
import { ScrollStory } from "@/components/site/ScrollStory";
import { ArrowLeft, Monitor, Loader2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { EditableText } from "@/components/cms/EditableText";
import { useCMSState } from "@/components/cms/CMSEditorProvider";
import { fetchProductShowcase } from "@/lib/api/cms";
import { ShowcaseProduct } from "@/data/products";

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

  const isCMSPreview = !!pageId?.startsWith("showcaseData") || !!pageId?.startsWith("ekl15ShowcaseData");

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await fetchProductShowcase(slug);
        if (data && data.product) {
          const productMedia = (data.product as any).product_media || [];
          const primaryImage = productMedia.find((m: any) => m.kind === 'primary' || m.kind === 'hero')?.public_url || "";
          
          // Map DB product and CMS content to ShowcaseProduct shape
          const mappedProduct: ShowcaseProduct = {
            id: data.product.id,
            slug: data.product.slug,
            name: data.product.name,
            kva: data.product.kva,
            engineBrand: (data.product as any).engine_brand,
            range: "15-62.5", 
            status: "active",
            thumbnail: primaryImage, 
            hero: primaryImage, 
            sections: data.showcase?.sections || [],
            hotspots: data.showcase?.hotspots || [],
          };
          setProduct(mappedProduct);
          await loadProductCMS(data.product.id);
        }
      } catch (err) {
        console.error("Failed to load product detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
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
        <SEO title="Coming soon — Adityagenset" />
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
  // Decide which CMS section to use for editing (dynamic products use showcaseData as base)
  const sectionId = isCMSPreview ? pageId : "showcaseData";
  const sectionKey = sectionId as "showcaseData";
  
  // If the DB CMS row is missing, content[sectionKey] falls back to global default (which says 62.5 kVA).
  // We want to ignore that fallback for all other products.
  const isFallback = content?.[sectionKey]?.productName === "62.5 kVA Silent DG Set" && activeProduct.slug !== "silent-62-5";
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
      <SEO title={`${productName} — Adityagenset`} description={`Explore the ${activeProduct.kva} kVA Silent DG Set: engine, power, sound, dimensions — a guided scroll story.`} />
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
            <ArrowLeft size={12} /> Back to category
          </button>

          <button
            onClick={() => scrollStoryRef.current?.enterPresentMode()}
            className="pointer-events-auto cms-clickable inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-navy-deep hover:scale-[1.03] hover:shadow-lg active:scale-95 mt-3"
          >
            <Monitor size={15} className="shrink-0" />
            <EditableText section={sectionKey} contentKey="presentModeBtn" as="span" override={isFallback ? "Present Mode" : undefined} />
          </button>
        </div>

        {/* Row 2 — Product identity */}
        <div className="mt-5">
          <div className="font-display text-[10px] uppercase tracking-[0.4em] text-accent">
            {activeProduct.sections[0]?.number} / {activeProduct.sections[0]?.id}
          </div>
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

