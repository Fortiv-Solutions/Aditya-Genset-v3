import { ShowcaseProduct, EKL15_SHOWCASE, SpecRow } from "@/data/products";
import { ExtractedProduct } from "./pdfExtractor";

/**
 * Generates a full ShowcaseProduct object from extracted PDF data,
 * using the EKL 15 kVA showcase as a structural and visual template.
 */
export function generateShowcaseFromTemplate(
  extracted: ExtractedProduct,
  template: ShowcaseProduct = EKL15_SHOWCASE
): ShowcaseProduct {
  const slug = extracted.model.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  
  // Clone the template structure
  const product: ShowcaseProduct = JSON.parse(JSON.stringify(template));
  
  // Update basic info
  product.slug = slug;
  product.name = extracted.name || `${extracted.kva} kVA Escorts DG Set`;
  product.kva = Number(extracted.kva) || template.kva;
  product.status = "active";
  
  // Update sections with extracted specs
  product.sections = product.sections.map(section => {
    const newSection = { ...section };
    
    switch (section.id) {
      case "overview":
        newSection.title = product.name;
        newSection.specs = [
          { label: "Model", value: extracted.model },
          { label: "Rating", value: `${extracted.kva} kVA` },
          { label: "Voltage", value: extracted.voltage || "415 V" },
          { label: "Compliance", value: extracted.cpcb || "CPCB IV+" },
        ];
        if (newSection.highlight) {
          newSection.highlight[0].value = product.kva;
        }
        break;
        
      case "engine":
        newSection.tagline = `${extracted.engineBrand} ${extracted.engineModel} — built for reliability.`;
        newSection.specs = [
          { label: "Make", value: extracted.engineBrand },
          { label: "Model", value: extracted.engineModel },
          { label: "Speed", value: extracted.frequency === "50 Hz" ? "1500 RPM" : "1800 RPM" },
          // Add other engine specs if we had them in a more detailed extraction
        ];
        break;
        
      case "fuel":
        newSection.specs = [
          { label: "Fuel Consumption", value: extracted.fuelConsumption || "Check Datasheet" },
          { label: "Cooling", value: "Water cooled" },
        ];
        break;
        
      case "alternator":
        newSection.specs = [
          { label: "Make", value: extracted.alternatorBrand || "Stamford/Leroy Somer" },
          { label: "Voltage Reg", value: "±1%" },
        ];
        break;
        
      case "enclosure":
        newSection.specs = [
          { label: "Dimensions", value: extracted.dimensions || "See PDF" },
          { label: "CPCB", value: extracted.cpcb || "IV+" },
        ];
        break;
        
      case "dimensions":
        newSection.specs = [
          { label: "Length x Width x Height", value: extracted.dimensions || "Contact Sales" },
          { label: "Dry Weight", value: extracted.dryWeight || "Check PDF" },
        ];
        break;
    }
    
    return newSection;
  });

  // Update hotspots description/specs
  product.hotspots = product.hotspots.map(hs => {
    const newHs = { ...hs };
    if (hs.id === "overview") {
      newHs.title = product.name;
      newHs.description = extracted.shortDesc || hs.description;
    }
    if (hs.id === "engine") {
      newHs.title = `${extracted.engineBrand} ${extracted.engineModel}`;
    }
    return newHs;
  });

  return product;
}

/**
 * Saves a dynamic product to localStorage
 */
export function saveDynamicProduct(product: ShowcaseProduct) {
  const existing = localStorage.getItem("dynamic_products");
  const products = existing ? JSON.parse(existing) : {};
  products[product.slug] = product;
  localStorage.setItem("dynamic_products", JSON.stringify(products));
  
  // Also add to a list of dynamic product summaries for the catalog
  const summariesExist = localStorage.getItem("dynamic_summaries");
  const summaries = summariesExist ? JSON.parse(summariesExist) : [];
  
  // Update or add
  const index = summaries.findIndex((s: any) => s.slug === product.slug);
  const summary = {
    slug: product.slug,
    name: product.name,
    kva: product.kva,
    range: product.range,
    status: product.status,
    thumbnail: product.thumbnail,
  };
  
  if (index >= 0) {
    summaries[index] = summary;
  } else {
    summaries.push(summary);
  }
  localStorage.setItem("dynamic_summaries", JSON.stringify(summaries));
}
