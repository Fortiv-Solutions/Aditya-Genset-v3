import { SectionReveal } from "./SectionReveal";
import { motion } from "framer-motion";
import { EditableText } from "@/components/cms/EditableText";

const PARTNER_KEYS = [
  { nameKey: "partner1Name", tagKey: "partner1Tag" },
  { nameKey: "partner2Name", tagKey: "partner2Tag" },
  { nameKey: "partner3Name", tagKey: "partner3Tag" },
] as const;

export function OEMPartners({ id }: { id?: string }) {
  return (
    <section id={id} className="relative flex min-h-screen snap-center flex-col justify-center bg-secondary/30 pt-16 md:pt-0">
      <div className="container-x">
        <SectionReveal className="text-center" variant="fadeUp">
          <div className="font-display text-xs uppercase tracking-[0.3em] text-accent">
            <EditableText section="oemPartners" contentKey="sectionLabel" />
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl heading-underline heading-underline-center inline-block">
            <EditableText section="oemPartners" contentKey="heading" />
          </h2>
        </SectionReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-3 max-w-5xl mx-auto">
          {PARTNER_KEYS.map((p, i) => (
            <SectionReveal
              key={p.nameKey}
              variant={i === 0 ? "slideLeft" : i === 2 ? "slideRight" : "fadeUp"}
              delay={i * 100}
              threshold={0.1}
            >
              <motion.div
                whileHover={{ y: -10, scale: 1.02, rotate: i === 0 ? -1 : i === 2 ? 1 : 0 }}
                className="group relative aspect-[3/2] overflow-hidden rounded-sm border border-border bg-white p-6 transition-shadow duration-500 hover:border-accent hover:shadow-[0_20px_50px_rgba(242,169,0,0.15)]"
              >
                {/* Animated shimmer sweep */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent/5 to-transparent transition-transform duration-1000 ease-brand group-hover:translate-x-full" />
                
                <div className="relative flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-2 h-1 w-8 rounded-full bg-accent/20 transition-all duration-500 group-hover:w-12 group-hover:bg-accent" />
                  <div className="font-display text-xl font-bold text-foreground md:text-2xl">
                    <EditableText section="oemPartners" contentKey={p.nameKey} />
                  </div>
                  <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    <EditableText section="oemPartners" contentKey={p.tagKey} />
                  </div>
                </div>
              </motion.div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
