import { useState, useEffect } from "react";
import {
  BarChart2, TrendingUp, Users, Package,
  Download, Calendar, Filter, Globe,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ─── Simple Bar Chart (SVG) ──────────────────────────────────────────────────
function BarChart({
  data, color = "#D97706", height = 120,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="w-full">
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground font-semibold">{item.value}</span>
            <div
              className="w-full rounded-t-md transition-all duration-700 hover:opacity-80 cursor-pointer"
              style={{
                height: `${Math.max((item.value / max) * (height - 24), 4)}px`,
                backgroundColor: color,
                opacity: 0.7 + (i / data.length) * 0.3,
              }}
              title={`${item.label}: ${item.value}`}
            />
          </div>
        ))}
      </div>
      <div className="flex items-start gap-2 mt-2">
        {data.map((item, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[9px] text-muted-foreground leading-tight">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string; sub: string; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-card shadow-sm border border-border rounded-xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={15} className="text-current" />
        </div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground font-display">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

export default function AdminReports() {
  const [dateRange, setDateRange] = useState("this_month");
  const [activeReport, setActiveReport] = useState<"overview" | "leads" | "products" | "regional">("overview");
  const [stats, setStats] = useState({
    totalLeads: 0,
    wonLeads: 0,
    conversionRate: 0,
    totalInquiries: 0,
    isLoading: true
  });

  useEffect(() => {
    async function fetchReportData() {
      try {
        const { count: leadCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });
        const { count: wonCount } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('stage', 'won');
        const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });

        setStats({
          totalLeads: leadCount || 0,
          wonLeads: wonCount || 0,
          conversionRate: leadCount ? Math.round((wonCount || 0) / leadCount * 100) : 0,
          totalInquiries: 0, // Placeholder
          isLoading: false
        });
      } catch (e) {
        console.error(e);
      }
    }
    fetchReportData();
  }, []);

  const REPORT_TABS = [
    { key: "overview", label: "Overview", icon: BarChart2 },
    { key: "leads", label: "Lead Report", icon: Users },
    { key: "products", label: "Product Performance", icon: Package },
    { key: "regional", label: "Regional", icon: Globe },
  ] as const;

  const stateData = [
    { label: "Gujarat", value: 38 },
    { label: "Maharashtra", value: 29 },
    { label: "Rajasthan", value: 18 },
    { label: "MP", value: 9 },
    { label: "Goa", value: 6 },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Business intelligence across sales, leads, and products</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-card shadow-sm border border-border rounded-lg text-sm text-muted-foreground focus:outline-none focus:border-accent/50"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="custom">Custom Range</option>
          </select>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Filter size={14} /> Filter
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent/90 rounded-lg text-sm font-bold text-accent-foreground transition-colors">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-1 border-b border-border">
        {REPORT_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveReport(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeReport === key
                ? "text-accent border-accent"
                : "text-muted-foreground border-transparent hover:text-muted-foreground"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeReport === "overview" && (
        <div className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Total Leads"
              value={String(stats.totalLeads)}
              sub="+0% vs last month"
              icon={Users}
              color="bg-blue-500/15 text-blue-400"
            />
            <MetricCard
              label="Won Deals"
              value={String(stats.wonLeads)}
              sub={`Est. ₹0L revenue`}
              icon={TrendingUp}
              color="bg-green-500/15 text-green-400"
            />
            <MetricCard
              label="Conversion Rate"
              value={`${stats.conversionRate}%`}
              sub={`${stats.wonLeads} won of ${stats.totalLeads} total`}
              icon={BarChart2}
              color="bg-accent/15 text-accent"
            />
            <MetricCard
              label="Product Inquiries"
              value="0"
              sub="Across all products"
              icon={Package}
              color="bg-purple-500/15 text-purple-400"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card shadow-sm border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Lead Volume — Daily Trend</h3>
              <div className="p-10 text-center text-muted-foreground italic text-xs">
                No trend data available.
              </div>
            </div>

            <div className="bg-card shadow-sm border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Pipeline Conversion Funnel</h3>
              <div className="p-10 text-center text-muted-foreground italic text-xs">
                Waiting for lead movement...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LEADS REPORT ── */}
      {activeReport === "leads" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "New Leads", value: stats.totalLeads, color: "text-slate-400" },
              { label: "In Pipeline", value: 0, color: "text-accent" },
              { label: "Won", value: stats.wonLeads, color: "text-green-400" },
              { label: "Lost", value: 0, color: "text-red-400" },
            ].map((s) => (
              <div key={s.label} className="bg-card shadow-sm border border-border rounded-xl p-4">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card shadow-sm border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Leads by Source</h3>
              <div className="space-y-3">
              <div className="p-10 text-center text-muted-foreground italic text-xs">
                No source data available.
              </div>
              </div>
            </div>

            <div className="bg-card shadow-sm border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Demand by kVA Range</h3>
              <div className="p-10 text-center text-muted-foreground italic text-xs">
                No demand data available.
              </div>
            </div>
          </div>

          {/* Lead Summary Table */}
          <div className="bg-card shadow-sm border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Lead Summary by Assigned Rep</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  {["Sales Rep", "Assigned", "Won", "Lost", "Active", "Conversion"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground italic">
                    No sales rep performance data recorded.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PRODUCTS ── */}
      {activeReport === "products" && (
        <div className="space-y-4">
          <div className="bg-card shadow-sm border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Product Inquiry Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Product", "Category", "kVA", "Price", "Inquiries", "Share", "Stock"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground italic">
                      No product performance data available.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── REGIONAL ── */}
      {activeReport === "regional" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card shadow-sm border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Leads by State</h3>
              <BarChart data={stateData} color="#D97706" height={140} />
            </div>
            <div className="bg-card shadow-sm border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">State-wise Breakdown</h3>
              <div className="space-y-3">
                {[
                  { state: "Gujarat", leads: 38, won: 4, revenue: "₹24L" },
                  { state: "Maharashtra", leads: 29, won: 2, revenue: "₹18L" },
                  { state: "Rajasthan", leads: 18, won: 2, revenue: "₹12L" },
                  { state: "Madhya Pradesh", leads: 9, won: 1, revenue: "₹6L" },
                  { state: "Goa", leads: 6, won: 0, revenue: "—" },
                ].map((row) => (
                  <div key={row.state} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{row.state}</p>
                      <p className="text-xs text-muted-foreground">{row.leads} leads · {row.won} won</p>
                    </div>
                    <span className="text-sm font-semibold text-accent">{row.revenue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
