import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, Users, FileText, Image as ImageIcon,
  ClipboardList, Handshake, Wrench, ShieldCheck, BarChart2,
  Settings, ChevronRight, Bell, Search, Plus, LogOut,
  Menu, X, Zap, Globe
} from "lucide-react";
import { toast } from "sonner";

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
    sub: [
      { label: "All Products", path: "/admin/products" },
      { label: "Add Product", path: "/admin/products/add" },
      { label: "Categories", path: "/admin/products/categories" },
    ],
  },
  {
    label: "Leads & Inquiries",
    icon: Users,
    path: "/admin/leads",
    badge: 8,
    sub: [
      { label: "All Leads", path: "/admin/leads" },
      { label: "Pipeline Board", path: "/admin/leads/pipeline" },
      { label: "Follow-ups", path: "/admin/leads/followups" },
    ],
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedNav, setExpandedNav] = useState<string | null>("Products");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userEmail = "Admin";
  const userInitials = "AD";

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const toggleExpand = (label: string) => {
    setExpandedNav(expandedNav === label ? null : label);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <Zap size={16} className="text-accent-foreground fill-accent-foreground" />
        </div>
        {sidebarOpen && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground tracking-tight leading-none">Aditya Tech Mech</p>
            <p className="text-[10px] text-accent/80 font-medium tracking-widest uppercase mt-0.5">Admin Portal</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const expanded = expandedNav === item.label;

          return (
            <div key={item.path}>
              <button
                onClick={() => {
                  if (item.sub) {
                    toggleExpand(item.label);
                  } else {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 group relative
                  ${active
                    ? "text-accent bg-accent/10 border-r-2 border-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                <Icon size={17} className={`flex-shrink-0 ${active ? "text-accent" : "text-muted-foreground group-hover:text-muted-foreground"}`} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {item.sub && (
                      <ChevronRight
                        size={14}
                        className={`text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
                      />
                    )}
                  </>
                )}
              </button>

              {/* Sub-items */}
              {sidebarOpen && item.sub && expanded && (
                <div className="ml-4 border-l border-border pl-4 py-1">
                  {item.sub.map((sub) => (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2 px-2 text-[13px] rounded-md transition-colors duration-150
                        ${location.pathname === sub.path
                          ? "text-accent font-medium"
                          : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-border p-4">
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-accent">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{userEmail}</p>
              <p className="text-[10px] text-muted-foreground">Super Admin</p>
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
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300 flex-shrink-0 ${
          sidebarOpen ? "w-60" : "w-16"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative z-10 w-64 bg-card border-r border-border flex flex-col h-full">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex-shrink-0 flex items-center gap-4 px-4 md:px-6 py-3.5 bg-card border-b border-border">
          {/* Left: Toggle + Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSidebarOpen(!sidebarOpen);
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="text-accent font-medium">Admin</span>
              {location.pathname !== "/admin" && (
                <>
                  <ChevronRight size={13} />
                  <span className="text-muted-foreground font-medium capitalize">
                    {location.pathname.split("/")[2] || "Dashboard"}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Centre: Global Search */}
          <div className="flex-1 max-w-md mx-auto hidden md:block">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products, leads, content..."
                className="w-full pl-9 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-muted-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:bg-secondary transition-all"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <Link 
              to="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-border hover:bg-secondary rounded-lg text-xs font-medium text-muted-foreground transition-colors mr-2"
            >
              <Globe size={14} />
              View Site
            </Link>
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent/90 rounded-lg text-xs font-bold text-accent-foreground transition-colors">
              <Plus size={14} />
              Quick Add
            </button>
            <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full ring-2 ring-stone-950"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
