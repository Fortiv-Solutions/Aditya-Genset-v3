/**
 * SlideReviewer.tsx
 * 11-slide review/edit flow for the Add Product V2 workflow.
 * Each slide corresponds to one showcase chapter section.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Eye, CheckCircle2, Settings, Move, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChapterDataInput, SectionInput, PublishMediaInput } from "@/lib/api/productPublisher";
import type { TemplateId } from "@/lib/templateRegistry";
import { ESCORTS_CHAPTER_LABELS, getChapterKeys } from "@/lib/templateRegistry";
import { ChapterInteractive } from "@/components/site/ChapterInteractive";
import { StickyImageStack } from "@/components/site/StickyImageStack";
import { ProgressRail } from "@/components/site/ProgressRail";
import { uploadImage } from "@/lib/api/storage";
import { toast } from "sonner";

export type ReviewChapterMap = Record<string, ChapterDataInput>;

interface SlideReviewerProps {
  templateId: TemplateId;
  chapterDataMap: ReviewChapterMap;
  sections: SectionInput[];
  media: PublishMediaInput;
  productName: string;
  onChapterChange: (key: string, data: ChapterDataInput) => void;
  onSectionChange: (key: string, section: Partial<SectionInput>) => void;
  onMediaChange: (media: Partial<PublishMediaInput>) => void;
}

// Removed hardcoded SLIDE_KEYS

export function SlideReviewer({
  templateId,
  chapterDataMap,
  sections,
  media,
  productName,
  onChapterChange,
  onSectionChange,
  onMediaChange,
}: SlideReviewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideKeys = getChapterKeys(templateId);

  const activeKey = slideKeys[activeIndex];
  const activeSection = sections.find((s) => s.id === activeKey);
  const activeChapter = chapterDataMap[activeKey] || {};

  const refs = useRef<(HTMLElement | null)[]>([]);
  const rightColRef = useRef<HTMLDivElement>(null);
  const isJumping = useRef(false);

  const jumpTo = useCallback((i: number) => {
    const el = refs.current[i];
    const col = rightColRef.current;
    if (!el || !col) return;
    col.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  }, []);

  const advanceTo = useCallback((next: number) => {
    if (isJumping.current) return;
    isJumping.current = true;
    const boundedNext = Math.max(0, Math.min(next, slideKeys.length - 1));
    setActiveIndex(boundedNext);
    jumpTo(boundedNext);
    window.setTimeout(() => {
      isJumping.current = false;
    }, 700);
  }, [jumpTo]);

  // Wheel interceptor — one wheel tick = one chapter advance/retreat
  useEffect(() => {
    const col = rightColRef.current;
    if (!col) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const next = event.deltaY > 0
        ? Math.min(activeIndex + 1, slideKeys.length - 1)
        : Math.max(activeIndex - 1, 0);
      advanceTo(next);
    };

    col.addEventListener("wheel", onWheel, { passive: false });
    return () => col.removeEventListener("wheel", onWheel);
  }, [activeIndex, advanceTo]);

  // Keyboard interceptor
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (isTyping) return;

      if (event.key === "PageDown" || event.key === "ArrowDown" || event.key === " ") {
        event.preventDefault();
        advanceTo(activeIndex + 1);
      }

      if (event.key === "PageUp" || event.key === "ArrowUp") {
        event.preventDefault();
        advanceTo(activeIndex - 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, advanceTo]);

  const showcaseSections = slideKeys.map((key, i) => {
    const s = sections.find(sec => sec.id === key);
    return {
      id: key,
      number: s?.number || String(i + 1).padStart(2, '0'),
      title: s?.title || ESCORTS_CHAPTER_LABELS[key],
      tagline: s?.tagline || "",
      image: s?.imageUrl || "",
      videoUrl: "", // Admin can edit video separately
      alt: s?.altText || s?.title || ""
    };
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const key = slideKeys[index];
    setUploadingImage(true);
    const toastId = toast.loading("Uploading image...");
    try {
      const url = await uploadImage(file);
      onSectionChange(key, { imageUrl: url });
      toast.success("Image uploaded", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="h-full bg-background relative overflow-hidden">
      {/* Container to match showcase layout exactly */}
      <div className="container-showcase hidden lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-12 h-full">
        
        {/* Left Side: Sticky Image + Progress Rail (EXACT ScrollStory match) */}
        <aside className="col-span-6 flex min-w-0 items-center self-start h-full sticky top-0 py-6">
          <div className="flex h-full w-full min-w-0 items-center gap-8 py-6 xl:gap-12 2xl:gap-16">
            <div className="flex h-full min-w-0 flex-1 flex-col justify-center">
                 <>
                   <div className="min-w-0 pt-2 pb-5 transition-all duration-500 ease-brand group/title">
                      <div className="font-display text-[10px] uppercase tracking-[0.45em] text-accent mb-1.5 flex items-center">
                         <span
                           contentEditable
                           suppressContentEditableWarning
                           onBlur={e => onSectionChange(activeKey, { number: e.currentTarget.textContent || "" })}
                           className="bg-transparent outline-none focus:bg-accent/10 focus:ring-2 focus:ring-accent/30 rounded px-1 transition-all min-w-[20px] text-center"
                         >
                           {showcaseSections[activeIndex]?.number}
                         </span>
                         <span className="mx-2">/</span>
                         <span>{showcaseSections[activeIndex]?.id}</span>
                      </div>
                      <h2
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => onSectionChange(activeKey, { title: e.currentTarget.textContent || "" })}
                        className="max-w-full break-words font-display text-3xl font-semibold leading-tight md:text-4xl bg-transparent outline-none focus:bg-accent/10 focus:ring-2 focus:ring-accent/30 rounded px-1 -mx-1 transition-all"
                      >
                        {showcaseSections[activeIndex]?.title}
                      </h2>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="h-px w-8 bg-accent" />
                        <div className="h-px flex-1 bg-border" />
                      </div>
                   </div>
                   <div className="flex-1 min-h-0 relative group">
                      <StickyImageStack sections={showcaseSections as any} active={activeIndex} />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                         <label className={cn("pointer-events-auto cursor-pointer bg-black/80 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-black transition-colors border border-white/20", uploadingImage && "opacity-50 pointer-events-none")}>
                            <Upload size={16} />
                            <span className="text-sm font-semibold tracking-wide">{uploadingImage ? "Uploading..." : "Upload Image"}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(activeIndex, e)} />
                         </label>
                      </div>
                   </div>
                 </>
            </div>

            <ProgressRail
              count={showcaseSections.length}
              active={activeIndex}
              labels={showcaseSections.map((s) => s.number)}
              images={showcaseSections.map((s) => s.image)}
              videoUrls={showcaseSections.map((s) => s.videoUrl)}
              onJump={(i) => {
                 advanceTo(i);
              }}
            />
          </div>
        </aside>

        {/* Right Side: Snap-scroll chapter column (EXACT ScrollStory match) */}
        <div 
          ref={rightColRef}
          className="col-span-6 min-w-0 overflow-y-auto h-full scrollbar-none pb-[50vh]" 
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {slideKeys.map((key, i) => {
             const sSection = sections.find(s => s.id === key);
             const sData = chapterDataMap[key] || {};
             const mergedData = { ...sData, ...showcaseSections[i] };

             return (
                <article 
                  key={key} 
                  ref={(el) => (refs.current[i] = el)}
                  data-index={i}
                  id={`section-${i}`} 
                  className="flex min-w-0 flex-col justify-center min-h-full py-16 xl:py-24 2xl:py-32"
                >
                   {/* EXACT Site Component Rendering with Inline Editing */}
                   <div className="relative group/canvas rounded-2xl transition-all duration-300">
                     {activeIndex === i && (
                        <div className="absolute -top-6 left-0 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-bold text-accent uppercase tracking-widest flex items-center gap-1.5 opacity-0 transition-opacity group-hover/canvas:opacity-100">
                          <Settings size={12} /> Live Showcase Editor
                        </div>
                     )}
                     <ChapterInteractive 
                       chapterId={key}
                       data={mergedData as any}
                       active={activeIndex === i}
                       index={i}
                       onChange={(data) => onChapterChange(key, { ...sData, ...data })}
                     />
                   </div>
                </article>
             );
          })}
        </div>
      </div>
    </div>
  );
}
