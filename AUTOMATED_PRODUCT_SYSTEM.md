# Automated Product Creation System

## Overview

This system automatically extracts product details from PDF datasheets, generates complete 10-chapter showcase pages and presentation modes, and stores everything in Supabase. Admins can review and edit before publishing.

## Features

✅ **Automatic PDF Extraction** - AI-powered extraction using Google Gemini API with local fallback  
✅ **10-Chapter Showcase Generation** - Complete EKL15-style showcase with all sections  
✅ **10-Hotspot Presentation Mode** - Interactive guided presentation automatically generated  
✅ **Intelligent Category Assignment** - Auto-assigns to correct category (DG Sets → Escort/Baudouin)  
✅ **Template-Based Structure** - Escorts products use EKL15 template, others use generic template  
✅ **Supabase Integration** - All data stored in database with proper relationships  
✅ **Admin Review & Edit** - Full control before publishing  
✅ **Missing Field Detection** - Highlights incomplete data for manual review  

## System Architecture

```
PDF Upload
    ↓
PDF Text Extraction (pdf.js)
    ↓
AI Extraction (Gemini API) → Enhanced Extraction (10 chapters + 10 hotspots)
    ↓
Product Automation (Category + Template Selection)
    ↓
Supabase Storage
    ├── products table (basic info)
    ├── product_specs table (specifications)
    ├── product_media table (images, videos, PDFs)
    └── cms_sections table (showcaseData + presentationData)
    ↓
Admin Review & Edit
    ↓
Publish → Live Product Page
```

## How It Works

### 1. PDF Upload & Extraction

**File**: `src/lib/pdfExtractor.ts`

- Admin uploads product PDF datasheet
- System extracts text using pdf.js
- Renders PDF pages as images (up to 8 pages)
- Sends text to Gemini API for structured extraction
- Falls back to local regex parsing if API unavailable

**Extracted Fields**:
- Basic: name, model, kVA, category, descriptions
- Engine: brand, model, cylinders, displacement
- Electrical: voltage, frequency, phase, power factor
- Performance: fuel consumption, noise level
- Physical: dimensions, weight, fuel tank capacity
- Compliance: CPCB, alternator brand, controller

### 2. Enhanced Extraction (10 Chapters)

**File**: `src/lib/enhancedPdfExtractor.ts`

Takes extracted data and generates complete 10-chapter structure:

1. **Overview** - Product intro, key specs, highlights
2. **Engine** - Engine specifications and features
3. **Fuel, Lube & Cooling** - Fuel system, lubrication, cooling
4. **Alternator** - Alternator specs and electrical performance
5. **Electrical Performance** - Voltage regulation, reactance data
6. **Enclosure & Sound** - Acoustic enclosure, noise levels, CPCB
7. **Control Panel** - Controller specs, monitoring parameters
8. **Protection & Approvals** - Safety systems, certifications
9. **Standard Supply** - Included items and optional extras
10. **Dimensions & Weight** - Physical dimensions and specifications

**Also generates 10 presentation hotspots** matching each chapter with:
- Position (x, y coordinates)
- Zoom level and offsets
- Title, description, specs
- Sub-images for each hotspot

### 3. Product Automation

**File**: `src/lib/productAutomation.ts`

**Category Assignment**:
- Escorts/Kubota → `dg-sets-escort`
- Baudouin → `dg-sets-baudouin`
- Silent type → `silent-dg-sets`
- Open type → `open-dg-sets`

**Template Selection**:
- **Escorts products** → Use EKL15 template (10 chapters, full structure)
- **Other brands** → Use generic template (6-7 chapters, simplified)

**Showcase Data Generation**:
```typescript
{
  productName: "EKL 15 kVA (2 Cyl) DG Set",
  pageLabel: "Showcase",
  pageSubtitle: "10-chapter walkthrough...",
  presentModeBtn: "Present Mode",
  sections: [...], // 10 ShowcaseSection objects
  hotspots: [...], // 10 Hotspot objects
  // Flattened CMS-editable fields
  chapter_0_title: "...",
  chapter_0_spec0_label: "...",
  chapter_0_spec0_value: "...",
  // ... all chapters and specs
}
```

**Presentation Data Generation**:
```typescript
{
  mainImages: {
    image1: "primary-image-url",
    image2: "alternate-view-url"
  },
  hotspots: [...], // 10 hotspots with positions
  // Flattened CMS-editable fields
  hotspot_0_title: "...",
  hotspot_0_desc: "...",
  hotspot_0_x: "50",
  hotspot_0_y: "50",
  // ... all hotspots
}
```

