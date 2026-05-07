import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Briefcase,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  Package,
  Plus,
  Printer,
  Settings,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type RevenueForecastItem = { month: string; revenue: number; weighted: number };
type ProductStatusItem = { name: string; value: number; color: string };
type ProductPerformanceItem = {
  id: string;
  model: string;
  name: string;
  status: string;
  inquiries: number;
  presentations: number;
  comparisons: number;
  quotes: number;
};
type SalesActivityItem = {
  id: string;
  name: string;
  presentations: number;
  quotesSent: number;
  lastActive: string;
};

type DashboardProduct = {
  id: string;
  name: string | null;
  model: string | null;
  status: string | null;
  inquiries: number | null;
};
type DashboardQuote = {
  id: string;
  status: string | null;
  total_amount: number | string | null;
  created_by_user_id: string | null;
  created_at: string | null;
  sent_at: string | null;
  accepted_at: string | null;
};
type DashboardProfile = {
  user_id: string;
  role: string | null;
  full_name: string | null;
};
type DashboardPresentation = {
  id: string;
  product_id: string | null;
  created_by_user_id: string | null;
  last_activity_at: string | null;
};
type DashboardComparisonProduct = {
  product_id: string | null;
};
type DashboardQuoteItem = {
  product_id: string | null;
  quote_id: string | null;
};

const INR = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const PRODUCT_STATUS_COLORS: Record<string, string> = {
  published: "#22C55E",
  draft: "#94A3B8",
  archived: "#EF4444",
};
const PRODUCT_STATUS_LABELS: Record<string, string> = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
};

function numberValue(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return 0;
}

function formatCurrencyCompact(value: number) {
  if (value >= 10000000) return `Rs ${INR.format(value / 10000000)} Cr`;
  if (value >= 100000) return `Rs ${INR.format(value / 100000)} L`;
  return `Rs ${INR.format(value)}`;
}

function monthKey(dateValue: string | null) {
  const date = dateValue ? new Date(dateValue) : new Date();
  return date.toLocaleDateString("en-US", { month: "short" });
}

