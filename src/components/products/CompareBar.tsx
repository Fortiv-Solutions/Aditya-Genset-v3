import { useCompare } from "@/context/CompareContext";
import { useNavigate } from "react-router-dom";
import { X, ArrowRight, BarChart2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { fetchPublishedProducts } from "@/lib/api/products";
import gensetFallback from "@/assets/products/showcase/main-view.png";

export function CompareBar() {
  const { selectedIds, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function loadProducts() {
      if (selectedIds.length === 0) {
        setProducts([]);
        return;
      }
      const all = await fetchPublishedProducts();
      const filtered = all.filter((p: any) => selectedIds.includes(p.id));
      setProducts(filtered);
    }
    loadProducts();
  }, [selectedIds]);

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white/95 backdrop-blur-md border border-accent/20 shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3 overflow-hidden">
              {products.map((p) => {
                const img = p.product_media?.find((m: any) => m.kind === 'primary')?.url || gensetFallback;
                return (
                  <div key={p.id} className="relative group">
                    <img
                      src={img}
                      alt={p.name}
                      className="w-12 h-12 rounded-lg border-2 border-white object-cover bg-gray-50 shadow-sm"
                    />
                    <button
                      onClick={() => removeFromCompare(p.id)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X size={10} />
                    </button>
                  </div>
                );
              })}
              {Array.from({ length: Math.max(0, 4 - selectedIds.length) }).map((_, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 flex items-center justify-center text-gray-300"
                >
                  <BarChart2 size={16} />
                </div>
              ))}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-foreground">
                Comparing {selectedIds.length} {selectedIds.length === 1 ? 'Product' : 'Products'}
              </p>
              <button
                onClick={clearCompare}
                className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearCompare}
              className="sm:hidden"
            >
              Clear
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/quote-builder")}
              disabled={selectedIds.length === 0}
              className="hidden md:flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Quote
            </Button>
            <Button
              onClick={() => navigate("/compare")}
              disabled={selectedIds.length < 2}
              className="bg-accent text-foreground hover:bg-accent/90 font-bold px-6"
            >
              Compare Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
