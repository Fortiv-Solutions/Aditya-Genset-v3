/**
 * Enhanced PDF Extraction System
 * Automatically generates complete 10-chapter showcase and presentation data
 * Based on EKL15 template structure
 */

import type { ExtractedProduct } from "./pdfExtractor";
import type { SpecRow } from "@/data/products";

export interface EnhancedProductExtraction {
  // Basic product info
  name: string;
  model: string;
  kva: number;
  kwe: number;
  
  // Complete chapter data (10 chapters)
  chapters: ChapterData[];
  
  // Presentation hotspots (10 hotspots)
  hotspots: HotspotData[];
  
  // Metadata
  confidence: "high" | "medium" | "low";
  missingFields: string[];
  extractionNotes: string;
}

export interface ChapterData {
  id: string;
  number: string;
  title: string;
  tagline: string;
  specs: SpecRow[];
  highlights?: Array<{ value: number | string; suffix: string; label: string }>;
}

export interface HotspotData {
  id: string;
  title: string;
  description: string;
  x: number;
  y: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
  specs: SpecRow[];
}

/**
 * Enhanced extraction that generates complete 10-chapter structure
 * Fills in missing data with intelligent defaults based on available information
 */
export function enhanceProductExtraction(
  extracted: ExtractedProduct,
  additionalSpecs: SpecRow[]
): EnhancedProductExtraction {
  const kva = parseFloat(extracted.kva) || 0;
  const kwe = Math.round(kva * 0.8 * 10) / 10;
  const missingFields: string[] = [];
  
  // Helper to find spec value
  const findSpec = (patterns: string[]) => {
    const found = additionalSpecs.find((spec) =>
      patterns.some((pattern) => spec.label.toLowerCase().includes(pattern.toLowerCase()))
    );
    return found?.value || "";
  };
  
  // Helper to check if field is missing
  const checkField = (value: string | undefined, fieldName: string) => {
    if (!value || value.trim() === "" || value === "Refer datasheet") {
      missingFields.push(fieldName);
      return false;
    }
    return true;
  };
  
  // Extract all available data
  const engineModel = extracted.engineModel || findSpec(["engine model"]);
  const cylinders = findSpec(["cylinder", "cylinders"]) || "Refer datasheet";
  const displacement = findSpec(["displacement"]) || "Refer datasheet";
  const boreStroke = findSpec(["bore", "stroke"]) || "Refer datasheet";
  const grossPower = findSpec(["gross power", "engine power"]) || `${Math.round(kva * 0.9)} kWm`;
  const speed = extracted.frequency === "50 Hz" ? "1500 RPM" : "1800 RPM";
  
  const alternatorFrame = findSpec(["frame", "alternator frame"]) || "Refer datasheet";
  const avrModel = findSpec(["avr", "voltage regulator"]) || "AVR";
  const ratedCurrent = findSpec(["current", "rated current"]) || "Refer datasheet";
  
  const lubeOil = findSpec(["lube", "oil capacity"]) || "Refer datasheet";
  const coolingCapacity = findSpec(["coolant", "cooling capacity"]) || "Refer datasheet";
  const governor = findSpec(["governor"]) || "Mechanical";
  
  const shortCircuitRatio = findSpec(["short circuit"]) || "Refer datasheet";
  const waveformDistortion = findSpec(["waveform", "distortion"]) || "< 5%";
  const batterySize = findSpec(["battery"]) || "60 Ah";
  
  const protection = findSpec(["protection", "ip rating"]) || "IP23";
  const designAmbient = findSpec(["ambient", "temperature"]) || "40°C";
  const altitude = findSpec(["altitude"]) || "Up to 1000 m";
  
  const controller = extracted.controllerModel || findSpec(["controller", "control panel"]) || "DEIF SGC 120";
  const display = findSpec(["display"]) || "Backlit LCD";
  const communication = findSpec(["communication", "interface"]) || "USB, RS-485, CANbus";
  
  const isoCompliance = findSpec(["iso"]) || "ISO 8528";
  const ceCompliant = findSpec(["ce"]) || "CE Compliant";
  
  const warranty = findSpec(["warranty"]) || "12 months";
  
  checkField(engineModel, "Engine Model");
  checkField(extracted.alternatorBrand, "Alternator Brand");
  checkField(extracted.fuelConsumption, "Fuel Consumption");
  checkField(extracted.noiseLevel, "Noise Level");
  checkField(extracted.dimensions, "Dimensions");
  
  // Build 10 complete chapters following EKL15 structure
  const chapters: ChapterData[] = [
    // Chapter 01: Overview
    {
      id: "overview",
      number: "01",
      title: extracted.name,
      tagline: extracted.shortDesc || `${extracted.cpcb.toUpperCase()} compliant, ISO 8528 certified — built for demanding environments.`,
      specs: [
        { label: "Model", value: extracted.model },
        { label: "Rating", value: `${kva} kVA / ${kwe} kWe` },
        { label: "Voltage", value: extracted.voltage || "415 V" },
        { label: "Frequency", value: extracted.frequency || "50 Hz" },
        { label: "Speed", value: speed },
        { label: "Compliance", value: extracted.cpcb === "ii" ? "CPCB II" : "CPCB IV+" },
      ],
      highlights: [
        { value: kva, suffix: " kVA", label: "Prime power" },
        { value: parseFloat(extracted.noiseLevel) || 75, suffix: " dB(A)", label: "Sound @ 1m" },
        { value: 27, suffix: "+ yrs", label: "Heritage" },
      ],
    },
    
    // Chapter 02: Engine
    {
      id: "engine",
      number: "02",
      title: "Engine",
      tagline: "Built for continuous duty and tight load response.",
      specs: [
        { label: "Make", value: extracted.engineBrand },
        { label: "Model", value: engineModel },
        { label: "No. of Cylinders", value: cylinders },
        { label: "Displacement", value: displacement },
        { label: "Bore / Stroke", value: boreStroke },
        { label: "Gross Engine Power", value: grossPower },
        { label: "Speed", value: speed },
        { label: "Frequency", value: extracted.frequency || "50 Hz" },
      ],
    },
    
    // Chapter 03: Fuel, Lube & Cooling
    {
      id: "fuel",
      number: "03",
      title: "Fuel, Lube & Cooling",
      tagline: "Optimized for efficiency and reliability.",
      specs: [
        { label: "Recommended Fuel", value: "High Speed Diesel" },
        { label: "Fuel Consumption", value: extracted.fuelConsumption || "Refer datasheet" },
        { label: "Fuel Tank Capacity", value: extracted.fuelTankCapacity || "Refer datasheet" },
        { label: "Governor", value: governor },
        { label: "Lube Oil", value: lubeOil },
        { label: "Cooling", value: extracted.coolingType || "Radiator (Water Cooled)" },
        { label: "Coolant Capacity", value: coolingCapacity },
        { label: "Silencer Type", value: "Residential" },
      ],
    },
    
    // Chapter 04: Alternator
    {
      id: "alternator",
      number: "04",
      title: "Alternator",
      tagline: "Clean, stable 3-phase power for sensitive loads.",
      specs: [
        { label: "Make", value: extracted.alternatorBrand || "Stamford" },
        { label: "Frame", value: alternatorFrame },
        { label: "Power Factor", value: extracted.powerFactor || "0.8" },
        { label: "Phases", value: extracted.phase || "3-Phase" },
        { label: "Voltage", value: extracted.voltage || "415 V" },
        { label: "Current", value: ratedCurrent },
        { label: "AVR Model", value: avrModel },
        { label: "Protection", value: protection },
      ],
    },
    
    // Chapter 05: Electrical Performance
    {
      id: "electrical",
      number: "05",
      title: "Electrical Performance",
      tagline: "Precision power delivery with advanced protection.",
      specs: [
        { label: "Short Circuit Ratio", value: shortCircuitRatio },
        { label: "Waveform Distortion", value: waveformDistortion },
        { label: "Voltage Regulation", value: "±1%" },
        { label: "AVR Type", value: avrModel },
        { label: "Battery Size", value: batterySize },
        { label: "Starter Motor", value: "2.5 kW" },
        { label: "System Voltage", value: "12 V DC" },
      ],
    },
    
    // Chapter 06: Enclosure & Sound
    {
      id: "enclosure",
      number: "06",
      title: "Enclosure & Sound",
      tagline: `${extracted.cpcb === "ii" ? "CPCB II" : "CPCB IV+"} compliant. Engineered to disappear into its environment.`,
      specs: [
        { label: "Sound Level", value: extracted.noiseLevel || "Refer datasheet" },
        { label: "Protection", value: protection },
        { label: "Design Ambient", value: designAmbient },
        { label: "Altitude", value: altitude },
        { label: "CPCB", value: extracted.cpcb === "ii" ? "CPCB II" : "CPCB IV+" },
        { label: "Construction", value: "1.6 mm CRCA panels" },
        { label: "Insulation", value: "PU foam, 50 mm" },
      ],
    },
    
    // Chapter 07: Control Panel
    {
      id: "control",
      number: "07",
      title: "Control Panel",
      tagline: "Real-time telemetry. Auto-start. Remote monitoring ready.",
      specs: [
        { label: "Controller", value: controller },
        { label: "Display", value: display },
        { label: "Modes", value: "Auto / Manual / Remote" },
        { label: "AMF", value: "Supported" },
        { label: "Communication", value: communication },
        { label: "Protection", value: "IP65" },
        { label: "Operating Temp", value: "-20 to 65°C" },
      ],
    },
    
    // Chapter 08: Protection & Approvals
    {
      id: "protection",
      number: "08",
      title: "Protection & Approvals",
      tagline: "Comprehensive safety systems and international certifications.",
      specs: [
        { label: "Engine Protection", value: "Temp, Oil, Fuel, Speed" },
        { label: "Electrical Protection", value: "UV, OV, UF, OF, OC" },
        { label: "ISO Compliance", value: isoCompliance },
        { label: "CE", value: ceCompliant },
        { label: "EMC", value: "EN 61000-6-2/4" },
        { label: "Low Voltage Directive", value: "EN 61010-1" },
      ],
    },
    
    // Chapter 09: Standard Supply & Options
    {
      id: "supply",
      number: "09",
      title: "Standard Supply & Options",
      tagline: "Complete package with optional upgrades available.",
      specs: [
        { label: "Engine", value: "Water-cooled diesel" },
        { label: "Alternator", value: "Single bearing IP23" },
        { label: "Controller", value: "Microprocessor-based" },
        { label: "Base Frame", value: "Anti-vibration mounts" },
        { label: "Fuel Tank", value: extracted.fuelTankCapacity || "Integrated" },
        { label: "Documentation", value: "Complete manuals" },
        { label: "Warranty", value: warranty },
      ],
    },
    
    // Chapter 10: Dimensions & Weight
    {
      id: "dimensions",
      number: "10",
      title: "Dimensions & Weight",
      tagline: "Compact footprint, easy to site and service.",
      specs: [
        { label: "Dimensions (L×W×H)", value: extracted.dimensions || "Refer datasheet" },
        { label: "Dry Weight", value: extracted.dryWeight || "Refer datasheet" },
        { label: "Fuel Tank", value: extracted.fuelTankCapacity || "Refer datasheet" },
        { label: "Rating", value: `${kva} kVA / ${kwe} kWe` },
        { label: "Power Factor", value: extracted.powerFactor || "0.8" },
      ],
    },
  ];
  
  // Build 10 presentation hotspots matching the chapters
  const hotspots: HotspotData[] = [
    {
      id: "overview",
      title: extracted.name,
      description: extracted.shortDesc || `The ${extracted.model} is an ${extracted.engineBrand}-powered ${kva} kVA silent diesel generator set, designed to comply with ISO 8528.`,
      x: 50,
      y: 50,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      specs: chapters[0].specs.slice(0, 5),
    },
    {
      id: "engine",
      title: "Engine",
      description: `${extracted.engineBrand} ${engineModel}. Built for continuous duty and tight load response.`,
      x: 42,
      y: 48,
      zoom: 1.8,
      offsetX: 8,
      offsetY: 2,
      specs: chapters[1].specs.slice(0, 5),
    },
    {
      id: "fuel",
      title: "Fuel, Lube & Cooling",
      description: "Optimized fuel system with efficient cooling for extended runtime.",
      x: 35,
      y: 55,
      zoom: 1.6,
      offsetX: 15,
      offsetY: -5,
      specs: chapters[2].specs.slice(0, 5),
    },
    {
      id: "alternator",
      title: "Alternator",
      description: `${extracted.alternatorBrand || "Stamford"} brushless alternator. Clean, stable 3-phase power.`,
      x: 65,
      y: 45,
      zoom: 1.5,
      offsetX: -15,
      offsetY: 5,
      specs: chapters[3].specs.slice(0, 5),
    },
    {
      id: "electrical",
      title: "Electrical Performance",
      description: "Precision power delivery with advanced voltage regulation.",
      x: 78,
      y: 38,
      zoom: 2.0,
      offsetX: -25,
      offsetY: 10,
      specs: chapters[4].specs.slice(0, 5),
    },
    {
      id: "enclosure",
      title: "Enclosure & Sound",
      description: `${extracted.cpcb === "ii" ? "CPCB II" : "CPCB IV+"} compliant acoustic enclosure. ${extracted.noiseLevel || "Low noise"} operation.`,
      x: 50,
      y: 75,
      zoom: 1.2,
      offsetX: 0,
      offsetY: -10,
      specs: chapters[5].specs.slice(0, 5),
    },
    {
      id: "control",
      title: "Control Panel",
      description: `${controller} digital controller with real-time monitoring.`,
      x: 70,
      y: 30,
      zoom: 1.8,
      offsetX: -20,
      offsetY: 15,
      specs: chapters[6].specs.slice(0, 5),
    },
    {
      id: "protection",
      title: "Protection & Approvals",
      description: "Comprehensive safety systems and international certifications.",
      x: 60,
      y: 60,
      zoom: 1.4,
      offsetX: -10,
      offsetY: 0,
      specs: chapters[7].specs.slice(0, 5),
    },
    {
      id: "supply",
      title: "Standard Supply",
      description: "Complete package with all essential components included.",
      x: 40,
      y: 65,
      zoom: 1.3,
      offsetX: 10,
      offsetY: -5,
      specs: chapters[8].specs.slice(0, 5),
    },
    {
      id: "dimensions",
      title: "Dimensions & Weight",
      description: `Compact footprint: ${extracted.dimensions || "Refer datasheet"}`,
      x: 50,
      y: 50,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      specs: chapters[9].specs.slice(0, 5),
    },
  ];
  
  // Calculate confidence based on missing fields
  let confidence: "high" | "medium" | "low" = "high";
  if (missingFields.length > 5) {
    confidence = "low";
  } else if (missingFields.length > 2) {
    confidence = "medium";
  }
  
  const extractionNotes = missingFields.length > 0
    ? `Some fields are missing or incomplete: ${missingFields.slice(0, 5).join(", ")}${missingFields.length > 5 ? `, and ${missingFields.length - 5} more` : ""}. Please review and update before publishing.`
    : "All major fields extracted successfully. Ready for review.";
  
  return {
    name: extracted.name,
    model: extracted.model,
    kva,
    kwe,
    chapters,
    hotspots,
    confidence,
    missingFields,
    extractionNotes,
  };
}
