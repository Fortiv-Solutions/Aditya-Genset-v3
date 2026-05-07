import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteLayout } from "@/components/site/SiteLayout";
import { RouteFade } from "@/components/site/RouteFade";

// Site Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import DGSetsCategory from "./pages/DGSetsCategory";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import CompareProducts from "./pages/CompareProducts";
import QuoteBuilder from "./pages/QuoteBuilder";

// Admin Layout
import AdminLayout from "./components/admin/AdminLayout";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AddProduct from "./pages/admin/AddProduct";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCMS from "./pages/admin/AdminCMS";
import CMSEditor from "./pages/admin/CMSEditor";
import AdminComingSoon from "./pages/admin/AdminComingSoon";
// import SoftwareRoadmap from "./pages/admin/SoftwareRoadmap";
import MigrationRunner from "./pages/MigrationRunner";

import { useState, useEffect } from "react";

const queryClient = new QueryClient();

// ─── Protected Route ────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

// ─── Admin Route (Protected + AdminLayout) ──────────────────────────────────
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <AdminLayout>{children}</AdminLayout>;
};

import { CMSEditorProvider } from "./components/cms/CMSEditorProvider";
import { CompareProvider } from "./context/CompareContext";
import { QuoteProvider } from "./context/QuoteContext";

const App = () => {
  const [, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CMSEditorProvider>
          <CompareProvider>
            <QuoteProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
              {/* ── Public ─────────────────────────────────── */}
              <Route path="/login" element={<Login />} />

            {/* ── Admin Dashboard ─────────────────────────── */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/products/add" element={<AdminRoute><AddProduct /></AdminRoute>} />
            <Route path="/admin/products/categories" element={
              <AdminRoute>
                <AdminComingSoon title="Product Categories" description="Manage the hierarchical category tree for DG Sets, Open DG Sets, Industrial Sets, and Accessories." />
              </AdminRoute>
            } />
            <Route path="/admin/products/:id/edit" element={<AdminRoute><AddProduct /></AdminRoute>} />

            <Route path="/admin/leads" element={<AdminRoute><AdminLeads /></AdminRoute>} />
            <Route path="/admin/leads/pipeline" element={<AdminRoute><AdminLeads /></AdminRoute>} />
            <Route path="/admin/leads/followups" element={
              <AdminRoute>
                <AdminComingSoon title="Follow-up Manager" description="View and manage all scheduled follow-ups, overdue tasks, and daily sales rep reminders." />
              </AdminRoute>
            } />

            <Route path="/admin/cms" element={<AdminRoute><AdminCMS /></AdminRoute>} />
            <Route path="/admin/cms/edit/:pageId" element={<ProtectedRoute><CMSEditor /></ProtectedRoute>} />
            {/* <Route path="/admin/roadmap" element={<AdminRoute><SoftwareRoadmap /></AdminRoute>} /> */}
            <Route path="/admin/migrations" element={<AdminRoute><MigrationRunner /></AdminRoute>} />

            {/* Removed CMS, Orders, Dealers, Service routes to focus on Presentation Tool features */}

            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />

            {/* ── Site (Protected + SiteLayout) ───────────── */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <SiteLayout>
                    <RouteFade>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/products/dg-sets" element={<DGSetsCategory />} />
                        <Route path="/products/:slug" element={<ProductDetail />} />
                        <Route path="/compare" element={<CompareProducts />} />
                        <Route path="/quote-builder" element={<QuoteBuilder />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </RouteFade>
                  </SiteLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
          </BrowserRouter>
        </QuoteProvider>
      </CompareProvider>
    </CMSEditorProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
