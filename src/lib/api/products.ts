import { supabase } from '../supabase'
import type { Product, ProductMedia, ProductSpec } from '../supabase'
import { PRODUCTS } from '@/data/products'

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

  // Merge with static PRODUCTS for global availability (Selection page, Quote builder, etc.)
  const staticProducts = PRODUCTS
    .filter(p => !transformedData.find(db => db.slug === p.slug))
    .map(p => ({
      id: p.slug,
      slug: p.slug,
      name: p.name,
      model: p.name,
      kva: p.kva,
      engine_brand: p.name.toLowerCase().includes('escort') ? 'Escorts' : 'Baudouin',
      status: 'published' as const,
      type: 'silent' as const,
      product_media: p.thumbnail ? [{ 
        public_url: p.thumbnail, 
        url: p.thumbnail,
        kind: 'primary',
        id: `media-${p.slug}`,
        product_id: p.slug,
        storage_path: null,
        alt_text: p.name,
        mime_type: 'image/jpeg',
        display_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }] : [],
      product_specs: [
        { id: `spec-kva-${p.slug}`, product_id: p.slug, spec_label: 'Power Output', spec_value: `${p.kva} kVA`, display_order: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), label: 'Power Output', value: `${p.kva} kVA` },
        { id: `spec-engine-${p.slug}`, product_id: p.slug, spec_label: 'Engine', spec_value: p.name.toLowerCase().includes('escort') ? 'Escorts' : 'Baudouin', display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), label: 'Engine', value: p.name.toLowerCase().includes('escort') ? 'Escorts' : 'Baudouin' }
      ]
    }));

  const mergedData = [...transformedData, ...staticProducts];
  console.log('📊 Final merged count:', mergedData.length)

  return mergedData
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
/**
 * Create a new product with its media and specs
 */
export async function createProduct(
  product: Partial<Product>,
  media: { url: string; kind: 'primary' | 'gallery' }[],
  specs: { label: string; value: string }[]
) {
  // 1. Insert product
  const { data: newProduct, error: productError } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (productError) throw productError;

  // 2. Insert media
  if (media.length > 0) {
    const mediaToInsert = media.map((m, i) => ({
      product_id: newProduct.id,
      kind: m.kind,
      public_url: m.url,
      display_order: i
    }));

    const { error: mediaError } = await supabase
      .from('product_media')
      .insert(mediaToInsert);

    if (mediaError) console.error("Media insertion error:", mediaError);
  }

  // 3. Insert specs
  if (specs.length > 0) {
    const specsToInsert = specs.map((s, i) => ({
      product_id: newProduct.id,
      spec_label: s.label,
      spec_value: s.value,
      display_order: i
    }));

    const { error: specsError } = await supabase
      .from('product_specs')
      .insert(specsToInsert);

    if (specsError) console.error("Specs insertion error:", specsError);
  }

  return newProduct;
}
