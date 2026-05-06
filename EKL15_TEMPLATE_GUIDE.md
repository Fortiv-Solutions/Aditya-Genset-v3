# EKL 15 Template System Guide

## Overview

The **EKL 15 (2 Cyl)** product serves as the **standard template** for all Escorts/Kubota products in the Aditya Genset system. This ensures consistency across all product pages while allowing easy content updates.

## Template Philosophy

**Same Structure, Different Content**

- ✅ **Same**: Page design, layout, section order, presentation format
- ✅ **Same**: 10-chapter showcase structure, 10 presentation hotspots
- ✅ **Same**: Spec categories, card format, navigation
- ❌ **Different**: Only the actual values (kVA, engine model, dimensions, specs, images)

## Files Involved

### 1. Template Definition
**File**: `src/lib/templates/escortsProductTemplate.ts`

Defines the `EscortsProductData` interface and `generateEscortsProduct()` function.

```typescript
interface EscortsProductData {
  // Basic Info
  model: string
  name: string
  kva: number
  slug: string
  
  // Engine Specs
  engineMake: string
  engineModel: string
  cylinders: number
  // ... more fields
  
  // Images
  cardImage: string
  showcaseImages: { ... }
  presentationImages: { ... }
}
```

### 2. Migration Script
**File**: `src/lib/migrations/migrateEKL15.ts`

Contains:
- `EKL15_DATA` - Complete data for EKL 15 product
- `migrateEKL15ToSupabase()` - Function to insert into database
- `fetchEKL15FromSupabase()` - Function to retrieve and verify

### 3. Reference Data
**File**: `src/data/ekl15Data.ts`

Contains the complete chapter-by-chapter data structure with ~130 data points covering all 10 chapters.

## Database Structure

When migrated, EKL 15 data is stored in:

### 1. `products` table
Basic product information:
- model, name, kva, slug
- engine_brand, type, cpcb
- status, pricing, stock info
- SEO fields

### 2. `product_media` table
Product images:
- Card image (primary)
- Showcase images (linked via CMS)
- Presentation images (linked via CMS)

### 3. `product_specs` table
All specifications (~60 specs):
- Engine specs (cylinders, displacement, power)
- Electrical specs (voltage, current, frequency)
- Physical specs (dimensions, weight)
- Performance specs (fuel consumption, noise)

### 4. `cms_sections` table
Two CMS entries per product:

**a) Showcase Data** (`section_key: 'showcaseData'`)
```json
{
  "sections": [
    {
      "id": "overview",
      "number": "01",
      "title": "EKL 15 kVA Silent DG Set",
      "tagline": "...",
      "image": "...",
      "specs": [...]
    },
    // ... 9 more sections
  ],
  "hotspots": [...]
}
```

**b) Presentation Data** (`section_key: 'presentationData'`)
```json
{
  "mainImages": {
    "image1": "...",
    "image2": "..."
  },
  "hotspots": [
    {
      "id": "overview",
      "x": 50, "y": 50,
      "title": "...",
      "description": "...",
      "subImage": "...",
      "zoom": 1,
      "offsetX": 0,
      "offsetY": 0
    },
    // ... 9 more hotspots
  ]
}
```

## 10-Chapter Structure

All Escorts products follow this structure:

1. **Overview** - Product introduction, key specs, highlights
2. **Engine** - Engine specifications and features
3. **Fuel, Lube & Cooling** - Fuel system, lubrication, cooling
4. **Alternator** - Alternator specs and electrical performance
5. **Electrical Performance** - Voltage regulation, reactance data
6. **Enclosure & Sound** - Acoustic enclosure, noise levels, CPCB
7. **Control Panel** - Controller specs, monitoring parameters
8. **Protection & Approvals** - Safety systems, certifications
9. **Standard Supply** - Included items and optional extras
10. **Dimensions & Weight** - Physical dimensions and specifications

## How to Add a New Escorts Product

### Step 1: Prepare Product Data

Create a new data object following the `EscortsProductData` interface:

```typescript
const EKL20_DATA: EscortsProductData = {
  model: "ATM EKL 20 (3 Cyl)-IV",
  name: "EKL 20 kVA (3 Cyl) DG Set",
  kva: 20,
  kwe: 16,
  slug: "ekl-20-3cyl",
  
  engineMake: "Escorts",
  engineModel: "G20-IV",
  cylinders: 3,
  displacement: "2.1 L",
  // ... update all other fields
  
  // Update images
  cardImage: ekl20Card,
  showcaseImages: {
    overview: ekl20Overview,
    engine: ekl20Engine,
    // ... all 10 images
  },
  presentationMainImage1: ekl20Main1,
  presentationMainImage2: ekl20Main2,
  presentationSubImages: {
    // ... all 10 images
  }
}
```

