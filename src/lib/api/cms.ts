import { supabase } from '../supabase'
import type { CMSSection } from '../supabase'

/**
 * Fetch CMS section content by key
 * This replaces hardcoded showcase/presentation data
 */
export async function fetchCMSSection(sectionKey: string, scopeType: 'global' | 'product' | 'category' | 'page' = 'global', scopeId?: string) {
  let query = supabase
    .from('cms_sections')
    .select('*')
    .eq('section_key', sectionKey)
    .eq('scope_type', scopeType)

  if (scopeId) {
    query = query.eq('scope_id', scopeId)
  } else {
    query = query.is('scope_id', null)
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    console.error(`Error fetching CMS section ${sectionKey}:`, error)
    return null
  }

  return data
}

/**
 * Update CMS section content (Admin only)
 */
export async function updateCMSSection(
  sectionKey: string,
  content: any,
  scopeType: 'global' | 'product' | 'category' | 'page' = 'global',
  scopeId?: string
) {
  let existingQuery = supabase
    .from('cms_sections')
    .select('id, revision')
    .eq('section_key', sectionKey)
    .eq('scope_type', scopeType)

  if (scopeId) {
    existingQuery = existingQuery.eq("scope_id", scopeId)
  } else {
    existingQuery = existingQuery.is("scope_id", null)
  }

  const { data: existing } = await existingQuery.maybeSingle()

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('cms_sections')
      .update({
        content,
        revision: existing.revision + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating CMS section:', error)
      return null
    }

    return data
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('cms_sections')
      .insert({
        section_key: sectionKey,
        scope_type: scopeType,
        scope_id: scopeId || null,
        content,
        revision: 1
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating CMS section:', error)
      return null
    }

    return data
  }
}

/**
 * Fetch showcase data for a product
 * This is what your ProductDetail page will use
 */
export async function fetchProductShowcase(productSlug: string) {
  // First get the product with its media
  const { data: product } = await supabase
    .from('products')
    .select(`
      id, slug, name, model, kva,
      product_media (*)
    `)
    .eq('slug', productSlug)
    .eq('status', 'published')
    .single()

  if (!product) return null

  // Then get the CMS section for this product's showcase
  const showcase = await fetchCMSSection('showcaseData', 'product', product.id)

  return {
    product,
    showcase: showcase?.content || null
  }
}

/**
 * Fetch presentation hotspots for guided presentation
 */
export async function fetchPresentationData(productSlug: string) {
  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('slug', productSlug)
    .single()

  if (!product) return null

  const presentation = await fetchCMSSection('presentationData', 'product', product.id)

  return presentation?.content || null
}
