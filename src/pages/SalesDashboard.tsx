import { useAuth } from "@/components/auth/AuthContext";
import { SEO } from "@/components/site/SEO";
import { BarChart3, ClipboardList, LogOut, Package, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function SalesDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const displayName = profile?.full_name || user?.email || "Sales Executive";

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  return (
    <>
      <SEO title="Sales Dashboard | Aditya Genset" description="Sales executive workspace for Aditya Genset." />
      <div className="min-h-screen bg-background px-4 py-20 md:px-10 md:py-12">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Sales Workspace</p>
              <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Welcome, {displayName}</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Access product information, assigned lead activity, and presentation tools from your sales dashboard.
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { label: "Assigned Leads", value: "Role-based", icon: ClipboardList },
              { label: "Product Catalogue", value: "Available", icon: Package },
              { label: "Sales Role", value: profile?.role || "Sales Executive", icon: UserCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-xl font-bold text-foreground">{item.value}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Icon size={18} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <BarChart3 size={18} className="text-accent" />
              <h2 className="text-base font-semibold text-foreground">Sales dashboard ready</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Supabase row-level security controls which leads and records this user can read. Sales Executives are limited to records assigned to their auth user ID.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
