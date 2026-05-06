import { supabase } from '../supabase'
import type { PresentationSession, PresentationSessionEvent } from '../supabase'

/**
 * Create a new presentation session
 */
export async function createPresentationSession(
  productId: string,
  cmsSectionKey: string,
  userId?: string
) {
  const { data, error } = await supabase
    .from('presentation_sessions')
    .insert({
      created_by_user_id: userId || null,
      product_id: productId,
      cms_section_key: cmsSectionKey,
      status: 'active',
      current_chapter_index: 0,
      started_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating presentation session:', error)
    return null
  }

  return data
}

/**
 * Update presentation session progress
 */
export async function updatePresentationProgress(
  sessionId: string,
  chapterIndex: number,
  hotspotId?: string
) {
  const { error } = await supabase
    .from('presentation_sessions')
    .update({
      current_chapter_index: chapterIndex,
      current_hotspot_id: hotspotId || null,
      last_activity_at: new Date().toISOString()
    })
    .eq('id', sessionId)

  if (error) {
    console.error('Error updating presentation progress:', error)
  }
}

/**
 * Log presentation event (for analytics)
 */
export async function logPresentationEvent(
  sessionId: string,
  eventType: string,
  payload: any = {}
) {
  const { error } = await supabase
    .from('presentation_session_events')
    .insert({
      session_id: sessionId,
      event_type: eventType,
      payload,
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error logging presentation event:', error)
  }
}

/**
 * End presentation session
 */
export async function endPresentationSession(sessionId: string) {
  const { error } = await supabase
    .from('presentation_sessions')
    .update({
      status: 'completed',
      ended_at: new Date().toISOString()
    })
    .eq('id', sessionId)

  if (error) {
    console.error('Error ending presentation session:', error)
  }
}
