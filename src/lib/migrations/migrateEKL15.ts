import { supabase } from '../supabase'
import { generateEscortsProduct } from '../templates/escortsProductTemplate'
import type { EscortsProductData } from '../templates/escortsProductTemplate'

// Import EKL 15 images (using existing Escorts images)
import ekl15Card from "@/assets/products/escorts/escort_15kva.jpg"
import ekl15Overview from "@/assets/products/escorts/escort_15kva.jpg"
import ekl15Engine from "@/assets/products/parts/engine-real.jpg"
import ekl15Fuel from "@/assets/products/escorts/escort_20kva_1.jpg"
import ekl15Alternator from "@/assets/products/escorts/escort_15kva_2.jpg"
import ekl15Electrical from "@/assets/products/escorts/escort_30kva.jpg"
import ekl15Enclosure from "@/assets/products/parts/enclosure.jpg"
import ekl15Control from "@/assets/products/escorts/escort_15kva_2.jpg"
import ekl15Protection from "@/assets/products/escorts/escort_30kva.jpg"
import ekl15Supply from "@/assets/products/escorts/escort_20kva_1.jpg"
import ekl15Dimensions from "@/assets/products/escorts/escort_40kva_main.jpg"
import ekl15Main1 from "@/assets/products/escorts/escort_15kva.jpg"
import ekl15Main2 from "@/assets/products/escorts/escort_15kva_2.jpg"

/**
 * EKL 15 (2 Cyl) Product Data
 * This serves as the template for all Escorts products
 */
const EKL15_DATA: EscortsProductData = {
  // Basic Info
  model: "ATM EKL 15 (2 Cyl)-IV",
  name: "EKL 15 kVA (2 Cyl) DG Set",
  kva: 15,
  kwe: 12,
  slug: "ekl-15-2cyl",
  
  // Engine
  engineMake: "Escorts",
  engineModel: "G15-IV",
  cylinders: 2,
  displacement: "1.56 L",
  boreStroke: "95 × 110 mm",
  grossPower: "14.1 kWm / 19 hp",
  speed: 1500,
  
  // Electrical
  voltage: "415 V, 3-Phase",
  frequency: 50,
  phases: "3-Phase, 1/3",
  powerFactor: 0.8,
  ratedCurrent: "62.50 / 20.88 A",
  
  // Alternator
  alternatorMake: "Stamford",
  alternatorFrame: "S0L1-P1",
  avrModel: "AS540",
  
  // Performance
  fuelConsumption: "4.1 L/h",
  noiseLevel: "70 dB(A)",
  
  // Physical
  length: "1760 mm",
  width: "950 mm",
  height: "1495 mm",
  fuelTankCapacity: "70 L",
  
  // Compliance
  cpcb: "CPCB IV+",
  isoCompliance: "ISO 8528",
  
  // Images - Showcase
  cardImage: ekl15Card,
  showcaseImages: {
    overview: ekl15Overview,
    engine: ekl15Engine,
    fuel: ekl15Fuel,
    alternator: ekl15Alternator,
    electrical: ekl15Electrical,
    enclosure: ekl15Enclosure,
    control: ekl15Control,
    protection: ekl15Protection,
    supply: ekl15Supply,
    dimensions: ekl15Dimensions,
  },
  
  // Images - Presentation
  presentationMainImage1: ekl15Main1,
  presentationMainImage2: ekl15Main2,
  presentationSubImages: {
    overview: ekl15Overview,
    engine: ekl15Engine,
    fuel: ekl15Fuel,
    alternator: ekl15Alternator,
    electrical: ekl15Electrical,
    enclosure: ekl15Enclosure,
    control: ekl15Control,
    protection: ekl15Protection,
    supply: ekl15Supply,
    dimensions: ekl15Dimensions,
  },
}

/**
 * Migrate EKL 15 product to Supabase
 */
