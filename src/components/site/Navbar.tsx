import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, Home, Box, Monitor, LayoutDashboard, BarChart2 } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import logo from "@/assets/brand/logo.png";

const links = [
  { to: "/", label: "Welcome", icon: Home },
  { to: "/products", label: "Products", icon: Box },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [isPresentMode, setIsPresentMode] = useState(false);
  const { pathname } = useLocation();
  const { selectedIds } = useCompare();

  const allLinks = [
    ...links,
    ...(selectedIds.length > 0 ? [{ to: "/compare", label: `Compare (${selectedIds.length})`, icon: BarChart2 }] : []),
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Listen for ESC key to exit present mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPresentMode(false);
      }
    };
    if (isPresentMode) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresentMode]);

  // If Present Mode is active, hide everything except the ESC button
  if (isPresentMode) {
    return (
      <button
        onClick={() => setIsPresentMode(false)}
        className="fixed top-6 right-6 z-[100] flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border border-border transition-all duration-300 hover:bg-gray-50 hover:scale-110 active:scale-95"
      >
        <X size={20} className="text-foreground" />
      </button>
    );
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-white px-6 shadow-sm md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Aditya" className="h-8 w-auto mix-blend-multiply" />
        </Link>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="text-foreground transition-colors hover:text-accent"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {open && (
        <div className="fixed inset-x-0 top-16 z-40 border-b border-border bg-white p-4 shadow-xl animate-fade-in md:hidden">
          <nav className="flex flex-col gap-2">
            {allLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-full px-5 py-3.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-brand-navy text-white"
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <l.icon size={18} className={isActive ? "text-accent" : ""} />
                    {l.label}
                  </>
                )}
              </NavLink>
            ))}

            {/* Mobile Present Mode Button */}
            <button
              onClick={() => {
                setIsPresentMode(true);
                setOpen(false);
              }}
              className="mt-2 flex items-center gap-3 rounded-full px-5 py-3.5 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary/80 hover:text-foreground"
            >
              <Monitor size={18} />
              Present
            </button>
          </nav>
        </div>
      )}

      {/* Desktop Independent Logo (Top Left) */}
      <div className="fixed top-0 left-0 z-50 hidden md:block">
        <Link to="/" className="group inline-block rounded-br-lg bg-white/70 backdrop-blur-md px-3 py-2 shadow-sm border-r border-b border-white/20 transition-all duration-300 hover:bg-white/90 hover:shadow-md">
          <img
            src={logo}
            alt="Aditya"
            className="h-8 w-auto mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>
      </div>

      {/* Desktop Floating Navigation Group (Vertically Centered) */}
      <div className="fixed top-1/2 left-2 z-50 hidden -translate-y-1/2 flex-col gap-3 md:flex">
        
        {/* Present Mode Pill */}
        <aside
          className={cn(
            "group flex flex-col overflow-hidden rounded-[24px] border border-border bg-white p-2 shadow-[0_8px_32px_rgba(11,58,92,0.12)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "w-max min-w-[56px]"
          )}
        >
          <button
            onClick={() => setIsPresentMode(true)}
            className={cn(
              "relative flex h-10 w-full items-center rounded-[20px] text-[13px] font-bold transition-all duration-300",
              "text-muted-foreground hover:bg-brand-navy hover:text-white hover:shadow-md hover:scale-[1.02]",
              "justify-center group-hover:justify-start group-hover:px-4"
            )}
          >
            <Monitor
              size={16}
              className="shrink-0 transition-transform duration-300 group-hover:scale-110"
            />
            <div
              className={cn(
                "overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                "max-w-0 opacity-0 group-hover:ml-3 group-hover:max-w-[150px] group-hover:opacity-100"
              )}
            >
              Present
            </div>
          </button>
        </aside>

        {/* Main Floating Icon-Only Hover Sidebar */}
        <aside
          className={cn(
            "group flex flex-col overflow-hidden rounded-[24px] border border-border bg-white p-2 shadow-[0_8px_32px_rgba(11,58,92,0.12)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "w-max min-w-[56px]"
          )}
        >
          <nav className="flex flex-col gap-1.5">
            {allLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "relative flex h-10 w-full items-center rounded-[20px] text-[13px] font-bold transition-all duration-300",
                    isActive
                      ? "bg-brand-navy text-white shadow-md shadow-brand-navy/20"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:scale-[1.02]",
                    "justify-center group-hover:justify-start group-hover:px-4"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <l.icon
                      size={18}
                      className={cn(
                        "shrink-0 transition-transform duration-300",
                        isActive ? "text-accent" : ""
                      )}
                    />
                    <div
                      className={cn(
                        "overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                        "max-w-0 opacity-0 group-hover:ml-4 group-hover:max-w-[120px] group-hover:opacity-100"
                      )}
                    >
                      {l.label}
                    </div>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );
}
