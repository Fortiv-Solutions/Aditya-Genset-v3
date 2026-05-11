import { useEffect, useRef, useState } from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { durations, easings } from "@/lib/animations";
import { EditableText } from "@/components/cms/EditableText";
import { EditableImage } from "@/components/cms/EditableImage";
import { useCMSState } from "@/components/cms/CMSEditorProvider";
import type { CMSSection as CMSSectionKey } from "@/lib/sanity";
import type { ShowcaseProduct } from "@/data/products";
import { ChapterInteractive } from "./ChapterInteractive";
// Legacy static data — used as fallback when chapterDataMap prop is not provided
// Legacy static data removed
// EKL20_3CYL_CHAPTER_DATA import removed

// Fallback images
import mainImageFallback from "@/assets/products/showcase/main-view.png";
import subProductFallback from "@/assets/products/parts/enclosure.jpg";

export function GuidedPresentation({ onClose, sectionId = "presentationData", product, chapterDataMap }: { onClose: () => void, sectionId?: string, product?: ShowcaseProduct, chapterDataMap?: Record<string, any> }) {
  const { isEditMode, content, updateContentLive, commitHistory } = useCMSState();
  const cmsContent = content[sectionId as keyof typeof content] as Record<string, any>;
  const showcaseContent = cmsContent; // Use the same section for both hotspot and showcase labels
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ container: wrapperRef });
  
  // Use product hotspots or fallback
  const presentationHotspots = (product?.hotspots || []).filter(h => h.id !== "video");
  
  const [currentIndex, setCurrentIndex] = useState(0);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Track scroll progress to update chapter
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((v) => {
      if (presentationHotspots.length === 0) return;
      const index = Math.min(
        Math.floor(v * presentationHotspots.length),
        presentationHotspots.length - 1
      );
      setCurrentIndex(index);
    });
    return () => unsubscribe();
  }, [scrollYProgress, presentationHotspots.length]);

  const activeHotspot = presentationHotspots[currentIndex];
  
  if (!activeHotspot) return null;

  // Image key and default - uses the two-main-image system for Escort products
  const isTwoImageSystem = presentationHotspots.length >= 10;
  const imageKey = isTwoImageSystem ? (currentIndex >= 5 ? "image2" : "image1") : "image1";
  const defaultImage = isTwoImageSystem 
    ? (currentIndex >= 5 ? (cmsContent?.mainImages?.image2 || mainImageFallback) : (cmsContent?.mainImages?.image1 || mainImageFallback))
    : (cmsContent?.mainImages?.image1 || product?.hero || mainImageFallback);

  // Hotspot coordinates
  const dotX = cmsContent?.[`hotspot_${currentIndex}_x`] !== undefined ? Number(cmsContent[`hotspot_${currentIndex}_x`]) : activeHotspot.x;
  const dotY = cmsContent?.[`hotspot_${currentIndex}_y`] !== undefined ? Number(cmsContent[`hotspot_${currentIndex}_y`]) : activeHotspot.y;
  
  // Camera pan offset - further dampened to keep image centered
  const cameraOffsetX = (50 - dotX) * 0.4;
  const cameraOffsetY = (50 - dotY) * 0.4;

  return (
    <div ref={wrapperRef} className="fixed inset-0 z-[9999] overflow-y-auto bg-white pointer-events-auto no-scrollbar">
      <div ref={containerRef} className="relative h-[600vh] w-full text-foreground selection:bg-accent selection:text-white">
        {/* Sticky Background Visuals */}
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-white">
          <motion.div
            animate={{
              scale: activeHotspot.zoom || 1.15,
              x: `${cameraOffsetX}%`,
              y: `${cameraOffsetY}%`,
            }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full flex items-center justify-center relative"
          >
            <div ref={imageWrapperRef} className="relative inline-block max-h-[80vh] max-w-[80vw]">
              {activeHotspot.id === "video" && product?.sections.find(s => s.id === "video")?.videoUrl ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  <video
                    src={product.sections.find(s => s.id === "video")?.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="max-h-[75vh] max-w-[75vw] object-contain rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] border-8 border-white/5 bg-black"
                  />
                  <div className="absolute inset-0 rounded-3xl ring-1 ring-white/20 pointer-events-none" />
                </motion.div>
              ) : (
                <EditableImage
                  section={sectionId}
                  contentKey={`mainImages.${imageKey}`}
                  defaultSrc={defaultImage}
                  alt="Product Presentation View"
                  className="max-h-[80vh] max-w-[80vw] object-contain pointer-events-none"
                />
              )}

              {/* Hotspot Dots */}
              {presentationHotspots.map((h, i) => {
                const hX = cmsContent?.[`hotspot_${i}_x`] !== undefined ? Number(cmsContent[`hotspot_${i}_x`]) : h.x;
                const hY = cmsContent?.[`hotspot_${i}_y`] !== undefined ? Number(cmsContent[`hotspot_${i}_y`]) : h.y;

                return (
                  <motion.div
                    key={h.id}
                    drag={isEditMode}
                    dragMomentum={false}
                    onDragEnd={(e, info) => {
                      if (!isEditMode || !imageWrapperRef.current) return;
                      const rect = imageWrapperRef.current.getBoundingClientRect();
                      let nx = ((info.point.x - rect.left) / rect.width) * 100;
                      let ny = ((info.point.y - rect.top) / rect.height) * 100;
                      nx = Math.max(0, Math.min(100, nx));
                      ny = Math.max(0, Math.min(100, ny));
                      updateContentLive(sectionId as CMSSectionKey, `hotspot_${i}_x`, nx.toFixed(2));
                      updateContentLive(sectionId as CMSSectionKey, `hotspot_${i}_y`, ny.toFixed(2));
                      commitHistory();
                    }}
                    animate={{ 
                      opacity: currentIndex === i ? 1 : 0.3,
                      scale: currentIndex === i ? 1.3 : 0.8,
                      left: `${hX}%`,
                      top: `${hY}%`,
                    }}
                    className={cn(
                      "absolute h-4 w-4 rounded-full border-2 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-colors",
                      currentIndex === i ? "bg-accent border-accent z-10" : "bg-white/80 border-foreground/20 z-0",
                      isEditMode && "cursor-move z-50"
                    )}
                  >
                    <div className={cn("h-1.5 w-1.5 rounded-full", currentIndex === i ? "bg-white animate-pulse" : "bg-foreground/20")} />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Navigation Dots (Right Center Static) */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-6 pointer-events-auto z-50">
            {presentationHotspots.map((h, i) => (
              <button
                key={h.id}
                onClick={() => {
                  if (!wrapperRef.current) return;
                  const scrollHeight = containerRef.current?.scrollHeight || 0;
                  const viewHeight = wrapperRef.current.clientHeight;
                  const targetScroll = (i / (presentationHotspots.length - 1)) * (scrollHeight - viewHeight);
                  wrapperRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
                }}
                className="group flex items-center justify-end gap-4 text-right"
              >
                <span className={cn(
                  "text-[10px] uppercase tracking-[0.2em] transition-all duration-500",
                  currentIndex === i ? "text-accent opacity-100" : "text-foreground/20 opacity-0 group-hover:opacity-60"
                )}>
                  {h.title}
                </span>
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all duration-500",
                  currentIndex === i ? "bg-accent scale-150 shadow-lg" : "bg-foreground/10 group-hover:bg-foreground/30"
                )} />
              </button>
            ))}
          </div>

          {/* Header (Top Right Exit) */}
          <header className="absolute top-0 inset-x-0 h-24 flex items-center justify-between px-12 pointer-events-auto z-50">
            <motion.div 
              className="flex items-center gap-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="h-10 w-1 bg-accent rounded-full" />
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-accent font-bold">Guided Presentation</p>
                <h2 className="font-display text-xl tracking-tight text-foreground">
                  {showcaseContent?.productName || product?.name}
                </h2>
              </div>
            </motion.div>
            <button
              onClick={onClose}
              className="group flex h-12 w-12 items-center justify-center bg-white shadow-md border border-border rounded-full transition-all active:scale-95"
            >
              <X size={20} className="text-foreground transition-transform group-hover:rotate-90" />
            </button>
          </header>

          {/* Content Area */}
          <div className="absolute inset-x-12 bottom-12 flex items-end justify-between pointer-events-none z-50">
            {/* Info Card */}
            <motion.div className="w-[440px] pointer-events-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeHotspot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-[#0B3A5C] border border-white/10 shadow-2xl rounded-3xl p-8 text-white dark h-[600px] flex flex-col"
                >
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-2 py-0.5 rounded bg-accent text-white text-[10px] font-bold uppercase tracking-widest">
                        Chapter {currentIndex + 1}
                      </div>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <EditableText 
                      section={sectionId as CMSSectionKey} 
                      contentKey={`hotspot_${currentIndex}_title`} 
                      fallback={activeHotspot.title}
                      className="font-display text-3xl font-semibold mb-3 leading-tight block" 
                      as="h3" 
                    />
                    <EditableText 
                      section={sectionId as CMSSectionKey} 
                      contentKey={`hotspot_${currentIndex}_desc`} 
                      fallback={activeHotspot.description}
                      className="text-white/70 text-sm leading-relaxed mb-8 block" 
                      as="p" 
                    />

                    {product?.engineBrand === "Escorts" ? (
                      <div className="mt-6">
                        <ChapterInteractive 
                          chapterId={activeHotspot.id} 
                          data={{
                            // V2: use chapterDataMap
                            ...(chapterDataMap ? (chapterDataMap[activeHotspot.id] || {}) : {}),
                            // removed 251
                            // removed 252
                            ...(product?.sections.find(s => s.id === activeHotspot.id) || {})
                          } as any} 
                          active={true} 
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {(activeHotspot.specs || []).map((spec, i) => (
                          <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <EditableText 
                              section={sectionId as CMSSectionKey} 
                              contentKey={`hotspot_${currentIndex}_spec${i}_label`} 
                              fallback={spec.label}
                              className="text-[9px] uppercase tracking-widest text-white/40 block mb-1" 
                              as="span" 
                            />
                            <EditableText 
                              section={sectionId as CMSSectionKey} 
                              contentKey={`hotspot_${currentIndex}_spec${i}_value`} 
                              fallback={spec.value as string}
                              className="text-sm font-semibold block" 
                              as="span" 
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Sub-Image Card - Hidden for EKL 15 as requested */}
            {product?.slug !== "ekl-15-2cyl" && (
              <motion.div className="w-[360px] pointer-events-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeHotspot.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border border-border shadow-2xl rounded-3xl p-2"
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
                      <EditableImage
                        section={sectionId}
                        contentKey={`hotspot_${currentIndex}_image`}
                        defaultSrc={activeHotspot.subImage || subProductFallback}
                        alt={activeHotspot.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
