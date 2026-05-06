import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import factoryHero from "@/assets/products/showcase/factory.jpg";
import dgRealistic from "@/assets/products/showcase/cinematic-view.png";
import { SEO } from "@/components/site/SEO";
import { StatStrip } from "@/components/site/StatStrip";
import { SectionReveal } from "@/components/site/SectionReveal";

// Imported new & updated sections
import { CompanyOverview } from "@/components/site/CompanyOverview";
import { MissionVision } from "@/components/site/MissionVision";
import { OEMPartners } from "@/components/site/OEMPartners";
import { DealerNetwork } from "@/components/site/DealerNetwork";
import { TrustGainers } from "@/components/site/TrustGainers";
import { ManufacturingProcess } from "@/components/site/ManufacturingProcess";
import { HappyCustomers } from "@/components/site/HappyCustomers";
import { ContactCTA } from "@/components/site/ContactCTA";
import { VerticalNav, HOME_SECTIONS } from "@/components/site/VerticalNav";

import { ArrowRight, Play } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { wordStagger, fadeUp } from "@/lib/animations";
import { EditableText } from "@/components/cms/EditableText";
import { useCMSState } from "@/components/cms/CMSEditorProvider";
import { CMSSection } from "@/lib/sanity";

export default function Home() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], [0, 300]);
  const cardY = useTransform(scrollY, [0, 1000], [0, -80]);
  
  const { content } = useCMSState();

  useEffect(() => {
    document.documentElement.classList.add("snap-container");
    return () => document.documentElement.classList.remove("snap-container");
  }, []);

  return (
    <>
      <SEO
        title={content.showcase.seoTitle}
        description={content.showcase.seoDescription}
      />

      {/* Slide 1 — Hero Section (Landing Screen) */}
      <section id="hero" className="relative flex min-h-screen snap-center flex-col overflow-hidden bg-white pt-16 md:pt-0">
        
        {/* Floating decorative elements - Adjusted for light background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/20 to-transparent animate-float-slow mix-blend-multiply" />
          <div className="absolute top-1/2 -right-32 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent/10 to-transparent animate-float-slower mix-blend-multiply" />
          <div className="absolute bottom-20 left-1/4 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-navy/10 to-transparent animate-float-slow" />
        </div>

        {/* Hero grid */}
        <div className="container-x relative z-10 grid flex-1 gap-6 py-8 lg:grid-cols-2 lg:items-center lg:py-12">
          {/* Left content */}
          {/* Left content */}
          <SectionReveal delay={0} variant="slideLeft" className="flex flex-col items-start justify-center gap-8 text-foreground h-full">
            
            {/* Brand Title Group */}
            <div className="flex flex-col">
              <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-foreground md:text-6xl lg:text-7xl leading-[0.9] whitespace-nowrap">
                <EditableText section="showcase" contentKey="heroTitle" />
              </h1>
              <EditableText section="showcase" contentKey="heroSubtitle" className="font-display text-[10px] font-black uppercase tracking-[0.4em] text-accent mt-2 block" as="div" />
            </div>

            {/* Tagline & Certification Row */}
            <div className="flex flex-col gap-5 border-l-2 border-accent/20 pl-6">
              <EditableText section="showcase" contentKey="heroTagline" className="text-lg font-bold text-foreground md:text-xl leading-tight tracking-tight whitespace-nowrap block" as="p" />
              
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/30 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                <EditableText section="showcase" contentKey="heroCertification" className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground" />
              </div>
            </div>

            {/* Structured Contact Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 w-full pt-4">
              <a href="tel:+919924968777" className="flex items-center gap-3 group pointer-events-auto">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brand-navy text-white transition-all duration-300 group-hover:bg-accent group-hover:text-brand-navy">
                  <span className="text-sm">📞</span>
                </div>
                <div className="flex flex-col">
                  <EditableText section="showcase" contentKey="heroContactPhoneLabel" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" />
                  <EditableText section="showcase" contentKey="heroContactPhone" className="text-sm font-bold text-foreground group-hover:text-accent transition-colors" />
                </div>
              </a>

              <a href="mailto:sales@adityagenset.com" className="flex items-center gap-3 group pointer-events-auto">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brand-navy text-white transition-all duration-300 group-hover:bg-accent group-hover:text-brand-navy">
                  <span className="text-sm">✉</span>
                </div>
                <div className="flex flex-col">
                  <EditableText section="showcase" contentKey="heroContactEmailLabel" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" />
                  <EditableText section="showcase" contentKey="heroContactEmail" className="text-sm font-bold text-foreground group-hover:text-accent transition-colors" />
                </div>
              </a>

              <a href="https://www.adityagenset.com" className="flex items-center gap-3 group col-span-1 sm:col-span-2 mt-2 pointer-events-auto">
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brand-navy text-white transition-all duration-300 group-hover:bg-accent group-hover:text-brand-navy">
                  <span className="text-sm">🌐</span>
                </div>
                <div className="flex flex-col">
                  <EditableText section="showcase" contentKey="heroContactWebsiteLabel" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground" />
                  <EditableText section="showcase" contentKey="heroContactWebsite" className="text-sm font-bold text-foreground group-hover:text-accent transition-colors" />
                </div>
              </a>
            </div>
          </SectionReveal>

          {/* Right floating product card */}
          <div className="relative hidden lg:block">
            <SectionReveal delay={150} variant="slideRight">
              <motion.div
                className="relative mx-auto max-w-md will-change-transform"
                style={{ y: reduced ? 0 : cardY }}
              >
                <div className="absolute -inset-6 rounded-full bg-amber-gradient opacity-30 blur-3xl animate-float-slow" />
                {/* Rotating ring */}
                <div className="absolute inset-0 -m-6 animate-spin-slow opacity-20">
                  <div className="h-full w-full rounded-full border-2 border-dashed border-accent" />
                </div>
                <motion.div 
                  className="relative rounded-sm bg-white border border-border p-6 shadow-2xl transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(242,169,0,0.3)] hover:border-accent/30 group/card"
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
                >
                <div className="absolute -top-3 left-6 rounded-sm bg-amber-gradient px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-foreground shadow-lg transition-transform duration-300 group-hover/card:-translate-y-1">
                  <EditableText section="showcase" contentKey="featuredBadge" />
                </div>
                <div className="mx-auto h-56 w-full overflow-hidden rounded-sm transition-transform duration-700 group-hover/card:scale-[1.02]">
                  <img 
                    src={dgRealistic} 
                    alt="62.5 kVA Silent Diesel Generator" 
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4 text-foreground">
                  <Stat section="showcase" vKey="featuredStat1Value" lKey="featuredStat1Label" />
                  <Stat section="showcase" vKey="featuredStat2Value" lKey="featuredStat2Label" />
                  <Stat section="showcase" vKey="featuredStat3Value" lKey="featuredStat3Label" small />
                </div>
                <Link
                  to="/products/silent-62-5"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-accent px-4 py-2.5 text-xs font-semibold text-foreground transition-all duration-300 ease-brand hover:bg-accent/90 hover:shadow-lg active:scale-[0.98] group pointer-events-auto"
                >
                  <EditableText section="showcase" contentKey="featuredButton" /> <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                </motion.div>
              </motion.div>
            </SectionReveal>
          </div>
        </div>

        {/* StatStrip moved INSIDE so it sits at the bottom of the hero screen above the fold */}
        <div className="relative z-10 w-full pb-8 pt-4">
          <StatStrip />
        </div>
      </section>

      {/* Slide 2 */}
      <CompanyOverview id="overview" />

      {/* Slide 3 */}
      <MissionVision id="mission" />

      {/* Slide 4 */}
      <OEMPartners id="oem" />
      <DealerNetwork id="dealer" />

      {/* Slide 5 */}
      <TrustGainers id="trust" />

      {/* Slide 6 */}
      <ManufacturingProcess id="manufacturing" />

      {/* Slide 7 */}
      <HappyCustomers id="customers" />

      {/* Slide 8 */}
      <ContactCTA id="contact" />
      
      <VerticalNav sections={HOME_SECTIONS} />
    </>
  );
}

function Stat({ section, vKey, lKey, small }: { section: CMSSection; vKey: string; lKey: string; small?: boolean }) {
  return (
    <div>
      <div className={`num-display font-bold text-foreground ${small ? "text-sm" : "text-lg"}`}>
        <EditableText section={section} contentKey={vKey} />
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        <EditableText section={section} contentKey={lKey} />
      </div>
    </div>
  );
}