### 4. Supabase Storage

**Products Table**:
```sql
INSERT INTO products (
  name, model, slug, kva, engine_brand, type, cpcb,
  category_id, status, price, stock, short_desc, full_desc,
  tags, seo_title, meta_desc, published_at
)
```

**Product Specs Table**:
```sql
INSERT INTO product_specs (
  product_id, spec_label, spec_value, display_order
)
-- All extracted specifications
```

**Product Media Table**:
```sql
INSERT INTO product_media (
  product_id, kind, public_url, storage_path, 
  mime_type, alt_text, display_order
)
-- Kinds: primary, gallery, datasheet, video
```

**CMS Sections Table**:
```sql
-- Showcase data
INSERT INTO cms_sections (
  section_key, scope_type, scope_id, content, revision
) VALUES (
  'showcaseData', 'product', product_id, {...}, 1
)

-- Presentation data
INSERT INTO cms_sections (
  section_key, scope_type, scope_id, content, revision
) VALUES (
  'presentationData', 'product', product_id, {...}, 1
)
```

### 5. Admin Review & Edit

**Page**: `src/pages/admin/AddProduct.tsx`

Admin can:
- ✅ Review all extracted fields
- ✅ Edit any field before publishing
- ✅ Add/remove specifications
- ✅ Upload additional images
- ✅ Set pricing and availability
- ✅ Configure SEO settings
- ✅ Save as draft or publish immediately

**Missing Field Detection**:
- System highlights fields that couldn't be extracted
- Shows confidence level (high/medium/low)
- Provides extraction notes for admin review

### 6. Product Showcase Page

**Page**: `src/pages/ProductDetail.tsx`

Automatically displays:
- ✅ 10-chapter scroll story (or 6-7 for generic)
- ✅ Each chapter with image, title, tagline, specs
- ✅ Smooth scroll navigation
- ✅ "Present Mode" button
- ✅ All data fetched from Supabase

**Data Flow**:
```typescript
// Fetch product with showcase data
const { data } = await fetchProductShowcase(slug)

// Returns:
{
  product: { id, name, model, kva, ... },
  showcase: {
    sections: [...], // 10 chapters
    hotspots: [...], // 10 hotspots
  }
}
```

### 7. Presentation Mode

**Component**: `src/components/site/GuidedPresentation.tsx`

Interactive presentation with:
- ✅ 10 clickable hotspots on main image
- ✅ Zoom and pan animations
- ✅ Sub-images for each hotspot
- ✅ Specs and descriptions
- ✅ Navigation between hotspots
- ✅ Full-screen mode

## Usage Guide

### For Admins

1. **Upload PDF**:
   - Go to `/admin/products/add`
   - Drop PDF datasheet in the import zone
   - Wait for extraction (5-10 seconds)

2. **Review Extracted Data**:
   - Check all fields for accuracy
   - Look for "Refer datasheet" placeholders
   - Review confidence level and notes
   - Edit any incorrect or missing fields

3. **Add Media**:
   - Primary image (required)
   - Gallery images (recommended: 8-10 images)
   - PDF datasheet URL
   - Product video (optional)

4. **Configure Settings**:
   - Set pricing or "Price on Request"
   - Choose availability status
   - Add product tags
   - Configure SEO fields

5. **Save or Publish**:
   - **Save Draft** - Store without publishing
   - **Publish** - Make live immediately

### For Developers

**Add New Product Programmatically**:

```typescript
import { generateProductAutomation } from "@/lib/productAutomation"
import { updateCMSSection } from "@/lib/api/cms"
import { supabase } from "@/lib/supabase"

// 1. Prepare data
const form = { name, model, kva, engineBrand, ... }
const specs = [{ label, value }, ...]
const media = { primaryImage, galleryUrls, ... }
const extracted = { /* from PDF extraction */ }

// 2. Generate automation
const automation = generateProductAutomation({
  form, specs, media, extracted
})

// 3. Insert product
const { data: product } = await supabase
  .from("products")
  .insert({ ...productData })
  .select("id")
  .single()

// 4. Insert specs
await supabase
  .from("product_specs")
  .insert(specs.map((spec, i) => ({
    product_id: product.id,
    spec_label: spec.label,
    spec_value: spec.value,
    display_order: i
  })))

// 5. Insert media
await supabase
  .from("product_media")
  .insert([
    { product_id: product.id, kind: "primary", public_url: media.primaryImage },
    // ... gallery, datasheet, video
  ])

// 6. Save CMS data
await updateCMSSection(
  "showcaseData",
  automation.showcaseData,
  "product",
  product.id
)

await updateCMSSection(
  "presentationData",
  automation.presentationData,
  "product",
  product.id
)
```

