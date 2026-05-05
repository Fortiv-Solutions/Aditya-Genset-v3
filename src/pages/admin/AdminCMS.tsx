import { useNavigate } from "react-router-dom";
import { Monitor, Layout, ShoppingBag, Building2, Target, Shield, Cog, Phone, ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { SHOWCASE, EKL15_SHOWCASE } from "@/data/products";

const pages = [

  {
    id: "showcase",
    title: "Welcome Page",
    description: "Edit the welcome text, company name, tagline, certification, and all welcome page sections.",
    icon: <Layout className="w-8 h-8 text-accent" />,
    color: "from-amber-500/10 to-amber-600/5",
  },
  {
    id: "products",
    title: "Products Catalog",
    description: "Edit the product category grid: titles, descriptions, and section header.",
    icon: <ShoppingBag className="w-8 h-8 text-accent" />,
    color: "from-green-500/10 to-green-600/5",
  },
  {
    id: "dgSetsCategory",
    title: "DG Sets Category",
    description: "Edit the DG sets listing page headers, SEO, and no-results copy.",
    icon: <Building2 className="w-8 h-8 text-accent" />,
    color: "from-indigo-500/10 to-indigo-600/5",
  },
  {
    id: "showcaseData",
    title: "Product Showcase",
    description: "Edit the 6-chapter scroll story: titles, taglines, highlights, and specifications.",
    icon: <Monitor className="w-8 h-8 text-accent" />,
    color: "from-purple-500/10 to-purple-600/5",
  },
];

export default function AdminCMS() {
  const navigate = useNavigate();
  const [showProductSelect, setShowProductSelect] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handlePageClick = (pageId: string) => {
    if (pageId === "showcaseData") {
      setShowProductSelect(true);
    } else {
      navigate(`/admin/cms/edit/${pageId}`);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Visual CMS</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a page to edit all its content in-place. Every text field on the page will become clickable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <div
            key={page.id}
            onClick={() => handlePageClick(page.id)}
            className="bg-card border border-border hover:border-accent/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${page.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors" />
            
            <div className="relative">
              <div className="mb-4 p-3 bg-secondary rounded-lg inline-block group-hover:scale-110 transition-transform">
                {page.icon}
              </div>
              
              <h3 className="font-display font-bold text-foreground text-lg mb-2">{page.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {page.description}
              </p>

              <div className="flex items-center gap-2 text-sm font-semibold text-accent group-hover:gap-3 transition-all">
                <span>Edit Page</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-secondary/50 rounded-lg border border-border text-xs text-muted-foreground">
        <strong className="text-foreground">Tip:</strong> Click any text on the page to edit it directly. Changes are saved in draft until you click <strong className="text-accent">Apply Changes</strong>.
      </div>

      {showProductSelect && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-card w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-border animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <h2 className="font-display font-semibold text-lg">Select Product to Edit Showcase</h2>
              <button 
                onClick={() => setShowProductSelect(false)}
                className="p-1 hover:bg-secondary rounded-md transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-4 border-b border-border">
              <input 
                type="text" 
                placeholder="Search models or kVA..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <button
                onClick={() => {
                  setShowProductSelect(false);
                  navigate(`/admin/cms/edit/showcaseData`);
                }}
                className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-all text-left group"
              >
                <div>
                  <div className="font-semibold text-foreground group-hover:text-accent transition-colors">{SHOWCASE.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {SHOWCASE.kva} kVA · Prime
                  </div>
                </div>
                <ArrowRight size={16} className="text-muted-foreground group-hover:text-accent transition-transform group-hover:translate-x-1" />
              </button>
              
              <button
                onClick={() => {
                  setShowProductSelect(false);
                  navigate(`/admin/cms/edit/ekl15ShowcaseData`);
                }}
                className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-all text-left group"
              >
                <div>
                  <div className="font-semibold text-foreground group-hover:text-accent transition-colors">{EKL15_SHOWCASE.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {EKL15_SHOWCASE.kva} kVA · Prime
                  </div>
                </div>
                <ArrowRight size={16} className="text-muted-foreground group-hover:text-accent transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
