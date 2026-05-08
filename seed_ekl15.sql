-- Fix 1: Allow all authenticated users to READ product-scoped CMS sections
-- (needed for Sales Execs / Sales Pros to see product showcase data)
CREATE POLICY "authenticated_read_product_cms"
ON public.cms_sections FOR SELECT
TO authenticated
USING (scope_type = 'product');

-- Fix 2: Allow public (unauthenticated) to also read product-scoped CMS sections
-- (needed if product pages are ever publicly accessible)
CREATE POLICY "public_read_product_cms"
ON public.cms_sections FOR SELECT
TO public
USING (scope_type = 'product');

-- Fix 3: Seed the EKL-15 product with complete chapter data
-- (Only run this ONCE — it uses ON CONFLICT to safely upsert)
DO $$
DECLARE
  v_product_id UUID;
BEGIN
  INSERT INTO public.products (
    slug, model, name, kva, engine_brand, type, cpcb, status, short_desc
  ) VALUES (
    'ekl-15-2cyl',
    'ATM EKL 15 (2 Cyl)-IV',
    'EKL 15 kVA (2 Cyl) DG Set',
    15.00,
    'Escorts',
    'silent',
    'iv-plus',
    'published',
    '15 kVA silent diesel generator set, CPCB IV+ compliant'
  )
  ON CONFLICT (slug) DO UPDATE SET
    name         = EXCLUDED.name,
    model        = EXCLUDED.model,
    kva          = EXCLUDED.kva,
    engine_brand = EXCLUDED.engine_brand,
    status       = EXCLUDED.status,
    type         = EXCLUDED.type,
    cpcb         = EXCLUDED.cpcb
  RETURNING id INTO v_product_id;

  -- Clear any existing CMS section for this product to avoid duplicate key error
  DELETE FROM public.cms_sections
  WHERE scope_type = 'product' AND scope_id = v_product_id;

  -- Insert the full 10-chapter showcase data
  INSERT INTO public.cms_sections (section_key, scope_type, scope_id, content)
  VALUES (
    'showcaseData',
    'product',
    v_product_id,
    '{
      "slug": "ekl-15-2cyl",
      "name": "EKL 15 kVA (2 Cyl) DG Set",
      "kva": 15,
      "range": "15-62.5",
      "status": "active",
      "productName": "EKL 15 kVA (2 Cyl) DG Set",
      "pageLabel": "Showcase",
      "pageSubtitle": "10-chapter walkthrough of the Escorts-powered 15 kVA generator.",
      "presentModeBtn": "Present Mode",
      "sections": [
        {
          "id": "overview", "number": "01",
          "title": "EKL 15 kVA (2 Cyl) DG Set",
          "tagline": "CPCB IV+ compliant, ISO 8528 certified — built for demanding environments.",
          "badges": ["CPCB IV+ Compliant","ISO 8528","Silent Operation","Industrial Grade","ISO 9001:2015"],
          "specs": [
            {"label":"Model","value":"EKL15-IV (2 Cyl)"},
            {"label":"Rating","value":"15 kVA / 12 kWe"},
            {"label":"Voltage","value":"415 V, 3-Phase"},
            {"label":"Frequency","value":"50 Hz"},
            {"label":"Speed","value":"1500 RPM"},
            {"label":"Compliance","value":"CPCB IV+"}
          ],
          "description": "The EKL15-IV (2 Cyl) is an Escorts-powered 15 kVA silent diesel generator set, designed to comply with ISO 8528. It delivers excellent performance under the most demanding environmental conditions with near-zero downtime for continuous power supply.",
          "aboutSpecs": [
            {"label":"Doc No.","value":"TDS-EKL15-IV(2 cyl) ATM"},
            {"label":"ISO Compliance","value":"ISO 8528"},
            {"label":"Factory","value":"Plot 29A/B, Survey 208, Silvassa-396230"},
            {"label":"Power Factor","value":"0.8 lagging"},
            {"label":"Overload Capability","value":"10% per ISO 3046"}
          ],
          "highlight": [
            {"value":15,"suffix":" kVA","label":"Prime power"},
            {"value":70,"suffix":" dB(A)","label":"Sound @ 1m"},
            {"value":27,"suffix":"+ yrs","label":"Heritage"}
          ]
        },
        {
          "id": "engine", "number": "02",
          "title": "Engine",
          "tagline": "Built for continuous duty and tight load response.",
          "specs": [
            {"label":"Make","value":"Escorts"},
            {"label":"Model","value":"G15-IV"},
            {"label":"No. of Cylinders","value":"2"},
            {"label":"Distribution","value":"4 Strokes"},
            {"label":"Aspiration","value":"Natural Aspiration"},
            {"label":"Type of Construction","value":"In-line"},
            {"label":"Displacement","value":"1.56 L"},
            {"label":"Bore / Stroke","value":"95 × 110 mm"},
            {"label":"Compression Ratio","value":"—"},
            {"label":"Gross Engine Power (PRP)","value":"14.1 kWm / 19 hp"},
            {"label":"Gross Power @ 110%","value":"15.5 kWm (est.)"},
            {"label":"Speed","value":"1500 RPM"},
            {"label":"Frequency","value":"50 Hz"}
          ],
          "features": [
            "Cast iron cylinder block with rugged body construction designed to minimize vibration & noise level",
            "High carbon steel forged crankshaft with induction hardening",
            "Full flow oil filter along with lube oil cooling to maintain optimum temperature",
            "Cast iron dry liners, lube oil cooled aluminium alloy piston with high performance piston rings",
            "Electronic governing for fast load response and stable frequency",
            "Excellent fuel and lube oil consumption",
            "Engine complying to ISO 3046-1/1, ISO 15550 standard reference conditions",
            "High power to weight ratio with low life cycle cost"
          ]
        },
        {
          "id": "fuel", "number": "03",
          "title": "Fuel, Lube & Cooling",
          "tagline": "Optimized for efficiency and reliability.",
          "specs": [
            {"label":"Recommended Fuel","value":"High Speed Diesel"},
            {"label":"Governor","value":"Mechanical"},
            {"label":"Governing Class","value":"Mechanical"},
            {"label":"Fuel Injection Pump","value":"Mechanical"},
            {"label":"Air Filter Type","value":"Dry"}
          ],
          "lubeSpecs": [
            {"label":"Recommended Lube Oil","value":"15W40 CI4"},
            {"label":"Lube Oil Capacity","value":"5.5 L"},
            {"label":"Lube Oil Consumption","value":"< Normal limits"},
            {"label":"Full Flow Filter","value":"Yes, with lube oil cooling"}
          ],
          "coolingSpecs": [
            {"label":"Method of Cooling","value":"Radiator (Water Cooled)"},
            {"label":"Thermostat Operating Range","value":"75°C"},
            {"label":"Coolant Alarm (Shutdown)","value":"100°C"},
            {"label":"Silencer Type","value":"Residential"},
            {"label":"Number of Silencers","value":"1"},
            {"label":"Exhaust Outlet Pipe Size","value":"40 mm (min.)"}
          ]
        },
        {
          "id": "alternator", "number": "04",
          "title": "Alternator",
          "tagline": "Clean, stable 3-phase power for sensitive loads.",
          "specs": [
            {"label":"Make","value":"Stamford*"},
            {"label":"Frame","value":"S0L1-P1"},
            {"label":"Power Factor","value":"0.8"},
            {"label":"No. of Phases","value":"3-Phase, 1/3"},
            {"label":"Frequency","value":"50 Hz"},
            {"label":"Rated Voltage (L-L)","value":"240V / 415V"},
            {"label":"Rated Current","value":"62.50 / 20.88 A"},
            {"label":"Voltage Regulation","value":"±1%"},
            {"label":"Insulation System","value":"H Class"},
            {"label":"Temperature Rise Limit","value":"H Class"},
            {"label":"AVR Model","value":"AS540"},
            {"label":"Protection","value":"IP23"},
            {"label":"Coupling","value":"Single bearing"}
          ],
          "perfSpecs": [
            {"label":"Excitation","value":"Self excited"},
            {"label":"Control System","value":"Analogue"},
            {"label":"AVR Type","value":"AS540"},
            {"label":"Waveform Distortion (No Load)","value":"< 2.5% (NDBLL < 5%)"}
          ],
          "features": [
            "Brushless type, screen protected, self-excited alternator complying to BS:5000/IEC 60034-1",
            "Excellent motor start capability",
            "Excellent alternator efficiency across the load range",
            "Compact design with sealed bearings for longer life and lower maintenance",
            "Testing carried out using state-of-the-art PLC based, resistive load bank"
          ]
        },
        {
          "id": "electrical", "number": "05",
          "title": "Electrical Performance",
          "tagline": "Precision power delivery with advanced protection.",
          "specs": [
            {"label":"Short Circuit Ratio","value":"0.515"},
            {"label":"Waveform Distortion (NDBLL)","value":"< 5%"},
            {"label":"Voltage Regulation","value":"±1%"},
            {"label":"AVR Type","value":"AS540 (Analogue)"},
            {"label":"Battery Size","value":"60 Ah"},
            {"label":"Starter Motor","value":"2.5 kW"},
            {"label":"Electrical System Voltage","value":"12 V DC"}
          ],
          "reactanceData": [
            {"symbol":"Xd","description":"Direct Axis Synchronous Reactance","value":"1.942"},
            {"symbol":"X''d","description":"Direct Axis Transient Reactance","value":"0.109"},
            {"symbol":"X''''d","description":"Direct Axis Sub-Transient Reactance","value":"0.100"},
            {"symbol":"Xq","description":"Quadrature Axis Reactance","value":"1.265"},
            {"symbol":"X''''q","description":"Quad Axis Sub-Transient Reactance","value":"0.172"},
            {"symbol":"Xl","description":"Leakage Reactance","value":"0.064"},
            {"symbol":"X2","description":"Negative Sequence Reactance","value":"0.197"},
            {"symbol":"X0","description":"Zero Sequence Reactance","value":"0.012"}
          ]
        },
        {
          "id": "enclosure", "number": "06",
          "title": "Enclosure & Sound",
          "tagline": "CPCB IV+ compliant. Engineered to disappear into its environment.",
          "acousticDims": [
            {"label":"Length","value":"1760 mm"},
            {"label":"Width","value":"950 mm"},
            {"label":"Height","value":"1495 mm"},
            {"label":"Fuel Tank","value":"70 L"}
          ],
          "openDims": [
            {"label":"Length","value":"NA"},
            {"label":"Width","value":"NA"},
            {"label":"Height","value":"NA"}
          ],
          "envSpecs": [
            {"label":"Protection","value":"IP23"},
            {"label":"Design Ambient","value":"40°C"},
            {"label":"Altitude","value":"Up to 1000 m"},
            {"label":"Cooling Airflow","value":"0.58 m³/sec"},
            {"label":"CPCB","value":"IV+ Compliant"},
            {"label":"Sound Level","value":"70 dB(A)"}
          ]
        },
        {
          "id": "control", "number": "07",
          "title": "Control Panel",
          "tagline": "Real-time telemetry. Auto-start. Remote monitoring ready.",
          "specs": [
            {"label":"Controller Make","value":"DEIF, Denmark"},
            {"label":"Model","value":"SGC 120"},
            {"label":"Display","value":"Backlit full graphics LCD"},
            {"label":"Operation Modes","value":"Auto / Manual / Remote"},
            {"label":"AMF Function","value":"Supported (Mains Fail Signal)"},
            {"label":"Communication","value":"USB, RS-485, CANbus"},
            {"label":"Protection Class","value":"IP65 with gasket"},
            {"label":"Operating Temp","value":"-20 to 65°C"},
            {"label":"Event Log","value":"100 events with date/time"}
          ],
          "features": [
            "Microprocessor based digital controller",
            "Accurate LCD display with backlit full graphics",
            "Local and Remote Start/Stop",
            "Generator breaker control",
            "Flexibility for Manual & Auto operations",
            "Easily convertible to AMF by giving Mains Fail Signal",
            "Battery voltage monitoring & reverse protection",
            "7/9 configurable analogue/digital inputs",
            "Island Operation support",
            "Automatic Mains Failure function",
            "CANbus engine interface for communication",
            "7 configurable digital outputs",
            "Power save mode"
          ],
          "engineParams": [
            "Engine Speed","Lube Oil Pressure","Coolant Temperature",
            "Engine Running Hours","Engine Battery Voltage","Running Status",
            "Fuel Level in Percentage","Event Log with date and time"
          ],
          "electricalParams": [
            "Generator Voltage (Ph-Ph)","Generator Voltage (Ph-N)",
            "Generator Current (R, Y, B)","Generator Apparent Power (kVA)",
            "Generator Active Power (kW)","Generator Reactive Power (kVAr)",
            "Generator Power Factor","Generator Frequency (Hz)",
            "Cumulative Energy (kWh)","Cumulative Energy (kVAh)",
            "Cumulative Energy (kVArh)","Control Supply Voltage"
          ],
          "electricalSpecs": [
            {"label":"Supply Voltage (Nominal)","value":"12 / 24 V DC"},
            {"label":"Max Current Consumption","value":"~200 mA"},
            {"label":"Deep Sleep Current","value":"20 mA, 12/24 V DC"},
            {"label":"Cranking Dropout Period","value":"50 ms"},
            {"label":"Max Reverse Voltage Protection","value":"-32 V DC"}
          ]
        },
        {
          "id": "protection", "number": "08",
          "title": "Protection & Approvals",
          "tagline": "Comprehensive safety systems and international certifications.",
          "engineProtections": [
            "High Water Temperature — Shutdown",
            "Low Oil Pressure — Shutdown",
            "Low Fuel Level — Alert",
            "Over Speed — Shutdown",
            "Engine Fails to Start — Alarm"
          ],
          "electricalProtections": [
            "Generator Under Voltage (ANSI-27)",
            "Generator Over Voltage (ANSI-59)",
            "Generator Under Frequency (ANSI-81L)",
            "Generator Over Frequency (ANSI-81H)",
            "Generator Over Current (ANSI-51)",
            "Control Supply Under Voltage",
            "Control Supply Over Voltage",
            "Phase Reversal Protection",
            "Unbalanced Load Protection"
          ],
          "approvals": [
            "CE Compliant",
            "EN 61010-1 (Low Voltage Directive)",
            "EN 61000-6-2 (EMC Immunity)",
            "EN 61000-6-4 (EMC Emissions)"
          ]
        },
        {
          "id": "supply", "number": "09",
          "title": "Standard Supply & Options",
          "tagline": "Complete package with optional upgrades available.",
          "standardItems": [
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
            "1 set of documents"
          ],
          "optionalItems": [
            "Coolant heater","Oversize batteries","Extra fuel pre-filter",
            "PMG","Space heater / RTD / BTD","3-phase sensing AVR",
            "Heat exchanger","Remote radiator","Sync module",
            "Isolator panel","ATS","Fuel transfer pump"
          ],
          "optionalGroups": [
            {"label":"Engine","items":["Coolant heater","Oversize batteries","Extra fuel pre-filter water separator"]},
            {"label":"Alternator","items":["Permanent Magnet Generator (PMG)","Space Heater, RTD & BTD sensor","Upgrade to 3-phase sensing AVR"]},
            {"label":"Cooling System","items":["Heat exchanger","Remote radiator"]},
            {"label":"General","items":["Synchronisation module","Isolator panel","Automatic transfer switch","Fuel transfer pump (Auto / Manual)"]}
          ]
        },
        {
          "id": "dimensions", "number": "10",
          "title": "Dimensions & Weight",
          "tagline": "Compact footprint, easy to site and service.",
          "acousticDims": [
            {"label":"Length","value":"1760 mm"},
            {"label":"Width","value":"950 mm"},
            {"label":"Height","value":"1495 mm"},
            {"label":"Fuel Tank","value":"70 L"}
          ],
          "openDims": [
            {"label":"Length","value":"NA"},
            {"label":"Width","value":"NA"},
            {"label":"Height","value":"NA"}
          ],
          "specs": [
            {"label":"Rating","value":"15 kVA / 12 kWe @ 415V, 50Hz"},
            {"label":"Power Factor","value":"0.8"},
            {"label":"Warranty","value":"Refer warranty policy"},
            {"label":"Documentation","value":"Full operation, maintenance & wiring manuals"},
            {"label":"Factory","value":"Aditya Tech Mech, Silvassa-396230"}
          ]
        }
      ]
    }'::jsonb
  );

  RAISE NOTICE 'EKL-15 seeded with product ID: %', v_product_id;
END $$;
