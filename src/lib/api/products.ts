import { supabase } from '../supabase'
import type { Product, ProductMedia, ProductSpec } from '../supabase'

/**
 * Fetch all published products with their media and specs
 */
export async function fetchPublishedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_media (*),
      product_specs (*)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data || []
}

/**
 * Fetch a single product by slug with all related data
 */
export async function fetchProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_media (*),
      product_specs (*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data
}

/**
 * Fetch products with filters (for DG Sets category page)
 */
export async function fetchProductsWithFilters(filters: {
  engineBrand?: string
  kvaMin?: number
  kvaMax?: number
  type?: string
  search?: string
}) {
  let query = supabase
    .from('products')
    .select(`
      *,
      product_media!inner(*)
    `)
    .eq('status', 'published')
    .eq('product_media.kind', 'primary')

  // Apply filters
  if (filters.engineBrand && filters.engineBrand !== 'All') {
    query = query.eq('engine_brand', filters.engineBrand)
  }

  if (filters.kvaMin !== undefined) {
    query = query.gte('kva', filters.kvaMin)
  }

  if (filters.kvaMax !== undefined) {
    query = query.lte('kva', filters.kvaMax)
  }

  if (filters.type && filters.type !== 'All') {
    query = query.eq('type', filters.type)
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,model.ilike.%${filters.search}%`)
  }

  query = query.order('kva', { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching filtered products:', error)
    return []
  }

  return data || []
}

/**
 * Increment product inquiry count
 */
export async function incrementProductInquiries(productId: string) {
  const { error } = await supabase.rpc('increment_product_inquiries', {
    product_id: productId
  })

  if (error) {
    console.error('Error incrementing inquiries:', error)
  }
}
