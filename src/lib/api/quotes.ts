import { supabase } from '../supabase'
import type { Quote, QuoteItem } from '../supabase'

/**
 * Create a new quote in Supabase
 */
export async function createQuote(quoteData: {
  lead_id?: string
  created_by_user_id?: string
  quote_number?: string
  currency?: string
  total_amount: number
  payload: any
  expires_at?: string
}) {
  const { data, error } = await supabase
    .from('quotes')
    .insert({
      ...quoteData,
      status: 'draft',
      currency: quoteData.currency || 'INR',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Create quote items
 */
export async function createQuoteItems(quoteId: string, items: Array<{
  product_id: string | null
  quantity: number
  unit_price: number
  line_total: number
  product_snapshot: any
  display_order: number
}>) {
  const itemsWithQuoteId = items.map(item => ({
    ...item,
    quote_id: quoteId,
  }))

  const { data, error } = await supabase
    .from('quote_items')
    .insert(itemsWithQuoteId)
    .select()

  if (error) throw error
  return data
}

/**
 * Update quote status
 */
export async function updateQuoteStatus(quoteId: string, status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired') {
  const updates: any = { status, updated_at: new Date().toISOString() }
  
  if (status === 'sent') {
    updates.sent_at = new Date().toISOString()
  } else if (status === 'accepted') {
    updates.accepted_at = new Date().toISOString()
  } else if (status === 'rejected') {
    updates.rejected_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('quotes')
    .update(updates)
    .eq('id', quoteId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Fetch all quotes
 */
export async function fetchQuotes(filters?: {
  status?: string
  lead_id?: string
  created_by_user_id?: string
}) {
  let query = supabase
    .from('quotes')
    .select(`
      *,
      quote_items (*),
      leads (*)
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.lead_id) {
    query = query.eq('lead_id', filters.lead_id)
  }

  if (filters?.created_by_user_id) {
    query = query.eq('created_by_user_id', filters.created_by_user_id)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Fetch a single quote by ID
 */
export async function fetchQuoteById(quoteId: string) {
  const { data, error } = await supabase
    .from('quotes')
    .select(`
      *,
      quote_items (*),
      leads (*)
    `)
    .eq('id', quoteId)
    .single()

  if (error) throw error
  return data
}

/**
 * Generate next quote number
 */
export async function generateQuoteNumber(): Promise<string> {
  // Get the latest quote number
  const { data, error } = await supabase
    .from('quotes')
    .select('quote_number')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw error
  }

  // Extract number and increment
  if (data?.quote_number) {
    const match = data.quote_number.match(/Q-(\d+)/)
    if (match) {
      const nextNum = parseInt(match[1]) + 1
      return `Q-${nextNum.toString().padStart(6, '0')}`
    }
  }

  // Default starting number
  return 'Q-000001'
}