function getLastActivityLabel(dateValue: string | null) {
  if (!dateValue) return "No activity";
  return new Date(dateValue).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function Sparkline({ data, color = "#D97706" }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const points = data
    .map((value, index) => `${(index / (data.length - 1)) * w},${h - ((value - min) / range) * h}`)
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

function DonutChart({ data }: { data: ProductStatusItem[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (data.length === 0 || total === 0) {
    return <div className="p-8 text-center text-muted-foreground italic text-xs">No products available.</div>;
  }

  let offset = 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-6">
      <svg width={100} height={100} className="flex-shrink-0 -rotate-90">
        {data.map((item) => {
          const pct = item.value / total;
          const dash = pct * circumference;
          const segment = (
            <circle
              key={item.name}
              cx={50}
              cy={50}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="12"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset * circumference}
            />
          );
          offset += pct;
          return segment;
        })}
      </svg>
      <div className="flex flex-col gap-1.5 min-w-0">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[11px] text-muted-foreground truncate">{item.name}</span>
            <span className="text-[11px] font-semibold text-foreground ml-auto pl-2">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  sparkData?: number[];
  sparkColor?: string;
}

function KpiCard({ label, value, sub, icon: Icon, iconColor, bgColor, sparkData, sparkColor }: KpiCardProps) {
  return (
    <div className="bg-card shadow-sm border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-border transition-colors">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${bgColor}`}>
          <Icon size={18} className={iconColor} />
        </div>
        {sparkData && <Sparkline data={sparkData} color={sparkColor} />}
      </div>
      <div>
        <span className="text-2xl font-bold text-foreground font-display">{value}</span>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    archivedProducts: 0,
    productSyncRate: 0,
    totalInquiries: 0,
    activeSalesUsers: 0,
    openQuotes: 0,
    quotesSent: 0,
    acceptedQuotes: 0,
    averageDealValue: 0,
    revenuePipeline: 0,
    acceptedRevenue: 0,
    revenueForecast: [] as RevenueForecastItem[],
    productStatusData: [] as ProductStatusItem[],
    productPerformance: [] as ProductPerformanceItem[],
    salesActivity: [] as SalesActivityItem[],
    isLoading: true,
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [
          productsResult,
          quotesResult,
          profilesResult,
          presentationsResult,
          comparisonProductsResult,
          quoteItemsResult,
        ] = await Promise.all([
          supabase.from("products").select("id, name, model, inquiries, status"),
          supabase.from("quotes").select("id, status, total_amount, created_by_user_id, created_at, sent_at, accepted_at"),
          supabase.from("profiles").select("user_id, role, full_name"),
          supabase.from("presentation_sessions").select("id, product_id, created_by_user_id, last_activity_at"),
          supabase.from("comparison_session_products").select("product_id"),
          supabase.from("quote_items").select("product_id, quote_id"),
        ]);

        const error = productsResult.error || quotesResult.error || profilesResult.error ||
          presentationsResult.error || comparisonProductsResult.error || quoteItemsResult.error;
        if (error) throw error;

        const products = (productsResult.data ?? []) as DashboardProduct[];
        const quotes = (quotesResult.data ?? []) as DashboardQuote[];
        const profiles = (profilesResult.data ?? []) as DashboardProfile[];
        const presentations = (presentationsResult.data ?? []) as DashboardPresentation[];
        const comparisonProducts = (comparisonProductsResult.data ?? []) as DashboardComparisonProduct[];
        const quoteItems = (quoteItemsResult.data ?? []) as DashboardQuoteItem[];

        const activeProducts = products.filter((product) => product.status === "published").length;
        const draftProducts = products.filter((product) => product.status === "draft").length;
        const archivedProducts = products.filter((product) => product.status === "archived").length;
        const productSyncRate = products.length ? Math.round((activeProducts / products.length) * 100) : 0;
        const totalInquiries = products.reduce((sum, product) => sum + (product.inquiries ?? 0), 0);
        const activeSalesUsers = profiles.filter((profile) =>
          ["Sales Executive", "Sales Manager"].includes(profile.role ?? "")
        ).length;

        const sentQuotes = quotes.filter((quote) => ["sent", "accepted", "rejected"].includes(quote.status ?? ""));
        const acceptedQuotes = quotes.filter((quote) => quote.status === "accepted");
        const activeQuotePipeline = quotes.filter((quote) => ["sent", "draft"].includes(quote.status ?? ""));
        const revenuePipeline = activeQuotePipeline.reduce((sum, quote) => sum + numberValue(quote.total_amount), 0);
        const acceptedRevenue = acceptedQuotes.reduce((sum, quote) => sum + numberValue(quote.total_amount), 0);
        const averageDealValue = acceptedQuotes.length ? acceptedRevenue / acceptedQuotes.length : 0;

        const productStatusData = ["published", "draft", "archived"]
          .map((status) => ({
            name: PRODUCT_STATUS_LABELS[status],
            value: products.filter((product) => product.status === status).length,
            color: PRODUCT_STATUS_COLORS[status],
          }))
          .filter((item) => item.value > 0);

        const monthlyQuotes = quotes.reduce<Record<string, { revenue: number; weighted: number }>>((acc, quote) => {
          const key = monthKey(quote.sent_at || quote.created_at);
          const amount = numberValue(quote.total_amount);
          const weight = quote.status === "accepted" ? 1 : quote.status === "sent" ? 0.6 : quote.status === "draft" ? 0.25 : 0;
          acc[key] = acc[key] ?? { revenue: 0, weighted: 0 };
          acc[key].revenue += amount;
          acc[key].weighted += amount * weight;
          return acc;
        }, {});
        const revenueForecast = Object.entries(monthlyQuotes).slice(-6).map(([month, values]) => ({
          month,
          revenue: values.revenue,
          weighted: values.weighted,
        }));

        const presentationCountByProduct = presentations.reduce<Record<string, number>>((acc, session) => {
          if (session.product_id) acc[session.product_id] = (acc[session.product_id] ?? 0) + 1;
          return acc;
        }, {});
        const comparisonCountByProduct = comparisonProducts.reduce<Record<string, number>>((acc, item) => {
          if (item.product_id) acc[item.product_id] = (acc[item.product_id] ?? 0) + 1;
          return acc;
        }, {});
        const quoteCountByProduct = quoteItems.reduce<Record<string, number>>((acc, item) => {
          if (item.product_id) acc[item.product_id] = (acc[item.product_id] ?? 0) + 1;
          return acc;
        }, {});

        const productPerformance = products
          .map((product) => ({
            id: product.id,
            model: product.model || product.name || "Unnamed model",
            name: product.name || "Unnamed product",
            status: product.status || "draft",
            inquiries: product.inquiries ?? 0,
            presentations: presentationCountByProduct[product.id] ?? 0,
            comparisons: comparisonCountByProduct[product.id] ?? 0,
            quotes: quoteCountByProduct[product.id] ?? 0,
          }))
          .sort((a, b) =>
            (b.inquiries + b.presentations + b.comparisons + b.quotes) -
            (a.inquiries + a.presentations + a.comparisons + a.quotes)
          )
          .slice(0, 8);

        const salesActivity = profiles
          .filter((profile) => ["Sales Executive", "Sales Manager"].includes(profile.role ?? ""))
          .map((profile) => {
            const repPresentations = presentations.filter((session) => session.created_by_user_id === profile.user_id);
            const repQuotes = quotes.filter((quote) => quote.created_by_user_id === profile.user_id);
            const lastPresentation = repPresentations
              .map((session) => session.last_activity_at)
              .filter(Boolean)
              .sort()
              .at(-1) ?? null;

            return {
              id: profile.user_id,
              name: profile.full_name || "Unnamed user",
              presentations: repPresentations.length,
              quotesSent: repQuotes.filter((quote) => ["sent", "accepted", "rejected"].includes(quote.status ?? "")).length,
              lastActive: getLastActivityLabel(lastPresentation),
            };
          })
          .sort((a, b) => (b.presentations + b.quotesSent) - (a.presentations + a.quotesSent))
          .slice(0, 4);

        setStats({
          totalProducts: products.length,
          activeProducts,
          draftProducts,
          archivedProducts,
          productSyncRate,
          totalInquiries,
          activeSalesUsers,
          openQuotes: activeQuotePipeline.length,
          quotesSent: sentQuotes.length,
          acceptedQuotes: acceptedQuotes.length,
          averageDealValue,
          revenuePipeline,
          acceptedRevenue,
          revenueForecast,
          productStatusData,
          productPerformance,
          salesActivity,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Unable to load live dashboard data.");
        setStats((current) => ({ ...current, isLoading: false }));
      }
    }

    void fetchDashboardData();
  }, []);

  const handleExport = (format: "excel" | "pdf") => {
    if (format === "pdf") {
      window.print();
      return;
    }

    const rows = [
      ["Metric", "Value"],
      ["Total Products", stats.totalProducts],
      ["Published Products", stats.activeProducts],
      ["Draft Products", stats.draftProducts],
      ["Archived Products", stats.archivedProducts],
      ["Product Sync Rate", `${stats.productSyncRate}%`],
      ["Product Requests", stats.totalInquiries],
      ["Sales Users", stats.activeSalesUsers],
      ["Quotes Sent", stats.quotesSent],
      ["Open Quotes", stats.openQuotes],
      ["Revenue Pipeline", stats.revenuePipeline],
      ["Accepted Revenue", stats.acceptedRevenue],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Dashboard CSV exported");
  };

  return (
    <div className="admin-page space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Operations Overview</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground font-display">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} - Product Operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2.5 rounded-lg border border-border bg-card transition-all relative ${showNotifications ? "bg-secondary ring-2 ring-accent/20" : "hover:bg-secondary"}`}
              aria-label="Notifications"
            >
              <Bell size={18} className="text-muted-foreground" />
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border shadow-2xl rounded-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-border bg-secondary/50">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notifications</h3>
                  </div>
                  <div className="p-10 text-center text-muted-foreground italic text-[11px]">
                    No new notifications
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

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KpiCard
          label="Total Products"
          value={String(stats.totalProducts)}
          sub={`${stats.activeProducts} published listings`}
          icon={Package}
          iconColor="text-purple-400"
          bgColor="bg-purple-500/10"
        />
        <KpiCard
          label="Product Sync Rate"
          value={`${stats.productSyncRate}%`}
          sub={`${stats.draftProducts} draft, ${stats.archivedProducts} archived`}
          icon={BarChart3}
          iconColor="text-blue-400"
          bgColor="bg-blue-500/10"
          sparkData={[stats.draftProducts, stats.activeProducts, stats.archivedProducts]}
          sparkColor="#3B82F6"
        />
        <KpiCard
          label="Sales Users"
          value={String(stats.activeSalesUsers)}
          sub="Profiles with sales roles"
          icon={Briefcase}
          iconColor="text-amber-400"
          bgColor="bg-amber-500/10"
        />
        <KpiCard
          label="Quotes Sent"
          value={String(stats.quotesSent)}
          sub={`${stats.openQuotes} open quote records`}
          icon={FileText}
          iconColor="text-accent"
          bgColor="bg-accent/10"
        />
        <KpiCard
          label="Revenue Pipeline"
          value={formatCurrencyCompact(stats.revenuePipeline)}
          sub={`${stats.acceptedQuotes} accepted quotes`}
          icon={IndianRupee}
          iconColor="text-green-400"
          bgColor="bg-green-500/10"
          sparkData={stats.revenueForecast.map((item) => item.weighted)}
          sparkColor="#22C55E"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-card shadow-sm border border-border rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Product Performance</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Top models by presentations, comparisons, quotes, and product requests</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-secondary/30 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3">Model</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Presentations</th>
                  <th className="px-5 py-3 text-right">Comparisons</th>
                  <th className="px-5 py-3 text-right">Quotes</th>
                  <th className="px-5 py-3 text-right">Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.productPerformance.length > 0 ? stats.productPerformance.map((product) => (
                  <tr key={product.id} className="hover:bg-secondary transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{product.model}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{product.name}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground capitalize">{product.status}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{product.presentations}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{product.comparisons}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{product.quotes}</td>
                    <td className="px-5 py-3 text-right text-accent font-semibold">{product.inquiries}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground italic">
                      No product records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card shadow-sm border border-border rounded-xl p-5 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Product Status</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Published, draft, and archived inventory</p>
          </div>
          <div className="py-4">
            <DonutChart data={stats.productStatusData} />
          </div>
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Sync Rate</p>
              <p className="text-sm font-bold text-foreground">{stats.productSyncRate}%</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Requests</p>
              <p className="text-sm font-bold text-accent">{stats.totalInquiries}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-card shadow-sm border border-border rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Sales Activity</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Presentation usage and quote output</p>
            </div>
            <UserCheck size={16} className="text-blue-400" />
          </div>
          <div className="space-y-4">
            {stats.salesActivity.length > 0 ? stats.salesActivity.map((rep) => (
              <div key={rep.id} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 p-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold">
                  {rep.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{rep.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {rep.presentations} presentations - {rep.quotesSent} quotes
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground">{rep.lastActive}</span>
              </div>
            )) : (
              <div className="p-10 text-center text-muted-foreground italic text-[11px]">
                No sales activity recorded yet.
              </div>
            )}
          </div>
          <button
            onClick={() => navigate("/admin/reports")}
            className="mt-4 w-full py-2.5 bg-secondary text-[11px] font-bold text-muted-foreground hover:text-foreground rounded-lg border border-border transition-all"
          >
            View Sales Metrics
          </button>
        </div>

        <div className="bg-card shadow-sm border border-border rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-foreground">Quote Analytics</h3>
              <IndianRupee size={16} className="text-green-500" />
            </div>
            <p className="text-[11px] text-muted-foreground mb-4">Value and conversion of quotations</p>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-end mb-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Value Sent</p>
                <p className="text-lg font-bold text-foreground">{formatCurrencyCompact(stats.revenuePipeline)}</p>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((stats.revenuePipeline / 25000000) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                <span>Monthly Target</span>
                <span>Rs 2.5 Cr</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                <p className="text-[10px] font-bold text-green-400 uppercase mb-1">Acceptance</p>
                <p className="text-xl font-bold text-foreground">
                  {stats.quotesSent ? Math.round((stats.acceptedQuotes / stats.quotesSent) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Avg Deal</p>
                <p className="text-xl font-bold text-foreground">{formatCurrencyCompact(stats.averageDealValue)}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Open quotes: <span className="text-foreground font-bold">{stats.openQuotes}</span></span>
            <button
              onClick={() => navigate("/admin/reports")}
              className="text-[11px] font-bold text-accent hover:underline"
            >
              Review Reports
            </button>
          </div>
        </div>

        <div className="bg-card shadow-sm border border-border rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Revenue Forecast</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Projected quote conversion</p>
            </div>
            <BarChart3 size={16} className="text-purple-400" />
          </div>
          <div className="relative h-32 mb-4">
            {stats.revenueForecast.length > 0 ? (() => {
              const max = Math.max(...stats.revenueForecast.map((item) => item.revenue), 1);
              return (
                <div className="flex items-end justify-between h-full gap-2">
                  {stats.revenueForecast.map((item, index) => (
                    <div key={`${item.month}-${index}`} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full relative flex items-end justify-center">
                        <div
                          className="w-full bg-secondary rounded-t-sm transition-all duration-1000"
                          style={{ height: `${(item.revenue / max) * 100}%` }}
                        />
                        <div
                          className="absolute w-full bg-purple-500/40 rounded-t-sm transition-all duration-1000"
                          style={{ height: `${(item.weighted / max) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground">{item.month}</span>
                    </div>
                  ))}
                </div>
              );
            })() : (
              <div className="h-full flex items-center justify-center text-center text-muted-foreground italic text-xs">
                No quote revenue history available.
              </div>
            )}
          </div>
          <div className="space-y-2 mt-auto">
            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-muted-foreground">Total Quoted Pipeline</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-2 h-2 rounded-full bg-purple-500/40" />
              <span className="text-muted-foreground">Weighted Forecast</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-card shadow-sm border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Product Operations Summary</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Live totals from Supabase product and quote tables</p>
            </div>
            <Package size={16} className="text-purple-400" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Published", value: stats.activeProducts, color: "text-green-400" },
              { label: "Draft", value: stats.draftProducts, color: "text-muted-foreground" },
              { label: "Archived", value: stats.archivedProducts, color: "text-red-400" },
              { label: "Requests", value: stats.totalInquiries, color: "text-accent" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-border bg-secondary/40 p-4">
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card shadow-sm border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Add Product", icon: Package, path: "/admin/products/add", color: "text-purple-400 bg-purple-500/10" },
              { label: "Manage Products", icon: FileText, path: "/admin/products", color: "text-accent bg-accent/10" },
              { label: "Manage Users", icon: Users, path: "/admin/users", color: "text-blue-400 bg-blue-500/10" },
              { label: "Settings", icon: Settings, path: "/admin/settings", color: "text-muted-foreground bg-secondary" },
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
                <ArrowRight size={13} className="ml-auto text-muted-foreground transition-colors" />
              </button>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Today&apos;s Summary</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Product sync rate</span>
                <span className="text-foreground font-medium">{stats.productSyncRate}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Open quotes</span>
                <span className="text-orange-400 font-medium">{stats.openQuotes}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Product requests</span>
                <span className="text-accent font-medium">{stats.totalInquiries}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Published listings</span>
                <span className="text-green-400 font-medium">{stats.activeProducts}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
