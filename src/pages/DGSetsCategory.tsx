import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/site/SEO";
import { SectionReveal } from "@/components/site/SectionReveal";
import { ArrowRight, Zap, Search } from "lucide-react";
import gensetHero from "@/assets/genset-hero-CdfwbH8a.jpg";
import gensetLarge from "@/assets/genset-large-CFWdgEox.jpg";
import gensetOpen from "@/assets/genset-open-tU4whFeg.jpg";
import gensetSmall from "@/assets/genset-small-C07x-piZ.jpg";

// Array of images to rotate through
const gensetImages = [gensetHero, gensetLarge, gensetOpen, gensetSmall];

interface DGSet {
  id: string;
  model: string;
  kva: number;
  engine: "Baudouin" | "Escorts";
  application: "Prime" | "Standby" | "Continuous";
  fuel: string;
  noise: string;
  image: string;
  compliance: string;
}

const dgSets: DGSet[] = [
  // Baudouin Generators
  { id: "1", model: "ATMBD 250", kva: 250, engine: "Baudouin", application: "Prime", fuel: "52.5 L/h", noise: "73 dB(A)", image: gensetImages[0], compliance: "CPCB IV+" },
  { id: "2", model: "ATMBD 320", kva: 320, engine: "Baudouin", application: "Prime", fuel: "67.2 L/h", noise: "74 dB(A)", image: gensetImages[1], compliance: "CPCB IV+" },
  { id: "3", model: "ATMBD 400", kva: 400, engine: "Baudouin", application: "Prime", fuel: "84 L/h", noise: "74 dB(A)", image: gensetImages[2], compliance: "CPCB IV+" },
  { id: "4", model: "ATMBD 450", kva: 450, engine: "Baudouin", application: "Prime", fuel: "94.5 L/h", noise: "74 dB(A)", image: gensetImages[3], compliance: "CPCB IV+" },
  { id: "5", model: "ATMBD 500", kva: 500, engine: "Baudouin", application: "Standby", fuel: "105 L/h", noise: "75 dB(A)", image: gensetImages[0], compliance: "CPCB IV+" },
  { id: "6", model: "ATMBD 625", kva: 625, engine: "Baudouin", application: "Standby", fuel: "131.3 L/h", noise: "75 dB(A)", image: gensetImages[1], compliance: "CPCB IV+" },
  { id: "7", model: "ATMBD 750", kva: 750, engine: "Baudouin", application: "Standby", fuel: "157.5 L/h", noise: "76 dB(A)", image: gensetImages[2], compliance: "CPCB IV+" },
  { id: "8", model: "ATMBD 910", kva: 910, engine: "Baudouin", application: "Standby", fuel: "191.1 L/h", noise: "77 dB(A)", image: gensetImages[3], compliance: "CPCB IV+" },
  { id: "9", model: "ATMBD 1010", kva: 1010, engine: "Baudouin", application: "Continuous", fuel: "212.1 L/h", noise: "77 dB(A)", image: gensetImages[0], compliance: "CPCB IV+" },
  { id: "10", model: "ATMBD 1250", kva: 1250, engine: "Baudouin", application: "Continuous", fuel: "262.5 L/h", noise: "78 dB(A)", image: gensetImages[1], compliance: "CPCB IV+" },
  { id: "11", model: "ATMBD 1500", kva: 1500, engine: "Baudouin", application: "Continuous", fuel: "315 L/h", noise: "80 dB(A)", image: gensetImages[2], compliance: "CPCB IV+" },
  { id: "12", model: "ATMBD 1850", kva: 1850, engine: "Baudouin", application: "Continuous", fuel: "388.5 L/h", noise: "81 dB(A)", image: gensetImages[3], compliance: "CPCB IV+" },
  { id: "13", model: "ATMBD 2000", kva: 2000, engine: "Baudouin", application: "Continuous", fuel: "420 L/h", noise: "82 dB(A)", image: gensetImages[0], compliance: "CPCB IV+" },
  { id: "14", model: "ATMBD 2250", kva: 2250, engine: "Baudouin", application: "Continuous", fuel: "472.5 L/h", noise: "83 dB(A)", image: gensetImages[1], compliance: "CPCB IV+" },
  { id: "15", model: "ATMBD 2500", kva: 2500, engine: "Baudouin", application: "Continuous", fuel: "525 L/h", noise: "85 dB(A)", image: gensetImages[2], compliance: "CPCB IV+" },
  
  // Escorts-Kubota Generators
  { id: "16", model: "ATM EKL 7.5-IV", kva: 7.5, engine: "Escorts", application: "Prime", fuel: "2 L/h", noise: "69 dB(A)", image: gensetImages[3], compliance: "CPCB IV" },
  { id: "17", model: "ATM EKL 10-IV", kva: 10, engine: "Escorts", application: "Prime", fuel: "2.7 L/h", noise: "69 dB(A)", image: gensetImages[0], compliance: "CPCB IV" },
  { id: "18", model: "ATM EKL 15 (2 Cyl)-IV", kva: 15, engine: "Escorts", application: "Prime", fuel: "4.1 L/h", noise: "70 dB(A)", image: gensetImages[1], compliance: "CPCB IV" },
  { id: "19", model: "ATM EKL 15 (3 Cyl)-IV", kva: 15, engine: "Escorts", application: "Prime", fuel: "4.1 L/h", noise: "70 dB(A)", image: gensetImages[2], compliance: "CPCB IV" },
  { id: "20", model: "ATM EKL 20 (2 Cyl)-IV", kva: 20, engine: "Escorts", application: "Prime", fuel: "5.4 L/h", noise: "70 dB(A)", image: gensetImages[3], compliance: "CPCB IV" },
  { id: "21", model: "ATM EKL 20 (3 Cyl)-IV", kva: 20, engine: "Escorts", application: "Prime", fuel: "5.4 L/h", noise: "70 dB(A)", image: gensetImages[0], compliance: "CPCB IV" },
  { id: "22", model: "ATM EKL 25-IV", kva: 25, engine: "Escorts", application: "Prime", fuel: "6.8 L/h", noise: "71 dB(A)", image: gensetImages[1], compliance: "CPCB IV" },
  { id: "23", model: "ATM EKL 30-IV", kva: 30, engine: "Escorts", application: "Prime", fuel: "8.1 L/h", noise: "71 dB(A)", image: gensetImages[2], compliance: "CPCB IV" },
  { id: "24", model: "ATM EKL 35 Prime", kva: 35, engine: "Escorts", application: "Prime", fuel: "9.5 L/h", noise: "72 dB(A)", image: gensetImages[3], compliance: "CPCB IV" },
  { id: "25", model: "ATM EKL 35 Standby", kva: 35, engine: "Escorts", application: "Standby", fuel: "9.5 L/h", noise: "72 dB(A)", image: gensetImages[0], compliance: "CPCB IV" },
  { id: "26", model: "ATM EKL 40-IV", kva: 40, engine: "Escorts", application: "Prime", fuel: "10.8 L/h", noise: "72 dB(A)", image: gensetImages[1], compliance: "CPCB IV" },
  { id: "27", model: "ATM EKL 45 Standby", kva: 45, engine: "Escorts", application: "Standby", fuel: "12.2 L/h", noise: "73 dB(A)", image: gensetImages[2], compliance: "CPCB IV" },
  { id: "28", model: "ATM EKL 45 Prime", kva: 45, engine: "Escorts", application: "Prime", fuel: "12.2 L/h", noise: "73 dB(A)", image: gensetImages[3], compliance: "CPCB IV" },
  { id: "29", model: "ATM EKL 50-IV", kva: 50, engine: "Escorts", application: "Prime", fuel: "13.5 L/h", noise: "73 dB(A)", image: gensetImages[0], compliance: "CPCB IV" },
  { id: "30", model: "ATM EKL 58.5-IV", kva: 58.5, engine: "Escorts", application: "Prime", fuel: "15.8 L/h", noise: "74 dB(A)", image: gensetImages[1], compliance: "CPCB IV" },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEngine, setSelectedEngine] = useState<string>("All");
  const [selectedKvaRange, setSelectedKvaRange] = useState(kvaRanges[0]);
  const [selectedApplication, setSelectedApplication] = useState("All");

  // Filter logic
  const filteredSets = dgSets.filter((set) => {
    const matchesSearch = set.model.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         set.kva.toString().includes(searchQuery);
    const matchesEngine = selectedEngine === "All" || set.engine === selectedEngine;
    const matchesKva = set.kva >= selectedKvaRange.min && set.kva <= selectedKvaRange.max;
    const matchesApplication = selectedApplication === "All" || set.application === selectedApplication;
    
    return matchesSearch && matchesEngine && matchesKva && matchesApplication;
  });

  return (
    <>
      <SEO
        title="DG Sets — Aditya Genset"
        description="Browse 30+ DG sets, run side-by-side comparisons, and generate quotes in one session."
      />

      <section className="h-screen bg-white py-6 overflow-hidden flex flex-col">
        <div className="container-x max-w-7xl flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="mb-4">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Find the right power solution.
            </h1>
            <p className="text-sm text-muted-foreground">
              Browse 30+ DG sets, run side-by-side comparisons, and generate quotes in one session.
            </p>
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
            <h2 className="text-base font-bold text-foreground">
              Available DG Sets
            </h2>
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
                      Best Seller
                    </div>
                  )}
                  {set.model === "ATMBD 1250" && (
                    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded">
                      Popular
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
                        <h3 className="font-display text-lg font-bold text-foreground leading-tight">
                          {set.model}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {set.engine} · {set.application}
                        </p>
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

                    {/* Specs */}
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2.5 text-foreground">
                        <span className="text-muted-foreground">⚙</span>
                        <span className="text-muted-foreground">Engine</span>
                        <span className="ml-auto font-semibold">{set.engine}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-foreground">
                        <span className="text-muted-foreground">⛽</span>
                        <span className="text-muted-foreground">Fuel</span>
                        <span className="ml-auto font-semibold">{set.fuel}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-foreground">
                        <span className="text-muted-foreground">🔊</span>
                        <span className="text-muted-foreground">Noise</span>
                        <span className="ml-auto font-semibold">{set.noise}</span>
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
                      onClick={() => navigate("/products/silent-62-5")}
                      className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-gray-50 hover:bg-accent hover:text-foreground rounded-lg text-base font-semibold transition-colors group/btn border border-border hover:border-accent"
                    >
                      <span>View Details</span>
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
              <h3 className="text-sm font-bold text-muted-foreground mb-1">No generators found</h3>
              <p className="text-xs text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
