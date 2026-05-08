import { SectionReveal } from "./SectionReveal";
import { useState } from "react";
import { useInView } from "@/hooks/useInView";
import { EditableText } from "@/components/cms/EditableText";

import { useCMSState } from "@/components/cms/CMSEditorProvider";

function ClientLogo({ name, logo }: { name: string; logo: string }) {
  const [hasError, setHasError] = useState(false);
  
  // Track continuously, applying inView=true only when the element is in the absolute middle 10% of the screen horizontally
  // The tight -45% margins ensure only one logo can trigger at a time.
  const { ref, inView } = useInView<HTMLDivElement>(
    { threshold: 0, rootMargin: "0px -45% 0px -45%" },
    false
  );

  if (hasError) {
    return (
      <div 
        ref={ref}
        className={`font-display text-2xl font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-500 ease-brand ${
          inView ? "text-accent scale-110 drop-shadow-sm" : "text-foreground/30 scale-100 hover:text-accent"
        }`}
      >
        {name}
      </div>
    );
  }

  return (
    <div ref={ref} className="flex h-16 w-40 items-center justify-center">
      <img
        src={logo}
        alt={name}
        loading="lazy"
        title={name}
        onError={() => setHasError(true)}
        className={`max-h-12 w-auto max-w-full object-contain transition-all duration-500 ease-brand hover:opacity-100 hover:grayscale-0 hover:scale-[1.15] ${
          inView ? "opacity-100 grayscale-0 scale-[1.25] drop-shadow-md" : "opacity-40 grayscale scale-100"
        }`}
      />
    </div>
  );
}

export function HappyCustomers({ id }: { id?: string }) {
  const { content } = useCMSState();
  const clients = content.happyCustomers?.clients || [];

  return (
    <section id={id} className="relative flex min-h-screen snap-center flex-col justify-center overflow-hidden bg-white pt-16 md:pt-0">
      <div className="container-x">
        <SectionReveal className="text-center" variant="fadeUp">
          <div className="font-display text-xs uppercase tracking-[0.3em] text-accent">
            <EditableText section="happyCustomers" contentKey="sectionLabel" />
          </div>
          <h2 className="mt-3 w-fit font-display text-3xl font-bold md:text-4xl heading-underline heading-underline-center mx-auto">
            <EditableText section="happyCustomers" contentKey="heading" />
          </h2>
        </SectionReveal>
      </div>

      {/* Marquee */}
      <div className="mt-14 overflow-hidden border-y border-border bg-secondary/30 py-10">
        <div className="flex w-max animate-marquee items-center gap-32 pr-32 hover:[animation-play-state:paused]">
          {[...clients, ...clients, ...clients].map((client: any, i) => (
            <div key={i} className="group flex items-center justify-center">
              <ClientLogo name={client.name} logo={client.logo} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
