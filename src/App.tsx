import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteLayout } from "@/components/site/SiteLayout";
import { RouteFade } from "@/components/site/RouteFade";
import Home from "./pages/Home";
import Welcome from "./pages/Welcome";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import DGSetsCategory from "./pages/DGSetsCategory";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check login status on mount
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public Route - Login */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes - Wrapped in SiteLayout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <SiteLayout>
                    <RouteFade>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/welcome" element={<Welcome />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/products/dg-sets" element={<DGSetsCategory />} />
                        <Route path="/products/:slug" element={<ProductDetail />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </RouteFade>
                  </SiteLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
