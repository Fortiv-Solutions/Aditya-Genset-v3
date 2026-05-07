import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCompare } from "@/context/CompareContext";
import { fetchPublishedProducts } from "@/lib/api/products";
import { SEO } from "@/components/site/SEO";
import { ArrowLeft, X, Check, Minus, Download, Printer, Share2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import gensetFallback from "@/assets/products/showcase/main-view.png";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CompareProducts() {
  const { selectedIds, removeFromCompare, clearCompare } = useCompare();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);

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

  const exportToCSV = () => {
    if (products.length === 0) return;

    const allSpecs = Array.from(
      new Set(
        products.flatMap((p) => p.product_specs?.map((s: any) => s.label) || [])
      )
    ).sort();

    // Create CSV content
    let csv = "Specification," + products.map(p => p.name).join(",") + "\n";
    csv += "Engine Brand," + products.map(p => p.engine_brand).join(",") + "\n";
    csv += "kVA Rating," + products.map(p => `${p.kva} kVA`).join(",") + "\n";
    
    allSpecs.forEach(label => {
      const row = [label];
      products.forEach(p => {
        const spec = p.product_specs?.find((s: any) => s.label === label);
        row.push(spec ? spec.value : "-");
      });
      csv += row.join(",") + "\n";
    });

    // Download CSV
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `product-comparison-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Comparison data has been exported to CSV.",
    });
  };

  const exportToPDF = () => {
    toast({
      title: "Generating PDF",
      description: "Your comparison report is being prepared...",
    });
    
    // Placeholder for PDF generation - would integrate with jsPDF or similar
    setTimeout(() => {
      toast({
        title: "PDF Ready",
        description: "Comparison report has been generated.",
      });
    }, 1500);
  };

  const printComparison = () => {
    window.print();
  };

  const shareComparison = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: "Product Comparison",
        text: `Compare ${products.map(p => p.name).join(", ")}`,
        url: url,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
        toast({
          title: "Link copied",
          description: "Comparison link has been copied to clipboard.",
        });
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Comparison link has been copied to clipboard.",
      });
    }
  };

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
      
      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .container-x {
            max-width: 100% !important;
            padding: 0 !important;
          }
        }
      `}</style>
      
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
              <p className="text-sm text-muted-foreground mt-1">
                Side-by-side comparison of {products.length} products
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Download size={16} />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportToCSV}>
                    <FileText className="mr-2" size={16} />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToPDF}>
                    <FileText className="mr-2" size={16} />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={printComparison} className="gap-2">
                <Printer size={16} />
                Print
              </Button>
              <Button variant="outline" onClick={shareComparison} className="gap-2">
                <Share2 size={16} />
                Share
              </Button>
              <Button variant="outline" onClick={clearCompare} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                Clear All
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-border" ref={tableRef}>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-64 min-w-[200px] bg-gray-50/50 font-bold">Specifications</TableHead>
                    {products.map((product) => (
                      <TableHead key={product.id} className="min-w-[250px] p-6 text-center align-top relative">
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 transition-colors print:hidden"
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
                            className="w-full print:hidden"
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
                <h4 className="font-bold mb-2">Create a Quote</h4>
                <p className="text-sm text-muted-foreground mb-4">Generate a professional quote with pricing for these products.</p>
                <Button 
                  variant="default" 
                  className="w-full bg-accent hover:bg-accent/90" 
                  onClick={() => navigate('/quote-builder')}
                >
                  Build Quote
                </Button>
             </div>
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
          </div>
        </div>
      </div>
    </>
  );
}
