import dgOverview from "@/assets/products/showcase/main-view.png";
import dgEngine from "@/assets/products/parts/engine-real.jpg"; // Placeholder as original is missing
import dgAlternator from "@/assets/products/parts/engine-real.jpg"; // Placeholder as original is missing
import dgEnclosure from "@/assets/products/parts/enclosure.jpg";
import dgDimensions from "@/assets/products/showcase/main-view.png"; // Placeholder
import dgThumb from "@/assets/products/parts/enclosure.jpg";
import dgControl from "@/assets/products/parts/enclosure.jpg"; // Placeholder
import dgFuel from "@/assets/products/parts/enclosure.jpg"; // Placeholder
import escortVideo from "@/assets/products/showcase/product-video.mp4";

export type ProductStatus = "active" | "coming_soon";
export type KvaRange = "15-62.5" | "75-200" | "250-500";

export interface ProductSummary {
  slug: string;
  name: string;
  kva: number;
  range: KvaRange;
  status: ProductStatus;
  thumbnail: string;
}

export interface SpecRow {
  label: string;
  value: string;
}

export interface ShowcaseSection {
  id: string;
  number: string;
  title: string;
  tagline?: string;
  image: string;
  alt: string;
  specs: SpecRow[];
  highlight?: { value: number; suffix?: string; label: string }[];
  videoUrl?: string;
}

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
  specs: SpecRow[];
  subImage?: string;
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
}

export interface ShowcaseProduct extends ProductSummary {
  status: "active";
  hero: string;
  sections: ShowcaseSection[];
  hotspots: Hotspot[];
}

