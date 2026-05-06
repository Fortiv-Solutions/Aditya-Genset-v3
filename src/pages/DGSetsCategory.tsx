import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/site/SEO";
import { fetchPublishedProducts } from "@/lib/api/products";
import { SectionReveal } from "@/components/site/SectionReveal";
import { ArrowLeft, ArrowRight, Zap, Search, Loader2 } from "lucide-react";
import gensetFallback from "@/assets/products/showcase/main-view.png";
import { EditableText } from "@/components/cms/EditableText";
import { useCMSState } from "@/components/cms/CMSEditorProvider";

export interface DGSet {
  id: string;
  slug: string;
  model: string;
  kva: number;
  engine: "Baudouin" | "Escorts";
  application: string;
  fuel: string;
  noise: string;
  image: string;
  compliance: string;
  isHidden?: boolean;
}

const kvaRanges = [
  { label: "All", min: 0, max: 10000 },
  { label: "<100", min: 0, max: 99 },
  { label: "100-500", min: 100, max: 500 },
  { label: "500-1500", min: 500, max: 1500 },
  { label: ">1500", min: 1500, max: 10000 },
];

const applications = ["All", "Prime", "Standby", "Continuous"];

export default function DGSetsCategory() {
  const navigate = useNavigate();
  const { content } = useCMSState();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEngine, setSelectedEngine] = useState<string>("All");
  const [selectedKvaRange, setSelectedKvaRange] = useState(kvaRanges[0]);
  const [selectedApplication, setSelectedApplication] = useState("All");
  
  const [sets, setSets] = useState<DGSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSets() {
      setLoading(true);
      try {
        const products = await fetchPublishedProducts();
        const mapped: DGSet[] = products.map(p => {
          const primaryMedia = p.product_media?.find(m => m.kind === 'primary' || m.kind === 'card');
          const specs = p.product_specs || [];
          
          return {
            id: p.id,
            slug: p.slug,
            model: p.model || p.name,
            kva: p.kva,
            engine: (p.engine_brand === 'Escorts' ? 'Escorts' : 'Baudouin') as any,
            application: specs.find(s => s.label.toLowerCase().includes('application'))?.value || 'Prime',
            fuel: specs.find(s => s.label.toLowerCase().includes('fuel consumption'))?.value || 'Variable',
            noise: specs.find(s => s.label.toLowerCase().includes('noise'))?.value || '70 dB(A)',
            image: primaryMedia?.url || gensetFallback,
            compliance: specs.find(s => s.label.toLowerCase().includes('compliance'))?.value || 'CPCB IV+',
            isHidden: p.status !== 'published'
          };
        });
        setSets(mapped);
      } catch (err) {
        console.error("Failed to load DG sets:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSets();
  }, []);

  // Filter logic
  const filteredSets = sets.filter((set) => {
    const matchesSearch = set.model.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         set.kva.toString().includes(searchQuery);
    const matchesEngine = selectedEngine === "All" || (selectedEngine === "Escorts" ? set.engine === "Escorts" : set.engine === "Baudouin");
    const matchesKva = set.kva >= selectedKvaRange.min && set.kva <= selectedKvaRange.max;
    const matchesApplication = selectedApplication === "All" || set.application.includes(selectedApplication);
    
    return !set.isHidden && matchesSearch && matchesEngine && matchesKva && matchesApplication;
  });

  return (
    <>
      <SEO
        title={content.dgSetsCategory.seoTitle}
        description={content.dgSetsCategory.seoDescription}
      />

      <section className="h-screen bg-white py-6 overflow-hidden flex flex-col">
        <div className="container-x max-w-7xl flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-start justify-between">
              <div>
                <EditableText 
                  section="dgSetsCategory" 
                  contentKey="pageTitle" 
                  className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2 block" 
                  as="h1" 
                />
                <EditableText 
                  section="dgSetsCategory" 
                  contentKey="pageSubtitle" 
                  className="text-sm text-muted-foreground block" 
                  as="p" 
                />
              </div>
              <button 
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors text-xs font-bold uppercase tracking-widest flex-shrink-0 mt-1"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Back to Category
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Engine Family Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Engine Family
                </label>
                <select
                  value={selectedEngine}
                  onChange={(e) => setSelectedEngine(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Baudouin">Baudouin</option>
                  <option value="Escorts">Escorts-Kubota</option>
                </select>
              </div>

              {/* kVA Range Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  kVA Range
                </label>
                <select
                  value={selectedKvaRange.label}
                  onChange={(e) => {
                    const range = kvaRanges.find(r => r.label === e.target.value);
                    if (range) setSelectedKvaRange(range);
                  }}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors cursor-pointer"
                >
                  {kvaRanges.map((range) => (
                    <option key={range.label} value={range.label}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Application Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Application
                </label>
                <select
                  value={selectedApplication}
                  onChange={(e) => setSelectedApplication(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors cursor-pointer"
                >
                  {applications.map((app) => (
                    <option key={app} value={app}>
                      {app}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Bar */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="text"
                    placeholder="Search models, specs, KVA..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-3">
            <EditableText 
              section="dgSetsCategory" 
              contentKey="resultsHeader" 
              className="text-base font-bold text-foreground block" 
              as="h2" 
            />
            <div className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `Showing ${filteredSets.length} results`}
            </div>
          </div>

          {/* Product Grid - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
              {filteredSets.map((set, index) => (
                <div key={set.id} onClick={() => navigate(`/products/${set.slug}`)}>
                  <div className="group relative bg-white border border-border rounded-xl overflow-hidden hover:border-accent hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                    {/* Badge */}
                    {index === 0 && (
                      <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-accent text-foreground text-xs font-bold uppercase tracking-wider rounded">
                        <EditableText section="dgSetsCategory" contentKey="badgeBestSeller" />
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative h-48 bg-gray-50 overflow-hidden">
                      <img
                        src={set.image}
                        alt={set.model}
                        className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-display text-lg font-bold text-foreground leading-tight">
                            {set.model}
                          </h3>
                          <div className="text-sm text-muted-foreground mt-0.5">
                            {set.engine} · {set.application}
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <div className="text-2xl font-bold text-accent leading-none">
                            {set.kva}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
                            kVA
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Engine</span>
                          <span className="font-semibold">{set.engine}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Fuel</span>
                          <span className="font-semibold">{set.fuel}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Noise</span>
                          <span className="font-semibold">{set.noise}</span>
                        </div>
                      </div>

                      {/* Compliance Badge */}
                      <div className="mb-4">
                        <span className="inline-block px-2.5 py-1 bg-accent/10 border border-accent/30 rounded text-xs font-bold text-accent uppercase tracking-wider">
                          {set.compliance}
                        </span>
                      </div>

                      {/* CTA */}
                      <button
                        className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-gray-50 hover:bg-accent hover:text-foreground rounded-lg text-base font-semibold transition-colors group/btn border border-border hover:border-accent"
                      >
                        Explore Story
                        <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>

          {/* No Results */}
          {!loading && filteredSets.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-2">
                <Zap size={32} className="mx-auto opacity-20" />
              </div>
              <h3 className="text-sm font-bold text-muted-foreground mb-1">No products found</h3>
              <p className="text-xs text-muted-foreground">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

