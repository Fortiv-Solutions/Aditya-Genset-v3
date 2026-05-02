import { Link } from "react-router-dom";
import { SectionReveal } from "./SectionReveal";
import { ChevronRight, Zap, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// DG Sets Images
import dgProduct from "@/assets/brand/dg-product.jpg";
import dgReal1 from "@/assets/brand/dg-real-1.png";
import dgReal2 from "@/assets/brand/dg-real-2.jpg";
import dgRealistic from "@/assets/brand/dg-realistic.png";
import controlPanel from "@/assets/brand/control-panel.jpg";

// Non-Standard Images
import containerImg from "@/assets/brand/container.png";
import nonStandard from "@/assets/brand/non-standard.jpeg";
import fuelTank from "@/assets/brand/fuel-tank.jpg";

const CATEGORIES = [
  {
    title: "DG SETS",
    desc: "High-performance diesel generator sets for industrial and commercial power..",
    icon: Zap,
    images: [dgProduct, dgReal1, dgReal2, dgRealistic, controlPanel],
    href: "/products/silent-62-5",
  },
  {
    title: "NON STANDARD",
    desc: "Customized containers and specialized enclosures tailored to unique..",
    icon: Box,
    images: [containerImg, nonStandard, fuelTank],
    href: "/products",
  },
];

function ImageSlider({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt="Product"
          className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
        />
      </AnimatePresence>
      
      {/* Slide Indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "w-6 bg-accent" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function ProductCategories() {
  return (
    <section className="relative flex min-h-[60vh] snap-center flex-col justify-center bg-white py-12">
      <div className="container-x max-w-5xl">
        <SectionReveal variant="fadeUp" className="text-center mb-10">
          <div className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-2">
            Official Range
          </div>
          <h2 className="font-display text-3xl font-black text-black md:text-4xl mb-3">
            Our Products
          </h2>
          <p className="mx-auto max-w-xl text-xs text-gray-500 leading-relaxed">
            Select a category to explore our comprehensive range of power solutions and customized enclosures.
          </p>
        </SectionReveal>

        <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
          {CATEGORIES.map((cat, i) => (
            <SectionReveal
              key={cat.title}
              variant={i % 2 === 0 ? "slideLeft" : "slideRight"}
              delay={i * 150}
              className="h-full"
            >
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Link
                  to={cat.href}
                  className="group relative flex flex-col h-full min-h-[280px] overflow-hidden rounded-xl bg-[#F5F5F5] transition-all duration-500 hover:shadow-[0_10px_30px_-8px_rgba(0,0,0,0.15)]"
                >
                  {/* Image Container - Top Right with Slider */}
                  <div className="absolute top-0 right-0 w-3/5 h-2/3 p-4 transition-transform duration-700 group-hover:scale-105">
                    <ImageSlider images={cat.images} />
                  </div>

                  {/* Content (Bottom Left) */}
                  <div className="mt-auto p-6 relative z-10 flex flex-col items-start text-left">
                    {/* Icon Box */}
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white shadow-md transition-all duration-500 group-hover:bg-accent group-hover:text-black group-hover:scale-110">
                      <cat.icon size={18} strokeWidth={2.5} />
                    </div>
                    
                    <h3 className="font-display text-2xl font-black text-black tracking-tight mb-2">
                      {cat.title}
                    </h3>
                    
                    <p className="text-[11px] text-gray-600 max-w-[240px] mb-3 leading-relaxed">
                      {cat.desc}
                    </p>
                    
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-black group-hover:text-accent transition-colors duration-300">
                      Select Category <ChevronRight size={14} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
