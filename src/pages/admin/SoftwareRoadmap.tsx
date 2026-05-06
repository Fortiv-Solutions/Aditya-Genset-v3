import { useState } from "react";
import { 
  Database, LayoutTemplate, MessageSquare, Presentation, 
  Box, Smartphone, BarChart3, Users, LineChart, 
  FileUp, Copy, History, Eye, CheckCircle2, Clock, 
  ChevronRight, ArrowUpRight, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Phase {
  id: string;
  title: string;
  badge: string;
  duration: string;
  color: string;
  features: Feature[];
}

interface Feature {
  id: string;
  icon: any;
  title: string;
  description: string;
  tags: string[];
  tasks: string[];
  prompt?: string;
  status: "done" | "in-progress" | "pending";
}

const ROADMAP_DATA: Phase[] = [
  {
    id: "p1",
    title: "Foundation — DB + Comparison tool",
    badge: "Phase 1",
    duration: "3–4 weeks",
    color: "#378ADD",
    features: [
      {
        id: "d1",
        icon: Database,
        title: "Supabase data layer",
        description: "Migrate all 36+ hardcoded products into a centralized DB. One source of truth for specs, pricing, and assets.",
        tags: ["Supabase", "PostgreSQL", "Next.js API"],
        status: "done",
        tasks: [
          "Design schema: products, specs, media_assets, categories, brands",
          "Write migration SQL + seed script for all 36 existing products",
          "Set up Row Level Security (RLS) policies",
          "Create Next.js API routes for product fetching",
          "Replace hardcoded data with Supabase queries",
          "Add Supabase Storage bucket for product images"
        ]
      },
      {
        id: "d2",
        icon: LayoutTemplate,
        title: "Comparison tool",
        description: "Side-by-side comparison of up to 3 DG models. Filter by kVA, fuel type, brand. Live data from Supabase.",
        tags: ["React state", "Supabase queries", "Table UI"],
        status: "in-progress",
        tasks: [
          "Build /compare page with URL-state param",
          "Product selector modal with search + filters",
          "Comparison table with spec field rows",
          "Highlight better value cells with color diff",
          "Shareable comparison URL with clipboard copy"
        ]
      },
      {
        id: "d3",
        icon: MessageSquare,
        title: "Lead funnel",
        description: "Contact/enquiry forms on product pages flow directly into Supabase leads table with source tracking.",
        tags: ["Supabase", "Lead scoring", "Email notify"],
        status: "done",
        tasks: [
          "Create leads table with source tracking",
          "Enquiry form component on product detail pages",
          "Lead scoring: +10 comparison, +20 present mode",
          "WhatsApp deep-link integration"
        ]
      }
    ]
  },
  {
    id: "p2",
    title: "Interactive Present / Scrollytelling mode",
    badge: "Phase 2",
    duration: "5–6 weeks",
    color: "#639922",
    features: [
      {
        id: "d4",
        icon: Presentation,
        title: "Scrollytelling engine",
        description: "Cinematic full-screen scroll experience per product. Each scroll trigger reveals a spec section with animated transition.",
        tags: ["Framer Motion", "IntersectionObserver", "GSAP"],
        status: "done",
        tasks: [
          "Lenis smooth scroll integration",
          "Build ScrollSection component for trigger animations",
          "Define 6–8 scenes: Intro -> Canopy -> Engine -> Specs",
          "Animated number roll-up for technical specs"
        ]
      },
      {
        id: "d5",
        icon: Box,
        title: "3D engine part zoom",
        description: "Scroll into annotated engine cross-section diagrams that highlight alternator, canopy, fuel tank.",
        tags: ["SVG animation", "CSS transforms", "Hotspots"],
        status: "in-progress",
        tasks: [
          "SVG cross-section diagram for flagship models",
          "Define zoom hotspots: Alternator, Canopy, Fuel Tank",
          "Animated tooltip annotations with spec data"
        ]
      },
      {
        id: "d6",
        icon: Smartphone,
        title: "Dealer present mode",
        description: "Fullscreen kiosk-style mode for tablet/laptop. Optimized layout for projection. Shareable present URL.",
        tags: ["Fullscreen API", "Next.js layout", "QR share"],
        status: "done",
        tasks: [
          "Add ?mode=present URL param logic",
          "Fullscreen kiosk layout override",
          "Keyboard navigation for slide advancing",
          "QR code generation for instant sharing"
        ]
      }
    ]
  },
  {
    id: "p3",
    title: "Admin dashboard + BI command center",
    badge: "Phase 3",
    duration: "5–6 weeks",
    color: "#BA7517",
    features: [
      {
        id: "d7",
        icon: BarChart3,
        title: "Analytics + BI",
        description: "Live metrics: top-viewed products, comparison frequency, lead conversion rate by category.",
        tags: ["Recharts", "Supabase realtime", "GA4"],
        status: "in-progress",
        tasks: [
          "Instrument page views and comparison events",
          "Top products bar charts (Recharts)",
          "Comparison heatmap: pairs compared most often",
          "Conversion funnel: View -> Compare -> Lead"
        ]
      },
      {
        id: "d8",
        icon: Users,
        title: "Lead CRM dashboard",
        description: "All inbound leads with activity scores, product interest, source channel. One-click follow-up.",
        tags: ["Supabase", "Lead scoring", "Admin auth"],
        status: "done",
        tasks: [
          "Admin auth with Supabase",
          "Lead list with scoring and status pipeline",
          "One-click WhatsApp/Email follow-up"
        ]
      },
      {
        id: "d9",
        icon: LineChart,
        title: "Revenue forecast",
        description: "Forecast kVA demand by category based on lead pipeline. Inventory stock recommendations.",
        tags: ["Trend analysis", "Quote analytics", "CSV export"],
        status: "in-progress",
        tasks: [
          "Pipeline value chart by kVA category",
          "Demand trend: 4-week rolling average",
          "Inventory stock recommendation engine"
        ]
      }
    ]
  },
  {
    id: "p4",
    title: "AI product launch (PDF → live page)",
    badge: "Phase 4",
    duration: "3–4 weeks",
    color: "#7F77DD",
    features: [
      {
        id: "d10",
        icon: FileUp,
        title: "PDF spec extraction",
        description: "Admin uploads product PDF brochure. AI extracts all specs into structured JSON automatically.",
        tags: ["Gemini API", "PDF parsing", "Structured JSON"],
        status: "done",
        tasks: [
          "PDF upload to Supabase Storage",
          "API route for Gemini AI extraction",
          "Zod schema validation for extracted specs"
        ]
      },
      {
        id: "d11",
        icon: LayoutTemplate,
        title: "Template cloning",
        description: "Extracted data auto-populates into the EKL15 page template. 5-minute launches.",
        tags: ["Supabase insert", "Admin preview", "ISR"],
        status: "done",
        tasks: [
          "Admin preview page for extraction review",
          "Live editable fields in preview mode",
          "One-click publish with ISR revalidation"
        ]
      }
    ]
  }
];

export default function SoftwareRoadmap() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const getStatusIcon = (status: Feature["status"]) => {
    if (status === "done") return <CheckCircle2 size={16} className="text-green-500" />;
    if (status === "in-progress") return <Zap size={16} className="text-amber-500 animate-pulse" />;
    return <Clock size={16} className="text-muted-foreground" />;
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Software Roadmap</h1>
        <p className="text-sm text-muted-foreground mt-0.5">DG Platform implementation plan — 4 phases from foundation to AI-powered launch</p>
      </div>

      {/* Timeline Bar */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-3">Total Timeline Overview</p>
        <div className="flex gap-0.5 h-3 rounded-full overflow-hidden mb-4">
          <div className="h-full" style={{ flex: 2, background: "#378ADD" }} />
          <div className="h-full" style={{ flex: 3, background: "#639922" }} />
          <div className="h-full" style={{ flex: 3, background: "#BA7517" }} />
          <div className="h-full" style={{ flex: 2, background: "#7F77DD" }} />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {ROADMAP_DATA.map(phase => (
            <div key={phase.id} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: phase.color }} />
              <span className="text-xs text-muted-foreground font-medium">{phase.badge} · {phase.duration}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-12 mt-8">
        {ROADMAP_DATA.map((phase) => (
          <div key={phase.id} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                phase.id === "p1" ? "bg-blue-500/10 text-blue-400" :
                phase.id === "p2" ? "bg-green-500/10 text-green-400" :
                phase.id === "p3" ? "bg-amber-500/10 text-amber-400" :
                "bg-purple-500/10 text-purple-400"
              )}>
                {phase.badge}
              </span>
              <h2 className="text-lg font-bold text-foreground">{phase.title}</h2>
              <span className="text-xs text-muted-foreground ml-auto">{phase.duration}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {phase.features.map((feature) => (
                <div 
                  key={feature.id}
                  onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
                  className={cn(
                    "bg-card border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md group",
                    activeFeature === feature.id ? "border-accent ring-1 ring-accent/20" : "border-border hover:border-border/80"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-secondary group-hover:bg-accent/10 transition-colors">
                      <feature.icon size={18} className="text-muted-foreground group-hover:text-accent" />
                    </div>
                    {getStatusIcon(feature.status)}
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-accent transition-colors">{feature.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{feature.description}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {feature.tags.map(tag => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border/50">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Expanded Tasks */}
                  {activeFeature === feature.id && (
                    <div className="mt-4 pt-4 border-t border-border animate-in slide-in-from-top-1 duration-200">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-3">Implementation Tasks</p>
                      <ul className="space-y-2">
                        {feature.tasks.map((task, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed">
                            <div className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                            {task}
                          </li>
                        ))}
                      </ul>
                      <button className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-accent text-[11px] font-bold text-accent-foreground hover:bg-accent/90 transition-all">
                        Deep Dive into Code <ArrowUpRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
