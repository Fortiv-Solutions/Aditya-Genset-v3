import { SectionReveal } from "./SectionReveal";
import { Award, Clock, Truck, Handshake, Leaf, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { EditableText } from "@/components/cms/EditableText";

const ICONS = [Award, Clock, Truck, Handshake, Leaf, ShieldCheck];
const ITEM_KEYS = [
  { titleKey: "item1Title", bodyKey: "item1Body" },
  { titleKey: "item2Title", bodyKey: "item2Body" },
  { titleKey: "item3Title", bodyKey: "item3Body" },
  { titleKey: "item4Title", bodyKey: "item4Body" },
  { titleKey: "item5Title", bodyKey: "item5Body" },
  { titleKey: "item6Title", bodyKey: "item6Body" },
] as const;

export function TrustGainers({ id }: { id?: string }) {
  return (
    <section id={id} className="relative flex min-h-screen snap-center flex-col justify-center overflow-hidden bg-brand-navy pt-16 text-white md:pt-0">
      {/* ─── Premium Industrial Background ─── */}
      <div className="pointer-events-none absolute inset-0 select-none">
        {/* Animated Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.08]" 
          style={{ 
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Large Decorative Text Watermark */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-bold leading-none text-white/[0.02] tracking-tighter uppercase whitespace-nowrap select-none">
          EXCELLENCE
        </div>

        {/* Cinematic Lighting Blobs — radial gradients, zero blur cost */}
        <div 
          className="absolute top-1/4 -left-20 h-[500px] w-[500px] rounded-full animate-float-slow"
          style={{ background: "radial-gradient(circle at center, rgba(242,169,0,0.2) 0%, transparent 70%)" }}
        />
        <div 
          className="absolute bottom-1/4 -right-20 h-[600px] w-[600px] rounded-full animate-float-slower"
          style={{ background: "radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, transparent 70%)" }}
        />
        
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </div>

      <div className="container-x relative z-10">
        <SectionReveal className="text-center" variant="fadeUp">
          <div className="font-display text-xs uppercase tracking-[0.4em] text-accent font-semibold">
            <EditableText section="trustGainers" contentKey="sectionLabel" />
          </div>
          <h2 className="mt-4 w-fit font-display text-5xl font-bold md:text-6xl tracking-tight heading-underline heading-underline-center mx-auto">
            <EditableText section="trustGainers" contentKey="heading" />
          </h2>
        </SectionReveal>

        <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ITEM_KEYS.map((keys, i) => {
            const Icon = ICONS[i];
            let variant: "slideLeft" | "slideRight" | "fadeDown" | "fadeUp" = "fadeUp";
            if (i % 3 === 0) variant = "slideLeft";
            else if (i % 3 === 2) variant = "slideRight";
            else variant = i < 3 ? "fadeDown" : "fadeUp";

            return (
              <SectionReveal
                key={keys.titleKey}
                variant={variant}
                delay={i * 100}
                threshold={0.1}
              >
                <motion.div
                  whileHover={{ y: -12, scale: 1.01 }}
                  className="group relative flex flex-col h-full overflow-hidden rounded-sm border border-white/10 bg-white/[0.06] p-8 shadow-md transition-all duration-500 hover:border-accent/40 hover:bg-white/[0.12] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
                >
                  {/* Corner Accent */}
                  <div className="absolute top-0 left-0 h-1 w-0 bg-accent transition-all duration-500 group-hover:w-full" />
                  
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-sm bg-accent text-brand-navy shadow-[0_0_20px_rgba(242,169,0,0.3)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-white">
                    <Icon size={26} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl font-bold tracking-tight text-white group-hover:text-accent transition-colors duration-300">
                    <EditableText section="trustGainers" contentKey={keys.titleKey} />
                  </h3>
                  <p className="mt-3 text-sm text-white/60 leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                    <EditableText section="trustGainers" contentKey={keys.bodyKey} />
                  </p>
                  
                  {/* Decorative Icon Background */}
                  <div className="absolute -bottom-4 -right-4 text-8xl font-bold text-white/[0.03] transition-all duration-500 group-hover:text-accent/[0.05] group-hover:scale-110">
                    <Icon size={120} />
                  </div>
                </motion.div>
              </SectionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
