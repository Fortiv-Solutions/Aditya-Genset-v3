import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { ShowcaseSection } from "@/data/products";
import { Play, Volume2 } from "lucide-react";

interface Props {
  sections: ShowcaseSection[];
  active: number;
}

function VideoSlide({ section, isActive }: { section: ShowcaseSection; isActive: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset player when we navigate away
  useEffect(() => {
    if (!isActive) {
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);

  const handlePlay = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  return (
    <div className="relative h-full w-full bg-black">
      {section.videoUrl && (
        <video
          ref={videoRef}
          src={section.videoUrl}
          preload="metadata"
          playsInline
          className="h-full w-full object-cover"
          controls={isPlaying}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Play overlay — shown when not playing */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center transition-all duration-400",
          isPlaying ? "opacity-0 pointer-events-none" : "opacity-100 bg-black/40"
        )}
      >
        <button
          onClick={handlePlay}
          className="group flex flex-col items-center gap-3"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-accent/30 animate-ping scale-125" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-accent/90 shadow-[0_0_40px_rgba(242,169,0,0.4)] transition-all duration-300 group-hover:scale-110 group-hover:bg-accent">
              <Play size={32} className="ml-2 text-white fill-white" />
            </div>
          </div>
          <p className="text-white text-sm font-medium tracking-wide flex items-center gap-1.5">
            <Volume2 size={13} /> Watch with sound
          </p>
        </button>
      </div>
    </div>
  );
}

export function StickyImageStack({ sections, active }: Props) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-sm">
      {sections.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            "absolute inset-0 h-full w-full transition-all duration-700 ease-brand",
            i === active ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]",
          )}
        >
          {s.videoUrl ? (
            <VideoSlide section={s} isActive={i === active} />
          ) : (s.image || (s as any).imageUrl) ? (
            <img
              src={s.image || (s as any).imageUrl}
              alt={s.alt || (s as any).altText}
              loading={i === 0 ? "eager" : "lazy"}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-muted/20 border-2 border-dashed border-border rounded-lg">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">No Image Uploaded</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
