import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, Store, ShieldCheck } from "lucide-react";
import { SEO } from "@/components/site/SEO";
import { toast } from "sonner";
import factoryHero from "@/assets/products/showcase/factory.jpg";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCMSState } from "@/components/cms/CMSEditorProvider";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState<"dealer" | "admin">("dealer");

  const [isLoading, setIsLoading] = useState(false);
  const { content } = useCMSState();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      if (data.user) {
        // Set basic login state for UI
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", data.user.email || email);
        
        toast.success("Login successful! Redirecting...");
        
        // Determine user role and redirect
        const userEmail = data.user.email || "";
        const isAdmin = data.user.app_metadata?.role === 'admin' || userEmail === 'admin@fortivsolutions.in';
        
        setTimeout(() => {
          if (isAdmin) {
            navigate("/admin");
          } else {
            // Redirect normal users to the main site (Home/Welcome page)
            navigate("/");
          }
        }, 500);
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed. Please check your credentials.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO title="Dealer Login | Aditya Genset" description="Secure login portal for Aditya Genset dealers and visual sales pro." />
      
      {/* Premium Background */}
      <div className="relative min-h-screen flex items-center justify-center bg-brand-navy-deep overflow-hidden px-4">
        
        {/* Background image with parallax + dim */}
        <div className="absolute inset-0">
          <img
            src={factoryHero}
            alt="Aditya manufacturing facility"
            className="h-full w-full object-cover opacity-20 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy-deep/80 via-brand-navy-deep/90 to-brand-navy-deep" />
        </div>

        {/* Floating decorative elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/20 to-transparent animate-float-slow" />
          <div className="absolute top-1/2 -right-32 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/10 to-transparent animate-float-slower" />
        </div>

        {/* Premium Login Card with Entrance Animation */}
        <div className="relative z-10 w-full max-w-[420px] p-8 md:p-12 rounded-xl border border-white/10 bg-brand-navy/95 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-1000 ease-brand">
          
          {/* Subtle top highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-accent">
              {loginType === "admin" ? "Admin Portal" : "Aditya Genset"}
            </h1>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">
              {loginType === "admin" ? "Management Dashboard" : "VisualSales Pro"}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {/* Email Field */}
            <div className="space-y-2 group">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/80 transition-colors group-focus-within:text-accent">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-white/40 transition-colors group-focus-within:text-accent">
                  <Mail size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Enter your credentials"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-sm text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2 group">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/80 transition-colors group-focus-within:text-accent">
                  Password
                </label>
                <Link to="#" className="text-xs font-medium text-accent hover:text-white transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-white/40 transition-colors group-focus-within:text-accent">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-sm text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex items-center justify-center gap-2 py-3.5 bg-amber-gradient rounded-sm text-sm font-bold text-brand-navy-deep transition-all duration-300 ease-out hover:shadow-[0_0_20px_rgba(255,176,0,0.4)] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Authenticating..." : "Secure Login"}
                {!isLoading && <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setLoginType("dealer");
                  setEmail("");
                }}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-sm text-sm font-medium transition-all duration-300 active:scale-[0.98] ${
                  loginType === "dealer" 
                    ? "bg-white/10 border border-accent/30 text-accent" 
                    : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                }`}
              >
                <Store size={16} className={loginType === "dealer" ? "text-accent" : "text-white/60"} /> Login as Dealer
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginType("admin");
                  setEmail("admin@fortivsolutions.in");
                }}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-sm text-sm font-medium transition-all duration-300 active:scale-[0.98] ${
                  loginType === "admin" 
                    ? "bg-white/10 border border-accent/30 text-accent" 
                    : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                }`}
              >
                <ShieldCheck size={16} className={loginType === "admin" ? "text-accent" : "text-white/60"} /> Login as Admin
              </button>
            </div>
          </form>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-[10px] text-white/40">
              Authorized Personnel Only. System activity is monitored.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
