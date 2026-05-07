import { supabase } from '../supabase'
import type { Product, ProductMedia, ProductSpec } from '../supabase'

/**
 * Fetch all published products with their media and specs
 */
export async function fetchPublishedProducts() {
  console.log('🔍 Fetching products from Supabase...')
  
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
    console.error('❌ Error fetching products:', error)
    throw error
  }

  console.log('✅ Raw data from Supabase:', data)
  console.log(`📊 Found ${data?.length || 0} products`)

  // Transform the data to match the expected format
  const transformedData = (data || []).map(product => ({
    ...product,
    product_media: product.product_media?.map((media: any) => ({
      ...media,
      url: media.public_url, // Map public_url to url for compatibility
    })),
    product_specs: product.product_specs?.map((spec: any) => ({
      ...spec,
      label: spec.spec_label, // Map spec_label to label
      value: spec.spec_value, // Map spec_value to value
    })),
  }))

  console.log('✅ Transformed data:', transformedData)

  return transformedData
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

  // Transform the data
  if (data) {
    return {
      ...data,
      product_media: data.product_media?.map((media: any) => ({
        ...media,
        url: media.public_url,
      })),
      product_specs: data.product_specs?.map((spec: any) => ({
        ...spec,
        label: spec.spec_label,
        value: spec.spec_value,
      })),
    }
  }

  return null
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
    throw error
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
