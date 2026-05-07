# System Architecture Diagram

## Complete Flow Visualization

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ADMIN UPLOADS PDF                               │
│                     (Product Datasheet - Any Format)                     │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PDF EXTRACTION LAYER                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  pdfExtractor.ts                                                  │  │
│  │  • Extract text using pdf.js                                     │  │
│  │  • Render pages as images (up to 8 pages)                        │  │
│  │  • Send to Gemini API for AI extraction                          │  │
│  │  • Fallback to local regex parsing if API unavailable            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  ExtractedProduct      │
                    │  • name, model, kVA    │
                    │  • engine specs        │
                    │  • electrical specs    │
                    │  • physical specs      │
                    │  • 20+ fields          │
                    └────────┬───────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   ENHANCED EXTRACTION LAYER                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  enhancedPdfExtractor.ts                                          │  │
│  │  • Generate 10 complete chapters                                  │  │
│  │  • Generate 10 presentation hotspots                              │  │
│  │  • Detect missing fields                                          │  │
│  │  • Calculate confidence score                                     │  │
│  │  • Apply intelligent defaults                                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │ EnhancedExtraction     │
                    │ • 10 chapters          │
                    │ • 10 hotspots          │
                    │ • confidence level     │
                    │ • missing fields list  │
                    └────────┬───────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PRODUCT AUTOMATION LAYER                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  productAutomation.ts                                             │  │
│  │  • Detect engine brand → Assign category                          │  │
│  │  • Select template (Escorts vs Generic)                           │  │
│  │  • Map images to chapters                                         │  │
│  │  • Generate showcase data (CMS format)                            │  │
│  │  • Generate presentation data (CMS format)                        │  │
│  │  • Flatten for CMS editing                                        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │ ProductAutomation      │
                    │ • brandKey             │
                    │ • categorySlug         │
                    │ • showcaseData         │
                    │ • presentationData     │
                    └────────┬───────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        ADMIN REVIEW LAYER                                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  AddProduct.tsx                                                   │  │
│  │  • Display extracted data                                         │  │
│  │  • Show confidence level                                          │  │
│  │  • Highlight missing fields                                       │  │
│  │  • Allow manual editing                                           │  │
│  │  • Provide draft/publish options                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
              Save Draft                  Publish
                    │                         │
                    └────────────┬────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE STORAGE                                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Database Tables:                                                 │  │
│  │                                                                    │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │  │
│  │  │   products      │  │ product_specs   │  │ product_media   │ │  │
│  │  │  • id           │  │  • product_id   │  │  • product_id   │ │  │
│  │  │  • name         │  │  • spec_label   │  │  • kind         │ │  │
│  │  │  • model        │  │  • spec_value   │  │  • public_url   │ │  │
│  │  │  • slug         │  │  • display_order│  │  • storage_path │ │  │
│  │  │  • kva          │  └─────────────────┘  │  • mime_type    │ │  │
│  │  │  • engine_brand │                        │  • alt_text     │ │  │
│  │  │  • category_id  │  ┌─────────────────┐  └─────────────────┘ │  │
│  │  │  • status       │  │  cms_sections   │                       │  │
│  │  │  • price        │  │  • section_key  │  ┌─────────────────┐ │  │
│  │  │  • stock        │  │  • scope_type   │  │product_categories│ │  │
│  │  │  • tags         │  │  • scope_id     │  │  • id           │ │  │
│  │  │  • seo_title    │  │  • content      │  │  • slug         │ │  │
│  │  │  • meta_desc    │  │  • revision     │  │  • name         │ │  │
│  │  └─────────────────┘  └─────────────────┘  │  • parent_id    │ │  │
│  │                                              └─────────────────┘ │  │
│  │                                                                    │  │
│  │  Storage Buckets:                                                 │  │
│  │  • product-media (images, videos, PDFs)                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND DISPLAY                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  ProductDetail.tsx (Showcase Page)                                │  │
│  │  • Fetch product + showcase data from Supabase                    │  │
│  │  • Display 10-chapter scroll story                                │  │
│  │  • Each chapter: image, title, tagline, specs                     │  │
│  │  • Smooth scroll navigation                                       │  │
│  │  • "Present Mode" button                                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  GuidedPresentation.tsx (Presentation Mode)                       │  │
│  │  • Fetch presentation data from Supabase                          │  │
│  │  • Display main product image                                     │  │
│  │  • 10 clickable hotspots                                          │  │
│  │  • Zoom and pan animations                                        │  │
│  │  • Sub-images for each hotspot                                    │  │
│  │  • Specs and descriptions                                         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Structure Flow