## Configuration

### Environment Variables

```env
# Required for AI extraction
VITE_GEMINI_API_KEY=your_gemini_api_key

# Required for Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PRODUCT_MEDIA_BUCKET=product-media
```

### Get Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Create new API key (free tier available)
3. Add to `.env` file

### Supabase Setup

1. Create Supabase project
2. Run schema from `supabase schems.txt`
3. Create storage bucket: `product-media`
4. Set bucket to public
5. Add credentials to `.env`

## File Structure

```
src/
├── lib/
│   ├── pdfExtractor.ts              # PDF text extraction + AI
│   ├── enhancedPdfExtractor.ts      # 10-chapter generation
│   ├── productAutomation.ts         # Category + template logic
│   ├── productMediaUpload.ts        # Media upload to Supabase
│   ├── supabase.ts                  # Supabase client + types
│   ├── api/
│   │   ├── cms.ts                   # CMS data read/write
│   │   └── products.ts              # Product queries
│   └── templates/
│       └── escortsProductTemplate.ts # EKL15 template
├── pages/
│   ├── ProductDetail.tsx            # Showcase page
│   └── admin/
│       ├── AddProduct.tsx           # Product creation form
│       └── AdminProducts.tsx        # Product management
├── components/
│   ├── admin/
│   │   └── PDFImportZone.tsx        # PDF upload UI
│   └── site/
│       ├── ScrollStory.tsx          # Showcase scroll UI
│       └── GuidedPresentation.tsx   # Presentation mode
└── data/
    ├── ekl15Data.ts                 # EKL15 reference data
    └── products.ts                  # Type definitions
```

## Troubleshooting

### PDF Extraction Fails

**Problem**: "Extraction failed" error  
**Solution**:
- Check if `VITE_GEMINI_API_KEY` is set
- Verify API key is valid
- Check PDF is valid and not corrupted
- System will fall back to local parsing automatically

### Missing Fields

**Problem**: Many "Refer datasheet" placeholders  
**Solution**:
- PDF may not have structured data
- Manually fill in missing fields
- Add specifications in the spec builder
- System will still generate 10 chapters with available data

### Images Not Showing

**Problem**: Showcase page shows broken images  
**Solution**:
- Check media URLs are valid
- Verify Supabase storage bucket is public
- Ensure images were uploaded successfully
- Check `product_media` table has correct URLs

### Category Not Auto-Assigned

**Problem**: Product goes to wrong category  
**Solution**:
- Check engine brand is correctly extracted
- Verify category logic in `productAutomation.ts`
- Manually select correct category in form
- System respects manual selection over auto-detection

## API Reference

### `extractProductDataWithAI(text, filename)`

Extracts structured product data from PDF text.

**Returns**: `ExtractedProduct`

### `enhanceProductExtraction(extracted, specs)`

Generates complete 10-chapter structure.

**Returns**: `EnhancedProductExtraction`

### `generateProductAutomation(source)`

Generates showcase and presentation data.

**Returns**: `ProductAutomationResult`

### `fetchProductShowcase(slug)`

Fetches product with showcase data from Supabase.

**Returns**: `{ product, showcase }`

### `updateCMSSection(key, content, scope, scopeId)`

Saves CMS content to Supabase.

**Returns**: `CMSSection`

## Best Practices

1. **Always review extracted data** before publishing
2. **Upload high-quality images** (8-10 images recommended)
3. **Fill in missing specifications** manually
4. **Test showcase page** before making product live
5. **Use consistent naming** for models and categories
6. **Add product tags** for better discoverability
7. **Configure SEO fields** for search visibility

## Future Enhancements

- [ ] Bulk PDF upload (multiple products at once)
- [ ] Image extraction from PDF
- [ ] Automatic image optimization
- [ ] Multi-language support
- [ ] Advanced CMS editor for showcase customization
- [ ] Product comparison tool
- [ ] Export to PDF/Excel
- [ ] Analytics dashboard

## Support

For issues or questions:
1. Check this documentation
2. Review `EKL15_TEMPLATE_GUIDE.md`
3. Check console for error messages
4. Verify Supabase connection
5. Test with EKL15 reference product

## License

Proprietary - Aditya Tech Mech
