import { supabase, isDemoMode } from '../supabase'
import type { Product, ProductMedia, ProductSpec } from '../supabase'
import { DEMO_PRODUCTS } from '@/data/demoProducts'

/**
 * Fetch all published products with their media and specs
 */
export async function fetchPublishedProducts() {
  // Use demo data if in demo mode
  if (isDemoMode) {
    console.info('📦 Loading demo products')
    return DEMO_PRODUCTS
  }

  try {
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
      console.warn('Supabase error, using demo data:', error)
      return DEMO_PRODUCTS
    }

    return data || DEMO_PRODUCTS
  } catch (err) {
    console.warn('Failed to connect to Supabase, using demo data:', err)
    return DEMO_PRODUCTS
  }
}

/**
 * Fetch a single product by slug with all related data
 */
export async function fetchProductBySlug(slug: string) {
  // Use demo data if in demo mode
  if (isDemoMode) {
    return DEMO_PRODUCTS.find(p => p.slug === slug) || null
  }

  try {
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
      console.warn('Supabase error, checking demo data:', error)
      return DEMO_PRODUCTS.find(p => p.slug === slug) || null
    }

    return data
  } catch (err) {
    console.warn('Failed to connect to Supabase, checking demo data:', err)
    return DEMO_PRODUCTS.find(p => p.slug === slug) || null
  }
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
  // Use demo data if in demo mode
  if (isDemoMode) {
    return filterDemoProducts(filters)
  }

  try {
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
      console.warn('Supabase error, using filtered demo data:', error)
      return filterDemoProducts(filters)
    }

    return data || filterDemoProducts(filters)
  } catch (err) {
    console.warn('Failed to connect to Supabase, using filtered demo data:', err)
    return filterDemoProducts(filters)
  }
}

function filterDemoProducts(filters: {
  engineBrand?: string
  kvaMin?: number
  kvaMax?: number
  type?: string
  search?: string
}) {
  let filtered = [...DEMO_PRODUCTS]

  if (filters.engineBrand && filters.engineBrand !== 'All') {
    filtered = filtered.filter(p => p.engine_brand === filters.engineBrand)
  }

  if (filters.kvaMin !== undefined) {
    filtered = filtered.filter(p => p.kva >= filters.kvaMin!)
  }

  if (filters.kvaMax !== undefined) {
    filtered = filtered.filter(p => p.kva <= filters.kvaMax!)
  }

  if (filters.type && filters.type !== 'All') {
    filtered = filtered.filter(p => p.type === filters.type)
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchLower) || 
      p.model.toLowerCase().includes(searchLower)
    )
  }

  return filtered.sort((a, b) => a.kva - b.kva)
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
