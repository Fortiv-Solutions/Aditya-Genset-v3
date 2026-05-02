import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import type { ShowcaseProduct } from "@/data/products";
import { StickyImageStack } from "./StickyImageStack";
import { ProgressRail } from "./ProgressRail";
import { Hotspots } from "./Hotspots";
import { CountUp } from "./CountUp";
import { cn } from "@/lib/utils";
import { Maximize2, Minimize2, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { GuidedPresentation } from "./GuidedPresentation";
import { SmoothImage } from "@/components/ui/SmoothImage";

interface Props { product: ShowcaseProduct; }

export const ScrollStory = forwardRef<{ enterPresentMode: () => void }, Props>(({ product }, ref) => {
  const [active, setActive] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useImperativeHandle(ref, () => ({
    enterPresentMode: () => setIsPresenting(true)
  }));

  useEffect(() => {
    if (isPresenting) {
      document.body.classList.add("present-mode");
    } else {
      document.body.classList.remove("present-mode");
    }
    return () => {
      document.body.classList.remove("present-mode");
    };
  }, [isPresenting]);

  useEffect(() => {
    if (isPresenting) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.index);
            setActive(i);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    refs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [isPresenting]);

  const jumpTo = (i: number) => {
    refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const nextSlide = () => setActive((prev) => (prev + 1) % product.sections.length);
  const prevSlide = () => setActive((prev) => (prev - 1 + product.sections.length) % product.sections.length);

  if (isPresenting) {
    return <GuidedPresentation onClose={() => setIsPresenting(false)} />;
  }

  return (
    <section className="relative">
      {/* Desktop split layout */}
      <div className="container-x hidden lg:grid lg:grid-cols-12 lg:gap-12">
        {/* Sticky left visual + right rail */}
        <aside className="col-span-6 self-start sticky top-24 h-[calc(100vh-7rem)] flex items-center">
          <div className="flex w-full items-center gap-8">
            <div className="flex-1">
              {active === 0 ? (
                <div className="relative aspect-square w-full overflow-visible">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <SmoothImage 
                      src={product.sections[0].image} 
                      alt={product.sections[0].alt}
                      wrapperClassName="w-full h-full absolute inset-0 bg-transparent" 
                      imageClassName="w-[120%] h-[120%] object-contain transition-all duration-700" 
                    />
                  </div>
                </div>
              ) : (
                <StickyImageStack sections={product.sections} active={active} />
              )}
            </div>
            <ProgressRail
              count={product.sections.length}
              active={active}
              labels={product.sections.map((s) => s.number)}
              images={product.sections.map((s) => s.image)}
              onJump={jumpTo}
            />
          </div>
        </aside>

        {/* Right sections */}
        <div className="col-span-6">
          {product.sections.map((s, i) => (
            <article
              key={s.id}
              ref={(el) => (refs.current[i] = el)}
              data-index={i}
              className="flex min-h-screen flex-col justify-center py-16"
            >
              <SectionContent section={s} active={active === i} />
            </article>
          ))}
        </div>
      </div>

      {/* Mobile stacked layout */}
      <div className="container-x lg:hidden">
        {product.sections.map((s, i) => (
          <article
            key={s.id}
            className="py-12 border-b border-border last:border-0"
          >
            <div className="mb-6 aspect-square overflow-hidden rounded-sm bg-muted">
              <SmoothImage src={s.image} alt={s.alt} loading="lazy" wrapperClassName="h-full w-full" imageClassName="h-full w-full object-cover" />
            </div>
            <SectionContent section={s} active />
          </article>
        ))}
      </div>
    </section>
  );
});

ScrollStory.displayName = 'ScrollStory';

function SectionContent({ section, active }: { section: ShowcaseProduct["sections"][number]; active: boolean }) {
  return (
    <div className={cn("transition-all duration-700 ease-brand", active ? "opacity-100 translate-y-0" : "opacity-40 translate-y-4")}>
      <div className="font-display text-xs uppercase tracking-[0.3em] text-accent">{section.number} / {section.id}</div>
      <h2 className="mt-3 font-display text-4xl font-semibold leading-[1.05] md:text-5xl text-balance">
        {section.title}
      </h2>
      {section.tagline && (
        <p className="mt-4 max-w-md text-base text-muted-foreground">{section.tagline}</p>
      )}

      {section.highlight && (
        <div className="mt-8 grid grid-cols-3 gap-6 border-y border-border py-6">
          {section.highlight.map((h) => (
            <div key={h.label}>
              <div className="num-display text-2xl font-semibold md:text-3xl">
                <CountUp end={h.value} suffix={h.suffix} decimals={h.value % 1 === 0 ? 0 : 1} />
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">{h.label}</div>
            </div>
          ))}
        </div>
      )}

      <dl className="mt-8 divide-y divide-border border-y border-border">
        {section.specs.map((row, i) => (
          <div
            key={row.label}
            className="grid grid-cols-2 gap-4 py-4 transition-all duration-500 ease-brand"
            style={{ transitionDelay: `${active ? i * 60 : 0}ms`, opacity: active ? 1 : 0.5, transform: active ? "translateY(0)" : "translateY(6px)" }}
          >
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="text-right font-medium tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
