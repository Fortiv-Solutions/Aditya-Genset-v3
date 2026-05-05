import { SectionReveal } from "./SectionReveal";
import { Phone, Mail, Globe, MapPin } from "lucide-react";
import { EditableText } from "@/components/cms/EditableText";

export function ContactCTA({ id }: { id?: string }) {
  return (
    <section id={id} className="relative flex min-h-screen snap-center flex-col justify-center overflow-hidden bg-brand-navy-deep pt-16 text-white md:pt-0">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 h-[40rem] w-[40rem] -translate-y-1/2 translate-x-1/3 rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/30 to-transparent" />
      </div>

      <div className="container-x relative z-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          
          <SectionReveal variant="slideLeft">
            <h2 className="font-display text-4xl font-bold md:text-6xl text-balance uppercase">
              <EditableText section="contactCTA" contentKey="heading1" />{" "}
              <span className="text-accent">
                <EditableText section="contactCTA" contentKey="headingAccent" />
              </span>
            </h2>
            <p className="mt-6 text-lg text-white/70 max-w-lg">
              <EditableText section="contactCTA" contentKey="description" />
            </p>

            <div className="mt-12 space-y-8">
              <div className="font-display text-xl font-bold flex items-center gap-2">
                <span>📞</span> Contact Options
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-accent">
                    <Phone size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest text-white/50">
                      <EditableText section="contactCTA" contentKey="phoneLabel" />
                    </div>
                    <div className="text-lg font-medium">
                      <EditableText section="contactCTA" contentKey="phoneValue" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-accent">
                    <Mail size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest text-white/50">
                      <EditableText section="contactCTA" contentKey="emailLabel" />
                    </div>
                    <div className="text-lg font-medium">
                      <EditableText section="contactCTA" contentKey="emailValue" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-accent">
                    <Globe size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest text-white/50">
                      <EditableText section="contactCTA" contentKey="websiteLabel" />
                    </div>
                    <div className="text-lg font-medium">
                      <EditableText section="contactCTA" contentKey="websiteValue" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionReveal>

          <SectionReveal variant="slideRight" delay={150}>
            <div className="rounded-sm border border-white/10 bg-white/10 shadow-inner p-8 lg:p-10">
              <div className="mb-8 font-display text-xl font-bold flex items-center gap-2">
                <span>📍</span>
                <EditableText section="contactCTA" contentKey="addressesTitle" />
              </div>
              
              <div className="space-y-10">
                <div>
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="mt-1 shrink-0 text-accent" />
                    <div>
                      <div className="font-display text-lg font-bold">
                        <EditableText section="contactCTA" contentKey="address1Title" />
                      </div>
                      <div className="mt-2 text-sm text-white/70 leading-relaxed">
                        <EditableText section="contactCTA" contentKey="address1Body" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="h-px bg-white/10" />
                
                <div>
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="mt-1 shrink-0 text-accent" />
                    <div>
                      <div className="font-display text-lg font-bold">
                        <EditableText section="contactCTA" contentKey="address2Title" />
                      </div>
                      <div className="mt-2 text-sm text-white/70 leading-relaxed">
                        <EditableText section="contactCTA" contentKey="address2Body" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10 text-center">
                <div className="text-xs font-semibold uppercase tracking-widest text-white/50 italic">
                  <EditableText section="contactCTA" contentKey="tagline" />
                </div>
              </div>
            </div>
          </SectionReveal>

        </div>
      </div>
    </section>
  );
}
