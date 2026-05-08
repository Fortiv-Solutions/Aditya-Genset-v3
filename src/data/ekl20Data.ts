/**
 * ekl20_3cyl_Data.ts
 * All interactive data for the EKL20 (3 Cyl) kVA DG Set showcase.
 * 11 chapters, 100% PDF coverage — TDS-EKL20 (3ycl)-IVATM
 */

export interface DimEntry       { label: string; value: string; }
export interface ReactanceRow   { symbol: string; description: string; value: string; }
export interface OptionalGroup  { label: string; items: string[]; }

export interface EKL20ChapterData {
  specs?:               { label: string; value: string }[];
  features?:            string[];
  badges?:              string[];
  description?:         string;
  aboutSpecs?:          { label: string; value: string }[];
  lubeSpecs?:           { label: string; value: string }[];
  coolingSpecs?:        { label: string; value: string }[];
  perfSpecs?:           { label: string; value: string }[];
  reactanceData?:       ReactanceRow[];
  acousticDims?:        DimEntry[];
  openDims?:            DimEntry[];
  envSpecs?:            { label: string; value: string }[];
  engineParams?:        string[];
  electricalParams?:    string[];
  electricalSpecs?:     { label: string; value: string }[];
  engineProtections?:   string[];
  electricalProtections?: string[];
  approvals?:           string[];
  standardItems?:       string[];
  optionalItems?:       string[];
  optionalGroups?:      OptionalGroup[];
}

