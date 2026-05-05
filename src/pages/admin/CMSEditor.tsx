import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCMSState } from "@/components/cms/CMSEditorProvider";
import { Undo2, Redo2, Check, X, Save, RefreshCw, ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";



import Home from "@/pages/Home";
import Products from "@/pages/Products";
import DGSetsCategory from "@/pages/DGSetsCategory";
import ProductDetail from "@/pages/ProductDetail";

export default function CMSEditor() {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { 
    setIsEditMode, 
    undo, redo, canUndo, canRedo, 
    discard, saveAll
  } = useCMSState();
  const [saving, setSaving] = useState(false);
  const appliedRef = useRef(false);

  useEffect(() => {
    setIsEditMode(true);
    return () => {
      setIsEditMode(false);
    };
  }, [setIsEditMode]);

  const handleApply = async () => {
    setSaving(true);
    try {
      await saveAll();
      appliedRef.current = true;
      toast.success("All changes applied successfully!");
      window.dispatchEvent(new Event("cms_updated"));
      navigate("/admin/cms");
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (window.confirm("Are you sure you want to discard all changes? This cannot be undone.")) {
      discard();
      toast.info("Changes discarded");
      navigate("/admin/cms");
    }
  };

  const getPagePath = () => {
    if (pageId === "products") return "/products";
    if (pageId === "dgSetsCategory") return "/products/dg-sets";
    if (pageId?.startsWith("showcaseData")) return "/products/silent-62-5";
    if (pageId === "ekl15ShowcaseData") return "/products/ekl-15-2cyl";
    return "/";
  };

  // Render the appropriate page component
  let ContentComponent = Home;
  if (pageId === "products") ContentComponent = Products;
  if (pageId === "dgSetsCategory") ContentComponent = DGSetsCategory;
  if (pageId?.startsWith("showcaseData") || pageId === "ekl15ShowcaseData") ContentComponent = ProductDetail;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Editor Top Bar */}
      <div className="h-14 bg-card border-b border-border shadow-sm flex items-center justify-between px-4 z-[101]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/admin/cms")}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors pr-2 border-r border-border"
          >
            <ArrowLeft size={14} /> Back
          </button>
          
          <div className="font-display font-bold text-foreground text-sm uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Live Editor: {pageId}
          </div>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1">
            <button 
              onClick={undo}
              disabled={!canUndo}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Undo"
            >
              <Undo2 size={16} />
            </button>
            <button 
              onClick={redo}
              disabled={!canRedo}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Redo"
            >
              <Redo2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground mr-2 hidden md:block">Click text to edit</span>
          
          <a 
            href={getPagePath()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors mr-2 border-r border-border pr-4"
          >
            <ExternalLink size={14} /> View Live
          </a>

          <button
            onClick={handleDiscard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
          >
            <X size={14} /> Discard
          </button>
          <button
            onClick={handleApply}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-bold rounded shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? "Saving..." : "Apply Changes"}
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div id="cms-scroll-container" className="flex-1 overflow-auto relative">
        {/* We wrap the content in pointer-events-none for things we don't want them clicking, 
            but EditableText will re-enable pointer-events. We exclude .cms-clickable buttons. */}
        <div className="w-full h-full [&_a:not(.cms-clickable)]:pointer-events-none [&_button:not(.cms-clickable)]:pointer-events-none">
          <ContentComponent />
        </div>
      </div>
    </div>
  );
}
