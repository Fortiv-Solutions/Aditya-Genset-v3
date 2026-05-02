import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Minimize2, ChevronDown, Info, Settings, Shield, Zap, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeIn, fadeUp, scaleIn, durations, easings } from "@/lib/animations";

// Main image - always dg-real-1
import mainImage from "@/assets/brand/dg-real-1.png";

// Sub-images from assets folder
import subEngine from "@/assets/dg-engine.jpg";
import subControl from "@/assets/brand/control-panel.jpg";
import subFuel from "@/assets/brand/fuel-tank.jpg";
import subProduct from "@/assets/brand/dg-product.jpg";
import subAlternator from "@/assets/brand/engine-baudouin.jpg";
import subEnclosure from "@/assets/brand/dg-real-2.jpg";
import subDimensions from "@/assets/genset-hero-CdfwbH8a.jpg";

interface Hotspot {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
  subImage?: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  specs: { label: string; value: string }[];
}

const HOTSPOTS: Hotspot[] = [
  {
    id: "overview",
    x: 50, y: 50,
    title: "Silent Diesel Generator",
    description: "62.5 kVA silent diesel generator overview. Engineered for premium reliability and quiet operation.",
    subImage: subProduct,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    specs: [
      { label: "Rating", value: "62.5 kVA" },
      { label: "Phase", value: "3 Phase" },
      { label: "Compliance", value: "CPCB IV+" }
    ]
  },
  {
    id: "engine",
    x: 42, y: 48,
    title: "Turbocharged Engine",
    description: "Turbocharged 4-cylinder diesel engine. Built for continuous duty and tight load response.",
    subImage: subEngine,
    zoom: 1.8,
    offsetX: 8,
    offsetY: 2,
    specs: [
      { label: "Configuration", value: "4-cylinder, inline" },
      { label: "Aspiration", value: "Turbocharged" },
      { label: "Displacement", value: "~3.9 L" },
      { label: "Cooling", value: "Water-cooled" },
      { label: "Fuel", value: "High-speed diesel" }
    ]
  },
  {
    id: "power",
    x: 35, y: 55,
    title: "Power Output",
    description: "Industrial brushless alternator with copper windings. Clean, stable 3-phase power for sensitive loads.",
    subImage: subAlternator,
    zoom: 1.6,
    offsetX: 15,
    offsetY: -5,
    specs: [
      { label: "Rating", value: "62.5 kVA / 50 kW" },
      { label: "Voltage", value: "415 V" },
      { label: "Frequency", value: "50 Hz" },
      { label: "Phase", value: "3-phase, 4-wire" },
      { label: "Power factor", value: "0.8 lagging" }
    ]
  },
  {
    id: "sound",
    x: 65, y: 45,
    title: "Sound & Enclosure",
    description: "Acoustic enclosure with louvered ventilation. CPCB IV+ compliant. Engineered to disappear into its environment.",
    subImage: subEnclosure,
    zoom: 1.5,
    offsetX: -15,
    offsetY: 5,
    specs: [
      { label: "Sound level", value: "75 dB(A) @ 1m" },
      { label: "At 7m", value: "63 dB(A)" },
      { label: "Construction", value: "1.6 mm CRCA panels" },
      { label: "Insulation", value: "PU foam, 50 mm" },
      { label: "Finish", value: "7-tank powder coat" }
    ]
  },
  {
    id: "dimensions",
    x: 50, y: 75,
    title: "Dimensions & Weight",
    description: "Side profile view of silent diesel generator. Compact footprint, easy to site and service.",
    subImage: subDimensions,
    zoom: 1.2,
    offsetX: 0,
    offsetY: -10,
    specs: [
      { label: "Length", value: "2400 mm" },
      { label: "Width", value: "1050 mm" },
      { label: "Height", value: "1550 mm" },
      { label: "Dry weight", value: "~1250 kg" },
      { label: "Wet weight", value: "~1450 kg" }
    ]
  }
];

