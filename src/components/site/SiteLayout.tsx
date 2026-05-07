import { ReactNode } from "react";
import { Navbar } from "@/components/site/Navbar";
import { useLocation } from "react-router-dom";
import { CompareBar } from "@/components/products/CompareBar";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isLoginPage = pathname === "/login";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!isLoginPage && <Navbar />}
      {/* 
        On mobile: add top padding for the fixed mobile header (pt-16)
        On desktop: no extra space. Content spans full width underneath the floating nav (md:pt-0 md:pl-0)
      */}
      <main className={isLoginPage ? "" : "pt-16 md:pt-0 md:pl-0"}>
        {children}
      </main>
      {!isLoginPage && <CompareBar />}
    </div>
  );
}