### 1. ExtractedProduct (from PDF)
```typescript
{
  name: "EKL 15 kVA Silent DG Set",
  model: "ATM-EKL15-IV",
  kva: "15",
  engineBrand: "escorts-kubota",
  engineModel: "G15-IV",
  alternatorBrand: "Stamford",
  voltage: "415 V",
  frequency: "50 Hz",
  fuelConsumption: "3.5 L/h",
  noiseLevel: "75 dB(A) @ 1m",
  dimensions: "1760 × 950 × 1495 mm",
  dryWeight: "850 kg",
  cpcb: "iv-plus",
  // ... 10+ more fields
}
```

### 2. EnhancedExtraction (10 chapters + 10 hotspots)
```typescript
{
  name: "EKL 15 kVA Silent DG Set",
  model: "ATM-EKL15-IV",
  kva: 15,
  kwe: 12,
  chapters: [
    {
      id: "overview",
      number: "01",
      title: "EKL 15 kVA (2 Cyl) DG Set",
      tagline: "CPCB IV+ compliant, ISO 8528 certified",
      specs: [
        { label: "Model", value: "ATM-EKL15-IV" },
        { label: "Rating", value: "15 kVA / 12 kWe" },
        { label: "Voltage", value: "415 V" },
        { label: "Frequency", value: "50 Hz" },
        { label: "Speed", value: "1500 RPM" },
        { label: "Compliance", value: "CPCB IV+" }
      ],
      highlights: [
        { value: 15, suffix: " kVA", label: "Prime power" },
        { value: 75, suffix: " dB(A)", label: "Sound @ 1m" },
        { value: 27, suffix: "+ yrs", label: "Heritage" }
      ]
    },
    // ... 9 more chapters
  ],
  hotspots: [
    {
      id: "overview",
      title: "Overview",
      description: "The ATM-EKL15-IV is an Escorts-powered...",
      x: 50, y: 50,
      zoom: 1,
      offsetX: 0, offsetY: 0,
      specs: [...]
    },
    // ... 9 more hotspots
  ],
  confidence: "high",
  missingFields: [],
  extractionNotes: "All major fields extracted successfully."
}
```

### 3. ProductAutomation (CMS-ready)
```typescript
{
  brandKey: "escorts-kubota",
  brandLabel: "Escorts",
  categorySlug: "dg-sets-escort",
  type: "silent",
  showcaseData: {
    productName: "EKL 15 kVA (2 Cyl) DG Set",
    pageLabel: "Showcase",
    pageSubtitle: "10-chapter walkthrough...",
    presentModeBtn: "Present Mode",
    sections: [...], // 10 ShowcaseSection objects
    hotspots: [...], // 10 Hotspot objects
    // Flattened CMS fields for editing
    chapter_0_title: "EKL 15 kVA (2 Cyl) DG Set",
    chapter_0_tagline: "CPCB IV+ compliant...",
    chapter_0_spec0_label: "Model",
    chapter_0_spec0_value: "ATM-EKL15-IV",
    chapter_0_spec1_label: "Rating",
    chapter_0_spec1_value: "15 kVA / 12 kWe",
    // ... all chapters and specs flattened
  },
  presentationData: {
    mainImages: {
      image1: "primary-image-url",
      image2: "alternate-view-url"
    },
    hotspots: [...],
    // Flattened CMS fields
    hotspot_0_title: "Overview",
    hotspot_0_desc: "The ATM-EKL15-IV...",
    hotspot_0_x: "50",
    hotspot_0_y: "50",
    // ... all hotspots flattened
  }
}
```

### 4. Supabase Storage
```sql
-- products table
INSERT INTO products (
  id: "uuid-1",
  name: "EKL 15 kVA (2 Cyl) DG Set",
  model: "ATM-EKL15-IV",
  slug: "ekl-15-2cyl",
  kva: 15,
  engine_brand: "Escorts",
  type: "silent",
  cpcb: "IV+",
  category_id: "uuid-cat-1",
  status: "published",
  ...
)

-- product_specs table (60+ rows)
INSERT INTO product_specs (
  { product_id: "uuid-1", spec_label: "Model", spec_value: "ATM-EKL15-IV", display_order: 0 },
  { product_id: "uuid-1", spec_label: "Rating", spec_value: "15 kVA / 12 kWe", display_order: 1 },
  { product_id: "uuid-1", spec_label: "Engine Make", spec_value: "Escorts", display_order: 2 },
  ...
)

-- product_media table
INSERT INTO product_media (
  { product_id: "uuid-1", kind: "primary", public_url: "...", display_order: 0 },
  { product_id: "uuid-1", kind: "gallery", public_url: "...", display_order: 1 },
  { product_id: "uuid-1", kind: "gallery", public_url: "...", display_order: 2 },
  { product_id: "uuid-1", kind: "datasheet", public_url: "...", display_order: 100 },
  ...
)

-- cms_sections table (2 rows per product)
INSERT INTO cms_sections (
  {
    section_key: "showcaseData",
    scope_type: "product",
    scope_id: "uuid-1",
    content: { /* showcaseData object */ },
    revision: 1
  },
  {
    section_key: "presentationData",
    scope_type: "product",
    scope_id: "uuid-1",
    content: { /* presentationData object */ },
    revision: 1
  }
)
```

