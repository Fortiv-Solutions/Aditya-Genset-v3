import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteLayout } from "@/components/site/SiteLayout";
import { RouteFade } from "@/components/site/RouteFade";
import { AuthProvider } from "@/components/auth/AuthProvider";
import {
  AuthenticatedRoute,
  RoleRoute,
} from "@/components/auth/AuthRoutes";
import { ADMIN_ROLES } from "@/lib/auth";
import { CMSEditorProvider } from "./components/cms/CMSEditorProvider";

// Site Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import DGSetsCategory from "./pages/DGSetsCategory";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

// Admin Layout
import AdminLayout from "./components/admin/AdminLayout";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AddProduct from "./pages/admin/AddProduct";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCMS from "./pages/admin/AdminCMS";
import CMSEditor from "./pages/admin/CMSEditor";
import AdminComingSoon from "./pages/admin/AdminComingSoon";
import MigrationRunner from "./pages/MigrationRunner";

const queryClient = new QueryClient();

const AdminRoute = ({ children }: { children: React.ReactNode }) => (
  <RoleRoute allowedRoles={ADMIN_ROLES}>
    <AdminLayout>{children}</AdminLayout>
  </RoleRoute>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CMSEditorProvider>
          <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />

                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
                <Route path="/admin/products/add" element={<AdminRoute><AddProduct /></AdminRoute>} />
                <Route path="/admin/products/categories" element={
                  <AdminRoute>
                    <AdminComingSoon title="Product Categories" description="Manage the hierarchical category tree for DG Sets, Open DG Sets, Industrial Sets, and Accessories." />
                  </AdminRoute>
                } />
                <Route path="/admin/products/:id/edit" element={<AdminRoute><AddProduct /></AdminRoute>} />

                <Route path="/admin/leads/*" element={<Navigate to="/admin" replace />} />

                <Route path="/admin/cms" element={<AdminRoute><AdminCMS /></AdminRoute>} />
                <Route path="/admin/cms/edit/:pageId" element={<AdminRoute><CMSEditor /></AdminRoute>} />
                <Route path="/admin/roadmap" element={
                  <AdminRoute>
                    <AdminComingSoon title="Software Roadmap" description="Track planned admin features, CMS improvements, and product management updates." />
                  </AdminRoute>
                } />
                <Route path="/admin/migrations" element={<AdminRoute><MigrationRunner /></AdminRoute>} />

                <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />

                <Route
                  path="/*"
                  element={
                    <AuthenticatedRoute>
                      <SiteLayout>
                        <RouteFade>
                          <Routes>
                            <Route path="/home" element={<Home />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/products/dg-sets" element={<DGSetsCategory />} />
                            <Route path="/products/:slug" element={<ProductDetail />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </RouteFade>
                      </SiteLayout>
                    </AuthenticatedRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </CMSEditorProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
