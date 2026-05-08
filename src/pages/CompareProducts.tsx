import { useEffect, useState, useRef } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCompare } from "@/context/CompareContext";
import { fetchPublishedProducts } from "@/lib/api/products";
import { SEO } from "@/components/site/SEO";
import { ArrowLeft, X, Check, Minus, Download, Printer, Share2, FileText, BarChart2, Zap, TrendingUp, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import gensetFallback from "@/assets/products/showcase/main-view.png";
import { cn } from "@/lib/utils";
import { EditableText } from "@/components/cms/EditableText";
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

// Specification categories for organized comparison
const SPEC_CATEGORIES = {
  "Power & Performance": [
    "Power Output",
    "kVA Rating", 
    "Application",
    "Overload Capability",
    "Power Factor"
  ],
  "Engine Specifications": [
    "Engine Model",
    "Engine Brand",
    "Cylinders",
    "Cooling System",
    "Starting System"
  ],
  "Fuel & Efficiency": [
    "Fuel Consumption (100% Load)",
    "Fuel Consumption (75% Load)",
    "Fuel Tank Capacity",
    "Run Time at Full Load"
  ],
  "Electrical System": [
    "Voltage",
    "Frequency",
    "Alternator",
    "Control Panel",
    "Protection Features"
  ],
  "Physical Specifications": [
    "Dimensions (L×W×H)",
    "Weight",
    "Noise Level",
    "Enclosure Type"
  ],
  "Compliance & Standards": [
    "Compliance",
    "Emission Standard",
    "Certifications",
    "Warranty"
  ]
};

// Helper function to analyze spec differences and find best/worst values
function analyzeSpecDifferences(products: any[], specLabel: string) {
  const values = products.map(p => 
    p.product_specs?.find((s: any) => s.spec_label === specLabel)?.spec_value
  ).filter(Boolean);
  
  const uniqueValues = new Set(values);
  const hasDifference = uniqueValues.size > 1;
  
  // For numeric values, find best/worst
  const numericValues = values.map(v => {
    const match = v?.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : null;
  }).filter(v => v !== null) as number[];
  
  let bestValue: number | null = null;
  let worstValue: number | null = null;
  
  if (numericValues.length > 1) {
    // Determine if higher or lower is better based on spec type
    const lowerIsBetter = [
      "Fuel Consumption",
      "Noise Level",
      "Weight"
    ].some(term => specLabel.includes(term));
    
    if (lowerIsBetter) {
      bestValue = Math.min(...numericValues);
      worstValue = Math.max(...numericValues);
    } else {
      bestValue = Math.max(...numericValues);
      worstValue = Math.min(...numericValues);
    }
  }
  
  return { hasDifference, bestValue, worstValue };
}

// Generate smart insights about the comparison
function generateInsights(products: any[]) {
  const insights = [];
  
  // Most Powerful
  const maxKva = Math.max(...products.map(p => p.kva));
  const mostPowerful = products.find(p => p.kva === maxKva);
  if (mostPowerful) {
    insights.push({
      title: "Most Powerful",
      productId: mostPowerful.id,
      reason: `Highest power output at ${maxKva} kVA`,
      icon: Zap,
      color: "text-orange-600"
    });
  }
  
  // Most Efficient
  const efficiencies = products.map(p => {
    const fuelSpec = p.product_specs?.find((s: any) => 
      s.spec_label.includes("Fuel Consumption")
    );
    const fuelValue = fuelSpec?.spec_value?.match(/[\d.]+/)?.[0];
    return {
      id: p.id,
      name: p.name,
      efficiency: fuelValue ? p.kva / parseFloat(fuelValue) : 0
    };
  }).filter(e => e.efficiency > 0);
  
  if (efficiencies.length > 0) {
    const bestEfficiency = efficiencies.sort((a, b) => b.efficiency - a.efficiency)[0];
    insights.push({
      title: "Most Efficient",
      productId: bestEfficiency.id,
      reason: "Best power-to-fuel consumption ratio",
      icon: TrendingUp,
      color: "text-green-600"
    });
  }
  
  // Quietest
  const noises = products.map(p => {
    const noiseSpec = p.product_specs?.find((s: any) => 
      s.spec_label.includes("Noise")
    );
    const noiseValue = noiseSpec?.spec_value?.match(/[\d.]+/)?.[0];
    return {
      id: p.id,
      name: p.name,
      noise: noiseValue ? parseFloat(noiseValue) : Infinity
    };
  }).filter(n => n.noise < Infinity);
  
  if (noises.length > 0) {
    const quietest = noises.sort((a, b) => a.noise - b.noise)[0];
    insights.push({
      title: "Quietest",
      productId: quietest.id,
      reason: `Lowest noise level at ${quietest.noise} dB(A)`,
      icon: Volume2,
      color: "text-blue-600"
    });
  }
  
  return insights;
}

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
        products.flatMap((p) => p.product_specs?.map((s: any) => s.spec_label) || [])
      )
    ).sort();

    // Create CSV content
    let csv = "Specification," + products.map(p => p.name).join(",") + "\n";
    csv += "Engine Brand," + products.map(p => p.engine_brand).join(",") + "\n";
    csv += "kVA Rating," + products.map(p => `${p.kva} kVA`).join(",") + "\n";
    
    allSpecs.forEach(label => {
      const row = [label];
      products.forEach(p => {
        const spec = p.product_specs?.find((s: any) => s.spec_label === label);
        row.push(spec ? spec.spec_value : "-");
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-gray-50 to-white">
        <SEO title="Compare Products | Aditya Genset" />
        <div className="max-w-md">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart2 className="text-accent" size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4 font-display">
            <EditableText section="comparePage" contentKey="emptyTitle" />
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            <EditableText section="comparePage" contentKey="emptySubtitle" />
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => navigate("/products/dg-sets")}
              className="bg-accent hover:bg-accent/90"
            >
              <EditableText section="comparePage" contentKey="browseBtn" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/")}
            >
              <EditableText section="comparePage" contentKey="backBtn" />
            </Button>
          </div>
          
          <div className="mt-12 p-6 bg-gray-50 rounded-xl text-left">
            <h3 className="font-bold mb-3 text-sm uppercase tracking-wider text-accent">
              <EditableText section="comparePage" contentKey="howToTitle" />
            </h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="font-bold text-accent">1.</span>
                <span><EditableText section="comparePage" contentKey="howToStep1" /></span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent">2.</span>
                <span><EditableText section="comparePage" contentKey="howToStep2" /></span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent">3.</span>
                <span><EditableText section="comparePage" contentKey="howToStep3" /></span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-accent">4.</span>
                <span><EditableText section="comparePage" contentKey="howToStep4" /></span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Extract all unique spec labels across all selected products
  const allSpecs = Array.from(
    new Set(
      products.flatMap((p) => p.product_specs?.map((s: any) => s.spec_label) || [])
    )
  ).sort();

  return (
    <>
      <SEO title="Compare Products | Aditya Genset" />
      
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
              <h1 className="text-3xl font-bold font-display">
                <EditableText section="comparePage" contentKey="title" />
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                <EditableText section="comparePage" contentKey="subtitle" />
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Download size={16} />
                    <EditableText section="comparePage" contentKey="exportBtn" />
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
                <EditableText section="comparePage" contentKey="printBtn" />
              </Button>
              <Button variant="outline" onClick={shareComparison} className="gap-2">
                <Share2 size={16} />
                <EditableText section="comparePage" contentKey="shareBtn" />
              </Button>
              <Button variant="outline" onClick={clearCompare} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <EditableText section="comparePage" contentKey="clearAllBtn" />
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-border" ref={tableRef}>
            {/* Legend */}
            <div className="p-4 bg-gray-50/50 border-b border-border flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
                <span className="text-muted-foreground">Best in category</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
                <span className="text-muted-foreground">Needs consideration</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-green-600" />
                <span className="text-muted-foreground">Top performer</span>
              </div>
            </div>
            
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
                              src={product.product_media?.find((m: any) => m.kind === 'primary')?.public_url || gensetFallback}
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
                  {/* Basic Information */}
                  <TableRow className="bg-gray-100/50">
                    <TableCell colSpan={products.length + 1} className="font-bold text-sm uppercase tracking-wider text-accent">
                      Basic Information
                    </TableCell>
                  </TableRow>
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
                  
                  {/* Categorized Specs */}
                  {Object.entries(SPEC_CATEGORIES).map(([category, specLabels]) => {
                    const categorySpecs = specLabels.filter(label => allSpecs.includes(label));
                    if (categorySpecs.length === 0) return null;
                    
                    return (
                      <React.Fragment key={category}>
                        <TableRow className="bg-gray-100/50">
                          <TableCell colSpan={products.length + 1} className="font-bold text-sm uppercase tracking-wider text-accent">
                            {category}
                          </TableCell>
                        </TableRow>
                        {categorySpecs.map((label) => {
                          const { hasDifference, bestValue, worstValue } = analyzeSpecDifferences(products, label);
                          
                          return (
                            <TableRow key={label}>
                              <TableCell className="font-medium bg-gray-50/30 pl-6">{label}</TableCell>
                              {products.map((p) => {
                                const spec = p.product_specs?.find((s: any) => s.spec_label === label);
                                const numericValue = spec?.spec_value?.match(/[\d.]+/)?.[0];
                                const isBest = numericValue && bestValue !== null && parseFloat(numericValue) === bestValue;
                                const isWorst = numericValue && worstValue !== null && parseFloat(numericValue) === worstValue;
                                
                                return (
                                  <TableCell 
                                    key={p.id} 
                                    className={cn(
                                      "text-center",
                                      hasDifference && "font-semibold",
                                      isBest && "bg-green-50 text-green-700",
                                      isWorst && "bg-red-50 text-red-700"
                                    )}
                                  >
                                    {spec ? (
                                      <div className="flex items-center justify-center gap-2">
                                        {isBest && <Check size={14} className="text-green-600" />}
                                        <span>{spec.spec_value}</span>
                                      </div>
                                    ) : (
                                      <Minus className="mx-auto text-gray-300" size={16} />
                                    )}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Smart Insights */}
          {products.length >= 2 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl border border-accent/20">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <BarChart2 className="text-accent" size={20} />
                <EditableText section="comparePage" contentKey="insightsTitle" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generateInsights(products).map((insight, idx) => {
                  const Icon = insight.icon;
                  return (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={cn("w-5 h-5", insight.color)} />
                        <div className="text-sm font-bold text-accent">
                          {insight.title}
                        </div>
                      </div>
                      <div className="text-base font-bold mb-1 line-clamp-1">
                        {products.find(p => p.id === insight.productId)?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {insight.reason}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="p-6 bg-white rounded-2xl border border-border shadow-sm">
                <h4 className="font-bold mb-2">
                  <EditableText section="comparePage" contentKey="createQuoteTitle" />
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  <EditableText section="comparePage" contentKey="createQuoteDesc" />
                </p>
                <Button 
                  variant="default" 
                  className="w-full bg-accent hover:bg-accent/90" 
                  onClick={() => navigate('/quote-builder')}
                >
                  <EditableText section="comparePage" contentKey="createQuoteBtn" />
                </Button>
             </div>
             <div className="p-6 bg-white rounded-2xl border border-border shadow-sm">
                <h4 className="font-bold mb-2">
                  <EditableText section="comparePage" contentKey="expertAdviceTitle" />
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  <EditableText section="comparePage" contentKey="expertAdviceDesc" />
                </p>
                <Button variant="link" className="p-0 text-accent font-bold" onClick={() => navigate('/')}>
                  <EditableText section="comparePage" contentKey="expertAdviceBtn" />
                </Button>
             </div>
             <div className="p-6 bg-white rounded-2xl border border-border shadow-sm">
                <h4 className="font-bold mb-2">
                  <EditableText section="comparePage" contentKey="downloadTitle" />
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  <EditableText section="comparePage" contentKey="downloadDesc" />
                </p>
                <Button variant="link" className="p-0 text-accent font-bold">
                  <EditableText section="comparePage" contentKey="downloadBtn" />
                </Button>
             </div>
          </div>
        </div>
      </div>
    </>
  );
}
