/**
 * Escorts Product Template
 * Standard structure for all Escorts/Kubota products
 * Based on EKL 15 (2 Cyl) as the reference template
 */

export interface EscortsProductData {
  // Basic Product Info
  model: string
  name: string
  kva: number
  kwe: number
  slug: string
  
  // Engine Specs
  engineMake: string
  engineModel: string
  cylinders: number
  displacement: string
  boreStroke: string
  grossPower: string
  speed: number
  
  // Electrical
  voltage: string
  frequency: number
  phases: string
  powerFactor: number
  ratedCurrent: string
  
  // Alternator
  alternatorMake: string
  alternatorFrame: string
  avrModel: string
  
  // Performance
  fuelConsumption: string
  noiseLevel: string
  
  // Physical
  length: string
  width: string
  height: string
  fuelTankCapacity: string
  
  // Compliance
  cpcb: string
  isoCompliance: string
  
  // Images
  cardImage: string
  showcaseImages: {
    overview: string
    engine: string
    fuel: string
    alternator: string
    electrical: string
    enclosure: string
    control: string
    protection: string
    supply: string
    dimensions: string
  }
  
  // Presentation Images
  presentationMainImage1: string
  presentationMainImage2: string
  presentationSubImages: {
    overview: string
    engine: string
    fuel: string
    alternator: string
    electrical: string
    enclosure: string
    control: string
    protection: string
    supply: string
    dimensions: string
  }
}

/**
 * Generate complete product data from template
 */
