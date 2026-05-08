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

  // Transform the data to match the expected format
  const transformedData = (data || []).map(product => ({
    ...product,
    product_media: product.product_media?.map((media: any) => ({
      ...media,
      url: media.public_url,
    })),
    product_specs: product.product_specs?.map((spec: any) => ({
      ...spec,
      label: spec.spec_label,
      value: spec.spec_value,
    })),
  }))

  // Merge with static PRODUCTS
  const staticProducts = PRODUCTS.map(p => ({
    id: p.slug,
    slug: p.slug,
    name: p.name,
    kva: p.kva,
    engine_brand: (p.name.toLowerCase().includes('escort') || p.name.toLowerCase().includes('ekl')) ? 'Escorts' : 'Baudouin',
    status: 'published' as const,
    product_media: p.thumbnail ? [{ public_url: p.thumbnail, kind: 'primary' }] : [],
    product_specs: [
      { spec_label: 'Power Output', spec_value: `${p.kva} kVA` },
      ...Object.entries(p.specs || {}).map(([label, value]) => ({
        spec_label: label,
        spec_value: value,
      }))
    ]
  }));

  const allMerged = [...transformedData, ...staticProducts];

  // 1. Initial filter to remove unwanted models
  const filtered = allMerged.filter(p => {
    // Exclude Baudouin 20kVA as requested
    const isBaudouin20 = Number(p.kva) === 20 && String(p.name).toLowerCase().includes('baudouin');
    if (isBaudouin20) return false;

    // Escorts 20kVA Logic
    const isEscorts20 = Number(p.kva) === 20 && 
      (String(p.engine_brand || "").toLowerCase().includes('escort') || 
       String(p.name || "").toLowerCase().includes('ekl'));

    if (isEscorts20) {
      const appSpec = p.product_specs?.find((s: any) => 
        String(s.label || s.spec_label || "").toLowerCase().includes('application')
      );
      const appValue = String(appSpec?.value || appSpec?.spec_value || "");
      
      // Specifically EXCLUDE the "Prime Power" version
      if (appValue === "Prime Power") return false;
      
      // Keep if it has a decent amount of data
      if (p.product_specs && p.product_specs.length >= 5) return true;
      
      // Otherwise, only keep if it's the static fallback (which has exactly 5 specs usually)
      return p.id === p.slug; // Static ones have id === slug
    }

    return true;
  });

  // 2. Final deduplication - Keep the version with the MOST specs
  const productMap = new Map<string, any>();
  filtered.forEach(p => {
    const key = String(p.name).toLowerCase().replace(/[^a-z0-9]/g, '');
    const existing = productMap.get(key);
    
    if (!existing || (p.product_specs?.length || 0) > (existing.product_specs?.length || 0)) {
      productMap.set(key, p);
    }
  });

  const finalResult = Array.from(productMap.values());
  console.log('📊 Final products for comparison:', finalResult.length);
  return finalResult;
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
