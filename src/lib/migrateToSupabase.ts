import { supabase } from './supabase'
import { SHOWCASE } from '@/data/products'

/**
 * Migration script to move hardcoded product data to Supabase
 * Run this once to populate the database with existing product data
 * 
 * UPDATED: Works with your production schema
 */
export async function migrateProductToSupabase() {
  try {
    console.log('🚀 Starting migration to production schema...')

    // 1. Insert main product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        slug: SHOWCASE.slug,
        model: 'ADG-62.5S',
        name: SHOWCASE.name,
        kva: SHOWCASE.kva,
        engine_brand: 'Baudouin',
        type: 'silent',
        cpcb: 'iv-plus',
        status: 'published',
        price_on_request: true,
        moq: 1,
        lead_time_days: 21,
        stock: 'in_stock',
        short_desc: '62.5 kVA silent diesel generator set, CPCB IV+ compliant',
        tags: ['Best Seller', 'Featured', 'Silent'],
        published_at: new Date().toISOString()
      })
      .select()
      .single()

    if (productError) {
      console.error('❌ Error inserting product:', productError)
      return
    }

    console.log('✅ Product inserted:', product.id)

    // 2. Insert primary product image
    const { error: mediaError } = await supabase
      .from('product_media')
      .insert({
        product_id: product.id,
        kind: 'primary',
        public_url: SHOWCASE.hero,
        alt_text: `${SHOWCASE.name} - Main Image`,
        display_order: 0
      })

    if (mediaError) {
      console.error('❌ Error inserting product media:', mediaError)
    } else {
      console.log('✅ Product media inserted')
    }

    // 3. Insert product specs from showcase sections
    const allSpecs: Array<{ label: string; value: string }> = []
    SHOWCASE.sections.forEach(section => {
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
    const showcaseContent = {
      sections: SHOWCASE.sections.map(section => ({
        id: section.id,
        number: section.number,
        title: section.title,
        tagline: section.tagline || null,
        image: section.image,
        alt: section.alt,
        specs: section.specs,
        highlight: section.highlight || null
      }))
    }

    const { error: cmsError } = await supabase
      .from('cms_sections')
      .insert({
        section_key: 'showcaseData',
        scope_type: 'product',
        scope_id: product.id,
        content: showcaseContent,
        revision: 1
      })

    if (cmsError) {
      console.error('❌ Error inserting CMS showcase data:', cmsError)
    } else {
      console.log('✅ CMS showcase data inserted')
    }

    // 5. Store presentation hotspots in CMS
    const presentationContent = {
      hotspots: SHOWCASE.hotspots.map(hotspot => ({
        id: hotspot.id,
        x: hotspot.x,
        y: hotspot.y,
        title: hotspot.title,
        description: hotspot.description,
        specs: hotspot.specs
      }))
    }

    const { error: presentationError } = await supabase
      .from('cms_sections')
      .insert({
        section_key: 'presentationData',
        scope_type: 'product',
        scope_id: product.id,
        content: presentationContent,
        revision: 1
      })

    if (presentationError) {
      console.error('❌ Error inserting CMS presentation data:', presentationError)
    } else {
      console.log('✅ CMS presentation data inserted')
    }

    console.log('🎉 Migration completed successfully!')
    console.log('📊 Summary:')
    console.log('  - 1 product')
    console.log('  - 1 product image')
    console.log(`  - ${allSpecs.length} product specs`)
    console.log('  - 1 showcase CMS section')
    console.log('  - 1 presentation CMS section')

    return product

  } catch (error) {
    console.error('💥 Migration failed:', error)
    throw error
  }
}

/**
 * Fetch product data from Supabase (for testing)
 */
export async function fetchProductFromSupabase(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_media (*),
      product_specs (*)
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data
}

/**
 * Fetch showcase data from CMS
 */
export async function fetchShowcaseFromSupabase(productId: string) {
  const { data, error } = await supabase
    .from('cms_sections')
    .select('content')
    .eq('section_key', 'showcaseData')
    .eq('scope_type', 'product')
    .eq('scope_id', productId)
    .single()

  if (error) {
    console.error('Error fetching showcase:', error)
    return null
  }

  return data?.content
}

