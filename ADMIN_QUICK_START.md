# Admin Quick Start Guide

## Adding a New Product from PDF

### Step 1: Access Product Creation

1. Log in to admin panel
2. Navigate to **Products** → **Add Product**
3. You'll see the product creation form

### Step 2: Upload PDF Datasheet

1. **Drag and drop** your product PDF into the import zone, or **click to browse**
2. Wait 5-10 seconds for extraction
3. System will show:
   - ✅ **Extraction complete** - Review below
   - Confidence level (high/medium/low)
   - Number of page images captured
   - Preview of extracted fields

### Step 3: Review Extracted Data

The system automatically fills these sections:

#### A. Basic Information
- ✅ Product Name (e.g., "EKL 15 kVA Silent DG Set")
- ✅ Model Number (e.g., "ATM-EKL15-IV")
- ✅ Category (auto-assigned based on engine brand)
- ✅ Type (Silent or Open)
- ✅ Short Description (160 characters)
- ✅ Full Description
- ✅ Product Tags

**What to check**:
- Product name is correct and professional
- Model number matches datasheet
- Category is appropriate (Escort/Baudouin/Silent/Open)
- Descriptions are accurate

#### B. Technical Specifications
- ✅ Power Output (kVA)
- ✅ Engine Brand (Escorts, Baudouin, etc.)
- ✅ CPCB Compliance (IV+ or II)
- ✅ All specifications from PDF

**What to check**:
- kVA rating is correct
- Engine brand is properly detected
- Look for "Refer datasheet" placeholders
- Add missing specifications manually

#### C. Pricing & Availability
- Set base price or check "Price on Request"
- Choose availability (In Stock/On Order/Discontinued)
- Set delivery time (default: 21 days)
- Set minimum order quantity (default: 1)

#### D. Media
- ✅ Primary Image (from PDF page 1)
- ✅ Gallery Images (from PDF pages 2-8)
- ✅ PDF Datasheet (original PDF)
- Optional: Product Video URL

**What to check**:
- Primary image looks good
- Gallery has enough images (8-10 recommended)
- Add video URL if available

#### E. SEO (Optional)
- SEO Title (auto-generated from product name)
- Meta Description (auto-generated from short desc)
- Canonical URL (auto-generated from model)

### Step 4: Review Missing Fields

System highlights missing or incomplete data:

**Common missing fields**:
- Engine Model → Add manually from datasheet
- Alternator Brand → Add manually
- Fuel Consumption → Add manually
- Noise Level → Add manually
- Dimensions → Add manually

**How to add**:
1. Scroll to **Technical Specifications**
2. Click **Add Specification Row**
3. Enter label and value
4. Repeat for all missing fields

### Step 5: Save or Publish

Two options:

**Save Draft**:
- Saves product without publishing
- Status: Draft
- Not visible on website
- Can edit later

**Publish**:
- Makes product live immediately
- Status: Published
- Visible on website
- Creates showcase page automatically
- Generates presentation mode

### Step 6: Verify Product Page

After publishing:

1. Click **Preview** button (eye icon)
2. Check showcase page has 10 chapters:
   - 01: Overview
   - 02: Engine
   - 03: Fuel, Lube & Cooling
   - 04: Alternator
   - 05: Electrical Performance
   - 06: Enclosure & Sound
   - 07: Control Panel
   - 08: Protection & Approvals
   - 09: Standard Supply
   - 10: Dimensions & Weight

3. Click **Present Mode** button
4. Verify 10 hotspots work correctly
5. Check all images load properly

## What Gets Auto-Generated

### ✅ Showcase Page (10 Chapters)

Each chapter includes:
- Title and tagline
- Image (from gallery or fallback)
- 4-8 specifications
- Smooth scroll navigation

**Example Chapter 1 (Overview)**:
```
Title: EKL 15 kVA (2 Cyl) DG Set
Tagline: CPCB IV+ compliant, ISO 8528 certified
Specs:
  - Model: ATM-EKL15-IV
  - Rating: 15 kVA / 12 kWe
  - Voltage: 415 V
  - Frequency: 50 Hz
  - Speed: 1500 RPM
  - Compliance: CPCB IV+
Highlights:
  - 15 kVA (Prime power)
  - 75 dB(A) (Sound @ 1m)
  - 27+ yrs (Heritage)
```

### ✅ Presentation Mode (10 Hotspots)

Interactive presentation with:
- Main product image
- 10 clickable hotspots
- Zoom and pan animations
- Sub-images for each section
- Specifications for each hotspot