### Step 2: Create Migration Script

Create `src/lib/migrations/migrateEKL20.ts`:

```typescript
import { supabase } from '../supabase'
import { generateEscortsProduct } from '../templates/escortsProductTemplate'
import type { EscortsProductData } from '../templates/escortsProductTemplate'

// Import images
import ekl20Card from "@/assets/products/escorts/escort_20kva.jpg"
// ... import all images

const EKL20_DATA: EscortsProductData = {
  // ... your data
}

export async function migrateEKL20ToSupabase() {
  const productData = generateEscortsProduct(EKL20_DATA)
  
  // Insert product
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      slug: EKL20_DATA.slug,
      model: EKL20_DATA.model,
      // ... all fields
    })
    .select()
    .single()
  
  // Insert media, specs, CMS data
  // ... (copy from migrateEKL15.ts)
  
  return product
}
```

### Step 3: Add to Migration Runner

Update `src/pages/MigrationRunner.tsx` to include the new product migration button.

### Step 4: Run Migration

1. Navigate to `/admin/migrations`
2. Click "Run Migration" for your new product
3. Verify with "Test Fetch"

## Frontend Integration

### Fetching from Database

Update your components to fetch from Supabase instead of hardcoded data:

```typescript
// Before (hardcoded)
import { EKL15_SHOWCASE } from '@/data/products'

// After (from database)
import { getProductBySlug } from '@/lib/api/products'

const product = await getProductBySlug('ekl-15-2cyl')
```

### Product Card (DG Sets Category)

```typescript
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('engine_brand', 'Escorts')
  .eq('status', 'published')
```

### Showcase Page (Product Detail)

```typescript
const { data: product } = await supabase
  .from('products')
  .select('*, product_media(*), product_specs(*)')
  .eq('slug', slug)
  .single()

const { data: showcaseData } = await supabase
  .from('cms_sections')
  .select('content')
  .eq('section_key', 'showcaseData')
  .eq('scope_id', product.id)
  .single()
```

### Presentation Mode

```typescript
const { data: presentationData } = await supabase
  .from('cms_sections')
  .select('content')
  .eq('section_key', 'presentationData')
  .eq('scope_id', product.id)
  .single()
```

## Image Management

### Current Image Structure

```
src/assets/products/
├── escorts/
│   ├── escort_15kva.jpg       (card image)
│   ├── escort_15kva_2.jpg     (alternate view)
│   ├── escort_20kva.jpg
│   ├── escort_20kva_1.jpg
│   ├── escort_30kva.jpg
│   ├── escort_40kva_main.jpg
│   └── ...
├── parts/
│   ├── engine-real.jpg        (generic engine)
│   └── enclosure.jpg          (generic enclosure)
└── showcase/
    ├── main-view.png
    └── product-video.mp4
```

### Image Guidelines

1. **Card Image**: Main product photo (front/side view)
2. **Showcase Images**: 10 images for each chapter
   - Can reuse generic images (engine, enclosure)
   - Product-specific images preferred
3. **Presentation Images**: 
   - 2 main images (different angles)
   - 10 sub-images (one per hotspot)

## Benefits of Template System

✅ **Consistency**: All Escorts products have identical structure
✅ **Maintainability**: Update template once, affects all products
✅ **Scalability**: Easy to add new products (just change content)
✅ **Type Safety**: TypeScript interface ensures all fields are provided
✅ **Database-Driven**: Content stored in Supabase, not hardcoded
✅ **CMS-Ready**: Showcase and presentation data editable via CMS

## Next Steps

1. ✅ Complete EKL 15 migration script (DONE)
2. ⏳ Set up Supabase project and run schema
3. ⏳ Run EKL 15 migration
4. ⏳ Update frontend components to fetch from database
5. ⏳ Test complete flow: card → showcase → presentation
6. ⏳ Create migrations for other Escorts products (EKL 20, 25, 30, etc.)
7. ⏳ Build admin dashboard for managing products
8. ⏳ Add CMS editor for showcase/presentation content

## Support Files

- `SUPABASE_SETUP.md` - Supabase setup instructions
- `SUPABASE_SUMMARY.md` - Database schema overview
- `QUICK_START.md` - Quick start guide
- `supabase-schema.sql` - Complete database schema

## Questions?

Refer to:
- Template interface: `src/lib/templates/escortsProductTemplate.ts`
- Example migration: `src/lib/migrations/migrateEKL15.ts`
- Reference data: `src/data/ekl15Data.ts`
- Migration runner: Navigate to `/admin/migrations`
