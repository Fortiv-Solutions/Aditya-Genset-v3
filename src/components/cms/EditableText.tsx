import React, { useEffect, useRef } from "react";
import { useCMSState } from "@/components/cms/CMSEditorProvider";
import type { CMSSection } from "@/lib/sanity";

interface EditableTextProps {
  contentKey: string;
  section: CMSSection;
  className?: string;
  as?: React.ElementType;
  fallback?: string;
}

export function EditableText({ contentKey, section, className = "", as: Component = "span", fallback }: EditableTextProps) {
  const context = useCMSState();
  const { content, isEditMode, updateContent } = context;

  // Always derive the raw string value from the single source of truth
  const rawValue = content[section]?.[contentKey as keyof typeof content[typeof section]] as string | undefined;
  const value = rawValue !== undefined ? rawValue : (fallback || "");
  const ref = useRef<HTMLElement>(null);

  // The Empty-DOM Effect Pattern:
  // We never pass React children or dangerouslySetInnerHTML to the contentEditable element.
  // Instead, we manually synchronize the DOM text via this useEffect.
  // Because the JSX element has no children, React's Virtual DOM will never attempt 
  // to overwrite our typing, completely eliminating cursor jump bugs.
  useEffect(() => {
    // Only update the actual DOM text if the user isn't actively focused on it
    if (ref.current && document.activeElement !== ref.current) {
      if (ref.current.textContent !== value) {
        ref.current.textContent = value;
      }
    }
  });

  if (!isEditMode) {
    return <Component className={className}>{value}</Component>;
  }

  return (
    <Component
      ref={ref}
      className={`${className} outline-none transition-all cursor-text rounded-sm ring-2 ring-transparent hover:ring-accent/50 focus:ring-accent ${
        className.includes('block') || className.includes('flex') || className.includes('mx-auto') 
          ? '' 
          : 'inline-block px-1 -ml-1 min-w-[20px]'
      }`}
      contentEditable={true}
      suppressContentEditableWarning={true}
      onInput={(e: React.FormEvent<HTMLElement>) => {
        updateContent(section, contentKey, e.currentTarget.textContent || "");
      }}
      onBlur={() => {
        if ('commitHistory' in context) {
          (context as any).commitHistory();
        }
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    />
  );
}
