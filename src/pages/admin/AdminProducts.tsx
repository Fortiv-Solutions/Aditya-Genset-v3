import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, Filter, Edit2, Copy, Trash2, Eye,
  ChevronUp, ChevronDown, Package, ArrowLeft,
} from "lucide-react";
import { AdminProduct } from "@/data/adminData";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
  FileSpreadsheet, History, FilterX, MoreVertical
} from "lucide-react";

const STATUS_STYLES = {
  published: "bg-green-900/50 text-green-300 border-green-700/50",
  draft: "bg-stone-700/50 text-muted-foreground border-border/50",
  archived: "bg-red-900/30 text-red-400 border-red-800/50",
};

const STOCK_STYLES = {
  in_stock: "text-green-400",
  on_order: "text-accent",
  discontinued: "text-red-400",
};

const STOCK_LABELS = {
  in_stock: "In Stock",
  on_order: "On Order",
  discontinued: "Discontinued",
};

type SortField = "name" | "kva" | "price" | "inquiries" | "status";

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("kva");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, model, slug, kva, engine_brand, type, cpcb, price, stock, inquiries, status, product_categories(name)")
        .order("kva", { ascending: true });

      if (error) throw error;

      const mapped: AdminProduct[] = (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        model: p.model || p.slug,
        kva: Number(p.kva || 0),
        engineBrand: p.engine_brand || "N/A",
        type: p.type || "silent",
        cpcb: p.cpcb === "ii" || p.cpcb === "II" ? "II" : "IV+",
        price: p.price ? Number(p.price) : null,
        stock: p.stock || "in_stock",
        inquiries: p.inquiries || 0,
        status: p.status || "draft",
        category: p.product_categories?.name || "DG Sets",
      }));

      setProducts(mapped);
    } catch (e) {
      console.error(e);
      toast.error("Unable to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = products
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.model.toLowerCase().includes(search.toLowerCase()) ||
        p.engineBrand.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || p.status === filterStatus;
      const matchType = filterType === "all" || p.type === filterType;
      return matchSearch && matchStatus && matchType;
    })
    .sort((a, b) => {
      let aVal: string | number = a[sortField] ?? "";
      let bVal: string | number = b[sortField] ?? "";
      if (sortField === "price") {
        aVal = a.price ?? 0;
        bVal = b.price ?? 0;
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };

  const updateProductStatus = async (ids: string[], status: AdminProduct["status"]) => {
    const { error } = await supabase.from("products").update({ status }).in("id", ids);
    if (error) throw error;
    setProducts((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, status } : p)));
  };

  const toggleStatus = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const nextStatus = product.status === "published" ? "draft" : "published";
    try {
      await updateProductStatus([id], nextStatus);
      toast.success(`Product marked as ${nextStatus}`);
    } catch (error) {
      console.error(error);
      toast.error("Unable to update product status");
    }
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
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error("Unable to duplicate product");
    }
  };

  const archiveProduct = async (id: string) => {
    try {
      await updateProductStatus([id], "archived");
      toast.info("Product moved to archives");
    } catch (error) {
      console.error(error);
      toast.error("Unable to archive product");
    }
  };

  const deleteProducts = async (ids: string[]) => {
    if (!window.confirm(`Delete ${ids.length} product${ids.length === 1 ? "" : "s"} permanently?`)) return;
    try {
      const { error } = await supabase.from("products").delete().in("id", ids);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
      setSelected(new Set());
      toast.success("Product deleted");
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete product");
    }
  };

  const handleBulkAction = async (action: "Publish" | "Draft" | "Delete") => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;

    try {
      if (action === "Delete") {
        await deleteProducts(ids);
        return;
      }
      await updateProductStatus(ids, action === "Publish" ? "published" : "draft");
      setSelected(new Set());
      toast.success(`${ids.length} product${ids.length === 1 ? "" : "s"} updated`);
    } catch (error) {
      console.error(error);
      toast.error("Bulk update failed");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="ml-1 inline-flex flex-col">
      <ChevronUp
        size={10}
        className={sortField === field && sortDir === "asc" ? "text-accent" : "text-muted-foreground"}
      />
      <ChevronDown
        size={10}
        className={sortField === field && sortDir === "desc" ? "text-accent" : "text-muted-foreground"}
      />
    </span>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Product Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {products.filter((p) => p.status === "published").length} published ·{" "}
            {products.filter((p) => p.status === "draft").length} draft ·{" "}
            {products.length} total
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/products/add")}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 rounded-lg text-sm font-bold text-accent-foreground transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Published", value: products.filter((p) => p.status === "published").length, color: "text-green-400" },
          { label: "Draft", value: products.filter((p) => p.status === "draft").length, color: "text-muted-foreground" },
          { label: "Silent Type", value: products.filter((p) => p.type === "silent").length, color: "text-accent" },
          { label: "Total Inquiries", value: products.reduce((s, p) => s + p.inquiries, 0), color: "text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="bg-card shadow-sm border border-border rounded-lg px-4 py-3">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, model, or engine brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card shadow-sm border border-border rounded-lg text-sm text-muted-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 bg-card shadow-sm border border-border rounded-lg text-sm text-muted-foreground focus:outline-none focus:border-accent/50 transition-all"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2.5 bg-card shadow-sm border border-border rounded-lg text-sm text-muted-foreground focus:outline-none focus:border-accent/50 transition-all"
          >
            <option value="all">All Types</option>
            <option value="silent">Silent</option>
            <option value="open">Open</option>
          </select>
          <button 
            onClick={() => {
              setSearch("");
              setFilterStatus("all");
              setFilterType("all");
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-card shadow-sm border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <FilterX size={14} /> Reset
          </button>
          <div className="h-full w-px bg-border mx-1 hidden sm:block" />
          <button className="flex items-center gap-1.5 px-4 py-2.5 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-sm font-medium text-muted-foreground transition-colors">
            <FileSpreadsheet size={15} className="text-green-500" />
            Bulk Import
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-accent/10 border border-accent/30 rounded-lg">
          <span className="text-sm font-medium text-accent">{selected.size} selected</span>
          <div className="flex gap-2 ml-auto">
            {(["Publish", "Draft", "Delete"] as const).map((action) => (
              <button
                key={action}
                onClick={() => handleBulkAction(action)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  action === "Delete"
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : "bg-secondary text-muted-foreground hover:bg-secondary"
                }`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card shadow-sm border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="rounded border-border accent-amber-500"
                  />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => toggleSort("name")}
                >
                  Product <SortIcon field="name" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => toggleSort("kva")}
                >
                  kVA <SortIcon field="kva" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Engine</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">CPCB</th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => toggleSort("price")}
                >
                  Price (INR) <SortIcon field="price" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock</th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => toggleSort("inquiries")}
                >
                  Inquiries <SortIcon field="inquiries" />
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => toggleSort("status")}
                >
                  Status <SortIcon field="status" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((product, i) => (
                <tr
                  key={product.id}
                  className={`hover:bg-secondary transition-colors ${i % 2 === 0 ? "" : "bg-secondary"}`}
                >
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={selected.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="rounded border-border accent-amber-500"
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Package size={16} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-accent">{product.kva}</span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{product.engineBrand}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      product.cpcb === "IV+" ? "bg-green-900/30 text-green-400 border-green-700/40" : "bg-stone-700/30 text-muted-foreground border-border/40"
                    }`}>
                      {product.cpcb}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {product.price
                      ? `₹${(product.price / 100000).toFixed(1)}L`
                      : <span className="text-muted-foreground text-xs">On Request</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-medium ${STOCK_STYLES[product.stock]}`}>
                      {STOCK_LABELS[product.stock]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min((product.inquiries / 70) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{product.inquiries}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => toggleStatus(product.id)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-opacity hover:opacity-80 ${STATUS_STYLES[product.status]}`}
                    >
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        title="Edit"
                        onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-md text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        title="Preview"
                        onClick={() => navigate(`/products/${product.model}`)}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                        title="Duplicate"
                        onClick={() => duplicateProduct(product)}
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-md text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                        title="Archive"
                        onClick={() => archiveProduct(product.id)}
                      >
                        <History size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                        onClick={() => deleteProducts([product.id])}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package size={40} className="text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium">No products found</p>
            <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters or search query</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of {products.length} products</p>
          <div className="flex gap-1">
            {[1].map((page) => (
              <button
                key={page}
                className="w-7 h-7 rounded-md text-xs font-medium bg-accent/20 text-accent border border-accent/30"
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
