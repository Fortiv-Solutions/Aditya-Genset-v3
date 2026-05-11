import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

interface Props {
  count: number;
  active: number;
  labels?: string[];
  images?: string[];
  videoUrls?: (string | undefined)[];
  onJump?: (i: number) => void;
}

export function ProgressRail({ count, active, labels, images, videoUrls, onJump }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className={cn("hidden lg:flex flex-col gap-3", mounted ? "opacity-100" : "opacity-0", "transition-opacity duration-500")}>
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === active;
        return (
          <button
            key={i}
            onClick={() => onJump?.(i)}
            aria-label={labels?.[i] ?? `Section ${i + 1}`}
            className="group flex items-center gap-3"
          >
            {images?.[i] && images[i] !== "" ? (
              <div
                className={cn(
                  "h-8 w-12 rounded-md overflow-hidden border-2 transition-all duration-500 ease-brand relative",
                  isActive ? "border-accent scale-110 shadow-lg" : "border-foreground/20 group-hover:border-accent/60 group-hover:scale-105 opacity-60 group-hover:opacity-100",
                )}
              >
                <img
                  src={images[i]}
                  alt={labels?.[i] ?? `Section ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className={cn(
                    "h-full w-full object-cover transition-all duration-500",
                    isActive ? "grayscale-0" : "grayscale group-hover:grayscale-0"
                  )}
                />
                {videoUrls?.[i] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play size={14} className="text-white fill-white" />
                  </div>
                )}
              </div>
            ) : (
              <span
                className={cn(
                  "h-2 w-2 rounded-full border transition-all duration-500 ease-brand",
                  isActive ? "bg-accent border-accent scale-125" : "bg-transparent border-foreground/40 group-hover:border-foreground",
                )}
              />
            )}
            <span
              className={cn(
                "font-display text-xs uppercase tracking-widest transition-all duration-500 ease-brand",
                isActive ? "text-foreground font-bold" : "text-muted-foreground opacity-60 group-hover:opacity-100",
              )}
            >
              {labels?.[i] ?? String(i + 1).padStart(2, "0")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
