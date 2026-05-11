import { useState, useEffect, useRef } from "react";
import { Film, Link2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import type { ChapterDataInput, SectionInput, PublishMediaInput } from "@/lib/api/productPublisher";
import { SlideField, SlideImagePicker } from "../SlideEditorPrimitives";

interface Props {
  chapterKey: string;
  data: ChapterDataInput;
  section?: SectionInput;
  media: PublishMediaInput;
  productName: string;
  onChange: (d: ChapterDataInput) => void;
  onSectionChange: (s: Partial<SectionInput>) => void;
  onMediaChange: (m: Partial<PublishMediaInput>) => void;
}

const MAX_VIDEO_MB = 50;
const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024;

export function Slide11Video({ media, section, onSectionChange, onMediaChange }: Props) {
  const [videoMode, setVideoMode] = useState<"upload" | "url">(media.videoFile ? "upload" : "url");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!media.videoFile) { setLocalPreview(null); return; }
    const url = URL.createObjectURL(media.videoFile);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [media.videoFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) { toast.error("Please select a video file."); return; }
    if (file.size > MAX_VIDEO_BYTES) { toast.error(`Video must be under ${MAX_VIDEO_MB} MB.`); return; }
    onMediaChange({ videoFile: file, videoUrl: "" });
  };

  const clearVideo = () => {
    onMediaChange({ videoFile: null, videoUrl: "", videoThumbUrl: "" });
    if (fileRef.current) fileRef.current.value = "";
  };

  const previewSrc = localPreview || media.videoUrl;

  return (
    <div className="space-y-5">
      <div className="pb-4 border-b border-border">
        <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Slide 11</p>
        <h3 className="text-lg font-bold text-foreground">Video & Final Slide</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          This is the closing slide of both the showcase and presentation mode.
        </p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setVideoMode("url")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${
            videoMode === "url" ? "bg-accent text-accent-foreground border-accent" : "bg-card border-border text-muted-foreground hover:border-accent/40"
          }`}
        >
          <Link2 size={13} /> URL / YouTube / Vimeo
        </button>
        <button
          type="button"
          onClick={() => setVideoMode("upload")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${
            videoMode === "upload" ? "bg-accent text-accent-foreground border-accent" : "bg-card border-border text-muted-foreground hover:border-accent/40"
          }`}
        >
          <Upload size={13} /> Upload File (max {MAX_VIDEO_MB} MB)
        </button>
      </div>

      {videoMode === "url" && (
        <SlideField
          label="Video URL (YouTube / Vimeo / Direct MP4)"
          value={media.videoUrl}
          onChange={(v) => onMediaChange({ videoUrl: v, videoFile: null })}
          placeholder="https://youtube.com/watch?v=..."
        />
      )}

      {videoMode === "upload" && (
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Upload Video File
          </label>
          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-accent/40 transition-colors">
            <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
            <Film size={24} className="text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Drop video here or <span className="text-accent">browse</span></p>
              <p className="text-xs text-muted-foreground mt-1">MP4, WebM, MOV — max {MAX_VIDEO_MB} MB</p>
            </div>
          </label>
        </div>
      )}

      {/* Preview */}
      {previewSrc && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Preview</label>
            <button type="button" onClick={clearVideo} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500">
              <X size={12} /> Remove
            </button>
          </div>
          {previewSrc.includes("youtube.com") || previewSrc.includes("youtu.be") || previewSrc.includes("vimeo.com") ? (
            <div className="aspect-video rounded-xl overflow-hidden bg-black/20 flex items-center justify-center border border-border">
              <p className="text-muted-foreground text-sm">🎬 Video URL set: <span className="text-accent">{previewSrc.slice(0, 50)}...</span></p>
            </div>
          ) : (
            <video src={previewSrc} controls className="w-full rounded-xl border border-border aspect-video object-cover" />
          )}
        </div>
      )}

      {/* Video thumbnail */}
      <SlideImagePicker
        label="Video Thumbnail Image"
        value={media.videoThumbUrl}
        onChange={(url) => onMediaChange({ videoThumbUrl: url })}
        hint="Shown before video plays. Use a high-quality product photo."
      />

      {/* Section image (background for video slide) */}
      <SlideImagePicker
        label="Video Slide Background Image"
        value={section?.imageUrl || ""}
        onChange={(url) => onSectionChange({ imageUrl: url })}
        hint="Background image shown behind the video player in showcase"
      />
    </div>
  );
}
