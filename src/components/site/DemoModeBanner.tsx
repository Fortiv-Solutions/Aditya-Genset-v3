import { isDemoMode } from "@/lib/supabase";
import { Info } from "lucide-react";

export function DemoModeBanner() {
  if (!isDemoMode) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 shadow-lg">
      <div className="container-x flex items-center justify-center gap-2 text-sm">
        <Info size={16} className="shrink-0" />
        <span className="font-medium">
          Demo Mode Active - Using sample data for demonstration
        </span>
      </div>
    </div>
  );
}
