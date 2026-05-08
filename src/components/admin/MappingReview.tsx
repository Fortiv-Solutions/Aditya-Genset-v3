import { ChevronRight, FileText, Info, Zap, Settings, ShieldCheck, Box, Maximize, Truck } from "lucide-react";
import type { EnhancedProductExtraction, ChapterData } from "@/lib/enhancedPdfExtractor";

interface MappingReviewProps {
  data: EnhancedProductExtraction;
}

export function MappingReview({ data }: MappingReviewProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case "overview": return <Info size={14} />;
      case "engine": return <Settings size={14} />;
      case "fuel": return <Zap size={14} />;
      case "alternator": return <Zap size={14} />;
      case "electrical": return <Zap size={14} />;
      case "enclosure": return <Box size={14} />;
      case "control": return <Settings size={14} />;
      case "protection": return <ShieldCheck size={14} />;
      case "supply": return <Truck size={14} />;
      case "dimensions": return <Maximize size={14} />;
      default: return <FileText size={14} />;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <FileText size={16} className="text-accent" />
          Structured Mapping Review
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${
            data.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-400' : 
            data.confidence === 'medium' ? 'bg-amber-500/10 text-amber-400' : 
            'bg-red-500/10 text-red-400'
          }`}>
            {data.confidence} Confidence
          </span>
        </h4>
        <p className="text-[11px] text-muted-foreground italic">10 chapters mapped from PDF</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.chapters.map((chapter) => (
          <div 
            key={chapter.id} 
            className="group relative bg-secondary/30 hover:bg-secondary/50 border border-border/50 hover:border-accent/30 rounded-xl p-4 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  {getIcon(chapter.id)}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest leading-none">
                    Chapter {chapter.number}
                  </p>
                  <h5 className="text-sm font-bold text-foreground mt-1">{chapter.title}</h5>
                </div>
              </div>
              <ChevronRight size={14} className="text-muted-foreground/30 group-hover:text-accent transition-colors" />
            </div>

            <div className="space-y-2">
              {chapter.specs?.slice(0, 3).map((spec, i) => (
                <div key={i} className="flex justify-between items-center text-[11px]">
                  <span className="text-muted-foreground">{spec.label}</span>
                  <span className="text-foreground font-medium truncate ml-4 max-w-[150px]">{spec.value}</span>
                </div>
              ))}
              {chapter.features && chapter.features.length > 0 && (
                <div className="pt-1 mt-1 border-t border-border/30">
                  <p className="text-[10px] text-muted-foreground truncate italic">
                    + {chapter.features.length} features mapped
                  </p>
                </div>
              )}
              {chapter.specs && chapter.specs.length > 3 && (
                <p className="text-[10px] text-accent font-medium pt-1">
                  + {chapter.specs.length - 3} more specifications
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.missingFields.length > 0 && (
        <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
          <p className="text-[11px] font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
            <Info size={12} /> Missing or Incomplete Fields
          </p>
          <div className="flex flex-wrap gap-2">
            {data.missingFields.map((field, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-500/70 rounded-md border border-amber-500/10">
                {field}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