export const SHOWCASE: ShowcaseProduct = {
  slug: "silent-62-5",
  name: "62.5 kVA Silent DG Set",
  kva: 62.5,
  range: "15-62.5",
  status: "active",
  thumbnail: dgOverview,
  hero: dgOverview,
  hotspots: [
    {
      id: "overview",
      x: 50, y: 50,
      title: "Silent Diesel Generator",
      description: "62.5 kVA silent diesel generator overview. Engineered for premium reliability and quiet operation.",
      subImage: dgThumb,
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
      subImage: dgEngine,
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
      subImage: dgAlternator,
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
      subImage: dgEnclosure,
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
      subImage: dgDimensions,
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
  ],
  sections: [
    {
      id: "overview",
      number: "01",
      title: "62.5 kVA Silent DG Set",
      tagline: "Industrial-grade reliability, whisper-quiet by design.",
      image: dgOverview,
      alt: "62.5 kVA silent diesel generator overview",
      specs: [
        { label: "Model", value: "ADG-62.5S" },
        { label: "Rating", value: "62.5 kVA / 50 kW" },
        { label: "Compliance", value: "CPCB IV+" },
      ],
      highlight: [
        { value: 62.5, suffix: " kVA", label: "Prime power" },
        { value: 75, suffix: " dB(A)", label: "Sound @ 1m" },
        { value: 27, suffix: "+ yrs", label: "Heritage" },
      ],
    },
    {
      id: "engine",
      number: "02",
      title: "Engine",
      tagline: "Built for continuous duty and tight load response.",
      image: dgEngine,
      alt: "Turbocharged 4-cylinder diesel engine",
      specs: [
        { label: "Configuration", value: "4-cylinder, inline" },
        { label: "Aspiration", value: "Turbocharged" },
        { label: "Displacement", value: "~3.9 L" },
        { label: "Cooling", value: "Water-cooled" },
        { label: "Fuel", value: "High-speed diesel" },
      ],
    },
    {
      id: "fuel",
      number: "03",
      title: "Fuel & Cooling",
      tagline: "High-capacity fuel tank and optimized radiator cooling.",
      image: dgFuel,
      alt: "Fuel tank and radiator system",
      specs: [
        { label: "Fuel Tank", value: "120 L" },
        { label: "Cooling", value: "Radiator / Fan" },
        { label: "Lube Oil", value: "15W40 CI4+" },
      ],
    },
    {
      id: "power",
      number: "04",
      title: "Power Output",
      tagline: "Clean, stable 3-phase power for sensitive loads.",
      image: dgAlternator,
      alt: "Industrial brushless alternator with copper windings",
      specs: [
        { label: "Rating", value: "62.5 kVA / 50 kW" },
        { label: "Voltage", value: "415 V" },
        { label: "Frequency", value: "50 Hz" },
        { label: "Phase", value: "3-phase, 4-wire" },
        { label: "Power factor", value: "0.8 lagging" },
      ],
    },
    {
      id: "sound",
      number: "05",
      title: "Sound & Enclosure",
      tagline: "CPCB IV+ compliant. Engineered to disappear into its environment.",
      image: dgEnclosure,
      alt: "Acoustic enclosure with louvered ventilation",
      specs: [
        { label: "Sound level", value: "75 dB(A) @ 1m" },
        { label: "At 7m", value: "63 dB(A)" },
        { label: "Construction", value: "1.6 mm CRCA panels" },
        { label: "Insulation", value: "PU foam, 50 mm" },
        { label: "Finish", value: "7-tank powder coat" },
      ],
    },
    {
      id: "control",
      number: "06",
      title: "Control Panel",
      tagline: "Intelligent management and remote monitoring.",
      image: dgControl,
      alt: "Digital control panel interface",
      specs: [
        { label: "Controller", value: "Deep Sea / DEIF" },
        { label: "Display", value: "Backlit LCD" },
        { label: "Monitoring", value: "Voltage, Current, Hz, Oil" },
        { label: "Protection", value: "IP65 rated" },
      ],
    },
    {
      id: "protection",
      number: "07",
      title: "Protection & Approvals",
      tagline: "Engine and electrical safeguards as standard.",
      image: dgOverview,
      alt: "Generator protection systems",
      specs: [
        { label: "Engine", value: "Low oil, High temp shutdown" },
        { label: "Electrical", value: "Under/Over voltage, Overload" },
        { label: "Compliance", value: "CE, ISO 8528" },
      ],
    },
    {
      id: "supply",
      number: "08",
      title: "Standard Supply",
      tagline: "Complete turnkey solution ready to run.",
      image: dgFuel,
      alt: "Scope of supply overview",
      specs: [
        { label: "Standard", value: "First fill lube oil & coolant" },
        { label: "Inclusions", value: "Battery, cables, day tank" },
        { label: "Documents", value: "Manuals & wiring diagrams" },
      ],
    },
    {
      id: "dimensions",
      number: "09",
      title: "Dimensions & Weight",
      tagline: "Compact footprint, easy to site and service.",
      image: dgDimensions,
      alt: "Side profile view of silent diesel generator",
      specs: [
        { label: "Length", value: "2400 mm" },
        { label: "Width", value: "1050 mm" },
        { label: "Height", value: "1550 mm" },
        { label: "Dry weight", value: "~1250 kg" },
        { label: "Wet weight", value: "~1450 kg" },
      ],
    },
    {
      id: "video",
      number: "10",
      title: "Product Video",
      tagline: "Escort DG Set — Multiple views and 360° product showcase.",
      image: dgOverview,
      videoUrl: escortVideo,
      alt: "Escort DG set 360 degree showcase",
      specs: [
        { label: "Duration", value: "8 sec" },
        { label: "Quality", value: "1080p HD" },
        { label: "Format", value: "MP4" },
      ],
    },
  ],
};

export const PRODUCTS: ProductSummary[] = [
  {
    slug: SHOWCASE.slug,
    name: SHOWCASE.name,
    kva: SHOWCASE.kva,
    range: SHOWCASE.range,
    status: "active",
    thumbnail: dgOverview,
  },
];

// ── EKL 15 (2 Cyl)-IV Showcase ──────────────────────────────────────────────
import ekl15Engine    from "@/assets/products/parts/engine-real.jpg";
import ekl15Control   from "@/assets/products/parts/enclosure.jpg";
import ekl15Overview  from "@/assets/products/escorts/escort_15kva.jpg";
import ekl15Alternator from "@/assets/products/parts/engine-real.jpg";
import ekl15Dimensions from "@/assets/products/escorts/escort_40kva_main.jpg";
import ekl15Enclosure  from "@/assets/products/parts/enclosure.jpg";
import ekl15Supply     from "@/assets/products/escorts/escort_20kva_1.jpg";

import escort15KVA from "@/assets/products/escorts/escort_15kva.jpg";
import escort15KVA2 from "@/assets/products/escorts/escort_15kva_2.jpg";
import escort20KVA1 from "@/assets/products/escorts/escort_20kva_1.jpg";
import escort30KVA from "@/assets/products/escorts/escort_30kva.jpg";
import escort40KVA2 from "@/assets/products/escorts/escort_40kva_2.jpg";
import escort40KVA from "@/assets/products/escorts/escort_40kva_main.jpg";
import escortVideoThumb from "@/assets/products/showcase/main-view.png";
import ekl15Electrical from "@/assets/products/parts/enclosure.jpg";
import ekl15Protection from "@/assets/products/parts/enclosure.jpg";
import ekl15RealDG     from "@/assets/products/parts/engine-real.jpg";

export const EKL15_SHOWCASE: ShowcaseProduct = {
  slug: "ekl-15-2cyl",
  name: "EKL 15 kVA (2 Cyl) DG Set",
  kva: 15,
  range: "15-62.5",
  status: "active",
  thumbnail: escort15KVA,
  hero: escort15KVA,
  hotspots: [
    {
      id: "overview",
      x: 50, y: 50,
      title: "EKL 15 kVA DG Set",
      description: "Escorts-powered 15 kVA silent generator. Compact, CPCB IV compliant — built for demanding environments.",
      subImage: escort15KVA,
      zoom: 1, offsetX: 0, offsetY: 0,
      specs: []
    },
    {
      id: "engine",
      x: 42, y: 55,
      title: "Escorts G15-IV Engine",
      description: "2-cylinder, naturally aspirated diesel engine with electronic governor for stable frequency output.",
      subImage: ekl15Engine,
      zoom: 1.8, offsetX: 8, offsetY: 2,
      specs: []
    },
    {
      id: "fuel",
      x: 58, y: 65,
      title: "Fuel, Lube & Cooling",
      description: "Highly efficient fuel consumption with integrated radiator cooling and high-capacity lube oil system.",
      subImage: escort15KVA,
      zoom: 1.4, offsetX: -5, offsetY: -5,
      specs: []
    },
    {
      id: "alternator",
      x: 25, y: 48,
      title: "Alternator & Electrical",
      description: "Brushless, self-excited alternator with ±1% AVR and high-precision electrical output.",
      subImage: ekl15Alternator,
      zoom: 1.6, offsetX: 15, offsetY: -5,
      specs: []
    },
    {
      id: "enclosure",
      x: 85, y: 58,
      title: "Enclosure & Sound",
      description: "CPCB IV compliant acoustic enclosure for silent residential and commercial operation.",
      subImage: ekl15Enclosure,
      zoom: 1.5, offsetX: -15, offsetY: 5,
      specs: []
    },
    {
      id: "control",
      x: 75, y: 35,
      title: "Control Panel",
      description: "Advanced DEIF SGC 120 microprocessor controller with full AMF support and CANbus.",
      subImage: ekl15Control,
      zoom: 2.0, offsetX: -20, offsetY: 15,
      specs: []
    },
    {
      id: "protection",
      x: 70, y: 38,
      title: "Protection & Approvals",
      description: "Comprehensive ANSI electrical and engine shutdown protections. CE compliant.",
      subImage: ekl15Protection,
      zoom: 2.2, offsetX: -15, offsetY: 12,
      specs: []
    },
    {
      id: "supply",
      x: 50, y: 50,
      title: "Standard Supply",
      description: "Complete turnkey package with extensive standard inclusions and optional upgrades.",
      subImage: ekl15Supply,
      zoom: 1.2, offsetX: 0, offsetY: 0,
      specs: []
    },
    {
      id: "dimensions",
      x: 50, y: 78,
      title: "Dimensions & Weight",
      description: "Compact dimensions — easy to transport, site and service.",
      subImage: ekl15Dimensions,
      zoom: 1.2, offsetX: 0, offsetY: -10,
      specs: []
    }
  ],
  sections: [
    {
      id: "overview",
      number: "01",
      title: "EKL 15 kVA Silent DG Set",
      tagline: "CPCB IV+ compliant, ISO 8528 certified — built for demanding environments.",
      image: escort15KVA,
      alt: "ATM EKL 15 kVA 2-cylinder silent diesel generator",
      specs: [
        { label: "Model", value: "EKL15-IV (2 Cyl)" },
        { label: "Rating", value: "15 kVA / 12 kWe" },
        { label: "Voltage", value: "415 V, 50 Hz" },
        { label: "Overload", value: "10% per ISO 3046" },
        { label: "Compliance", value: "CPCB IV+" },
      ],
      highlight: [
        { value: 15, suffix: " kVA", label: "Prime power" },
        { value: 70, suffix: " L", label: "Day fuel tank" },
        { value: 27, suffix: "+ yrs", label: "Heritage" },
      ],
    },
    {
      id: "engine",
      number: "02",
      title: "Engine",
      tagline: "Escorts G15-IV — 2-cylinder, naturally aspirated, 1500 RPM, built for reliability.",
      image: escort15KVA2,
      alt: "Escorts 2-cylinder diesel engine",
      specs: [
        { label: "Make", value: "Escorts" },
        { label: "Model", value: "G15-IV" },
        { label: "Distribution", value: "4 Strokes" },
        { label: "Aspiration", value: "Natural Aspiration" },
        { label: "Configuration", value: "2-cylinder In-line" },
        { label: "Displacement", value: "1.56 L" },
        { label: "Bore × Stroke", value: "95 × 110 mm" },
        { label: "Speed", value: "1500 RPM" },
        { label: "Gross Power (PRP)", value: "14.1 kWm / 19 hp" },
      ],
    },
    {
      id: "fuel",
      number: "03",
      title: "Fuel, Lube & Cooling",
      tagline: "Mechanical fuel injection · 15W40 CI4 lube · Radiator cooled at 75°C thermostat.",
      image: escort20KVA1,
      alt: "Fuel and cooling system of EKL 15",
      specs: [
        { label: "Governor", value: "Mechanical" },
        { label: "Air Filter", value: "Dry type" },
        { label: "Lube Oil", value: "15W40 CI4, 5.5 L" },
        { label: "Cooling", value: "Radiator / Water cooled" },
        { label: "Fuel (100% Load)", value: "3.78 L/hr" },
        { label: "Fuel (75% Load)", value: "2.98 L/hr" },
        { label: "Fuel (50% Load)", value: "2.28 L/hr" },
        { label: "Exhaust Outlet", value: "40 mm min. pipe" },
        { label: "Silencer", value: "Residential type (qty: 1)" },
      ],
    },
    {
      id: "alternator",
      number: "04",
      title: "Alternator & Electrical",
      tagline: "Stamford S0L1-P1 — brushless, self-excited, AS540 AVR, ±1% regulation, full reactance data.",
      image: escort15KVA,
      alt: "Stamford brushless alternator and electrical wiring",
      specs: [
        { label: "Make / Frame", value: "Stamford S0L1-P1 (CG/Leroy opt)" },
        { label: "Phases / Current", value: "1 or 3 Phase / 62.50A or 20.88A" },
        { label: "Insulation / Pitch", value: "H Class / 2/3 Double layer concentric" },
        { label: "AVR / Voltage Reg", value: "AS540 / ±1%" },
        { label: "Efficiency (75% / 100%)", value: "86.4% / 83.5%" },
        { label: "Waveform Distortion", value: "NL < 2.5%, NDBLL < 5%" },
        { label: "Short Circuit Ratio", value: "0.515" },
        { label: "Starter / Battery", value: "12V DC / 2.5kW / 60Ah" },
        { label: "Protection", value: "IP23" },
      ],
    },
    {
      id: "enclosure",
      number: "05",
      title: "Enclosure",
      tagline: "CPCB IV+ compliant. Acoustic: 1760 × 950 × 1495 mm · 70 L day tank.",
      image: ekl15Enclosure,
      alt: "EKL 15 acoustic enclosure side profile",
      specs: [
        { label: "Acoustic L", value: "1760 mm" },
        { label: "Acoustic W", value: "950 mm" },
        { label: "Acoustic H", value: "1495 mm" },
        { label: "Day Fuel Tank", value: "70 L" },
        { label: "Protection", value: "IP23" },
        { label: "Design Ambient", value: "40°C" },
        { label: "Altitude Rating", value: "Up to 1000 m" },
        { label: "Cooling Airflow", value: "0.58 m³/sec" },
        { label: "CPCB", value: "IV+ Compliant" },
      ],
    },
    {
      id: "control",
      number: "06",
      title: "Control Panel",
      tagline: "DEIF SGC 120 — advanced AMF controller with CANbus and 100-event log.",
      image: escort15KVA2,
      alt: "DEIF SGC 120 digital genset controller",
      specs: [
        { label: "Controller", value: "DEIF SGC 120" },
        { label: "Display", value: "LCD backlit, full graphics" },
        { label: "Operation", value: "Auto / Manual / Remote / AMF" },
        { label: "Metering", value: "V, A, kW, kVA, Hz, Temp, Oil" },
        { label: "Vibration / Shock", value: "2G / 15g" },
        { label: "Operating Temp", value: "-20°C to 65°C" },
        { label: "Event Log", value: "100 events" },
      ],
    },
    {
      id: "protection",
      number: "07",
      title: "Protection & Approvals",
      tagline: "Full ANSI protection suite — engine & electrical shutdowns, CE compliant.",
      image: escort30KVA,
      alt: "DEIF protection relay and ANSI protection indicators",
      specs: [
        { label: "Engine Protections", value: "5 shutdown/alarm triggers" },
        { label: "Electrical Protections", value: "ANSI 27, 59, 51, 81L, 81H + Phase Reversal" },
        { label: "CE Compliant", value: "Yes" },
        { label: "Low Voltage Directive", value: "EN 61010-1" },
        { label: "EMC Immunity", value: "EN 61000-6-2" },
        { label: "EMC Emissions", value: "EN 61000-6-4" },
      ],
    },
    {
      id: "supply",
      number: "08",
      title: "Standard Supply & Extras",
      tagline: "17 standard inclusions. Optional extras: PMG, ATS, sync module and more.",
      image: escort40KVA2,
      alt: "EKL 15 open set showing standard scope of supply",
      specs: [
        { label: "Standard Items", value: "17 (complete turnkey)" },
        { label: "Optional Groups", value: "Engine / Alternator / Cooling / General" },
        { label: "Documentation", value: "Full set — operation, maintenance & wiring" },
        { label: "Warranty", value: "Refer warranty policy" },
      ],
    },
    {
      id: "dimensions",
      number: "09",
      title: "Dimensions & Weight",
      tagline: "Acoustic: 1760 × 950 × 1495 mm · Open set: NA (site-specific) · Day tank: 70 L.",
      image: escort40KVA,
      alt: "EKL 15 generator dimensions diagram",
      specs: [
        { label: "Acoustic L", value: "1760 mm" },
        { label: "Acoustic W", value: "950 mm" },
        { label: "Acoustic H", value: "1495 mm" },
        { label: "Day Fuel Tank", value: "70 L" },
        { label: "Open Set", value: "Dimensions: Site specific" },
        { label: "Rating", value: "15 kVA / 12 kWe @ 415V, 50Hz, 0.8 p.f." },
        { label: "Warranty", value: "Refer warranty policy" },
      ],
    },
    {
      id: "video",
      number: "10",
      title: "Product Video",
      tagline: "Escort DG Set — Multiple views and 360° product showcase.",
      image: escortVideoThumb,
      videoUrl: escortVideo,
      alt: "Escort DG set 360 degree showcase",
      specs: [
        { label: "Duration", value: "8 sec" },
        { label: "Format", value: "MP4" },
        { label: "Source", value: "360° View" },
      ],
    },
  ],
};