export async function migrateEKL15ToSupabase() {
  try {
    console.log('🚀 Starting EKL 15 migration...')
    
    // Generate complete product data from template
    const productData = generateEscortsProduct(EKL15_DATA)
    
    // 1. Insert main product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        slug: EKL15_DATA.slug,
        model: EKL15_DATA.model,
        name: EKL15_DATA.name,
        kva: EKL15_DATA.kva,
        engine_brand: 'Escorts',
        type: 'silent',
        cpcb: 'iv-plus',
        status: 'published',
        price_on_request: true,
        moq: 1,
        lead_time_days: 21,
        stock: 'in_stock',
        short_desc: `${EKL15_DATA.kva} kVA silent diesel generator set, ${EKL15_DATA.cpcb} compliant`,
        full_desc: `The ${EKL15_DATA.model} is an ${EKL15_DATA.engineMake}-powered ${EKL15_DATA.kva} kVA silent diesel generator set, designed to comply with ${EKL15_DATA.isoCompliance}. It delivers excellent performance under the most demanding environmental conditions with near-zero downtime for continuous power supply.`,
        tags: ['Escorts', 'Silent', 'CPCB IV+', 'ISO 8528', 'Industrial Grade'],
        seo_title: `${EKL15_DATA.name} - ${EKL15_DATA.cpcb} Compliant | Aditya Genset`,
        meta_desc: `${EKL15_DATA.kva} kVA ${EKL15_DATA.engineMake} diesel generator. ${EKL15_DATA.noiseLevel} sound level, ${EKL15_DATA.cpcb} compliant. ${EKL15_DATA.isoCompliance} certified.`,
        published_at: new Date().toISOString()
      })
      .select()
      .single()

    if (productError) {
      console.error('❌ Error inserting product:', productError)
      return null
    }

    console.log('✅ Product inserted:', product.id)

    // 2. Insert primary product image
    const { error: mediaError } = await supabase
      .from('product_media')
      .insert({
        product_id: product.id,
        kind: 'primary',
        public_url: EKL15_DATA.cardImage,
        alt_text: `${EKL15_DATA.name} - Main Image`,
        display_order: 0
      })

    if (mediaError) {
      console.error('❌ Error inserting product media:', mediaError)
    } else {
      console.log('✅ Product media inserted')
    }

    // 3. Insert product specs (from all showcase sections)
    const allSpecs: Array<{ label: string; value: string }> = []
    productData.showcase.sections.forEach(section => {
      section.specs.forEach(spec => {
        allSpecs.push({ label: spec.label, value: spec.value })
      })
    })

    for (let i = 0; i < allSpecs.length; i++) {
      const spec = allSpecs[i]
      const { error: specError } = await supabase
        .from('product_specs')
        .insert({
          product_id: product.id,
          spec_label: spec.label,
          spec_value: spec.value,
          display_order: i
        })

      if (specError) {
        console.error(`❌ Error inserting spec ${spec.label}:`, specError)
      }
    }

    console.log(`✅ ${allSpecs.length} product specs inserted`)

    // 4. Store showcase data in CMS
    const { error: showcaseError } = await supabase
      .from('cms_sections')
      .insert({
        section_key: 'showcaseData',
        scope_type: 'product',
        scope_id: product.id,
        content: productData.showcase,
        revision: 1
      })

    if (showcaseError) {
      console.error('❌ Error inserting showcase CMS:', showcaseError)
    } else {
      console.log('✅ Showcase CMS data inserted')
    }

    // 5. Store presentation data in CMS
    const { error: presentationError } = await supabase
      .from('cms_sections')
      .insert({
        section_key: 'presentationData',
        scope_type: 'product',
        scope_id: product.id,
        content: productData.presentation,
        revision: 1
      })

    if (presentationError) {
      console.error('❌ Error inserting presentation CMS:', presentationError)
    } else {
      console.log('✅ Presentation CMS data inserted')
    }

    console.log('🎉 EKL 15 migration completed successfully!')
    console.log('📊 Summary:')
    console.log('  - Product ID:', product.id)
    console.log('  - Slug:', product.slug)
    console.log('  - Specs:', allSpecs.length)
    console.log('  - Showcase sections:', productData.showcase.sections.length)
    console.log('  - Presentation hotspots:', productData.presentation.hotspots.length)

    return product

  } catch (error) {
    console.error('💥 EKL 15 migration failed:', error)
    throw error
  }
}

/**
 * Fetch EKL 15 data from Supabase (for testing)
 */
export async function fetchEKL15FromSupabase() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_media (*),
      product_specs (*)
    `)
    .eq('slug', 'ekl-15-2cyl')
    .single()

  if (error) {
    console.error('Error fetching EKL 15:', error)
    return null
  }

  // Also fetch CMS data
  const { data: showcaseData } = await supabase
    .from('cms_sections')
    .select('content')
    .eq('section_key', 'showcaseData')
    .eq('scope_type', 'product')
    .eq('scope_id', data.id)
    .single()

  const { data: presentationData } = await supabase
    .from('cms_sections')
    .select('content')
    .eq('section_key', 'presentationData')
    .eq('scope_type', 'product')
    .eq('scope_id', data.id)
    .single()

  return {
    product: data,
    showcase: showcaseData?.content,
    presentation: presentationData?.content
  }
}
