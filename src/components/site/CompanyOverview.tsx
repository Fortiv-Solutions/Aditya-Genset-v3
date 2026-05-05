import { SectionReveal } from "./SectionReveal";
import { CheckCircle2 } from "lucide-react";
import { EditableText } from "@/components/cms/EditableText";

export function CompanyOverview({ id }: { id?: string }) {
  return (
    <section id={id} className="relative flex min-h-screen snap-center flex-col justify-center overflow-hidden bg-white pt-16 md:pt-0">
      <div className="container-x">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Text Content */}
          <SectionReveal variant="slideLeft">
            <div className="font-display text-xs uppercase tracking-[0.3em] text-accent">
              <EditableText section="companyOverview" contentKey="sectionLabel" />
            </div>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl heading-underline">
              <EditableText section="companyOverview" contentKey="heading" />
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              <EditableText section="companyOverview" contentKey="description" />
            </p>

            <div className="mt-10 grid sm:grid-cols-2 gap-x-8 gap-y-6">
              {([
                { labelKey: "stat1Label", valueKey: "stat1Value" },
                { labelKey: "stat2Label", valueKey: "stat2Value" },
                { labelKey: "stat3Label", valueKey: "stat3Value" },
              ] as const).map((item) => (
                <div key={item.labelKey} className="border-l-2 border-accent pl-4">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    <EditableText section="companyOverview" contentKey={item.labelKey} />
                  </div>
                  <div className="mt-1 font-display text-lg font-semibold text-foreground">
                    <EditableText section="companyOverview" contentKey={item.valueKey} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <div className="font-display text-sm font-bold uppercase tracking-widest text-foreground mb-4">
                <EditableText section="companyOverview" contentKey="clientsTitle" />
              </div>
              <div className="flex flex-wrap gap-3">
                {(["client1", "client2", "client3", "client4"] as const).map((key) => (
                  <div key={key} className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2 text-sm font-medium">
                    <CheckCircle2 size={16} className="text-accent" />
                    <EditableText section="companyOverview" contentKey={key} />
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>

          {/* Stats Grid */}
          <SectionReveal variant="slideRight" delay={150}>
            <div className="relative">
              <div className="absolute -inset-8 rounded-full bg-brand-navy opacity-5 blur-3xl" />
              <div className="grid grid-cols-2 gap-4">
                {([
                  { valueKey: "kpi1Value", labelKey: "kpi1Label" },
                  { valueKey: "kpi2Value", labelKey: "kpi2Label" },
                  { valueKey: "kpi3Value", labelKey: "kpi3Label" },
                  { valueKey: "kpi4Value", labelKey: "kpi4Label" },
                ] as const).map((kpi) => (
                  <div
                    key={kpi.valueKey}
                    className="group relative overflow-hidden rounded-sm border border-border bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:border-accent hover:shadow-xl"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                      <div className="h-16 w-16 rounded-full bg-accent blur-xl" />
                    </div>
                    <div className="num-display text-3xl font-bold text-foreground md:text-4xl">
                      <EditableText section="companyOverview" contentKey={kpi.valueKey} />
                    </div>
                    <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      <EditableText section="companyOverview" contentKey={kpi.labelKey} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
}
