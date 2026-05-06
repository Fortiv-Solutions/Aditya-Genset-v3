import { supabase } from './supabase'
import { SHOWCASE } from '@/data/products'

/**
 * Migration script to move hardcoded product data to Supabase
 * Run this once to populate the database with existing product data
 */
export async function migrateProductToSupabase() {
  try {
    console.log('Starting migration...')

    // 1. Insert main product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        slug: SHOWCASE.slug,
        model: 'ADG-62.5S',
        name: SHOWCASE.name,
        kva: SHOWCASE.kva,
        engine_brand: 'Baudouin',
        type: 'Silent',
        phase: 'Three',
        application: 'Prime',
        status: 'Active',
        tags: ['Best Seller', 'Featured'],
        thumbnail_url: SHOWCASE.thumbnail,
        hero_image_url: SHOWCASE.hero,
      })
      .select()
      .single()

    if (productError) {
      console.error('Error inserting product:', productError)
      return
    }

    console.log('✅ Product inserted:', product.id)

    // 2. Insert showcase sections
    for (const section of SHOWCASE.sections) {
      const { data: showcaseSection, error: sectionError } = await supabase
        .from('showcase_sections')
        .insert({
          product_id: product.id,
          section_id: section.id,
          section_number: section.number,
          title: section.title,
          tagline: section.tagline || null,
          description: null,
          image_url: section.image,
          alt_text: section.alt,
          order: parseInt(section.number),
        })
        .select()
        .single()

      if (sectionError) {
        console.error(`Error inserting section ${section.id}:`, sectionError)
        continue
      }

      console.log(`✅ Section inserted: ${section.id}`)

      // 3. Insert section specs
      for (let i = 0; i < section.specs.length; i++) {
        const spec = section.specs[i]
        const { error: specError } = await supabase
          .from('showcase_section_specs')
          .insert({
            section_id: showcaseSection.id,
            label: spec.label,
            value: spec.value,
            order: i,
          })

        if (specError) {
          console.error(`Error inserting spec for ${section.id}:`, specError)
        }
      }

      // 4. Insert section highlights (if exists)
      if (section.highlight) {
        for (let i = 0; i < section.highlight.length; i++) {
          const highlight = section.highlight[i]
          const { error: highlightError } = await supabase
            .from('showcase_section_highlights')
            .insert({
              section_id: showcaseSection.id,
              value: highlight.value,
              suffix: highlight.suffix || null,
              label: highlight.label,
              order: i,
            })

          if (highlightError) {
            console.error(`Error inserting highlight for ${section.id}:`, highlightError)
          }
        }
      }
    }

    // 5. Insert presentation hotspots
    for (let i = 0; i < SHOWCASE.hotspots.length; i++) {
      const hotspot = SHOWCASE.hotspots[i]
      const { data: presentationHotspot, error: hotspotError } = await supabase
        .from('presentation_hotspots')
        .insert({
          product_id: product.id,
          hotspot_id: hotspot.id,
          title: hotspot.title,
          description: hotspot.description,
          x_position: hotspot.x,
          y_position: hotspot.y,
          zoom: 1.0,
          offset_x: 0,
          offset_y: 0,
          sub_image_url: null,
          order: i,
        })
        .select()
        .single()

      if (hotspotError) {
        console.error(`Error inserting hotspot ${hotspot.id}:`, hotspotError)
        continue
      }

      console.log(`✅ Hotspot inserted: ${hotspot.id}`)

      // 6. Insert hotspot specs
      for (let j = 0; j < hotspot.specs.length; j++) {
        const spec = hotspot.specs[j]
        const { error: specError } = await supabase
          .from('presentation_hotspot_specs')
          .insert({
            hotspot_id: presentationHotspot.id,
            label: spec.label,
            value: spec.value,
            order: j,
          })

        if (specError) {
          console.error(`Error inserting hotspot spec for ${hotspot.id}:`, specError)
        }
      }
    }

    console.log('✅ Migration completed successfully!')
    return product

  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

/**
 * Fetch product data from Supabase
 */
export async function fetchProductFromSupabase(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      showcase_sections (
        *,
        showcase_section_specs (*),
        showcase_section_highlights (*)
      ),
      presentation_hotspots (
        *,
        presentation_hotspot_specs (*)
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data
}
