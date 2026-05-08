import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SmoothImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
  imageClassName?: string;
}

export function SmoothImage({ 
  className, 
  wrapperClassName, 
  imageClassName,
  alt, 
  ...props 
}: SmoothImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={cn("overflow-hidden relative bg-secondary/30", wrapperClassName, className)}>
      {/* Optional loading skeleton/pulse could go here */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]",
          isLoaded ? "hidden" : "block"
        )} 
      />
      
      <img
        {...props}
        alt={alt || "Image"}
        decoding={props.decoding || "async"}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-sm",
          imageClassName
        )}
      />
    </div>
  );
}
