import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface NavSection {
  id: string;
  label: string;
}

interface VerticalNavProps {
  /** Sections to track. Each id must match a DOM element's id. */
  sections: NavSection[];
  /**
   * When provided, the nav becomes controlled — it uses this index
   * instead of its own IntersectionObserver. Pass the `active` state
   * from ScrollStory so they stay in sync.
   */
  activeIndex?: number;
  /** Called when a dot is clicked. Receives the dot index. */
  onDotClick?: (index: number) => void;
}

export function VerticalNav({ sections, activeIndex, onDotClick }: VerticalNavProps) {
  const [internalActive, setInternalActive] = useState(sections[0]?.id ?? "");

  // Only observe if not controlled externally
  useEffect(() => {
    if (activeIndex !== undefined) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInternalActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections, activeIndex]);

  const handleClick = (index: number, id: string) => {
    if (onDotClick) {
      onDotClick(index);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed right-2 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-1 items-center">
      {sections.map(({ id, label }, index) => {
        const isActive =
          activeIndex !== undefined
            ? activeIndex === index
            : internalActive === id;

        return (
          <button
            key={id}
            onClick={() => handleClick(index, id)}
            className="group relative flex items-center justify-center h-5 w-5"
            aria-label={`Go to ${label}`}
          >
            {/* Tooltip */}
            <span className="absolute right-6 rounded bg-brand-navy px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-white opacity-0 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 whitespace-nowrap shadow-md">
              {label}
            </span>

            {/* Dot */}
            <div className="flex h-full w-full items-center justify-center">
              <span
                className={cn(
                  "block rounded-full transition-all duration-300 ease-out",
                  isActive
                    ? "h-4 w-1.5 bg-accent shadow-[0_0_8px_rgba(242,169,0,0.8)]"
                    : "h-1.5 w-1.5 bg-muted-foreground/30 group-hover:bg-muted-foreground/80 group-hover:scale-125"
                )}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Home page sections (pre-defined) ────────────────────────────────────────
export const HOME_SECTIONS: NavSection[] = [
  { id: "hero",         label: "Home" },
  { id: "overview",     label: "Overview" },
  { id: "mission",      label: "Mission & Vision" },
  { id: "oem",          label: "OEM Partners" },
  { id: "dealer",       label: "Dealer Network" },
  { id: "trust",        label: "Trust Gainers" },
  { id: "manufacturing",label: "Manufacturing" },
  { id: "customers",    label: "Happy Customers" },
  { id: "contact",      label: "Contact Us" },
];
