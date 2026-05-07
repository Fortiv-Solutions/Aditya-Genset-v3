import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import type { ShowcaseProduct } from "@/data/products";
import { StickyImageStack } from "./StickyImageStack";
import { ProgressRail } from "./ProgressRail";
import { Hotspots } from "./Hotspots";
import { CountUp } from "./CountUp";
import { cn } from "@/lib/utils";
import { GuidedPresentation } from "./GuidedPresentation";
import { SmoothImage } from "@/components/ui/SmoothImage";
import { EditableText } from "@/components/cms/EditableText";
import { useCMSState } from "@/components/cms/CMSEditorProvider";
import { VerticalNav } from "./VerticalNav";
import type { NavSection } from "./VerticalNav";
import type { CMSSection } from "@/lib/sanity";
import { ChapterInteractive } from "./ChapterInteractive";
import { Clock, MonitorPlay, Clapperboard } from "lucide-react";
import { EKL15_CHAPTER_DATA } from "@/data/ekl15Data";

// No fixed header bar — ScrollStory takes full viewport height
const HEADER_H = 0;

interface Props { 
  product: ShowcaseProduct; 
  sectionId?: "showcaseData" | string;
  /** Pixels to offset the first chapter so it clears the absolute header overlay */
  firstChapterOffset?: number;
  /** Called whenever the active chapter index changes */
  onChapterChange?: (index: number) => void;
}