export const EKL20_3CYL_CHAPTER_DATA: Record<string, EKL20ChapterData> = {

  // ── 01 Overview ─────────────────────────────────────────────────────────────
  overview: {
    badges: [
      "CPCB IV+ Compliant",
      "ISO 8528",
      "Silent Operation",
      "Industrial Grade",
      "ISO 9001:2015",
    ],
    specs: [
      { label: "Model",       value: "EKL20(3cyl)-IV" },
      { label: "Rating",      value: "20 kVA / 16 kWe" },
      { label: "Voltage",     value: "415 V, 3-Phase" },
      { label: "Frequency",   value: "50 Hz" },
      { label: "Speed",       value: "1500 RPM" },
      { label: "Compliance",  value: "CPCB IV+" },
    ],
    description:
      "The EKL20(3cyl)-IV is an Escorts-powered 20 kVA silent diesel generator set, designed to comply with ISO 8528. It delivers excellent performance under the most demanding environmental conditions with near-zero downtime for continuous power supply. Comes with a sturdy base frame, efficient anti-vibration mounts, and undergoes stringent shop floor testing using state-of-the-art PLC based resistive load bank.",
    aboutSpecs: [
      { label: "Doc No.",             value: "TDS-EKL20 (3ycl)-IVATM" },
      { label: "ISO Compliance",      value: "ISO 8528, ISO 3046-1/1, ISO 15550" },
      { label: "Factory",             value: "Plot 29A/B, Survey 208, Silvassa-396230, UT of D&N Haveli and Daman & Diu" },
      { label: "Power Factor",        value: "0.8 lagging" },
      { label: "Overload Capability", value: "10% per ISO 3046" },
      { label: "Output Rating",       value: "20 kVA / 16 kWe @ 415V, 50Hz" },
    ],
  },

  // ── 02 Engine ────────────────────────────────────────────────────────────────
  engine: {
    specs: [
      { label: "Make",                        value: "Escorts" },
      { label: "Model",                       value: "G20-IV" },
      { label: "No. of Cylinders",            value: "3" },
      { label: "Distribution",                value: "4 Strokes" },
      { label: "Aspiration",                  value: "Natural Aspiration" },
      { label: "Type of Construction",        value: "In-line" },
      { label: "Displacement",                value: "2.34 L" },
      { label: "Bore / Stroke",               value: "95 × 110 mm" },
      { label: "Mean Piston Speed",           value: "—" },
      { label: "Compression Ratio",           value: "—" },
      { label: "Gross Engine Power (PRP)",    value: "18 kWm / 24.2 hp" },
      { label: "Gross Engine Power @ 110%",   value: "—" },
      { label: "Speed",                       value: "1500 RPM" },
      { label: "Frequency",                   value: "50 Hz" },
    ],
    features: [
      "Cast iron cylinder block with rugged body construction designed to minimize vibration & noise level",
      "High carbon steel forged crankshaft with induction hardening",
      "Full flow oil filter along with lube oil cooling to maintain optimum temperature",
      "Cast iron dry liners, lube oil cooled aluminium alloy piston with high performance piston rings",
      "Electronic governing for fast load response and stable frequency",
      "Excellent fuel and lube oil consumption",
      "Engine complying to ISO 3046-1/1, ISO 15550 standard reference conditions",
      "High power to weight ratio with low life cycle cost",
    ],
  },

  // ── 03 Fuel, Lube & Cooling ──────────────────────────────────────────────────
  fuel: {
    specs: [
      { label: "Recommended Fuel",                    value: "High Speed Diesel" },
      { label: "Governor",                            value: "Mechanical" },
      { label: "Governing Class",                     value: "—" },
      { label: "Fuel Injection Pump",                 value: "Mechanical" },
      { label: "Air Filter Type",                     value: "Dry" },
      { label: "Air Intake Restriction (Dirty)",      value: "—" },
      { label: "Fuel Consumption (110% Load)",        value: "4.66 L/hr" },
      { label: "Fuel Consumption (100% Load)",        value: "4.17 L/hr" },
      { label: "Fuel Consumption (75% Load)",         value: "3.31 L/hr" },
      { label: "Fuel Consumption (50% Load)",         value: "2.46 L/hr" },
      { label: "Fuel Consumption (25% Load)",         value: "1.77 L/hr" },
      { label: "Specific Gravity Reference",          value: "850 gms/Litre" },
    ],
    lubeSpecs: [
      { label: "Recommended Lube Oil",    value: "15W 40 CI4" },
      { label: "Lube Oil System Capacity",value: "6.5 L" },
      { label: "Lube Oil Consumption",    value: "< Normal limits" },
      { label: "Full Flow Filter",        value: "Yes, with lube oil cooling" },
    ],
    coolingSpecs: [
      { label: "Method of Cooling",               value: "Radiator (Water Cooled)" },
      { label: "Coolant Capacity",                value: "—" },
      { label: "Radiator Fan Power",              value: "—" },
      { label: "Thermostat Operating Range",      value: "75°C" },
      { label: "Coolant Alarm (Shutdown) Temp",   value: "100°C" },
      { label: "Silencer Type",                   value: "Residential" },
      { label: "Number of Silencers",             value: "1" },
      { label: "Max Back Pressure Total System",  value: "—" },
      { label: "Exhaust Outlet Pipe Size (min)",  value: "40 mm" },
      { label: "Exhaust Gas Temperature",         value: "—" },
    ],
  },

  // ── 04 Alternator ────────────────────────────────────────────────────────────
  alternator: {
    specs: [
      { label: "Make",                    value: "Stamford (CG / Leroy Somer options available)" },
      { label: "Frame",                   value: "S0L2-G1" },
      { label: "Power Factor",            value: "0.8" },
      { label: "No. of Phases",           value: "3-Phase, 1/3" },
      { label: "Frequency",               value: "50 Hz" },
      { label: "Rated Voltage (L-L)",     value: "240V / 415V" },
      { label: "Rated Current",           value: "83.33 / 27.84 Amps" },
      { label: "Voltage Regulation",      value: "±1%" },
      { label: "Insulation System",       value: "H Class" },
      { label: "Temperature Rise Limit",  value: "H Class" },
      { label: "Winding Pitch",           value: "2/3 Double layer concentric" },
      { label: "Over Load",               value: "—" },
      { label: "AVR Model",               value: "AS540" },
      { label: "Protection",              value: "IP23" },
      { label: "Coupling",                value: "Single bearing" },
    ],
    perfSpecs: [
      { label: "Excitation System",                   value: "Self excited" },
      { label: "Control System",                      value: "Analogue" },
      { label: "AVR Type",                            value: "AS540" },
      { label: "Maximum Over Speed",                  value: "—" },
      { label: "Cooling",                             value: "Air Cooled" },
      { label: "Air Flow",                            value: "0.105 m³/sec" },
      { label: "Stator Winding",                      value: "Double layer concentric" },
      { label: "Waveform Distortion (No Load)",       value: "< 2.5% (NDBLL < 5%)" },
      { label: "Design Ambient for Alternator",       value: "40°C" },
      { label: "Altitude",                            value: "1000 m" },
      { label: "Efficiency @ 100% Load (0.8 p.f.)",  value: "85.5%" },
      { label: "Efficiency @ 75% Load (0.8 p.f.)",   value: "88.0%" },
    ],
    features: [
      "Brushless type, screen protected, self-excited alternator complying to BS:5000/IEC 60034-1",
      "Excellent motor start capability",
      "Excellent alternator efficiency across the load range",
      "Compact design with sealed bearings for longer life and lower maintenance",
      "Testing carried out using state-of-the-art PLC based, resistive load bank",
      "Optimised engine compatibility",
    ],
  },

  // ── 05 Electrical Performance ─────────────────────────────────────────────────
  electrical: {
    specs: [
      { label: "Short Circuit Ratio",           value: "0.410" },
      { label: "Waveform Distortion (NDBLL)",   value: "< 5%" },
      { label: "Voltage Regulation",            value: "±1%" },
      { label: "AVR Type",                      value: "AS540 (Analogue)" },
      { label: "Battery Size",                  value: "60 Ah" },
      { label: "Starter Motor Power",           value: "2.5 kW" },
      { label: "Electrical System Voltage",     value: "12 V DC" },
    ],
    reactanceData: [
      { symbol: "Xd",    description: "Direct Axis Synchronous Reactance",      value: "2.437" },
      { symbol: "X'd",   description: "Direct Axis Transient Reactance",         value: "0.129" },
      { symbol: "X''d",  description: "Direct Axis Sub-Transient Reactance",     value: "0.126" },
      { symbol: "Xq",    description: "Quadrature Axis Reactance",               value: "1.406" },
      { symbol: "X''q",  description: "Quad Axis Sub-Transient Reactance",       value: "0.175" },
      { symbol: "Xl",    description: "Leakage Reactance",                       value: "0.089" },
      { symbol: "X2",    description: "Negative Sequence Reactance",             value: "0.211" },
      { symbol: "X0",    description: "Zero Sequence Reactance",                 value: "0.021" },
    ],
  },

  // ── 06 Enclosure & Sound ──────────────────────────────────────────────────────
  enclosure: {
    acousticDims: [
      { label: "Length",     value: "1950 mm" },
      { label: "Width",      value: "1050 mm" },
      { label: "Height",     value: "1555 mm" },
      { label: "Weight Dry", value: "—" },
      { label: "Fuel Tank",  value: "75 L" },
    ],
    openDims: [
      { label: "Length",     value: "NA" },
      { label: "Width",      value: "NA" },
      { label: "Height",     value: "NA" },
      { label: "Weight Dry", value: "—" },
      { label: "Fuel Tank",  value: "—" },
    ],
    envSpecs: [
      { label: "Protection",      value: "IP23" },
      { label: "Design Ambient",  value: "40°C" },
      { label: "Altitude",        value: "Up to 1000 m" },
      { label: "Cooling Airflow", value: "0.105 m³/sec" },
      { label: "CPCB",            value: "IV+ Compliant" },
    ],
  },

  // ── 07 Control Panel ──────────────────────────────────────────────────────────
  control: {
    specs: [
      { label: "Controller Make",   value: "DEIF, Denmark" },
      { label: "Model",             value: "SGC 120" },
      { label: "Display",           value: "Backlit full graphics LCD" },
      { label: "Operation Modes",   value: "Auto / Manual / Remote" },
      { label: "AMF Function",      value: "Supported (Mains Fail Signal)" },
      { label: "Communication",     value: "USB, RS-485, CANbus" },
      { label: "Protection Class",  value: "IP65 with gasket" },
      { label: "Operating Temp",    value: "-20 to 65°C" },
      { label: "Event Log",         value: "100 events with date/time" },
    ],
    features: [
      "Microprocessor based digital controller",
      "Accurate LCD display with backlit full graphics",
      "Local and Remote Start/Stop",
      "Generator breaker control",
      "Easily accessible through fascia",
      "Flexibility for selecting Manual & Auto operations",
      "Easily convertible to AMF by giving Mains Fail Signal",
      "Battery voltage monitoring & reverse protection to auxiliary supply",
      "7/9 configurable analogue/digital inputs",
      "Island Operation support",
      "Automatic Mains Failure function",
      "CANbus engine interface for communication",
      "Log with latest 100 events",
      "Fully configurable via PC using USB, RS485 communication",
      "DC battery supply voltage range 8 to 28V",
      "-20 to 65°C operating temperature range",
      "IP65 Protection class with gasket",
      "LCD alarm indication",
      "Power save mode",
      "7 configurable digital outputs",
    ],
    engineParams: [
      "Engine Speed",
      "Lube Oil Pressure",
      "Coolant Temperature",
      "Engine Running Hours",
      "Engine Battery Voltage",
      "Running Status",
      "Fuel Level in Percentage",
      "Event Log with date and time",
    ],
    electricalParams: [
      "Generator Voltage (Ph-Ph)",
      "Generator Voltage (Ph-N)",
      "Generator Current (R, Y, B)",
      "Generator Apparent Power (kVA)",
      "Generator Active Power (kW)",
      "Generator Reactive Power (kVAr)",
      "Generator Power Factor",
      "Generator Frequency (Hz)",
      "Cumulative Energy (kWh)",
      "Cumulative Energy (kVAh)",
      "Cumulative Energy (kVArh)",
      "Control Supply Voltage",
    ],
    electricalSpecs: [
      { label: "Supply Voltage (Nominal)",              value: "12 / 24 V DC" },
      { label: "Cranking Dropout Period",               value: "50 ms" },
      { label: "Max Reverse Voltage Protection",        value: "-32 V DC" },
      { label: "Measurement Accuracy (Battery V)",      value: "±1% Full Scale" },
      { label: "Resolution",                            value: "0.1 V" },
      { label: "Max Current Consumption",               value: "~200 mA" },
      { label: "Deep Sleep Current",                    value: "20 mA, 12/24 V DC" },
      { label: "Vibration",                             value: "2G in X, Y, Z axes for 8–500 Hz (IEC 60068-2-6)" },
      { label: "Shock",                                 value: "15 g for 11 ms (IEC 60068-2-27)" },
      { label: "Humidity",                              value: "0–95% RH (IEC 60068-2-78)" },
      { label: "EMI/EMC",                               value: "IEC 61000-6-2, 4" },
    ],
  },

  // ── 08 Protection & Approvals ─────────────────────────────────────────────────
  protection: {
    engineProtections: [
      "High Water Temperature — Shutdown",
      "Low Oil Pressure — Shutdown",
      "Low Fuel Level — Alert",
      "Over Speed — Shutdown",
      "Engine Fails to Start — Alarm",
    ],
    electricalProtections: [
      "Generator Under Voltage (ANSI-27)",
      "Generator Over Voltage (ANSI-59)",
      "Generator Under Frequency (ANSI-81L)",
      "Generator Over Frequency (ANSI-81H)",
      "Generator Over Current (ANSI-51)",
      "Control Supply Under Voltage",
      "Control Supply Over Voltage",
      "Phase Reversal Protection",
      "Unbalanced Load Protection",
    ],
    approvals: [
      "CE Compliant",
      "EN 61010-1 (EU Low Voltage Directive)",
      "EN 61000-6-2 (EMC Immunity)",
      "EN 61000-6-4 (EMC Emissions)",
      "IEC 60068 (Environmental compliance)",
      "IEC 60529 (IP65 enclosure)",
    ],
  },

  // ── 09 Standard Supply & Optional Extras ──────────────────────────────────────
  supply: {
    standardItems: [
      "Water-cooled diesel engine",
      "Engine-driven radiator",
      "Electric starter & charging alternator",
      "Electronic governor",
      "Microprocessor-based genset controller",
      "Dry type air filter",
      "Single bearing IP23 alternator",
      "Base frame with anti-vibration mounts",
      "Flexible fuel lines & lube oil drain pump",
      "Fuel water separator filter (engine mounted)",
      "Exhaust outlet with flexible and flanges",
      "DG control panel",
      "Battery, battery lead & battery stand",
      "Day fuel tank with High / Low level switch",
      "First fill lube oil",
      "First fill coolant",
      "1 set of documents",
    ],
    optionalItems: [
      "Coolant heater",
      "Oversize batteries",
      "Extra fuel pre-filter water separator",
      "Permanent Magnet Generator (PMG)",
      "Space Heater, RTD & BTD sensor",
      "Upgrade to 3-phase sensing AVR",
      "Air inlet filters",
      "Heat exchanger",
      "Remote radiator",
      "Synchronisation module",
      "Isolator panel",
      "Automatic transfer switch",
      "Fuel transfer pump (Automatic / Manual)",
    ],
    optionalGroups: [
      {
        label: "Engine",
        items: [
          "Coolant heater",
          "Oversize batteries",
          "Extra fuel pre-filter water separator",
        ],
      },
      {
        label: "Alternator",
        items: [
          "Permanent Magnet Generator (PMG)",
          "Space Heater, RTD & BTD sensor",
          "Upgrade to 3-phase sensing AVR",
          "Air inlet filters",
        ],
      },
      {
        label: "Cooling System",
        items: ["Heat exchanger", "Remote radiator"],
      },
      {
        label: "General",
        items: [
          "Synchronisation module",
          "Isolator panel",
          "Automatic transfer switch",
          "Fuel transfer pump (Automatic / Manual)",
        ],
      },
    ],
  },

  // ── 10 Dimensions & Weights ────────────────────────────────────────────────────
  dimensions: {
    acousticDims: [
      { label: "Length",     value: "1950 mm" },
      { label: "Width",      value: "1050 mm" },
      { label: "Height",     value: "1555 mm" },
      { label: "Weight Dry", value: "—" },
      { label: "Fuel Tank",  value: "75 L" },
    ],
    openDims: [
      { label: "Length",     value: "NA" },
      { label: "Width",      value: "NA" },
      { label: "Height",     value: "NA" },
      { label: "Weight Dry", value: "—" },
      { label: "Fuel Tank",  value: "—" },
    ],
    specs: [
      { label: "Rating",           value: "20 kVA / 16 kWe @ 415V, 50Hz" },
      { label: "Power Factor",     value: "0.8" },
      { label: "Warranty",         value: "Refer warranty policy" },
      { label: "Documentation",    value: "Full operation, maintenance & wiring manuals" },
      { label: "Factory",          value: "Aditya Tech Mech, Plot 29A/B, Survey 208, Silvassa-396230" },
      { label: "Special Condition",value: "For specific site conditions, refer to application engineering" },
    ],
  },

  // ── 11 Product Video ──────────────────────────────────────────────────────────
  video: {
    specs: [
      { label: "Duration", value: "8 sec" },
      { label: "Format", value: "MP4" },
      { label: "Source", value: "360° View" },
    ],
  },
};
