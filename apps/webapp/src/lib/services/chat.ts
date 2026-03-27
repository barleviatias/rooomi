import { supabase } from '../supabase'
import { logService } from '../debug'
import type { Match, Property, PropertyPhoto, Profile, Conversation, Message } from '@roomi/types'

export type ConversationWithDetails = Conversation & {
  updated_at?: string
  match?: Match & {
    property?: Property & { photos?: PropertyPhoto[] }
    seeker?: Profile
    host?: Profile
  }
}

export type MessageWithSender = Message & {
  metadata?: Record<string, unknown>
  is_deleted?: boolean
  deleted_at?: string | null
  sender?: Profile
}

export async function getConversations(userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      match:matches(
        *,
        property:properties(
          *,
          photos:property_photos(*)
        ),
        seeker:profiles!matches_seeker_id_fkey(id, full_name, display_name, gender, avatar_url, bio, is_seeker, is_host, instagram_handle, preferred_city, is_verified, profile_completion_pct, last_active_at, created_at, updated_at),
        host:profiles!matches_host_id_fkey(id, full_name, display_name, gender, avatar_url, bio, is_seeker, is_host, instagram_handle, preferred_city, is_verified, profile_completion_pct, last_active_at, created_at, updated_at)
      )
    `)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (error) {
    logService('chat', 'getConversations', undefined, error)
    throw error
  }

  const allConversations = data as ConversationWithDetails[]
  const filtered = allConversations.filter(
    c => c.match?.seeker_id === userId || c.match?.host_id === userId
  )
  logService('chat', 'getConversations', filtered)
  return filtered
}

export async function getConversationById(conversationId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      match:matches(
        *,
        property:properties(
          *,
          photos:property_photos(*)
        ),
        seeker:profiles!matches_seeker_id_fkey(id, full_name, display_name, gender, avatar_url, bio, is_seeker, is_host, instagram_handle, preferred_city, is_verified, profile_completion_pct, last_active_at, created_at, updated_at),
        host:profiles!matches_host_id_fkey(id, full_name, display_name, gender, avatar_url, bio, is_seeker, is_host, instagram_handle, preferred_city, is_verified, profile_completion_pct, last_active_at, created_at, updated_at)
      )
    `)
    .eq('id', conversationId)
    .single()

  if (error) {
    logService('chat', 'getConversationById', undefined, error)
    throw error
  }
  logService('chat', 'getConversationById', data)
  return data as ConversationWithDetails
}

export async function getConversationByMatchId(matchId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      match:matches(
        *,
        property:properties(
          *,
          photos:property_photos(*)
        ),
        seeker:profiles!matches_seeker_id_fkey(id, full_name, display_name, gender, avatar_url, bio, is_seeker, is_host, instagram_handle, preferred_city, is_verified, profile_completion_pct, last_active_at, created_at, updated_at),
        host:profiles!matches_host_id_fkey(id, full_name, display_name, gender, avatar_url, bio, is_seeker, is_host, instagram_handle, preferred_city, is_verified, profile_completion_pct, last_active_at, created_at, updated_at)
      )
    `)
    .eq('match_id', matchId)
    .single()

  if (error) throw error
  return data as ConversationWithDetails
}

export async function getMessages(conversationId: string, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles(id, full_name, display_name, avatar_url)
    `)
    .eq('conversation_id', conversationId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) {
    logService('chat', 'getMessages', undefined, error)
    throw error
  }
  logService('chat', 'getMessages', data)
  return data as MessageWithSender[]
}

export async function sendMessage(message: {
  conversation_id: string
  sender_id: string
  content: string
  message_type: string
}) {
  logService('chat', 'sendMessage (input)', message)
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select(`
      *,
      sender:profiles(id, full_name, display_name, avatar_url)
    `)
    .single()

  if (error) {
    logService('chat', 'sendMessage', undefined, error)
    throw error
  }
  logService('chat', 'sendMessage', data)
  return data as MessageWithSender
}

export async function markMessagesAsRead(conversationId: string, userId: string) {
  const { error } = await supabase
    .from('messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('is_read', false)

  if (error) throw error

  const { data: conversation } = await supabase
    .from('conversations')
    .select('match:matches(seeker_id, host_id)')
    .eq('id', conversationId)
    .single()

  if (conversation?.match) {
    const matchArr = conversation.match as unknown as Array<{ seeker_id: string; host_id: string }>
    const matchData = Array.isArray(matchArr) ? matchArr[0] : matchArr
    if (!matchData) return
    const isSeeker = matchData.seeker_id === userId
    const updateField = isSeeker ? 'seeker_unread_count' : 'host_unread_count'

    await supabase
      .from('conversations')
      .update({ [updateField]: 0 })
      .eq('id', conversationId)
  }
}

export async function deleteMessage(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', messageId)

  if (error) throw error
}

export async function getOrCreateConversation(matchId: string): Promise<ConversationWithDetails> {
  const { data: existing } = await supabase
    .from('conversations')
    .select(`
      *,
      match:matches(
        *,
        property:properties(
          *,
          photos:property_photos(*)
        ),
        seeker:profiles!matches_seeker_id_fkey(id, full_name, display_name, gender, avatar_url, bio, is_seeker, is_host, instagram_handle, preferred_city, is_verified, profile_completion_pct, last_active_at, created_at, updated_at),
        host:profiles!matches_host_id_fkey(id, full_name, display_name, gender, avatar_url, bio, is_seeker, is_host, instagram_handle, preferred_city, is_verified, profile_completion_pct, last_active_at, created_at, updated_at)
      )
    `)
    .eq('match_id', matchId)
    .maybeSingle()

  if (existing) return existing as ConversationWithDetails

  const { data: created, error } = await supabase
    .from('conversations')
    .insert({ match_id: matchId })
    .select(`
      *,
      match:matches(
        *,
        property:properties(
          *,
          photos:property_photos(*)
        ),
        seeker:profiles!matches_seeker_id_fkey(id, full_name, display_name, gender, avatar_url, bio, is_seeker, is_host, instagram_handle, preferred_city, is_verified, profile_completion_pct, last_active_at, created_at, updated_at),
        host:profiles!matches_host_id_fkey(id, full_name, display_name, gender, avatar_url, bio, is_seeker, is_host, instagram_handle, preferred_city, is_verified, profile_completion_pct, last_active_at, created_at, updated_at)
      )
    `)
    .single()

  if (error) {
    logService('chat', 'getOrCreateConversation', undefined, error)
    throw error
  }
  return created as ConversationWithDetails
}

export function subscribeToMessages(conversationId: string, callback: (message: MessageWithSender) => void) {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        callback(payload.new as MessageWithSender)
      }
    )
    .subscribe()
}

export function subscribeToConversationUpdates(userId: string, callback: (conversation: ConversationWithDetails) => void) {
  return supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
      },
      (payload) => {
        callback(payload.new as ConversationWithDetails)
      }
    )
    .subscribe()
}