export const ScrollStory = forwardRef<{ enterPresentMode: () => void }, Props>(({ product, sectionId = "showcaseData", firstChapterOffset = 0, onChapterChange }, ref) => {
  const [active, setActive] = useState(0);

  // Notify parent whenever active chapter changes
  useEffect(() => { onChapterChange?.(active); }, [active, onChapterChange]);
  const [isPresenting, setIsPresenting] = useState(false);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const rightColRef = useRef<HTMLDivElement>(null);
  // Scroll-lock: prevents rapid fire chapter jumps
  const isJumping = useRef(false);

  useImperativeHandle(ref, () => ({
    enterPresentMode: () => setIsPresenting(true)
  }));

  // Present-mode body class
  useEffect(() => {
    if (isPresenting) {
      document.body.classList.add("present-mode");
    } else {
      document.body.classList.remove("present-mode");
    }
    return () => { document.body.classList.remove("present-mode"); };
  }, [isPresenting]);

  // IntersectionObserver — uses the right column as its root so it tracks
  // the column's internal scroll, not the page scroll.
  useEffect(() => {
    if (isPresenting) return;
    const root = rightColRef.current;
    if (!root) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.index);
            setActive(i);
          }
        });
      },
      { root, rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );
    refs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [isPresenting]);

  const jumpTo = (i: number) => {
    const el = refs.current[i];
    const col = rightColRef.current;
    if (!el || !col) return;
    col.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  };

  // Wheel interceptor — one wheel tick = one chapter advance/retreat
  useEffect(() => {
    if (isPresenting) return;
    const col = rightColRef.current;
    if (!col) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isJumping.current) return;
      isJumping.current = true;
      setActive((prev) => {
        const next = e.deltaY > 0
          ? Math.min(prev + 1, product.sections.length - 1)
          : Math.max(prev - 1, 0);
        // Scroll the column directly
        const el = refs.current[next];
        if (el) col.scrollTo({ top: el.offsetTop, behavior: "smooth" });
        return next;
      });
      setTimeout(() => { isJumping.current = false; }, 750);
    };

    col.addEventListener("wheel", onWheel, { passive: false });
    return () => col.removeEventListener("wheel", onWheel);
  }, [isPresenting, product.sections.length]);

  // Touch swipe interceptor for mobile
  useEffect(() => {
    if (isPresenting) return;
    const col = rightColRef.current;
    if (!col) return;

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const delta = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(delta) < 30) return; // ignore tiny swipes
      if (isJumping.current) return;
      isJumping.current = true;
      setActive((prev) => {
        const next = delta > 0
          ? Math.min(prev + 1, product.sections.length - 1)
          : Math.max(prev - 1, 0);
        const el = refs.current[next];
        if (el) col.scrollTo({ top: el.offsetTop, behavior: "smooth" });
        return next;
      });
      setTimeout(() => { isJumping.current = false; }, 750);
    };

    col.addEventListener("touchstart", onTouchStart, { passive: true });
    col.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      col.removeEventListener("touchstart", onTouchStart);
      col.removeEventListener("touchend", onTouchEnd);
    };
  }, [isPresenting, product.sections.length]);

  // Build nav sections from product chapters
  const navSections: NavSection[] = product.sections.map((s, i) => ({
    id: `chapter-${i}`,
    label: s.id,
  }));

  if (isPresenting) {
    return <GuidedPresentation onClose={() => setIsPresenting(false)} sectionId={sectionId} product={product} />;
  }

  const colHeight = `calc(100vh - ${HEADER_H}px)`;

  return (
    <section className="relative">
      {/* ── Desktop split layout ───────────────────────────────────────── */}
      <div className="container-showcase hidden lg:grid lg:grid-cols-12 lg:gap-12" style={{ height: colHeight }}>

        {/* Left — sticky image + progress rail */}
        <aside
          className="col-span-6 self-start flex items-center"
          style={{ height: colHeight, position: "sticky", top: HEADER_H }}
        >
          <div className="flex w-full items-center gap-16 h-full py-6">
            <div className="flex-1 h-full flex flex-col">

              {active === 0 ? (
                /* ── Slide 1: image centred, no title above ── */
                <div className="flex-1 flex items-center">
                  <div className="relative aspect-square w-full overflow-hidden rounded-sm">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <SmoothImage
                        src={product.sections[0].image}
                        alt={product.sections[0].alt}
                        wrapperClassName="w-full h-full absolute inset-0 bg-transparent"
                        imageClassName="w-[120%] h-[120%] object-contain transition-all duration-700"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Slides 2+: chapter title above image ── */
                <>
                  {/* Chapter title block — uses the space above the image */}
                  <div className="transition-all duration-500 ease-brand pt-2 pb-5">
                    <div className="font-display text-[10px] uppercase tracking-[0.45em] text-accent mb-1.5">
                      {product.sections[active]?.number} / {product.sections[active]?.id}
                    </div>
                    <h2 className="font-display text-3xl font-semibold leading-tight md:text-4xl">
                      {product.sections[active]?.title}
                    </h2>
                    {/* Decorative rule */}
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-px w-8 bg-accent" />
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  </div>

                  {/* Image fills remaining space */}
                  <div className="flex-1 min-h-0">
                    <StickyImageStack sections={product.sections} active={active} />
                  </div>
                </>
              )}
            </div>

            <ProgressRail
              count={product.sections.length}
              active={active}
              labels={product.sections.map((s) => s.number)}
              images={product.sections.map((s) => s.image)}
              videoUrls={product.sections.map((s) => s.videoUrl)}
              onJump={jumpTo}
            />
          </div>
        </aside>

        {/* Right — snap-scroll chapter column */}
        <div
          ref={rightColRef}
          className="col-span-6 overflow-y-auto"
          style={{
            height: colHeight,
            scrollSnapType: "y mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {product.sections.map((s, i) => {
            const isEscortsTemplateProduct = product.engineBrand === "Escorts" && product.slug === "ekl-15-2cyl";
            const ekl15Data = EKL15_CHAPTER_DATA[s.id];
            return (
              <article
                key={s.id}
                ref={(el) => (refs.current[i] = el)}
                data-index={i}
                className="flex flex-col justify-center"
                style={{
                  height: colHeight,
                  scrollSnapAlign: "start",
                }}
              >
                {isEscortsTemplateProduct && ekl15Data ? (
                  <ChapterInteractive
                    chapterId={s.id}
                    data={ekl15Data}
                    active={active === i}
                  />
                ) : (
                  <SectionContent section={s} active={active === i} index={i} sectionId={sectionId} />
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* ── Mobile stacked layout ──────────────────────────────────────── */}
      <div className="container-x lg:hidden">
        {product.sections.map((s, i) => (
          <article
            key={s.id}
            className="py-12 border-b border-border last:border-0"
          >
            <div className="mb-6 aspect-square overflow-hidden rounded-sm bg-muted">
              <SmoothImage src={s.image} alt={s.alt} loading="lazy" wrapperClassName="h-full w-full" imageClassName="h-full w-full object-cover" />
            </div>
            <SectionContent section={s} active index={i} sectionId={sectionId} />
          </article>
        ))}
      </div>

      {/* Vertical Dot Nav — controlled by active chapter */}
      <VerticalNav
        sections={navSections}
        activeIndex={active}
        onDotClick={jumpTo}
      />
    </section>
  );
});

ScrollStory.displayName = 'ScrollStory';

function getSectionBadges(id: string, index: number) {
  // Default overview badges
  if (index === 0) {
    return [
      { icon: "✓", text: "CPCB IV+ Compliant" },
      { icon: "⚡", text: "Silent Operation" },
      { icon: "🏭", text: "Industrial Grade" },
      { icon: "🔧", text: "Easy Maintenance" },
      { icon: "📋", text: "ISO 9001:2015" },
    ];
  }

  // Section-specific badges
  switch (id) {
    case "engine":
      return [
        { icon: "⚙️", text: "2-Cylinder" },
        { icon: "🐎", text: "1500 RPM" },
        { icon: "💧", text: "Water Cooled" },
        { icon: "⛽", text: "Fuel Efficient" },
      ];
    case "power":
      return [
        { icon: "⚡", text: "Stamford Alternator" },
        { icon: "🔋", text: "3-Phase / 415V" },
        { icon: "🎯", text: "Stable Frequency" },
        { icon: "🛡️", text: "H-Class Insulation" },
      ];
    case "sound":
      return [
        { icon: "🔇", text: "70 dB(A) @ 1m" },
        { icon: "🏠", text: "Residential Silent" },
        { icon: "🧱", text: "CRCA Steel Body" },
        { icon: "🌧️", text: "IP23 Protection" },
      ];
    case "control":
      return [
        { icon: "🖥️", text: "Digital Control" },
        { icon: "🛡️", text: "AMF Compatible" },
        { icon: "📊", text: "Event Logging" },
        { icon: "🔌", text: "Remote Start" },
      ];
    case "dimensions":
      return [
        { icon: "📏", text: "Compact Footprint" },
        { icon: "🏗️", text: "Easy Lifting Eye" },
        { icon: "🚚", text: "Logistics Ready" },
      ];
    case "fuel":
      return [
        { icon: "⛽", text: "HSD Fuel" },
        { icon: "🛢️", text: "15W40 CI4 Oil" },
        { icon: "🌡️", text: "75°C Thermostat" },
      ];
    case "alternator":
      return [
        { icon: "⚡", text: "Stamford S0L1" },
        { icon: "🔋", text: "H-Class Insulation" },
        { icon: "🎯", text: "AS540 AVR" },
      ];
    case "electrical":
      return [
        { icon: "📐", text: "SCR 0.515" },
        { icon: "🎛️", text: "±1% Regulation" },
        { icon: "🔌", text: "8 Reactance Values" },
      ];
    case "enclosure":
      return [
        { icon: "🔇", text: "70 dB(A) @ 1m" },
        { icon: "🌧️", text: "IP23 Protected" },
        { icon: "🌡️", text: "40°C Ambient" },
      ];
    case "protection":
      return [
        { icon: "🛡️", text: "CE Compliant" },
        { icon: "⚡", text: "ANSI 27/59/51" },
        { icon: "🔒", text: "5 Engine Shutdowns" },
      ];
    case "supply":
      return [
        { icon: "📦", text: "17 Std. Items" },
        { icon: "➕", text: "12 Optional Extras" },
        { icon: "📄", text: "Docs Included" },
      ];
    case "video":
      return [
        { icon: "🎬", text: "Factory Film" },
        { icon: "🔊", text: "Full Audio" },
        { icon: "📺", text: "1080p HD" },
      ];
    default:
      return [
        { icon: "✨", text: "Premium Quality" },
        { icon: "🛠️", text: "Expert Support" },
      ];
  }
}


function VideoContent({ active }: { active: boolean }) {
  const stats = [
    { icon: Clock, label: "Duration", value: "8 sec" },
    { icon: MonitorPlay, label: "Resolution", value: "1080p HD" },
    { icon: Clapperboard, label: "Views", value: "360°" },
  ];
  return (
    <div className={cn("mt-6 transition-all duration-700 ease-brand", active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
      <p className="text-[10px] uppercase tracking-[0.35em] text-accent font-bold mb-1">Official Film</p>
      <p className="font-display text-lg font-semibold mb-4">Escort DG Set — In Action</p>
      <div className="relative pl-5 border-l-2 border-accent mb-6">
        <p className="font-display text-[14px] font-medium text-foreground/80 leading-relaxed italic">
          Multiple angles of the Escort DG Set — showcasing the final product from every side, including a full 360° view of the complete unit.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-muted/40 py-4 px-2 text-center transition-all duration-300 hover:border-accent/30 hover:bg-muted/70"
          >
            <Icon size={18} className="text-accent" />
            <span className="text-[18px] font-bold tabular-nums leading-tight">{value}</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionContent({ section, active, index, sectionId }: { section: ShowcaseProduct["sections"][number]; active: boolean; index: number; sectionId: string }) {
  const { content, isEditMode } = useCMSState();
  const sectionKey = sectionId as "showcaseData";

  return (
    <div className={cn("transition-all duration-700 ease-brand", active ? "opacity-100 translate-y-0" : "opacity-40 translate-y-4")}>
      {section.videoUrl && <VideoContent active={active} />}
      {section.tagline && !section.videoUrl && (
        <div className="mt-6 flex flex-col gap-5">
          {/* Tagline premium style (Space Grotesk + Italic) */}
          <div className="relative pl-5 border-l-2 border-accent">
            <EditableText
              section={sectionKey}
              contentKey={`chapter_${index}_tagline`}
              className="font-display text-[15px] md:text-[17px] font-medium text-foreground/90 leading-relaxed italic block"
              as="p"
            />
          </div>

          {/* Context-aware Feature Badges (Single line, max 3) */}
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {getSectionBadges(section.id, index).slice(0, 3).map((badge) => (
              <span
                key={badge.text}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-[11px] font-medium text-foreground/70 tracking-wide transition-all duration-300 hover:bg-muted whitespace-nowrap"
              >
                <span className="text-accent text-xs">{badge.icon}</span>
                {badge.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {section.highlight && (
        <div className="mt-8 grid grid-cols-3 gap-6 border-y border-border py-6">
          {section.highlight.map((h, hIdx) => {
            const hValueRaw = content?.[sectionKey]?.[`chapter_${index}_h${hIdx}_value`];
            const hValue = Number(hValueRaw) || h.value;
            const hSuffix = content?.[sectionKey]?.[`chapter_${index}_h${hIdx}_suffix`] ?? h.suffix;
            return (
              <div key={h.label}>
                <div className="num-display text-2xl font-semibold md:text-3xl flex items-baseline">
                  {isEditMode ? (
                    <>
                      <EditableText 
                        section={sectionKey} 
                        contentKey={`chapter_${index}_h${hIdx}_value`} 
                        className="inline-block"
                        as="span"
                      />
                      <EditableText 
                        section={sectionKey} 
                        contentKey={`chapter_${index}_h${hIdx}_suffix`} 
                        className="inline-block whitespace-pre"
                        as="span"
                      />
                    </>
                  ) : (
                    <CountUp end={hValue} suffix={hSuffix} decimals={hValue % 1 === 0 ? 0 : 1} />
                  )}
                </div>
                <EditableText 
                  section={sectionKey} 
                  contentKey={`chapter_${index}_h${hIdx}_label`} 
                  className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground block" 
                  as="div" 
                />
              </div>
            );
          })}
        </div>
      )}

      <dl className="mt-8 divide-y divide-border border-y border-border">
        {section.specs.map((row, spIdx) => (
          <div
            key={row.label}
            className="grid grid-cols-2 gap-4 py-4 transition-all duration-500 ease-brand"
            style={{ transitionDelay: `${active ? spIdx * 60 : 0}ms`, opacity: active ? 1 : 0.5, transform: active ? "translateY(0)" : "translateY(6px)" }}
          >
            <dt className="text-sm text-muted-foreground">
              <EditableText section={sectionKey} contentKey={`chapter_${index}_spec${spIdx}_label`} as="span" />
            </dt>
            <dd className="text-right font-medium tabular-nums">
              <EditableText section={sectionKey} contentKey={`chapter_${index}_spec${spIdx}_value`} as="span" />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
