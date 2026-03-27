import { supabase } from '../supabase'
import { logService } from '../debug'

export type NotificationRow = {
  id: string
  recipient_id: string
  type: string
  title: string
  body: string
  is_read: boolean
  read_at: string | null
  action_url: string | null
  related_match_id: string | null
  related_property_id: string | null
  related_profile_id: string | null
  created_at: string
}

export async function getNotifications(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    logService('notifications', 'getNotifications', undefined, error)
    throw error
  }
  return data as NotificationRow[]
}

export async function getUnreadCount(userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('is_read', false)

  if (error) {
    logService('notifications', 'getUnreadCount', undefined, error)
    throw error
  }
  return count ?? 0
}

export async function markAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)

  if (error) {
    logService('notifications', 'markAsRead', undefined, error)
    throw error
  }
}

export async function markAllAsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('recipient_id', userId)
    .eq('is_read', false)

  if (error) {
    logService('notifications', 'markAllAsRead', undefined, error)
    throw error
  }
}

export function subscribeToNotifications(userId: string, callback: (notification: NotificationRow) => void) {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as NotificationRow)
      }
    )
    .subscribe()
}

export async function registerPushToken(userId: string, token: string, platform: 'ios' | 'android' | 'web') {
  const { error } = await supabase
    .from('push_tokens')
    .upsert(
      { user_id: userId, token, platform, is_active: true, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,token' }
    )

  if (error) {
    logService('notifications', 'registerPushToken', undefined, error)
    throw error
  }
}

export async function unregisterPushToken(userId: string, token: string) {
  const { error } = await supabase
    .from('push_tokens')
    .delete()
    .eq('user_id', userId)
    .eq('token', token)

  if (error) {
    logService('notifications', 'unregisterPushToken', undefined, error)
    throw error
  }
}

export async function createNotification(notification: {
  recipient_id: string
  type: string
  title: string
  body: string
  action_url?: string
  related_match_id?: string
  related_property_id?: string
  related_profile_id?: string
}) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      recipient_id: notification.recipient_id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      action_url: notification.action_url ?? null,
      related_match_id: notification.related_match_id ?? null,
      related_property_id: notification.related_property_id ?? null,
      related_profile_id: notification.related_profile_id ?? null,
    })

  if (error) {
    logService('notifications', 'createNotification', undefined, error)
  }
}
