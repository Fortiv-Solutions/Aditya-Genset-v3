// Demo products for testing without Supabase
export const DEMO_PRODUCTS = [
  {
    id: "demo-1",
    slug: "ekl-15-demo",
    name: "EKL 15 kVA Silent DG Set",
    kva: 15,
    engine_brand: "Escorts",
    type: "Silent",
    model: "EKL15-IV",
    status: "published",
    created_at: new Date().toISOString(),
    product_media: [
      {
        id: "media-1",
        product_id: "demo-1",
        url: "/src/assets/products/escorts/escort_15kva.jpg",
        kind: "primary",
        sort_order: 0,
      }
    ],
    product_specs: [
      { id: "spec-1", product_id: "demo-1", label: "Rating", value: "15 kVA / 12 kWe", sort_order: 0 },
      { id: "spec-2", product_id: "demo-1", label: "Voltage", value: "415 V, 50 Hz", sort_order: 1 },
      { id: "spec-3", product_id: "demo-1", label: "Engine", value: "Escorts G15-IV", sort_order: 2 },
      { id: "spec-4", product_id: "demo-1", label: "Configuration", value: "2-cylinder In-line", sort_order: 3 },
      { id: "spec-5", product_id: "demo-1", label: "Cooling", value: "Water-cooled", sort_order: 4 },
      { id: "spec-6", product_id: "demo-1", label: "Fuel Tank", value: "70 L", sort_order: 5 },
    ]
  },
  {
    id: "demo-2",
    slug: "ekl-20-demo",
    name: "EKL 20 kVA Silent DG Set",
    kva: 20,
    engine_brand: "Escorts",
    type: "Silent",
    model: "EKL20-IV",
    status: "published",
    created_at: new Date().toISOString(),
    product_media: [
      {
        id: "media-2",
        product_id: "demo-2",
        url: "/src/assets/products/escorts/escort_20kva_1.jpg",
        kind: "primary",
        sort_order: 0,
      }
    ],
    product_specs: [
      { id: "spec-7", product_id: "demo-2", label: "Rating", value: "20 kVA / 16 kWe", sort_order: 0 },
      { id: "spec-8", product_id: "demo-2", label: "Voltage", value: "415 V, 50 Hz", sort_order: 1 },
      { id: "spec-9", product_id: "demo-2", label: "Engine", value: "Escorts G20-IV", sort_order: 2 },
      { id: "spec-10", product_id: "demo-2", label: "Configuration", value: "3-cylinder In-line", sort_order: 3 },
      { id: "spec-11", product_id: "demo-2", label: "Cooling", value: "Water-cooled", sort_order: 4 },
      { id: "spec-12", product_id: "demo-2", label: "Fuel Tank", value: "90 L", sort_order: 5 },
    ]
  },
  {
    id: "demo-3",
    slug: "ekl-30-demo",
    name: "EKL 30 kVA Silent DG Set",
    kva: 30,
    engine_brand: "Escorts",
    type: "Silent",
    model: "EKL30-IV",
    status: "published",
    created_at: new Date().toISOString(),
    product_media: [
      {
        id: "media-3",
        product_id: "demo-3",
        url: "/src/assets/products/escorts/escort_30kva.jpg",
        kind: "primary",
        sort_order: 0,
      }
    ],
    product_specs: [
      { id: "spec-13", product_id: "demo-3", label: "Rating", value: "30 kVA / 24 kWe", sort_order: 0 },
      { id: "spec-14", product_id: "demo-3", label: "Voltage", value: "415 V, 50 Hz", sort_order: 1 },
      { id: "spec-15", product_id: "demo-3", label: "Engine", value: "Escorts G30-IV", sort_order: 2 },
      { id: "spec-16", product_id: "demo-3", label: "Configuration", value: "3-cylinder In-line", sort_order: 3 },
      { id: "spec-17", product_id: "demo-3", label: "Cooling", value: "Water-cooled", sort_order: 4 },
      { id: "spec-18", product_id: "demo-3", label: "Fuel Tank", value: "110 L", sort_order: 5 },
    ]
  },
  {
    id: "demo-4",
    slug: "ekl-40-demo",
    name: "EKL 40 kVA Silent DG Set",
    kva: 40,
    engine_brand: "Escorts",
    type: "Silent",
    model: "EKL40-IV",
    status: "published",
    created_at: new Date().toISOString(),
    product_media: [
      {
        id: "media-4",
        product_id: "demo-4",
        url: "/src/assets/products/escorts/escort_40kva_main.jpg",
        kind: "primary",
        sort_order: 0,
      }
    ],
    product_specs: [
      { id: "spec-19", product_id: "demo-4", label: "Rating", value: "40 kVA / 32 kWe", sort_order: 0 },
      { id: "spec-20", product_id: "demo-4", label: "Voltage", value: "415 V, 50 Hz", sort_order: 1 },
      { id: "spec-21", product_id: "demo-4", label: "Engine", value: "Escorts G40-IV", sort_order: 2 },
      { id: "spec-22", product_id: "demo-4", label: "Configuration", value: "4-cylinder In-line", sort_order: 3 },
      { id: "spec-23", product_id: "demo-4", label: "Cooling", value: "Water-cooled", sort_order: 4 },
      { id: "spec-24", product_id: "demo-4", label: "Fuel Tank", value: "150 L", sort_order: 5 },
    ]
  },
  {
    id: "demo-5",
    slug: "perkins-62-demo",
    name: "62.5 kVA Silent DG Set",
    kva: 62.5,
    engine_brand: "Perkins",
    type: "Silent",
    model: "ADG-62.5S",
    status: "published",
    created_at: new Date().toISOString(),
    product_media: [
      {
        id: "media-5",
        product_id: "demo-5",
        url: "/src/assets/products/showcase/main-view.png",
        kind: "primary",
        sort_order: 0,
      }
    ],
    product_specs: [
      { id: "spec-25", product_id: "demo-5", label: "Rating", value: "62.5 kVA / 50 kWe", sort_order: 0 },
      { id: "spec-26", product_id: "demo-5", label: "Voltage", value: "415 V, 50 Hz", sort_order: 1 },
      { id: "spec-27", product_id: "demo-5", label: "Engine", value: "Perkins 1104C-44TAG2", sort_order: 2 },
      { id: "spec-28", product_id: "demo-5", label: "Configuration", value: "4-cylinder Turbocharged", sort_order: 3 },
      { id: "spec-29", product_id: "demo-5", label: "Cooling", value: "Water-cooled", sort_order: 4 },
      { id: "spec-30", product_id: "demo-5", label: "Fuel Tank", value: "120 L", sort_order: 5 },
      { id: "spec-31", product_id: "demo-5", label: "Sound Level", value: "75 dB(A) @ 1m", sort_order: 6 },
    ]
  },
];
