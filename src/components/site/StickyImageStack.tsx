import { cn } from "@/lib/utils";
import type { ShowcaseSection } from "@/data/products";
import { Play } from "lucide-react";

interface Props {
  sections: ShowcaseSection[];
  active: number;
}

export function StickyImageStack({ sections, active }: Props) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-sm">
      {sections.map((s, i) => {
        const isVideo = i === 5; // 6th position (index 5)
        return (
          <div
            key={s.id}
            className={cn(
              "absolute inset-0 h-full w-full transition-all duration-700 ease-brand",
              i === active ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]",
            )}
          >
            <img
              src={s.image}
              alt={s.alt}
              loading={i === 0 ? "eager" : "lazy"}
              className="h-full w-full object-contain"
            />
            {isVideo && i === active && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/40 backdrop-blur-sm rounded-full p-8 transition-all duration-300 hover:bg-black/60 hover:scale-110 cursor-pointer">
                  <Play size={64} className="text-white fill-white" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
