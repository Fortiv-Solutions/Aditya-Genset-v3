import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Check if we have valid Supabase credentials
const hasValidCredentials = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('dummy') && 
  !supabaseAnonKey.includes('dummy') &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder')

// Create Supabase client (will use demo mode if credentials are invalid)
export const supabase = hasValidCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

export const isDemoMode = !hasValidCredentials

if (isDemoMode) {
  console.info('🎨 Running in DEMO MODE - Using local demo data instead of Supabase')
}

// =====================================================
// TYPE DEFINITIONS (matching your production schema)
// =====================================================

// Enums
export type AppRole = 'Super Admin' | 'Admin' | 'Sales Manager' | 'Sales Executive' | 'Media Editor'
export type ProductStatus = 'published' | 'draft' | 'archived'
export type ProductType = 'silent' | 'open'
export type ProductStock = 'in_stock' | 'on_order' | 'discontinued'
export type LeadStage = 'new' | 'contacted' | 'qualified' | 'site_assessment' | 'quotation_sent' | 'negotiation' | 'won' | 'lost'
export type LeadSource = 'website_form' | 'whatsapp' | 'phone' | 'referral' | 'indiamart' | 'trade_show' | 'dealer'
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
export type PresentationStatus = 'active' | 'completed' | 'abandoned'
export type ScopeType = 'global' | 'product' | 'category' | 'page'

// Product Types
export interface Product {
  id: string
  category_id: string | null
  status: ProductStatus
  type: ProductType
  name: string
  model: string
  slug: string
  kva: number
  engine_brand: string
  cpcb: string
  price: number | null
  price_on_request: boolean
  moq: number
  lead_time_days: number
  stock: ProductStock
  short_desc: string | null
  full_desc: string | null
  tags: string[]
  seo_title: string | null
  meta_desc: string | null
  inquiries: number
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface ProductCategory {
  id: string
  parent_id: string | null
  slug: string
  name: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductMedia {
  id: string
  product_id: string
  kind: string
  storage_path: string | null
  public_url: string | null
  alt_text: string | null
  mime_type: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface ProductSpec {
  id: string
  product_id: string
  spec_label: string
  spec_value: string
  display_order: number
  created_at: string
  updated_at: string
}

// CMS Types
export interface CMSSection {
  id: string
  section_key: string
  scope_type: ScopeType
  scope_id: string | null
  content: any // JSONB
  revision: number
  updated_by_user_id: string | null
  created_at: string
  updated_at: string
}

// Presentation Types
export interface PresentationSession {
  id: string
  created_by_user_id: string | null
  share_token: string | null
  product_id: string | null
  cms_section_key: string
  status: PresentationStatus
  current_chapter_index: number
  current_hotspot_id: string | null
  started_at: string
  last_activity_at: string
  ended_at: string | null
}

export interface PresentationSessionEvent {
  id: string
  session_id: string
  event_type: string
  created_at: string
  payload: any // JSONB
}

// Lead Types
export interface Lead {
  id: string
  customer_name: string
  company: string
  designation: string | null
  phone: string | null
  email: string | null
  city: string | null
  state: string | null
  kva_required: string | null
  application: string | null
  stage: LeadStage
  source: LeadSource
  assigned_to_user_id: string | null
  assigned_to_name: string | null
  score: number
  created_by_user_id: string | null
  created_at: string
  last_activity_at: string | null
  updated_at: string
}

// Quote Types
export interface Quote {
  id: string
  quote_number: string | null
  lead_id: string | null
  created_by_user_id: string | null
  status: QuoteStatus
  currency: string
  total_amount: number
  payload: any // JSONB
  sent_at: string | null
  accepted_at: string | null
  rejected_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

// Profile Types
export interface Profile {
  user_id: string
  role: AppRole
  full_name: string | null
  phone: string | null
  created_at: string
  updated_at: string
}