export function generateEscortsProduct(data: EscortsProductData) {
  return {
    // Product Card Data (for DG Sets Category page)
    card: {
      id: data.slug,
      model: data.model,
      kva: data.kva,
      engine: "Escorts",
      application: "Prime",
      fuel: data.fuelConsumption,
      noise: data.noiseLevel,
      image: data.cardImage,
      compliance: data.cpcb
    },
    
    // Showcase Data (for Product Detail page - ScrollStory)
    showcase: {
      slug: data.slug,
      name: data.name,
      kva: data.kva,
      range: "15-62.5",
      status: "active",
      thumbnail: data.cardImage,
      hero: data.showcaseImages.overview,
      
      sections: [
        // Chapter 01: Overview
        {
          id: "overview",
          number: "01",
          title: data.name,
          tagline: "CPCB IV+ compliant, ISO 8528 certified — built for demanding environments.",
          image: data.showcaseImages.overview,
          alt: `${data.model} silent diesel generator`,
          specs: [
            { label: "Model", value: data.model },
            { label: "Rating", value: `${data.kva} kVA / ${data.kwe} kWe` },
            { label: "Voltage", value: data.voltage },
            { label: "Frequency", value: `${data.frequency} Hz` },
            { label: "Speed", value: `${data.speed} RPM` },
            { label: "Compliance", value: data.cpcb },
          ],
          highlight: [
            { value: data.kva, suffix: " kVA", label: "Prime power" },
            { value: parseFloat(data.noiseLevel), suffix: " dB(A)", label: "Sound @ 1m" },
            { value: 27, suffix: "+ yrs", label: "Heritage" },
          ],
        },
        
        // Chapter 02: Engine
        {
          id: "engine",
          number: "02",
          title: "Engine",
          tagline: "Built for continuous duty and tight load response.",
          image: data.showcaseImages.engine,
          alt: `${data.cylinders}-cylinder diesel engine`,
          specs: [
            { label: "Make", value: data.engineMake },
            { label: "Model", value: data.engineModel },
            { label: "No. of Cylinders", value: data.cylinders.toString() },
            { label: "Displacement", value: data.displacement },
            { label: "Bore / Stroke", value: data.boreStroke },
            { label: "Gross Engine Power", value: data.grossPower },
            { label: "Speed", value: `${data.speed} RPM` },
            { label: "Frequency", value: `${data.frequency} Hz` },
          ],
        },
        
        // Chapter 03: Fuel, Lube & Cooling
        {
          id: "fuel",
          number: "03",
          title: "Fuel, Lube & Cooling",
          tagline: "Optimized for efficiency and reliability.",
          image: data.showcaseImages.fuel,
          alt: "Fuel system and cooling",
          specs: [
            { label: "Recommended Fuel", value: "High Speed Diesel" },
            { label: "Fuel Consumption", value: data.fuelConsumption },
            { label: "Governor", value: "Mechanical" },
            { label: "Lube Oil", value: "15W40 CI4" },
            { label: "Cooling", value: "Radiator (Water Cooled)" },
            { label: "Silencer Type", value: "Residential" },
          ],
        },
        
        // Chapter 04: Alternator
        {
          id: "alternator",
          number: "04",
          title: "Alternator",
          tagline: "Clean, stable 3-phase power for sensitive loads.",
          image: data.showcaseImages.alternator,
          alt: "Brushless alternator",
          specs: [
            { label: "Make", value: data.alternatorMake },
            { label: "Frame", value: data.alternatorFrame },
            { label: "Power Factor", value: data.powerFactor.toString() },
            { label: "Phases", value: data.phases },
            { label: "Voltage", value: data.voltage },
            { label: "Current", value: data.ratedCurrent },
            { label: "AVR Model", value: data.avrModel },
            { label: "Protection", value: "IP23" },
          ],
        },
        
        // Chapter 05: Electrical Performance
        {
          id: "electrical",
          number: "05",
          title: "Electrical Performance",
          tagline: "Precision power delivery with advanced protection.",
          image: data.showcaseImages.electrical,
          alt: "Electrical system",
          specs: [
            { label: "Voltage Regulation", value: "±1%" },
            { label: "AVR Type", value: data.avrModel },
            { label: "Battery Size", value: "60 Ah" },
            { label: "Starter Motor", value: "2.5 kW" },
            { label: "System Voltage", value: "12 V DC" },
            { label: "Waveform Distortion", value: "< 5%" },
          ],
        },
        
        // Chapter 06: Enclosure & Sound
        {
          id: "enclosure",
          number: "06",
          title: "Enclosure & Sound",
          tagline: "CPCB IV+ compliant. Engineered to disappear into its environment.",
          image: data.showcaseImages.enclosure,
          alt: "Acoustic enclosure",
          specs: [
            { label: "Sound Level", value: data.noiseLevel },
            { label: "Protection", value: "IP23" },
            { label: "Design Ambient", value: "40°C" },
            { label: "Altitude", value: "Up to 1000 m" },
            { label: "CPCB", value: data.cpcb },
          ],
        },
        
        // Chapter 07: Control Panel
        {
          id: "control",
          number: "07",
          title: "Control Panel",
          tagline: "Real-time telemetry. Auto-start. Remote monitoring ready.",
          image: data.showcaseImages.control,
          alt: "Digital control panel",
          specs: [
            { label: "Controller", value: "DEIF SGC 120" },
            { label: "Display", value: "Backlit LCD" },
            { label: "Modes", value: "Auto / Manual / Remote" },
            { label: "AMF", value: "Supported" },
            { label: "Communication", value: "USB, RS-485, CANbus" },
            { label: "Protection", value: "IP65" },
          ],
        },
        
        // Chapter 08: Protection & Approvals
        {
          id: "protection",
          number: "08",
          title: "Protection & Approvals",
          tagline: "Comprehensive safety systems and international certifications.",
          image: data.showcaseImages.protection,
          alt: "Protection systems",
          specs: [
            { label: "Engine Protection", value: "Temp, Oil, Fuel, Speed" },
            { label: "Electrical Protection", value: "UV, OV, UF, OF, OC" },
            { label: "ISO Compliance", value: data.isoCompliance },
            { label: "CE", value: "Compliant" },
            { label: "EMC", value: "EN 61000-6-2/4" },
          ],
        },
        
        // Chapter 09: Standard Supply
        {
          id: "supply",
          number: "09",
          title: "Standard Supply & Options",
          tagline: "Complete package with optional upgrades available.",
          image: data.showcaseImages.supply,
          alt: "Standard supply items",
          specs: [
            { label: "Engine", value: "Water-cooled diesel" },
            { label: "Alternator", value: "Single bearing IP23" },
            { label: "Controller", value: "Microprocessor-based" },
            { label: "Base Frame", value: "Anti-vibration mounts" },
            { label: "Fuel Tank", value: `${data.fuelTankCapacity} capacity` },
            { label: "Documentation", value: "Complete manuals" },
          ],
        },
        
        // Chapter 10: Dimensions & Weight
        {
          id: "dimensions",
          number: "10",
          title: "Dimensions & Weight",
          tagline: "Compact footprint, easy to site and service.",
          image: data.showcaseImages.dimensions,
          alt: "Dimensions and specifications",
          specs: [
            { label: "Length", value: data.length },
            { label: "Width", value: data.width },
            { label: "Height", value: data.height },
            { label: "Fuel Tank", value: data.fuelTankCapacity },
            { label: "Rating", value: `${data.kva} kVA / ${data.kwe} kWe` },
          ],
        },
      ],
      
      // Hotspots for interactive image (not used in current implementation but kept for future)
      hotspots: [
        {
          id: "engine",
          x: 42, y: 55,
          title: "Engine",
          description: `${data.cylinders}-cylinder ${data.engineMake} engine`,
          specs: [
            { label: "Model", value: data.engineModel },
            { label: "Cylinders", value: data.cylinders.toString() },
            { label: "Power", value: data.grossPower },
          ],
        },
        {
          id: "alternator",
          x: 25, y: 48,
          title: "Alternator",
          description: `${data.alternatorMake} brushless alternator`,
          specs: [
            { label: "Output", value: `${data.kva} kVA / ${data.kwe} kW` },
            { label: "Voltage", value: data.voltage },
            { label: "PF", value: data.powerFactor.toString() },
          ],
        },
        {
          id: "control",
          x: 75, y: 35,
          title: "Control Panel",
          description: "Digital controller with auto-start",
          specs: [
            { label: "Display", value: "Backlit LCD" },
            { label: "AMF", value: "Supported" },
            { label: "Comms", value: "RS-485" },
          ],
        },
        {
          id: "enclosure",
          x: 85, y: 58,
          title: "Enclosure",
          description: `${data.cpcb} compliant acoustic enclosure`,
          specs: [
            { label: "Sound", value: data.noiseLevel },
            { label: "Protection", value: "IP23" },
            { label: "CPCB", value: data.cpcb },
          ],
        },
        {
          id: "fuel",
          x: 50, y: 78,
          title: "Fuel Tank",
          description: "Integrated base fuel tank",
          specs: [
            { label: "Capacity", value: data.fuelTankCapacity },
            { label: "Consumption", value: data.fuelConsumption },
            { label: "Material", value: "Mild steel" },
          ],
        },
      ],
    },
    
    // Presentation Mode Data (for GuidedPresentation)
    presentation: {
      mainImages: {
        image1: data.presentationMainImage1,
        image2: data.presentationMainImage2,
      },
      hotspots: [
        {
          id: "overview",
          x: 50, y: 50,
          title: data.name,
          description: `The ${data.model} is an ${data.engineMake}-powered ${data.kva} kVA silent diesel generator set, designed to comply with ${data.isoCompliance}.`,
          subImage: data.presentationSubImages.overview,
          zoom: 1,
          offsetX: 0,
          offsetY: 0,
        },
        {
          id: "engine",
          x: 42, y: 48,
          title: "Engine",
          description: `${data.cylinders}-cylinder diesel engine. Built for continuous duty and tight load response.`,
          subImage: data.presentationSubImages.engine,
          zoom: 1.8,
          offsetX: 8,
          offsetY: 2,
        },
        {
          id: "fuel",
          x: 35, y: 55,
          title: "Fuel, Lube & Cooling",
          description: "Optimized fuel system with efficient cooling for extended runtime.",
          subImage: data.presentationSubImages.fuel,
          zoom: 1.6,
          offsetX: 15,
          offsetY: -5,
        },
        {
          id: "alternator",
          x: 65, y: 45,
          title: "Alternator",
          description: `${data.alternatorMake} brushless alternator. Clean, stable 3-phase power.`,
          subImage: data.presentationSubImages.alternator,
          zoom: 1.5,
          offsetX: -15,
          offsetY: 5,
        },
        {
          id: "electrical",
          x: 78, y: 38,
          title: "Electrical Performance",
          description: "Precision power delivery with advanced voltage regulation.",
          subImage: data.presentationSubImages.electrical,
          zoom: 2.0,
          offsetX: -25,
          offsetY: 10,
        },
        {
          id: "enclosure",
          x: 50, y: 75,
          title: "Enclosure & Sound",
          description: `${data.cpcb} compliant acoustic enclosure. ${data.noiseLevel} sound level.`,
          subImage: data.presentationSubImages.enclosure,
          zoom: 1.2,
          offsetX: 0,
          offsetY: -10,
        },
        {
          id: "control",
          x: 70, y: 30,
          title: "Control Panel",
          description: "DEIF digital controller with real-time monitoring.",
          subImage: data.presentationSubImages.control,
          zoom: 1.8,
          offsetX: -20,
          offsetY: 15,
        },
        {
          id: "protection",
          x: 60, y: 60,
          title: "Protection & Approvals",
          description: "Comprehensive safety systems and international certifications.",
          subImage: data.presentationSubImages.protection,
          zoom: 1.4,
          offsetX: -10,
          offsetY: 0,
        },
        {
          id: "supply",
          x: 40, y: 65,
          title: "Standard Supply",
          description: "Complete package with all essential components included.",
          subImage: data.presentationSubImages.supply,
          zoom: 1.3,
          offsetX: 10,
          offsetY: -5,
        },
        {
          id: "dimensions",
          x: 50, y: 50,
          title: "Dimensions & Weight",
          description: `Compact footprint: ${data.length} × ${data.width} × ${data.height}`,
          subImage: data.presentationSubImages.dimensions,
          zoom: 1,
          offsetX: 0,
          offsetY: 0,
        },
      ],
    },
  }
}
