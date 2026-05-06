import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/site/SEO";
import { getDynamicSummaries } from "@/data/products";
import { SectionReveal } from "@/components/site/SectionReveal";
import { ArrowLeft, ArrowRight, Zap, Search } from "lucide-react";
import gensetHero from "@/assets/products/showcase/main-view.png";
import gensetLarge from "@/assets/products/showcase/main-view.png";
import gensetOpen from "@/assets/products/parts/engine-real.jpg";
import gensetSmall from "@/assets/products/parts/enclosure.jpg";
import { EditableText } from "@/components/cms/EditableText";
import { useCMSState } from "@/components/cms/CMSEditorProvider";

// Array of images to rotate through
const gensetImages = [gensetHero, gensetLarge, gensetOpen, gensetSmall];

export interface DGSet {
  id: string;
  model: string;
  kva: number;
  engine: "Baudouin" | "Escorts";
  application: "Prime" | "Standby" | "Continuous";
  fuel: string;
  noise: string;
  image: string;
  compliance: string;
  isHidden?: boolean;
}

export const dgSets: DGSet[] = [
  // Escorts-Kubota (pinned first)
  { id: "18", model: "ATM EKL 15 (2 Cyl)-IV", kva: 15, engine: "Escorts", application: "Prime", fuel: "4.1 L/h", noise: "70 dB(A)", image: gensetImages[1], compliance: "CPCB IV" },

  // Baudouin Generators (Hidden as per user request, but kept in data)
  { id: "1", model: "ATMBD 250", kva: 250, engine: "Baudouin", application: "Prime", fuel: "52.5 L/h", noise: "73 dB(A)", image: gensetImages[0], compliance: "CPCB IV+", isHidden: true },
  { id: "2", model: "ATMBD 320", kva: 320, engine: "Baudouin", application: "Prime", fuel: "67.2 L/h", noise: "74 dB(A)", image: gensetImages[1], compliance: "CPCB IV+", isHidden: true },
  { id: "3", model: "ATMBD 400", kva: 400, engine: "Baudouin", application: "Prime", fuel: "84 L/h", noise: "74 dB(A)", image: gensetImages[2], compliance: "CPCB IV+", isHidden: true },
];

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

  // Get live CMS values to override hardcoded values
  const dynamicSummaries = getDynamicSummaries();
  const dynamicSets: DGSet[] = dynamicSummaries.map(s => ({
    id: s.slug,
    model: s.name,
    kva: s.kva,
    engine: "Escorts", // Assuming Escorts for dynamic imports as per request
    application: "Prime",
    fuel: "Variable",
    noise: "70 dB(A)",
    image: gensetImages[1], // Use Escort template image
    compliance: "CPCB IV+",
  }));

  const liveDgSets = [...dgSets, ...dynamicSets].map(set => ({
    ...set,
    model: content?.productsData?.[`product_${set.id}_model`] || set.model,
    kva: Number(content?.productsData?.[`product_${set.id}_kva`]) || set.kva,
    engine: (content?.productsData?.[`product_${set.id}_engine`] || set.engine) as "Baudouin" | "Escorts",
    application: (content?.productsData?.[`product_${set.id}_application`] || set.application) as "Prime" | "Standby" | "Continuous",
    fuel: content?.productsData?.[`product_${set.id}_fuel`] || set.fuel,
    noise: content?.productsData?.[`product_${set.id}_noise`] || set.noise,
    compliance: content?.productsData?.[`product_${set.id}_compliance`] || set.compliance,
  }));

  // Filter logic
  const filteredSets = liveDgSets.filter((set) => {
    const matchesSearch = set.model.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         set.kva.toString().includes(searchQuery);
    const matchesEngine = selectedEngine === "All" || set.engine === selectedEngine;
    const matchesKva = set.kva >= selectedKvaRange.min && set.kva <= selectedKvaRange.max;
    const matchesApplication = selectedApplication === "All" || set.application === selectedApplication;
    
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
              Showing {filteredSets.length} results
            </div>
          </div>

          {/* Product Grid - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-4">
            {filteredSets.map((set, index) => (
              <div key={set.id}>
                <div className="group relative bg-white border border-border rounded-xl overflow-hidden hover:border-accent hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                  {/* Badge */}
                  {index === 0 && (
                    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-accent text-foreground text-xs font-bold uppercase tracking-wider rounded">
                      <EditableText section="dgSetsCategory" contentKey="badgeBestSeller" />
                    </div>
                  )}
                  {set.model === "ATMBD 1250" && (
                    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded">
                      <EditableText section="dgSetsCategory" contentKey="badgePopular" />
                    </div>
                  )}

                  {/* Compare Icon */}
                  <button className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm border border-border rounded-lg flex items-center justify-center hover:bg-accent hover:border-accent transition-colors text-sm">
                    ⚖
                  </button>

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
                        <EditableText 
                          section="productsData" 
                          contentKey={`product_${set.id}_model`} 
                          className="font-display text-lg font-bold text-foreground leading-tight block" 
                          as="h3" 
                        />
                        <div className="text-sm text-muted-foreground mt-0.5">
                          <EditableText section="productsData" contentKey={`product_${set.id}_engine`} as="span" />
                          {" · "}
                          <EditableText section="productsData" contentKey={`product_${set.id}_application`} as="span" />
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <EditableText 
                          section="productsData" 
                          contentKey={`product_${set.id}_kva`} 
                          className="text-2xl font-bold text-accent leading-none block" 
                          as="div" 
                        />
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
                          <EditableText section="dgSetsCategory" contentKey="cardKvaLabel" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2.5 text-foreground">
                        <span className="text-muted-foreground">⚙</span>
                        <span className="text-muted-foreground"><EditableText section="dgSetsCategory" contentKey="cardEngineLabel" /></span>
                        <EditableText section="productsData" contentKey={`product_${set.id}_engine`} className="ml-auto font-semibold" as="span" />
                      </div>
                      <div className="flex items-center gap-2.5 text-foreground">
                        <span className="text-muted-foreground">⛽</span>
                        <span className="text-muted-foreground"><EditableText section="dgSetsCategory" contentKey="cardFuelLabel" /></span>
                        <EditableText section="productsData" contentKey={`product_${set.id}_fuel`} className="ml-auto font-semibold" as="span" />
                      </div>
                      <div className="flex items-center gap-2.5 text-foreground">
                        <span className="text-muted-foreground">🔊</span>
                        <span className="text-muted-foreground"><EditableText section="dgSetsCategory" contentKey="cardNoiseLabel" /></span>
                        <EditableText section="productsData" contentKey={`product_${set.id}_noise`} className="ml-auto font-semibold" as="span" />
                      </div>
                    </div>

                    {/* Compliance Badge */}
                    <div className="mb-4">
                      <EditableText 
                        section="productsData" 
                        contentKey={`product_${set.id}_compliance`} 
                        className="inline-block px-2.5 py-1 bg-accent/10 border border-accent/30 rounded text-xs font-bold text-accent uppercase tracking-wider" 
                        as="span" 
                      />
                    </div>

                    {/* CTA */}
                    <button
                      onClick={(e) => {
                        if (document.querySelector('.fixed.inset-0.z-\\[100\\]')) {
                          e.preventDefault();
                          return;
                        }
                        // EKL 15 (2 Cyl) has its own specific slug, others use their ID/Slug
                        const targetSlug = set.id === "18" ? "ekl-15-2cyl" : set.id;
                        navigate(`/products/${targetSlug}`);
                      }}
                      className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-gray-50 hover:bg-accent hover:text-foreground rounded-lg text-base font-semibold transition-colors group/btn border border-border hover:border-accent"
                    >
                      <EditableText section="dgSetsCategory" contentKey="cardCtaText" as="span" />
                      <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>

          {/* No Results */}
          {filteredSets.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-2">
                <Zap size={32} className="mx-auto opacity-20" />
              </div>
              <EditableText 
                section="dgSetsCategory" 
                contentKey="noResultsTitle" 
                className="text-sm font-bold text-muted-foreground mb-1 block" 
                as="h3" 
              />
              <EditableText 
                section="dgSetsCategory" 
                contentKey="noResultsSubtitle" 
                className="text-xs text-muted-foreground block" 
                as="p" 
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
