import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, TrendingDown, Users, Package, FileText,
  AlertCircle, Plus, Eye, ArrowRight, Calendar, Star,
  Bell, Download, ChevronRight, LayoutDashboard, 
  BarChart3, UserCheck, Briefcase, IndianRupee, BellRing,
  MoreVertical, Search, Filter, Share2, Printer, FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const PIPELINE_DATA: any[] = [];
const LEAD_SOURCE_DATA: any[] = [];
const LEAD_TREND_DATA: any[] = [];
const REVENUE_FORECAST: any[] = [];
// ─── Mini Chart (SVG Sparkline) ────────────────────────────────────────────
function Sparkline({ data, color = "#D97706" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 32;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Bar Chart ──────────────────────────────────────────────────────────────
function MiniBarChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-2.5">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-3">
          <div className="w-28 text-xs text-muted-foreground truncate flex-shrink-0">{item.name}</div>
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color }}
            />
          </div>
          <div className="w-8 text-right text-xs font-semibold text-muted-foreground">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Donut Chart (SVG) ──────────────────────────────────────────────────────
function DonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  const r = 38, cx = 50, cy = 50, circumference = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-6">
      <svg width={100} height={100} className="flex-shrink-0 -rotate-90">
        {data.map((item) => {
          const pct = item.value / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const el = (
            <circle
              key={item.name}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={item.color}
              strokeWidth="12"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circumference}
              strokeLinecap="butt"
            />
          );
          offset += pct;
          return el;
        })}
      </svg>
      <div className="flex flex-col gap-1.5 min-w-0">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[11px] text-muted-foreground truncate">{item.name}</span>
            <span className="text-[11px] font-semibold text-foreground ml-auto pl-2">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Funnel ─────────────────────────────────────────────────────────────────
function PipelineFunnel({ data }: { data: { stage: string; count: number; color: string }[] }) {
  const max = data[0]?.count || 1;
  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={item.stage} className="flex items-center gap-3">
          <div className="w-20 text-xs text-muted-foreground flex-shrink-0">{item.stage}</div>
          <div className="flex-1 flex justify-center">
            <div
              className="h-7 rounded-sm flex items-center justify-center text-xs font-bold text-foreground/90 transition-all duration-700"
              style={{
                width: `${Math.max((item.count / max) * 100, 25)}%`,
                backgroundColor: item.color,
                opacity: 1 - i * 0.07,
              }}
            >
              {item.count}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── KPI Card ───────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string;
  sub: string;
  trend: "up" | "down" | "neutral";
  change: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  sparkData?: number[];
  sparkColor?: string;
}