export function GuidedPresentation({ onClose }: { onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((v) => {
      const index = Math.min(
        Math.floor(v * HOTSPOTS.length),
        HOTSPOTS.length - 1
      );
      setCurrentIndex(index);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const activeHotspot = HOTSPOTS[currentIndex];

  return (
    <div ref={containerRef} className="relative h-[600vh] bg-[#f8f9fa] text-foreground selection:bg-accent selection:text-white overflow-x-hidden z-[9999]">
      {/* Fixed Background Visuals */}
      <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-[#f8f9fa]">
        <motion.div
          className="absolute inset-0"
        >
          <motion.div
            animate={{
              scale: activeHotspot.zoom,
              x: `${activeHotspot.offsetX}%`,
              y: `${activeHotspot.offsetY}%`,
            }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full flex items-center justify-center relative"
          >
            <img
              src={mainImage}
              alt="Diesel Generator"
              className="max-h-[80vh] max-w-[80vw] object-contain"
            />

            {/* Hotspot Dots that move with the zoom */}
            {HOTSPOTS.map((h, i) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: activeHotspot.zoom > 1.1 ? (currentIndex === i ? 1 : 0.1) : 0.8,
                  scale: currentIndex === i ? 1.3 : 0.8,
                  left: `${h.x}%`,
                  top: `${h.y}%`,
                }}
                className={cn(
                  "absolute h-4 w-4 rounded-full border-2 transition-all duration-300 flex items-center justify-center",
                  currentIndex === i ? "bg-accent border-accent scale-150" : "bg-white/80 border-foreground/20"
                )}
              >
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  currentIndex === i ? "bg-white animate-pulse" : "bg-foreground/20"
                )} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <header className="absolute top-0 inset-x-0 h-24 flex items-center justify-between px-12 pointer-events-auto">
          <motion.div 
            className="flex items-center gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: durations.slow, ease: easings.cinematic }}
          >
            <div className="h-10 w-1 bg-accent rounded-full" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-accent font-bold">Guided Presentation</p>
              <h2 className="font-display text-xl tracking-tight text-foreground">Aditya x Escorts · Silent Series</h2>
            </div>
          </motion.div>
          <motion.button
            onClick={onClose}
            className="group flex items-center gap-3 px-5 py-2.5 bg-black/5 hover:bg-black/10 backdrop-blur-xl border border-black/5 rounded-full transition-all active:scale-95"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: durations.slow, ease: easings.cinematic, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xs uppercase tracking-widest font-medium text-foreground/60 group-hover:text-foreground transition-colors">Exit <kbd className="ml-2 px-1.5 py-0.5 rounded bg-black/5 border border-black/10 text-[10px]">ESC</kbd></span>
            <Minimize2 size={18} className="text-accent" />
          </motion.button>
        </header>

        {/* Main Content Area (Split Bottom) */}
        <div className="absolute inset-x-12 bottom-12 flex items-end justify-between pointer-events-none">
          {/* Spec Card (Left) */}
          <motion.div 
            className="w-[420px] pointer-events-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: durations.cinematic, ease: easings.cinematic, delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeHotspot.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: durations.slow, ease: easings.cinematic }}
                className="bg-[#0B3A5C] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] rounded-3xl p-8 text-white"
              >
                <motion.div 
                  className="flex items-center gap-3 mb-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: durations.base, delay: 0.1 }}
                >
                  <div className="px-2 py-0.5 rounded bg-accent text-white text-[10px] font-bold uppercase tracking-widest border border-accent/20">
                    {currentIndex === 0 ? "Overview" : `Chapter ${currentIndex + 1}`}
                  </div>
                  <div className="h-px flex-1 bg-white/10" />
                </motion.div>

                <motion.h3 
                  className="font-display text-3xl font-semibold mb-3 leading-tight"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: durations.base, delay: 0.2 }}
                >
                  {activeHotspot.title}
                </motion.h3>
                <motion.p 
                  className="text-white/70 text-sm leading-relaxed mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: durations.base, delay: 0.3 }}
                >
                  {activeHotspot.description}
                </motion.p>

                <motion.div 
                  className="grid grid-cols-2 gap-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.4
                      }
                    }
                  }}
                >
                  {activeHotspot.specs.map((spec, i) => (
                    <motion.div 
                      key={spec.label} 
                      className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0, transition: { duration: durations.base } }
                      }}
                    >
                      <span className="text-[9px] uppercase tracking-widest text-white/40 block mb-1">{spec.label}</span>
                      <span className="text-sm font-semibold">{spec.value}</span>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div 
                  className="mt-10 flex items-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: durations.base, delay: 0.8 }}
                >
                  <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                    <ChevronDown className="animate-bounce text-white" size={18} />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40">
                    {currentIndex === HOTSPOTS.length - 1 ? "End of story" : "Scroll to continue walkthrough"}
                  </p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Sub-Image Card (Right) */}
          <motion.div 
            className="w-[350px] pointer-events-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: durations.cinematic, ease: easings.cinematic, delay: 0.5 }}
          >
            <AnimatePresence mode="wait">
              {activeHotspot.subImage && (
                <motion.div
                  key={`sub-${activeHotspot.id}`}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ duration: durations.slow, ease: easings.cinematic }}
                  className="bg-white/80 backdrop-blur-2xl border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-3xl p-3"
                >
                  <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
                    <motion.img 
                      src={activeHotspot.subImage} 
                      alt="Detail view" 
                      className="h-full w-full object-contain"
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: durations.cinematic, ease: easings.cinematic }}
                    />
                    <div className="absolute inset-0 bg-black/10" />
                    <motion.div 
                      className="absolute top-4 left-4 px-2 py-1 bg-black/40 backdrop-blur-md rounded-md border border-white/10"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: durations.base, delay: 0.3 }}
                    >
                      <span className="text-[9px] uppercase tracking-widest font-bold text-white">Detail View</span>
                    </motion.div>
                  </div>
                  <motion.div 
                    className="mt-3 px-3 py-1 flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: durations.base, delay: 0.4 }}
                  >
                    <div className="h-1 w-1 rounded-full bg-accent" />
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Component Verification</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Progress Navigation */}
        <motion.div 
          className="absolute right-12 top-1/3 flex flex-col gap-6 pointer-events-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: durations.cinematic, ease: easings.cinematic, delay: 0.6 }}
        >
          {HOTSPOTS.map((h, i) => (
            <motion.button
              key={h.id}
              onClick={() => {
                const scrollHeight = containerRef.current?.scrollHeight || 0;
                const viewHeight = window.innerHeight;
                const targetScroll = (i / (HOTSPOTS.length - 1)) * (scrollHeight - viewHeight);
                window.scrollTo({ top: targetScroll, behavior: 'smooth' });
              }}
              className="group flex items-center justify-end gap-4 text-right"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: durations.base, delay: 0.7 + (i * 0.05) }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className={cn(
                "text-[10px] uppercase tracking-[0.2em] transition-all duration-500",
                currentIndex === i ? "text-accent opacity-100 translate-x-0" : "text-foreground/20 opacity-0 translate-x-4 group-hover:opacity-60 group-hover:translate-x-0"
              )}>
                {h.title}
              </span>
              <motion.div 
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all duration-500",
                  currentIndex === i ? "bg-accent scale-150 shadow-[0_0_12px_rgba(242,169,0,0.5)]" : "bg-foreground/10 group-hover:bg-foreground/30"
                )}
                animate={currentIndex === i ? { scale: [1.5, 1.7, 1.5] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.button>
          ))}
        </motion.div>

        {/* Scroll Progress Bar (Bottom) */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-foreground/5">
          <motion.div 
            className="h-full bg-accent shadow-[0_0_10px_rgba(242,169,0,0.3)]"
            style={{ scaleX: scrollYProgress, originX: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
