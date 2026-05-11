import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Archive,
  Check,
  Copy,
  Edit2,
  Eye,
  FilterX,
  History,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AdminProduct } from "@/data/adminData";
import { supabase } from "@/lib/supabase";

const STATUS_STYLES: Record<AdminProduct["status"], string> = {
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  archived: "bg-red-50 text-red-700 border-red-200",
};

const STOCK_STYLES: Record<AdminProduct["stock"], string> = {
  in_stock: "text-emerald-700 bg-emerald-50 border-emerald-200",
  on_order: "text-amber-700 bg-amber-50 border-amber-200",
  discontinued: "text-red-700 bg-red-50 border-red-200",
};

const STOCK_LABELS: Record<AdminProduct["stock"], string> = {
  in_stock: "In Stock",
  on_order: "On Order",
  discontinued: "Discontinued",
};

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ElementType;
}) {
  return (
    <div className="admin-card bg-card border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold text-foreground font-display">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent">
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}

function IconButton({
  label,
  children,
  onClick,
  danger,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center border transition-colors ${
        danger
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, model, slug, kva, engine_brand, type, cpcb, price, stock, inquiries, status, product_categories(name), product_specs(*)")
        .order("kva", { ascending: true });

      if (error) throw error;

      const mapped: AdminProduct[] = (data || [])
        .map((p) => ({
          id: p.id,
          name: p.name,
          model: p.model || p.slug,
          slug: p.slug || p.model,
          kva: Number(p.kva || 0),
          engineBrand: p.engine_brand || "N/A",
          type: p.type || "silent",
          cpcb: p.cpcb === "ii" || p.cpcb === "II" ? "II" : "IV+",
          price: p.price ? Number(p.price) : null,
          stock: p.stock || "in_stock",
          inquiries: p.inquiries || 0,
          status: p.status || "draft",
          category: (p.product_categories as any)?.name || p.product_categories?.[0]?.name || "DG Sets",
        }));

      setProducts(mapped);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const searchable = `${product.name} ${product.model} ${product.engineBrand} ${product.category}`.toLowerCase();
      const matchSearch = !query || searchable.includes(query);
      const matchStatus = filterStatus === "all" || product.status === filterStatus;
      const matchType = filterType === "all" || product.type === filterType;
      return matchSearch && matchStatus && matchType;
    });
  }, [filterStatus, filterType, products, search]);

  const published = products.filter((product) => product.status === "published").length;
  const draft = products.filter((product) => product.status === "draft").length;
  const archived = products.filter((product) => product.status === "archived").length;
  const syncRate = products.length ? Math.round((published / products.length) * 100) : 0;

  const updateProductStatus = async (ids: string[], status: AdminProduct["status"]) => {
    const { error } = await supabase.from("products").update({ status }).in("id", ids);
    if (error) throw error;
    setProducts((prev) => prev.map((product) => (ids.includes(product.id) ? { ...product, status } : product)));
  };

  const toggleSelect = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((current) => current.size === filtered.length ? new Set() : new Set(filtered.map((product) => product.id)));
  };

  const duplicateProduct = async (product: AdminProduct) => {
    try {
      const slug = `${product.model.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-copy-${Date.now()}`;
      const { error } = await supabase.from("products").insert({
        name: `${product.name} (Copy)`,
        model: `${product.model}-copy`,
        slug,
        kva: product.kva,
        engine_brand: product.engineBrand,
        type: product.type,
        cpcb: product.cpcb,
        price: product.price,
        price_on_request: !product.price,
        stock: product.stock,
        status: "draft",
        inquiries: 0,
      });

      if (error) throw error;
      toast.success("Product duplicated as draft");
      void fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error("Unable to duplicate product");
    }
  };

  const deleteProducts = async (ids: string[]) => {
    if (!window.confirm(`Delete ${ids.length} product${ids.length === 1 ? "" : "s"} permanently?`)) return;
    try {
      const { error } = await supabase.from("products").delete().in("id", ids);
      if (error) throw error;
      setProducts((prev) => prev.filter((product) => !ids.includes(product.id)));
      setSelected(new Set());
      toast.success("Product deleted");
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete product");
    }
  };

  const bulkUpdate = async (status: AdminProduct["status"]) => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    try {
      await updateProductStatus(ids, status);
      setSelected(new Set());
      toast.success(`${ids.length} product${ids.length === 1 ? "" : "s"} updated`);
    } catch (error) {
      console.error(error);
      toast.error("Bulk update failed");
    }
  };

  return (
    <div className="admin-page space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Inventory Console</p>
          <h1 className="mt-2 text-3xl font-bold font-display">Product Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {published} published - {draft} draft - {products.length} total listings
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate("/admin/products/add")}
            className="inline-flex items-center gap-2 bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground shadow-sm shadow-accent/25 transition-colors hover:bg-accent/90"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Published" value={published} detail={`${syncRate}% product sync rate`} icon={Check} />
        <StatCard label="Draft" value={draft} detail="Needs review before listing" icon={Edit2} />
        <StatCard label="Archived" value={archived} detail="Hidden from catalogue" icon={Archive} />
        <StatCard label="Product Types" value={new Set(products.map((product) => product.type)).size} detail="Live type coverage" icon={Package} />
      </div>

      <div className="admin-card bg-card border border-border p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products by name, model, category, or engine..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full border border-border bg-background py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={filterType}
              onChange={(event) => setFilterType(event.target.value)}
              className="border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="silent">Silent</option>
              <option value="open">Open</option>
            </select>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilterStatus("all");
                setFilterType("all");
              }}
              className="inline-flex items-center gap-2 border border-border bg-background px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <FilterX size={15} />
              Reset
            </button>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-md border border-accent/30 bg-accent/10 px-3 py-2.5">
            <span className="text-sm font-bold text-foreground">{selected.size} selected</span>
            <div className="ml-auto flex flex-wrap gap-2">
              <button onClick={() => bulkUpdate("published")} className="border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-secondary">Publish</button>
              <button onClick={() => bulkUpdate("draft")} className="border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-secondary">Draft</button>
              <button onClick={() => void deleteProducts(Array.from(selected))} className="border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100">Delete</button>
            </div>
          </div>
        )}
      </div>

      <div className="admin-card overflow-hidden border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="w-12 px-5 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onChange={toggleAll}
                    className="rounded border-border accent-amber-500"
                  />
                </th>
                <th className="px-5 py-3 text-left">Product</th>
                <th className="px-5 py-3 text-left">Power</th>
                <th className="px-5 py-3 text-left">Engine</th>
                <th className="px-5 py-3 text-left">Compliance</th>
                <th className="px-5 py-3 text-left">Price</th>
                <th className="px-5 py-3 text-left">Stock</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-14 text-center text-muted-foreground">
                    Loading product catalogue...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-14 text-center">
                    <Package size={36} className="mx-auto mb-3 text-muted-foreground" />
                    <p className="font-semibold text-foreground">No products found</p>
                    <p className="mt-1 text-sm text-muted-foreground">Adjust filters or create a new listing.</p>
                  </td>
                </tr>
              ) : filtered.map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selected.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="rounded border-border accent-amber-500"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground">
                        <Package size={17} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">{product.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{product.model} - {product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-bold text-accent">{product.kva}</span>
                    <span className="ml-1 text-xs text-muted-foreground">kVA</span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{product.engineBrand}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                      CPCB {product.cpcb}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {product.price ? `Rs ${(product.price / 100000).toFixed(1)}L` : "On Request"}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-md border px-2 py-1 text-[11px] font-bold ${STOCK_STYLES[product.stock]}`}>
                      {STOCK_LABELS[product.stock]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (product.status === "archived") return;
                        void updateProductStatus([product.id], product.status === "published" ? "draft" : "published");
                      }}
                      title={product.status === "archived" ? "Archived products must be edited or bulk-updated to republish" : "Toggle published/draft"}
                      className={`inline-flex rounded-md border px-2.5 py-1 text-[11px] font-bold capitalize transition-opacity ${
                        product.status === "archived" ? "cursor-not-allowed opacity-75" : "hover:opacity-80"
                      } ${STATUS_STYLES[product.status]}`}
                    >
                      {product.status}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <IconButton label="Edit" onClick={() => navigate(`/admin/products/${product.id}/edit`)}>
                        <Edit2 size={15} />
                      </IconButton>
                      <IconButton label="Preview" onClick={() => navigate(`/products/${product.slug}`)}>
                        <Eye size={15} />
                      </IconButton>
                      <IconButton label="Duplicate" onClick={() => void duplicateProduct(product)}>
                        <Copy size={15} />
                      </IconButton>
                      <IconButton label="Archive" onClick={() => void updateProductStatus([product.id], "archived")}>
                        <History size={15} />
                      </IconButton>
                      <IconButton label="Delete" onClick={() => void deleteProducts([product.id])} danger>
                        <Trash2 size={15} />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-2 border-t border-border px-5 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Showing {filtered.length} of {products.length} products</span>
          <span>Sync rate: <strong className="text-foreground">{syncRate}%</strong></span>
        </div>
      </div>
    </div>
  );
}
