import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, FileText,
  ShieldCheck, BarChart2,
  Settings, ChevronRight, Bell, Search, Plus, LogOut,
  Menu, X, Globe
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthContext";
import logo from "@/assets/brand/logo.png";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  sub?: { label: string; path: string }[];
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
  },
  {
    label: "Products",
    icon: Package,
    path: "/admin/products",
  },
  {
    label: "CMS / Content",
    icon: FileText,
    path: "/admin/cms",
  },
  {
    label: "Users & Roles",
    icon: ShieldCheck,
    path: "/admin/users",
  },
  {
    label: "Reports",
    icon: BarChart2,
    path: "/admin/reports",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  const userName = profile?.full_name || user?.email || "Admin";
  const userInitials = (profile?.full_name || user?.email || "AD")
    .split(/[ @.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AD";

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const currentSection = NAV_ITEMS.find((item) => isActive(item.path))?.label ?? "Dashboard";

  const handleGlobalSearch = () => {
    const query = globalSearch.trim().toLowerCase();
    if (!query) return;

    if (query.includes("user") || query.includes("role")) {
      navigate("/admin/users");
      return;
    }

    if (query.includes("report")) {
      navigate("/admin/reports");
      return;
    }

    if (query.includes("setting")) {
      navigate("/admin/settings");
      return;
    }

    if (query.includes("cms") || query.includes("content")) {
      navigate("/admin/cms");
      return;
    }

    navigate("/admin/products");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center border-b border-border ${sidebarOpen ? "px-5 py-4" : "justify-center px-2 py-5"}`}>
        <Link to="/" className="flex min-w-0 items-center">
          <img
            src={logo}
            alt="Aditya"
            className={`${sidebarOpen ? "h-12 max-w-[185px]" : "h-8 max-w-10"} w-auto object-contain mix-blend-multiply`}
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <div key={item.path}>
              <button
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 group relative rounded-md
                  ${active
                    ? "text-foreground bg-accent/10 shadow-sm ring-1 ring-accent/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-md ${active ? "bg-accent text-accent-foreground" : "bg-transparent"}`}>
                  <Icon size={16} className="flex-shrink-0" />
                </span>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left font-semibold">{item.label}</span>
                    {item.badge && (
                      <span className="bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-border p-4">
        {sidebarOpen ? (
          <div className="flex items-center gap-3 rounded-md border border-border bg-secondary/50 p-2.5">
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-accent">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{userName}</p>
              <p className="text-[10px] text-muted-foreground">{profile?.role || "Admin"}</p>
            </div>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="w-full flex justify-center text-muted-foreground hover:text-red-400 transition-colors">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="admin-shell flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`admin-sidebar hidden lg:flex flex-col transition-all duration-300 flex-shrink-0 ${
          sidebarOpen ? "w-[260px]" : "w-16"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="admin-sidebar relative z-10 w-64 flex flex-col h-full">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="admin-header flex-shrink-0 flex items-center gap-4 px-4 md:px-7 py-4">
          {/* Left: Toggle + Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSidebarOpen(!sidebarOpen);
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="text-accent font-semibold">Admin</span>
              {location.pathname !== "/admin" && (
                <>
                  <ChevronRight size={13} />
                  <span className="text-foreground font-semibold">{currentSection}</span>
                </>
              )}
            </div>
          </div>

          {/* Centre: Global Search */}
          <div className="flex-1 max-w-xl mx-auto hidden md:block">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products, content, users..."
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleGlobalSearch();
                }}
                className="w-full pl-9 pr-4 py-2.5 bg-secondary/70 border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 focus:bg-card transition-all"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <Link 
              to="/home"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 border border-border hover:bg-secondary text-xs font-semibold text-muted-foreground transition-colors mr-2"
            >
              <Globe size={14} />
              View Site
            </Link>
            <button
              onClick={() => navigate("/admin/products/add")}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:bg-accent/90 text-xs font-bold text-accent-foreground shadow-sm shadow-accent/25 transition-colors"
            >
              <Plus size={14} />
              Quick Add
            </button>
            <button
              onClick={() => toast.info("No new notifications")}
              className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-main flex-1 overflow-y-auto p-4 md:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