**Hotspot positions** (auto-calculated):
1. Overview - Center (50%, 50%)
2. Engine - Left-center (42%, 48%)
3. Fuel System - Left-bottom (35%, 55%)
4. Alternator - Right-center (65%, 45%)
5. Electrical - Right-top (78%, 38%)
6. Enclosure - Center-bottom (50%, 75%)
7. Control Panel - Right-top (70%, 30%)
8. Protection - Center-right (60%, 60%)
9. Supply - Left-bottom (40%, 65%)
10. Dimensions - Center (50%, 50%)

## Category Auto-Assignment

System automatically assigns products to correct category:

| Engine Brand | Type | Category |
|-------------|------|----------|
| Escorts / Escorts-Kubota | Silent | DG Sets → Escort |
| Escorts / Escorts-Kubota | Open | Open DG Sets |
| Baudouin | Silent | DG Sets → Baudouin |
| Baudouin | Open | Open DG Sets |
| Other | Silent | Silent DG Sets |
| Other | Open | Open DG Sets |

**Override**: You can manually select a different category if needed.

## Template Selection

System uses different templates based on engine brand:

### Escorts Template (10 Chapters)
Used for: Escorts, Escorts-Kubota, Kubota

**Structure**:
1. Overview
2. Engine
3. Fuel, Lube & Cooling
4. Alternator
5. Electrical Performance
6. Enclosure & Sound
7. Control Panel
8. Protection & Approvals
9. Standard Supply
10. Dimensions & Weight

### Generic Template (6-7 Chapters)
Used for: Baudouin, Cummins, Kohler, Mahindra, others

**Structure**:
1. Overview
2. Engine
3. Power Output
4. Sound & Enclosure
5. Control Panel
6. Dimensions & Weight
7. Product Video (if available)

## Confidence Levels

System rates extraction confidence:

**High Confidence** ✅
- All major fields extracted
- 0-2 missing fields
- Ready to publish with minimal review

**Medium Confidence** ⚠️
- Most fields extracted
- 3-5 missing fields
- Review and fill missing data

**Low Confidence** ❌
- Many fields missing
- 6+ missing fields
- Requires significant manual input

## Common Issues & Solutions

### Issue: "Refer datasheet" appears in many fields

**Cause**: PDF doesn't have structured data or AI couldn't extract  
**Solution**: Manually add specifications from datasheet

### Issue: Wrong category assigned

**Cause**: Engine brand not detected correctly  
**Solution**: Manually select correct category from dropdown

### Issue: Images not showing in showcase

**Cause**: PDF pages didn't render properly  
**Solution**: Manually add image URLs in Media section

### Issue: Extraction confidence is low

**Cause**: PDF format is non-standard or scanned image  
**Solution**: Manually fill in all fields, system will still generate 10 chapters

### Issue: Product video not showing

**Cause**: Video URL not added  
**Solution**: Add YouTube or direct video URL in Media section

## Best Practices

### ✅ DO:
- Review all extracted fields before publishing
- Add missing specifications manually
- Upload high-quality product images
- Test showcase page after publishing
- Use consistent naming conventions
- Add relevant product tags
- Configure SEO fields

### ❌ DON'T:
- Publish without reviewing extracted data
- Leave "Refer datasheet" placeholders
- Use low-quality or blurry images
- Skip testing the showcase page
- Forget to set pricing/availability
- Ignore missing field warnings

## Editing Published Products

1. Go to **Products** list
2. Click **Edit** (pencil icon) on product
3. Make changes
4. Click **Publish** to update

**Note**: Showcase and presentation data will be regenerated with new information.

## Bulk Operations

From Products list, you can:
- ✅ Select multiple products (checkbox)
- ✅ Bulk publish/draft
- ✅ Bulk archive
- ✅ Bulk delete
- ✅ Duplicate products
- ✅ Filter by status/type/engine

## Product Status Workflow

```
Draft → Published → Archived
  ↑         ↓
  └─────────┘
```

**Draft**: Not visible on website, can edit freely  
**Published**: Live on website, visible to customers  
**Archived**: Hidden from website, kept for records

## Quick Checklist

Before publishing, verify:

- [ ] Product name is professional and accurate
- [ ] Model number is correct
- [ ] kVA rating is accurate
- [ ] Engine brand is correct
- [ ] Category is appropriate
- [ ] All specifications are filled (no "Refer datasheet")
- [ ] Primary image looks good
- [ ] Gallery has 8-10 images
- [ ] Pricing is set or "Price on Request" is checked
- [ ] Availability status is correct
- [ ] Product tags are added
- [ ] SEO fields are configured
- [ ] Showcase page tested (10 chapters visible)
- [ ] Presentation mode tested (10 hotspots work)

## Support

If you encounter issues:
1. Check this guide
2. Review extraction notes
3. Check console for errors
4. Contact technical support

## Video Tutorial

Coming soon: Step-by-step video walkthrough of the product creation process.

---

**Last Updated**: May 2026  
**Version**: 1.0
