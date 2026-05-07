import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Layout, Monitor, ShoppingBag, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const pages = [
  {
    id: "showcase",
    title: "Welcome Page",
    description: "Edit the welcome text, company name, tagline, certification, and hero sections.",
    icon: <Layout className="w-8 h-8 text-accent" />,
    color: "from-amber-500/10 to-amber-600/5",
  },
  {
    id: "products",
    title: "Products Catalog",
    description: "Edit the product category grid, listing copy, and section headers.",
    icon: <ShoppingBag className="w-8 h-8 text-accent" />,
    color: "from-green-500/10 to-green-600/5",
  },
  {
    id: "dgSetsCategory",
    title: "DG Sets Category",
    description: "Edit the DG sets listing page headers, SEO, and empty-state copy.",
    icon: <Building2 className="w-8 h-8 text-accent" />,
    color: "from-indigo-500/10 to-indigo-600/5",
  },
  {
    id: "showcaseData",
    title: "Product Showcase",
    description: "Edit a product's scroll story, showcase text, and feature sections.",
    icon: <Monitor className="w-8 h-8 text-accent" />,
    color: "from-purple-500/10 to-purple-600/5",
  },
];

export default function AdminCMS() {
  const navigate = useNavigate();
  const [showProductSelect, setShowProductSelect] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Array<{ id: string; name: string; slug: string; kva: number | null }>>([]);

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, kva")
        .order("kva", { ascending: true });

      if (error) {
        console.error(error);
        return;
      }

      setProducts(data || []);
    }

    void loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return `${product.name} ${product.slug} ${product.kva ?? ""}`.toLowerCase().includes(query);
  });

  const handlePageClick = (pageId: string) => {
    if (pageId === "showcaseData") {
      setShowProductSelect(true);
      return;
    }

    navigate(`/admin/cms/edit/${pageId}`);
  };

  return (
    <div className="admin-page admin-page-narrow space-y-8 animate-fade-in">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Content Studio</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground font-display">Visual CMS</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a page to edit content in place. Product showcase editing now uses real products from Supabase.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <div
            key={page.id}
            onClick={() => handlePageClick(page.id)}
            className="admin-card bg-card border border-border hover:border-accent/50 p-6 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${page.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative">
              <div className="mb-4 p-3 bg-secondary rounded-lg inline-block group-hover:scale-110 transition-transform">
                {page.icon}
              </div>
              <h3 className="font-display font-bold text-foreground text-lg mb-2">{page.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{page.description}</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-accent group-hover:gap-3 transition-all">
                <span>Edit Page</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-secondary/50 rounded-lg border border-border text-xs text-muted-foreground">
        <strong className="text-foreground">Tip:</strong> Product showcase edits are now scoped to the selected product.
      </div>

      {showProductSelect && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-card w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-border animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <h2 className="font-display font-semibold text-lg">Select Product to Edit Showcase</h2>
              <button onClick={() => setShowProductSelect(false)} className="p-1 hover:bg-secondary rounded-md transition-colors">
                <X size={20} className="text-muted-foreground" />
              </button>
            </div>

            <div className="p-4 border-b border-border">
              <input
                type="text"
                placeholder="Search models or kVA..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredProducts.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No products match this search.
                </div>
              ) : filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    setShowProductSelect(false);
                    navigate(`/admin/cms/edit/showcaseData?productId=${product.id}&slug=${product.slug}`);
                  }}
                  className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-all text-left group"
                >
                  <div>
                    <div className="font-semibold text-foreground group-hover:text-accent transition-colors">{product.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{product.kva ?? "-"} kVA</div>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground group-hover:text-accent transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
