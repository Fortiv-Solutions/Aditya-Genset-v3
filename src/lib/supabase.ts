import { createClient } from '@supabase/supabase-js'

// Supabase configuration - ALWAYS use environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  throw new Error('Supabase credentials not configured. Please check your .env file.');
}

console.log('🔍 Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
  fromEnv: !!import.meta.env.VITE_SUPABASE_URL
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('VITE_SUPABASE_URL:', supabaseUrl)
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing')
  throw new Error('Missing Supabase credentials. Please check your .env file and restart the dev server.')
}

// Create Supabase client with real credentials
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// No demo mode - always use real database
export const isDemoMode = false

console.info('✅ Connected to Supabase:', supabaseUrl)

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
export type MessageDirection = 'inbound' | 'outbound'
export type MessageSender = 'customer' | 'agent' | 'system'

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

export interface QuoteItem {
  id: string
  quote_id: string
  product_id: string | null
  quantity: number
  unit_price: number | null
  line_total: number | null
  product_snapshot: any // JSONB
  display_order: number
  created_at: string
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

export interface LeadTimelineEvent {
  id: string
  lead_id: string
  action: string
  by_user_id: string | null
  created_at: string
  metadata: any // JSONB
}

export interface LeadSelectedProduct {
  id: string
  lead_id: string
  product_id: string
  selection_source: string
  selected_at: string
  context: any // JSONB
}

export interface LeadInsight {
  id: string
  lead_id: string
  insight_type: string
  title: string | null
  payload: any // JSONB
  source: string
  created_at: string
}

// Comparison Types
export interface ComparisonSession {
  id: string
  created_by_user_id: string | null
  session_token: string | null
  status: string
  settings: any // JSONB
  created_at: string
  updated_at: string
}

export interface ComparisonSessionProduct {
  id: string
  session_id: string
  product_id: string
  display_order: number
  added_at: string
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

// WhatsApp Types
export interface LeadWhatsAppThread {
  id: string
  from_phone: string
  to_phone: string | null
  lead_id: string | null
  thread_key: string | null
  created_at: string
  updated_at: string
}

export interface WhatsAppMessage {
  id: string
  thread_id: string
  lead_id: string | null
  message_direction: MessageDirection
  sender: MessageSender
  external_message_id: string | null
  external_contact_id: string | null
  message_text: string | null
  status: string | null
  received_at: string | null
  raw_payload: any // JSONB
  created_at: string
}

// AI Recommender Types
export interface AIRecommenderRequest {
  id: string
  created_by_user_id: string | null
  lead_id: string | null
  provider: string
  model: string | null
  status: string
  input_payload: any // JSONB
  created_at: string
  completed_at: string | null
}

export interface AIRecommenderOutput {
  request_id: string
  output_payload: any // JSONB
  created_at: string
}

export interface AIRecommenderProductScore {
  id: string
  request_id: string
  product_id: string | null
  score: number | null
  reason: string | null
  payload: any // JSONB
  created_at: string
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

// Settings Types
export interface SiteSettings {
  id: string
  company_name: string | null
  tagline: string | null
  website: string | null
  phone1: string | null
  phone2: string | null
  email: string | null
  admin_email: string | null
  whatsapp: string | null
  address: string | null
  linkedin: string | null
  facebook: string | null
  instagram: string | null
  youtube: string | null
  twitter: string | null
  gmaps_key: string | null
  created_at: string
  updated_at: string
}

export interface NotificationSettings {
  id: string
  new_lead: boolean
  lead_assigned: boolean
  quote_sent: boolean
  followup_due: boolean
  amc_renewal: boolean
  service_ticket: boolean
  weekly_report: boolean
  monthly_report: boolean
  created_at: string
  updated_at: string
}

export interface SecuritySettings {
  id: string
  two_factor: boolean
  ip_whitelist: boolean
  audit_log: boolean
  session_timeout_minutes: number
  login_attempts: number
  created_at: string
  updated_at: string
}

export interface EmailTemplate {
  id: string
  template_key: string
  name: string | null
  trigger_event: string | null
  audience: string | null
  template_subject: string | null
  template_body: string | null
  variables: any // JSONB
  created_at: string
  updated_at: string
}

export interface Integration {
  id: string
  integration_key: string
  status: string
  config: any // JSONB
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  actor_user_id: string | null
  action_type: string
  entity_type: string | null
  entity_id: string | null
  description: string | null
  metadata: any // JSONB
  created_at: string
}