function KpiCard({ label, value, sub, trend, change, icon: Icon, iconColor, bgColor, sparkData, sparkColor }: KpiCardProps) {
  return (
    <div className="bg-card shadow-sm border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-border transition-colors group">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${bgColor}`}>
          <Icon size={18} className={iconColor} />
        </div>
        {sparkData && <Sparkline data={sparkData} color={sparkColor} />}
      </div>
      <div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-foreground font-display">{value}</span>
          <span className={`text-xs font-semibold pb-0.5 flex items-center gap-0.5 ${
            trend === "up" ? "text-green-400" : trend === "down" ? "text-red-400" : "text-muted-foreground"
          }`}>
            {trend === "up" ? <TrendingUp size={12} /> : trend === "down" ? <TrendingDown size={12} /> : null}
            {change}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ─── Stage Badge ─────────────────────────────────────────────────────────────
const STAGE_COLORS: Record<string, string> = {
  new: "bg-slate-700/50 text-slate-300",
  contacted: "bg-blue-900/50 text-blue-300",
  qualified: "bg-amber-900/50 text-accent",
  site_assessment: "bg-purple-900/50 text-purple-300",
  quotation_sent: "bg-orange-900/50 text-orange-300",
  negotiation: "bg-yellow-900/50 text-yellow-300",
  won: "bg-green-900/50 text-green-300",
  lost: "bg-red-900/50 text-red-300",
};

const STAGE_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  site_assessment: "Site Assess",
  quotation_sent: "Quote Sent",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "leads" | "products">("overview");

  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalLeads: 0,
    openQuotes: 0,
    revenuePipeline: 0,
    recentLeads: [] as any[],
    isLoading: true
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 1. Fetch Products
        const { count: totalCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        const { count: activeCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'published');

        // 2. Fetch Leads
        const { count: leadCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });

        const { count: quoteCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('stage', 'quotation_sent');

        // 3. Fetch Recent Leads
        const { data: recent } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          totalProducts: totalCount || 0,
          activeProducts: activeCount || 0,
          totalLeads: leadCount || 0,
          openQuotes: quoteCount || 0,
          revenuePipeline: 0, // Placeholder until revenue tracking is added
          recentLeads: recent || [],
          isLoading: false
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setStats(s => ({ ...s, isLoading: false }));
      }
    }

    fetchDashboardData();
  }, []);

  const handleExport = (format: "excel" | "pdf") => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
      loading: `Generating ${format.toUpperCase()} report...`,
      success: `Report exported as ${format.toUpperCase()}`,
      error: "Export failed",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} — Business Overview</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2.5 rounded-lg border border-border bg-card transition-all relative ${showNotifications ? 'bg-secondary ring-2 ring-accent/20' : 'hover:bg-secondary'}`}
            >
              <Bell size={18} className="text-muted-foreground" />
              {/* No unread notifications logic for now */}
            </button>

            {/* Notification Center Panel */}
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border shadow-2xl rounded-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-secondary/50">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notifications</h3>
                  </div>
                  <div className="p-10 text-center text-muted-foreground italic text-[11px]">
                    No new notifications
                  </div>
                  <div className="px-4 py-2 bg-secondary/30 border-t border-border text-center">
                    <button className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors">View All Activities</button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="h-6 w-px bg-border mx-1" />

          <button
            onClick={() => handleExport("excel")}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-card hover:bg-secondary border border-border rounded-lg text-xs font-bold text-muted-foreground transition-all active:scale-95"
          >
            <FileSpreadsheet size={15} className="text-green-500" />
            Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-card hover:bg-secondary border border-border rounded-lg text-xs font-bold text-muted-foreground transition-all active:scale-95"
          >
            <Printer size={15} className="text-red-400" />
            PDF
          </button>
          <button
            onClick={() => navigate("/admin/products/add")}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 rounded-lg text-xs font-bold text-accent-foreground shadow-lg shadow-accent/20 transition-all active:scale-95 ml-2"
          >
            <Plus size={15} />
            Create Listing
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard
          label="Total Products"
          value={String(stats.totalProducts)}
          sub={`${stats.activeProducts} Active Listings`}
          trend="up"
          change="+0"
          icon={Package}
          iconColor="text-purple-400"
          bgColor="bg-purple-500/10"
        />
        <KpiCard
          label="Active Dealers"
          value="0"
          sub="No active partners"
          trend="neutral"
          change="—"
          icon={Briefcase}
          iconColor="text-amber-400"
          bgColor="bg-amber-500/10"
        />
        <KpiCard
          label="Total Leads"
          value={String(stats.totalLeads)}
          sub="Updated just now"
          trend="neutral"
          change="—"
          icon={Users}
          iconColor="text-blue-400"
          bgColor="bg-blue-500/10"
          sparkData={[5, 10, 8, 15, 12, 20]}
          sparkColor="#3B82F6"
        />
        <KpiCard
          label="Quotes Sent"
          value={String(stats.openQuotes)}
          sub="Pending follow-up"
          trend="neutral"
          change="—"
          icon={FileText}
          iconColor="text-accent"
          bgColor="bg-accent/10"
        />
        <KpiCard
          label="Revenue Pipeline"
          value="₹0.00 Cr"
          sub="No active quotes"
          trend="neutral"
          change="—"
          icon={IndianRupee}
          iconColor="text-green-400"
          bgColor="bg-green-500/10"
          sparkData={[0, 0, 0, 0, 0]}
          sparkColor="#22C55E"
        />
      </div>

      {/* ── Section: Performance Analytics ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Product Performance Analytics */}
        <div className="xl:col-span-2 bg-card shadow-sm border border-border rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Product Performance</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Top performing models by views, comparisons, and quotes</p>
            </div>
            <div className="flex gap-2">
              <select className="bg-secondary/50 border-none text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded cursor-pointer">
                <option>Last 30 Days</option>
                <option>Last Quarter</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-secondary/30 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3">Model</th>
                  <th className="px-5 py-3 text-right">Views</th>
                  <th className="px-5 py-3 text-right">Comparisons</th>
                  <th className="px-5 py-3 text-right">Quotes</th>
                  <th className="px-5 py-3 text-center">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* No products performance data yet */}
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground italic">
                    Waiting for product engagement data...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Lead Source Donut */}
        <div className="bg-card shadow-sm border border-border rounded-xl p-5 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Lead Acquisition</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Where your leads are coming from</p>
          </div>
          <div className="py-4">
            <DonutChart data={LEAD_SOURCE_DATA} />
          </div>
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Top Source</p>
              <p className="text-sm font-bold text-foreground">Website Form</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Total Leads</p>
              <p className="text-sm font-bold text-accent">{stats.totalLeads}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section: Sales & Quotes ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Sales Rep Activity */}
        <div className="bg-card shadow-sm border border-border rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Sales Rep Activity</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Presentation usage & performance</p>
            </div>
            <UserCheck size={16} className="text-blue-400" />
          </div>
          <div className="space-y-4">
            <div className="p-10 text-center text-muted-foreground italic text-[11px]">
              No sales activity recorded yet.
            </div>
          </div>
          <button className="mt-4 w-full py-2.5 bg-secondary text-[11px] font-bold text-muted-foreground hover:text-foreground rounded-lg border border-border transition-all">
            View All Sales Metrics
          </button>
        </div>

        {/* Quote Analytics */}
        <div className="bg-card shadow-sm border border-border rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-foreground">Quote Analytics</h3>
              <IndianRupee size={16} className="text-green-500" />
            </div>
            <p className="text-[11px] text-muted-foreground mb-4">Value and conversion of sent quotations</p>
          </div>
          
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-end mb-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Value Sent</p>
                <p className="text-lg font-bold text-foreground">₹0.00 Cr</p>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent rounded-full transition-all duration-1000" 
                  style={{ width: `0%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                <span>Monthly Target</span>
                <span>₹2.5 Cr</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                <p className="text-[10px] font-bold text-green-400 uppercase mb-1">Acceptance</p>
                <p className="text-xl font-bold text-foreground">0%</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Avg Deal</p>
                <p className="text-xl font-bold text-foreground">₹0k</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Pending approvals: <span className="text-foreground font-bold">0</span></span>
            <button className="text-[11px] font-bold text-accent hover:underline">Review Quotes</button>
          </div>
        </div>

        {/* Revenue Forecast */}
        <div className="bg-card shadow-sm border border-border rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Revenue Forecast</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Projected pipeline conversion</p>
            </div>
            <BarChart3 size={16} className="text-purple-400" />
          </div>
          <div className="relative h-32 mb-4">
            {(() => {
              const max = Math.max(...REVENUE_FORECAST.map(d => d.revenue));
              return (
                <div className="flex items-end justify-between h-full gap-2">
                  {REVENUE_FORECAST.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full relative flex items-end justify-center">
                         {/* Full Pipeline */}
                        <div 
                          className="w-full bg-secondary rounded-t-sm transition-all duration-1000" 
                          style={{ height: `${(d.revenue / max) * 100}%` }}
                        />
                        {/* Weighted Forecast */}
                        <div 
                          className="absolute w-full bg-purple-500/40 rounded-t-sm transition-all duration-1000" 
                          style={{ height: `${(d.weighted / max) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground">{d.month}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
          <div className="space-y-2 mt-auto">
            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-muted-foreground">Total Quoted Pipeline</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-2 h-2 rounded-full bg-purple-500/40" />
              <span className="text-muted-foreground">Weighted (Probability) Forecast</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section: Dealers & Funnel ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deal Pipeline Funnel */}
        <div className="bg-card shadow-sm border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Lead Funnel</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Current leads across all stages</p>
            </div>
            <button
              onClick={() => navigate("/admin/leads/pipeline")}
              className="text-[11px] font-bold text-accent hover:text-accent flex items-center gap-1 transition-colors"
            >
              View Board <ArrowRight size={12} />
            </button>
          </div>
          <PipelineFunnel data={PIPELINE_DATA} />
        </div>

        {/* Dealer Activity */}
        <div className="bg-card shadow-sm border border-border rounded-xl p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Active Dealers</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Regional partner performance</p>
            </div>
            <Briefcase size={16} className="text-amber-400" />
          </div>
          <div className="space-y-3">
            <div className="p-10 text-center text-muted-foreground italic text-[11px]">
              No active dealer partners found.
            </div>
          </div>
          <button className="mt-4 w-full py-2.5 bg-secondary text-[11px] font-bold text-muted-foreground hover:text-foreground rounded-lg border border-border transition-all">
            Manage Partner Network
          </button>
        </div>
      </div>

      {/* Bottom Row: Recent Leads + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Leads */}
        <div className="xl:col-span-2 bg-card shadow-sm border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Recent Leads</h3>
            <button
              onClick={() => navigate("/admin/leads")}
              className="text-xs text-accent hover:text-accent flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-border">
            {stats.recentLeads.length > 0 ? stats.recentLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-4 px-5 py-3 hover:bg-secondary transition-colors cursor-pointer group"
                onClick={() => navigate(`/admin/leads/${lead.id}`)}
              >
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-muted-foreground">{lead.name.slice(0, 2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-foreground transition-colors truncate">{lead.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{lead.company || 'Private'} · {lead.city || 'Unknown'}</p>
                </div>
                <div className="hidden sm:block text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-accent">{lead.kva_required || lead.kvaRequired || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">{lead.application || 'General'}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex-shrink-0 ${STAGE_COLORS[lead.stage] || 'bg-slate-700/50 text-slate-300'}`}>
                  {STAGE_LABELS[lead.stage] || 'New'}
                </span>
              </div>
            )) : (
              <div className="p-10 text-center text-muted-foreground italic text-sm">
                No recent leads found.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card shadow-sm border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Add New Lead", icon: Users, path: "/admin/leads", color: "text-blue-400 bg-blue-500/10" },
              { label: "Create Quotation", icon: FileText, path: "/admin/orders/quotations", color: "text-accent bg-accent/10" },
              { label: "Add Product", icon: Package, path: "/admin/products/add", color: "text-purple-400 bg-purple-500/10" },
              { label: "View Follow-ups", icon: AlertCircle, path: "/admin/leads/followups", color: "text-orange-400 bg-orange-500/10" },
              { label: "Service Tickets", icon: Calendar, path: "/admin/service", color: "text-rose-400 bg-rose-500/10" },
            ].map(({ label, icon: Icon, path, color }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors group text-left"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon size={14} />
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
                <ArrowRight size={13} className="ml-auto text-muted-foreground group-hover:text-muted-foreground transition-colors" />
              </button>
            ))}
          </div>

          {/* Today's summary */}
          <div className="mt-5 pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Today's Summary</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">New leads today</span>
                <span className="text-foreground font-medium">3</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Follow-ups due</span>
                <span className="text-orange-400 font-medium">5</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Overdue tasks</span>
                <span className="text-red-400 font-medium">2</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">AMC renewals (30d)</span>
                <span className="text-accent font-medium">4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
