import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
      }
      product_specs: {
        Row: ProductSpec
        Insert: Omit<ProductSpec, 'id'>
        Update: Partial<Omit<ProductSpec, 'id'>>
      }
      product_images: {
        Row: ProductImage
        Insert: Omit<ProductImage, 'id'>
        Update: Partial<Omit<ProductImage, 'id'>>
      }
      showcase_sections: {
        Row: ShowcaseSection
        Insert: Omit<ShowcaseSection, 'id'>
        Update: Partial<Omit<ShowcaseSection, 'id'>>
      }
      showcase_section_specs: {
        Row: ShowcaseSectionSpec
        Insert: Omit<ShowcaseSectionSpec, 'id'>
        Update: Partial<Omit<ShowcaseSectionSpec, 'id'>>
      }
      presentation_hotspots: {
        Row: PresentationHotspot
        Insert: Omit<PresentationHotspot, 'id'>
        Update: Partial<Omit<PresentationHotspot, 'id'>>
      }
      presentation_hotspot_specs: {
        Row: PresentationHotspotSpec
        Insert: Omit<PresentationHotspotSpec, 'id'>
        Update: Partial<Omit<PresentationHotspotSpec, 'id'>>
      }
    }
  }
}

// Type definitions
export interface Product {
  id: string
  slug: string
  model: string
  name: string
  kva: number
  engine_brand: 'Baudouin' | 'Escorts' | 'Kubota'
  type: 'Silent' | 'Open'
  phase: 'Single' | 'Three'
  application: 'Prime' | 'Standby' | 'Continuous'
  status: 'Active' | 'Discontinued' | 'Coming Soon'
  tags: string[]
  thumbnail_url: string
  hero_image_url: string
  created_at: string
  updated_at: string
}

export interface ProductSpec {
  id: string
  product_id: string
  category: string
  spec_key: string
  spec_value: string
  order: number
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  image_type: 'main' | 'gallery' | 'detail' | 'section'
  alt_text: string
  order: number
}

export interface ShowcaseSection {
  id: string
  product_id: string
  section_id: string
  section_number: string
  title: string
  tagline: string | null
  description: string | null
  image_url: string
  alt_text: string
  order: number
}

export interface ShowcaseSectionSpec {
  id: string
  section_id: string
  label: string
  value: string
  order: number
}

export interface ShowcaseSectionHighlight {
  id: string
  section_id: string
  value: number
  suffix: string | null
  label: string
  order: number
}

export interface PresentationHotspot {
  id: string
  product_id: string
  hotspot_id: string
  title: string
  description: string
  x_position: number
  y_position: number
  zoom: number
  offset_x: number
  offset_y: number
  sub_image_url: string | null
  order: number
}

export interface PresentationHotspotSpec {
  id: string
  hotspot_id: string
  label: string
  value: string
  order: number
}