## Category Assignment Logic

```
┌─────────────────────────────────────────────────────────────┐
│                    Engine Brand Detection                    │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    Escorts/Kubota   Baudouin        Other
         │               │               │
         │               │               │
         ▼               ▼               ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────┐
│  Type: Silent   │ │Type: Silent │ │Type: Silent │
│  Category:      │ │Category:    │ │Category:    │
│  dg-sets-escort │ │dg-sets-     │ │silent-      │
│                 │ │baudouin     │ │dg-sets      │
└─────────────────┘ └─────────────┘ └─────────────┘
         │               │               │
┌─────────────────┐ ┌─────────────┐ ┌─────────────┐
│  Type: Open     │ │Type: Open   │ │Type: Open   │
│  Category:      │ │Category:    │ │Category:    │
│  open-dg-sets   │ │open-dg-sets │ │open-dg-sets │
└─────────────────┘ └─────────────┘ └─────────────┘
```

## Template Selection Logic

```
┌─────────────────────────────────────────────────────────────┐
│                    Engine Brand Check                        │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
    Escorts/Kubota                   Other Brands
         │                               │
         ▼                               ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│   EKL15 Template        │    │   Generic Template      │
│   (10 Chapters)         │    │   (6-7 Chapters)        │
├─────────────────────────┤    ├─────────────────────────┤
│ 01. Overview            │    │ 01. Overview            │
│ 02. Engine              │    │ 02. Engine              │
│ 03. Fuel, Lube & Cool   │    │ 03. Power Output        │
│ 04. Alternator          │    │ 04. Sound & Enclosure   │
│ 05. Electrical Perf     │    │ 05. Control Panel       │
│ 06. Enclosure & Sound   │    │ 06. Dimensions & Weight │
│ 07. Control Panel       │    │ 07. Product Video (opt) │
│ 08. Protection & Appr   │    └─────────────────────────┘
│ 09. Standard Supply     │
│ 10. Dimensions & Weight │
└─────────────────────────┘
```

## Performance Timeline

```
Time (seconds)
0s ────────────────────────────────────────────────────────────> 15s
│
├─ PDF Upload (instant)
│
├─ Text Extraction (2-3s)
│  └─ pdf.js processing
│
├─ AI Extraction (3-5s)
│  └─ Gemini API call
│
├─ Enhanced Generation (<1s)
│  └─ 10 chapters + 10 hotspots
│
├─ Product Automation (<1s)
│  └─ Category + template selection
│
├─ Admin Review (variable)
│  └─ Human review and editing
│
└─ Supabase Storage (2-3s)
   ├─ Product insert
   ├─ Specs insert
   ├─ Media insert
   └─ CMS data save

Total Automated Time: 7-10 seconds
Total with Admin Review: 10-15 minutes
```

## Success Metrics

```
┌─────────────────────────────────────────────────────────────┐
│                    Before Automation                         │
├─────────────────────────────────────────────────────────────┤
│ Manual data entry:              60 minutes                   │
│ Creating 10 chapters:           30 minutes                   │
│ Setting up presentation:        20 minutes                   │
│ Image preparation:              10 minutes                   │
│ ─────────────────────────────────────────                   │
│ Total per product:              120 minutes (2 hours)        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    After Automation                          │
├─────────────────────────────────────────────────────────────┤
│ PDF upload:                     10 seconds                   │
│ Automated extraction:           7 seconds                    │
│ Admin review:                   5 minutes                    │
│ Manual corrections:             5 minutes                    │
│ ─────────────────────────────────────────────────────────────│
│ Total per product:              10 minutes                   │
└─────────────────────────────────────────────────────────────┘

Time Saved: 110 minutes (92% reduction)
```

---

**Last Updated**: May 7, 2026  
**Version**: 1.0
