import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompare } from "@/context/CompareContext";
import { fetchPublishedProducts } from "@/lib/api/products";
import { SEO } from "@/components/site/SEO";
import { ArrowLeft, X, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import gensetFallback from "@/assets/products/showcase/main-view.png";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CompareProducts() {
  const { selectedIds, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      if (selectedIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const all = await fetchPublishedProducts();
      const filtered = all.filter((p: any) => selectedIds.includes(p.id));
      setProducts(filtered);
      setLoading(false);
    }
    loadProducts();
  }, [selectedIds]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">No products selected for comparison</h1>
        <p className="text-muted-foreground mb-8">Add products from the catalog to see them here.</p>
        <Button onClick={() => navigate("/products/dg-sets")}>
          Go to Products
        </Button>
      </div>
    );
  }

  // Extract all unique spec labels across all selected products
  const allSpecs = Array.from(
    new Set(
      products.flatMap((p) => p.product_specs?.map((s: any) => s.label) || [])
    )
  ).sort();

  return (
    <>
      <SEO title="Compare Products — Aditya Genset" />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-x max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-2"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <h1 className="text-3xl font-bold font-display">Compare Products</h1>
            </div>
            <Button variant="outline" onClick={clearCompare} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              Clear Comparison
            </Button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-64 min-w-[200px] bg-gray-50/50">Specifications</TableHead>
                    {products.map((product) => (
                      <TableHead key={product.id} className="min-w-[250px] p-6 text-center align-top relative">
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <X size={18} />
                        </button>
                        <div className="flex flex-col items-center">
                          <div className="h-32 w-32 bg-gray-50 rounded-xl mb-4 p-2">
                            <img
                              src={product.product_media?.find((m: any) => m.kind === 'primary')?.url || gensetFallback}
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <h3 className="font-bold text-lg leading-tight mb-2">{product.name}</h3>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-bold rounded uppercase tracking-wider">
                              {product.kva} kVA
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase tracking-wider">
                              {product.engine_brand}
                            </span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => navigate(`/products/${product.slug}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Static Core Specs first */}
                  <TableRow>
                    <TableCell className="font-bold bg-gray-50/30">Engine Brand</TableCell>
                    {products.map((p) => (
                      <TableCell key={p.id} className="text-center font-medium">
                        {p.engine_brand}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-bold bg-gray-50/30">kVA Rating</TableCell>
                    {products.map((p) => (
                      <TableCell key={p.id} className="text-center font-medium">
                        {p.kva} kVA
                      </TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Dynamic Specs */}
                  {allSpecs.map((label) => (
                    <TableRow key={label}>
                      <TableCell className="font-medium bg-gray-50/30">{label}</TableCell>
                      {products.map((p) => {
                        const spec = p.product_specs?.find((s: any) => s.label === label);
                        return (
                          <TableCell key={p.id} className="text-center">
                            {spec ? (
                              spec.value
                            ) : (
                              <Minus className="mx-auto text-gray-300" size={16} />
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="p-6 bg-white rounded-2xl border border-border shadow-sm">
                <h4 className="font-bold mb-2">Need Expert Advice?</h4>
                <p className="text-sm text-muted-foreground mb-4">Our engineers can help you choose the right genset for your specific load requirements.</p>
                <Button variant="link" className="p-0 text-accent font-bold" onClick={() => navigate('/')}>
                  Contact Sales Support
                </Button>
             </div>
             <div className="p-6 bg-white rounded-2xl border border-border shadow-sm">
                <h4 className="font-bold mb-2">Download Brochures</h4>
                <p className="text-sm text-muted-foreground mb-4">Get detailed technical data sheets and installation guides for these models.</p>
                <Button variant="link" className="p-0 text-accent font-bold">
                  Download All Selected
                </Button>
             </div>
             <div className="p-6 bg-white rounded-2xl border border-border shadow-sm">
                <h4 className="font-bold mb-2">Custom Requirements?</h4>
                <p className="text-sm text-muted-foreground mb-4">We specialize in custom soundproofing and non-standard containerized solutions.</p>
                <Button variant="link" className="p-0 text-accent font-bold" onClick={() => navigate('/products/non-standard')}>
                  Explore Custom Solutions
                </Button>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
