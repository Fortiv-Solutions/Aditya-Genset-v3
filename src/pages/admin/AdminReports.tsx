import { useEffect, useMemo, useState } from "react";
import {
  BarChart2,
  Calendar,
  Download,
  FileText,
  IndianRupee,
  Package,
  PieChart,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type ProductRow = {
  id: string;
  name: string | null;
  model: string | null;
  kva: number | null;
  price: number | string | null;
  stock: string | null;
  status: string | null;
};

type QuoteRow = {
  id: string;
  status: string | null;
  total_amount: number | string | null;
  created_at: string | null;
  sent_at: string | null;
  accepted_at: string | null;
};

type QuoteItemRow = {
  product_id: string | null;
  quote_id: string | null;
};

type PresentationRow = {
  product_id: string | null;
};

const INR = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function numberValue(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return 0;
}

function formatCurrency(value: number) {
  if (value >= 10000000) return `Rs ${INR.format(value / 10000000)} Cr`;
  if (value >= 100000) return `Rs ${INR.format(value / 100000)} L`;
  return `Rs ${INR.format(value)}`;
}

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
}) {
  return (
    <div className="admin-card bg-card border border-border p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-bold text-foreground font-display">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function EmptyPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-md border border-dashed border-border bg-secondary/40 p-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

export default function AdminReports() {
  const [dateRange, setDateRange] = useState("this_month");
  const [activeReport, setActiveReport] = useState<"overview" | "products" | "quotes">("overview");
  const [data, setData] = useState({
    products: [] as ProductRow[],
    quotes: [] as QuoteRow[],
    quoteItems: [] as QuoteItemRow[],
    presentations: [] as PresentationRow[],
    loading: true,
  });

  useEffect(() => {
    async function fetchReportData() {
      try {
        const [productsResult, quotesResult, quoteItemsResult, presentationsResult] = await Promise.all([
          supabase.from("products").select("id, name, model, kva, price, stock, status"),
          supabase.from("quotes").select("id, status, total_amount, created_at, sent_at, accepted_at"),
          supabase.from("quote_items").select("product_id, quote_id"),
          supabase.from("presentation_sessions").select("product_id"),
        ]);

        const error = productsResult.error || quotesResult.error || quoteItemsResult.error || presentationsResult.error;
        if (error) throw error;

        setData({
          products: (productsResult.data ?? []) as ProductRow[],
          quotes: (quotesResult.data ?? []) as QuoteRow[],
          quoteItems: (quoteItemsResult.data ?? []) as QuoteItemRow[],
          presentations: (presentationsResult.data ?? []) as PresentationRow[],
          loading: false,
        });
      } catch (error) {
        console.error(error);
        toast.error("Unable to load report data");
        setData((current) => ({ ...current, loading: false }));
      }
    }

    void fetchReportData();
  }, []);

  const stats = useMemo(() => {
    const published = data.products.filter((product) => product.status === "published").length;
    const draft = data.products.filter((product) => product.status === "draft").length;
    const sentQuotes = data.quotes.filter((quote) => ["sent", "accepted", "rejected"].includes(quote.status ?? ""));
    const acceptedQuotes = data.quotes.filter((quote) => quote.status === "accepted");
    const quotePipeline = data.quotes
      .filter((quote) => ["draft", "sent"].includes(quote.status ?? ""))
      .reduce((sum, quote) => sum + numberValue(quote.total_amount), 0);
    const acceptedRevenue = acceptedQuotes.reduce((sum, quote) => sum + numberValue(quote.total_amount), 0);

    const quoteCountByProduct = data.quoteItems.reduce<Record<string, number>>((acc, item) => {
      if (item.product_id) acc[item.product_id] = (acc[item.product_id] ?? 0) + 1;
      return acc;
    }, {});
    const presentationCountByProduct = data.presentations.reduce<Record<string, number>>((acc, item) => {
      if (item.product_id) acc[item.product_id] = (acc[item.product_id] ?? 0) + 1;
      return acc;
    }, {});

    const productPerformance = data.products
      .map((product) => ({
        id: product.id,
        name: product.name || "Unnamed product",
        model: product.model || "-",
        kva: product.kva || 0,
        stock: product.stock || "in_stock",
        status: product.status || "draft",
        quoted: quoteCountByProduct[product.id] ?? 0,
        presentations: presentationCountByProduct[product.id] ?? 0,
      }))
      .sort((a, b) => (b.quoted + b.presentations) - (a.quoted + a.presentations));

    return {
      published,
      draft,
      syncRate: data.products.length ? Math.round((published / data.products.length) * 100) : 0,
      sentQuotes: sentQuotes.length,
      acceptedQuotes: acceptedQuotes.length,
      conversionRate: sentQuotes.length ? Math.round((acceptedQuotes.length / sentQuotes.length) * 100) : 0,
      quotePipeline,
      acceptedRevenue,
      productPerformance,
    };
  }, [data]);

  const REPORT_TABS = [
    { key: "overview", label: "Overview", icon: BarChart2 },
    { key: "products", label: "Product Performance", icon: Package },
    { key: "quotes", label: "Quote Analytics", icon: FileText },
  ] as const;

  const exportCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Products", data.products.length],
      ["Published Products", stats.published],
      ["Draft Products", stats.draft],
      ["Product Sync Rate", `${stats.syncRate}%`],
      ["Quotes Sent", stats.sentQuotes],
      ["Accepted Quotes", stats.acceptedQuotes],
      ["Quote Conversion", `${stats.conversionRate}%`],
      ["Quote Pipeline", stats.quotePipeline],
      ["Accepted Revenue", stats.acceptedRevenue],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  return (
    <div className="admin-page space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Business Intelligence</p>
          <h1 className="mt-2 text-3xl font-bold font-display">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Live product, quote, and catalogue performance from Supabase</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select
              value={dateRange}
              onChange={(event) => setDateRange(event.target.value)}
              className="border border-border bg-card py-2.5 pl-9 pr-8 text-sm text-foreground focus:outline-none"
            >
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="this_quarter">This Quarter</option>
              <option value="all_time">All Time</option>
            </select>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground shadow-sm shadow-accent/25 hover:bg-accent/90"
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {REPORT_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveReport(key)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeReport === key
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {activeReport === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Product Sync Rate" value={`${stats.syncRate}%`} sub={`${stats.published} published of ${data.products.length}`} icon={TrendingUp} />
            <MetricCard label="Quote Pipeline" value={formatCurrency(stats.quotePipeline)} sub={`${stats.sentQuotes} sent quote records`} icon={IndianRupee} />
            <MetricCard label="Quote Conversion" value={`${stats.conversionRate}%`} sub={`${stats.acceptedQuotes} accepted quotes`} icon={PieChart} />
            <MetricCard label="Catalogue Size" value={String(data.products.length)} sub={`${stats.draft} draft products`} icon={Package} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="admin-card bg-card border border-border p-5">
              <h3 className="text-base font-semibold text-foreground">Revenue Summary</h3>
              <p className="mt-1 text-sm text-muted-foreground">Accepted revenue and open quote value</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-md border border-border bg-secondary/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Accepted</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(stats.acceptedRevenue)}</p>
                </div>
                <div className="rounded-md border border-border bg-secondary/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Pipeline</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(stats.quotePipeline)}</p>
                </div>
              </div>
            </div>

            <div className="admin-card bg-card border border-border p-5">
              <h3 className="text-base font-semibold text-foreground">Catalogue Health</h3>
              <p className="mt-1 text-sm text-muted-foreground">Publication state of current inventory</p>
              <div className="mt-5 space-y-3">
                {[
                  { label: "Published", value: stats.published },
                  { label: "Draft", value: stats.draft },
                  { label: "Archived", value: data.products.filter((product) => product.status === "archived").length },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-semibold text-muted-foreground">{item.label}</span>
                      <span className="font-bold text-foreground">{item.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${data.products.length ? Math.max((item.value / data.products.length) * 100, 3) : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReport === "products" && (
        <div className="admin-card overflow-hidden border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-base font-semibold text-foreground">Product Performance</h3>
            <p className="mt-1 text-sm text-muted-foreground">Ranked by quote usage and presentation sessions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left">Product</th>
                  <th className="px-5 py-3 text-left">kVA</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-right">Presentations</th>
                  <th className="px-5 py-3 text-right">Quotes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.loading ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">Loading product analytics...</td></tr>
                ) : stats.productPerformance.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-12"><EmptyPanel>No product analytics are available yet.</EmptyPanel></td></tr>
                ) : stats.productPerformance.map((product) => (
                  <tr key={product.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.model}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{product.kva}</td>
                    <td className="px-5 py-4 text-muted-foreground capitalize">{product.status}</td>
                    <td className="px-5 py-4 text-right font-semibold text-foreground">{product.presentations}</td>
                    <td className="px-5 py-4 text-right font-semibold text-accent">{product.quoted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === "quotes" && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <MetricCard label="Quotes Sent" value={String(stats.sentQuotes)} sub="Sent, accepted, or rejected" icon={FileText} />
          <MetricCard label="Accepted Quotes" value={String(stats.acceptedQuotes)} sub={formatCurrency(stats.acceptedRevenue)} icon={TrendingUp} />
          <MetricCard label="Open Pipeline" value={formatCurrency(stats.quotePipeline)} sub="Draft and sent quotes" icon={IndianRupee} />
        </div>
      )}
    </div>
  );
}
