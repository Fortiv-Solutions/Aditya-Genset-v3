import { useState, useRef } from "react";
import { useCMSState } from "./CMSEditorProvider";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import type { CMSSection } from "@/lib/sanity";

interface EditableImageProps {
  section: string;
  contentKey: string;
  defaultSrc: string;
  className?: string;
  alt?: string;
}

export function EditableImage({ section, contentKey, defaultSrc, className, alt }: EditableImageProps) {
  const { isEditMode, content, updateContentLive, commitHistory } = useCMSState();
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sectionContent = content[section as keyof typeof content] as Record<string, any>;
  const currentSrc = sectionContent?.[contentKey] || defaultSrc;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB for local storage preview.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      updateContentLive(section as CMSSection, contentKey, base64Str);
      commitHistory();
      toast.success("Image updated in CMS!");
    };
    reader.readAsDataURL(file);
  };

  if (!isEditMode) {
    return <img src={currentSrc} alt={alt} className={className} />;
  }

  return (
    <div 
      className="relative group cms-clickable cursor-pointer inline-block w-full h-full pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInputRef.current?.click();
      }}
    >
      <img 
        src={currentSrc} 
        alt={alt} 
        className={cn(className, "transition-opacity", isHovered ? "opacity-60" : "opacity-100", "pointer-events-none")} 
      />
      
      {/* Edit Overlay */}
      <div className={cn(
        "absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px] transition-opacity duration-200 rounded-lg",
        isHovered ? "opacity-100" : "opacity-0"
      )}>
        <div className="bg-accent text-accent-foreground p-3 rounded-full shadow-lg mb-2">
          <Upload size={20} />
        </div>
        <span className="text-white font-semibold text-xs drop-shadow-md bg-black/50 px-3 py-1 rounded-full">Change Image</span>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/png, image/jpeg, image/webp" 
        className="hidden" 
      />
    </div>
  );
}
