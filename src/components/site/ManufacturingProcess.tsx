import { SectionReveal, StaggerReveal } from "./SectionReveal";
import { PackageSearch, Wrench, Activity, Truck } from "lucide-react";
import { EditableText } from "@/components/cms/EditableText";

const ICONS = [PackageSearch, Wrench, Activity, Truck];
const STEP_KEYS = [
  { titleKey: "step1Title", descKey: "step1Desc" },
  { titleKey: "step2Title", descKey: "step2Desc" },
  { titleKey: "step3Title", descKey: "step3Desc" },
  { titleKey: "step4Title", descKey: "step4Desc" },
] as const;

export function ManufacturingProcess({ id }: { id?: string }) {
  return (
    <section id={id} className="relative flex min-h-screen snap-center flex-col justify-center bg-secondary/30 pt-16 md:pt-0">
      <div className="container-x">
        <SectionReveal className="text-center" variant="fadeUp">
          <div className="font-display text-xs uppercase tracking-[0.3em] text-accent">
            <EditableText section="manufacturingProcess" contentKey="sectionLabel" />
          </div>
          <h2 className="mt-3 w-fit font-display text-4xl font-bold md:text-5xl heading-underline heading-underline-center mx-auto">
            <EditableText section="manufacturingProcess" contentKey="heading" />
          </h2>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">
            <EditableText section="manufacturingProcess" contentKey="description" />
          </p>
        </SectionReveal>

        <div className="mt-20 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />
          
          <StaggerReveal
            className="grid gap-12 md:grid-cols-4 relative z-10"
            staggerMs={120}
            threshold={0.1}
          >
            {STEP_KEYS.map((keys, i) => {
              const Icon = ICONS[i];
              return (
                <div key={keys.titleKey} className="relative flex flex-col items-center text-center group">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-foreground text-white shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:bg-accent group-hover:text-foreground">
                    <Icon size={32} />
                    <div className="absolute -bottom-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-border text-xs font-bold text-muted-foreground group-hover:bg-brand-navy group-hover:text-white transition-colors duration-500">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    <EditableText section="manufacturingProcess" contentKey={keys.titleKey} />
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    <EditableText section="manufacturingProcess" contentKey={keys.descKey} />
                  </p>
                </div>
              );
            })}
          </StaggerReveal>
        </div>
      </div>
    </section>
  );
}
