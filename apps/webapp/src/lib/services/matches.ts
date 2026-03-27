import { supabase } from '../supabase'
import { logService } from '../debug'
import { createNotification } from './notifications'
import type { Match, Property, PropertyPhoto, Profile, ProfileLifestyle, Conversation } from '@roomi/types'

export type MatchWithDetails = Match & {
  property?: Property & { photos?: PropertyPhoto[] }
  seeker?: Profile & { lifestyle?: ProfileLifestyle }
  host?: Profile
  conversation?: Conversation
}

export async function createInteraction(actorId: string, propertyId: string, action: 'like' | 'pass' | 'super_like') {
  logService('matches', 'createInteraction', { actorId, propertyId, action })

  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) {
    const err = new Error('No active Supabase session — cannot create interaction')
    logService('matches', 'createInteraction', undefined, err)
    throw err
  }

  const { data: existing } = await supabase
    .from('interactions')
    .select('id')
    .eq('actor_id', actorId)
    .eq('property_id', propertyId)
    .maybeSingle()

  if (existing) {
    logService('matches', 'createInteraction — duplicate skipped', { actorId, propertyId })
    return existing
  }

  const { data, error } = await supabase
    .from('interactions')
    .insert({
      actor_id: actorId,
      property_id: propertyId,
      action,
    })
    .select()
    .single()

  if (error) {
    logService('matches', 'createInteraction', undefined, error)
    throw error
  }
  logService('matches', 'createInteraction OK', data)
  return data
}

export async function likeProperty(seekerId: string, propertyId: string, hostId: string) {
  logService('matches', 'likeProperty (input)', { seekerId, propertyId, hostId })
  const [, { data: existingMatch }] = await Promise.all([
    createInteraction(seekerId, propertyId, 'like'),
    supabase
      .from('matches')
      .select('*')
      .eq('seeker_id', seekerId)
      .eq('property_id', propertyId)
      .maybeSingle(),
  ])

  if (existingMatch) {
    logService('matches', 'likeProperty — match already exists', existingMatch)
    return existingMatch
  }

  const { data, error } = await supabase
    .from('matches')
    .insert({
      seeker_id: seekerId,
      property_id: propertyId,
      host_id: hostId,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    logService('matches', 'likeProperty', undefined, error)
    throw error
  }

  logService('matches', 'likeProperty', data)

  await createNotification({
    recipient_id: hostId,
    type: 'new_like',
    title: 'New like!',
    body: 'Someone liked your property',
    action_url: '/matches',
    related_match_id: data.id,
    related_property_id: data.property_id,
    related_profile_id: seekerId,
  })

  return data
}

export async function passProperty(actorId: string, propertyId: string) {
  return createInteraction(actorId, propertyId, 'pass')
}

export async function getSeekerMatches(seekerId: string, status?: string) {
  let query = supabase
    .from('matches')
    .select(`
      *,
      property:properties(
        *,
        photos:property_photos(*)
      ),
      host:profiles!matches_host_id_fkey(id, full_name, display_name, gender, avatar_url, bio, is_seeker, is_host, instagram_handle, preferred_city, is_verified, profile_completion_pct, last_active_at, created_at, updated_at),
      conversation:conversations(*)
    `)
    .eq('seeker_id', seekerId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    logService('matches', `getSeekerMatches(${status || 'all'})`, undefined, error)
    throw error
  }
  logService('matches', `getSeekerMatches(${status || 'all'})`, data)
  return data as MatchWithDetails[]
}

export async function getHostMatches(hostId: string, status?: string) {
  let query = supabase
    .from('matches')
    .select(`
      *,
      property:properties(
        *,
        photos:property_photos(*)
      ),
      seeker:profiles!matches_seeker_id_fkey(
        id, full_name, display_name, gender, avatar_url, bio, is_seeker, is_host, instagram_handle, preferred_city, is_verified, profile_completion_pct, last_active_at, created_at, updated_at,
        lifestyle:profile_lifestyle(*)
      ),
      conversation:conversations(*)
    `)
    .eq('host_id', hostId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    logService('matches', `getHostMatches(${status || 'all'})`, undefined, error)
    throw error
  }
  logService('matches', `getHostMatches(${status || 'all'})`, data)
  return data as MatchWithDetails[]
}

export async function getPendingLikesForProperty(propertyId: string) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      seeker:profiles!matches_seeker_id_fkey(
        *,
        lifestyle:profile_lifestyle(*)
      )
    `)
    .eq('property_id', propertyId)
    .eq('status', 'pending')
    .order('seeker_liked_at', { ascending: false })

  if (error) throw error
  return data
}

export async function acceptMatch(matchId: string) {
  logService('matches', 'acceptMatch', { matchId })

  const { data, error } = await supabase
    .from('matches')
    .update({
      status: 'matched',
      host_responded_at: new Date().toISOString(),
    })
    .eq('id', matchId)
    .select()
    .single()

  if (error) {
    logService('matches', 'acceptMatch', undefined, error)
    throw error
  }

  logService('matches', 'acceptMatch OK', data)

  createNotification({
    recipient_id: data.seeker_id,
    type: 'new_match',
    title: 'It\'s a match!',
    body: 'Your request was accepted! Start chatting now.',
    action_url: '/matches',
    related_match_id: matchId,
    related_property_id: data.property_id,
    related_profile_id: data.host_id,
  }).catch((err) => {
    logService('matches', 'acceptMatch notification failed (non-blocking)', undefined, err)
  })

  return data
}

export async function rejectMatch(matchId: string) {
  const { data, error } = await supabase
    .from('matches')
    .update({
      status: 'rejected',
      host_responded_at: new Date().toISOString(),
    })
    .eq('id', matchId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function unmatch(matchId: string, unmatchedBy: string) {
  const { data, error } = await supabase
    .from('matches')
    .update({
      status: 'unmatched',
      unmatched_at: new Date().toISOString(),
      unmatched_by: unmatchedBy,
    })
    .eq('id', matchId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getScoredPendingLikes(propertyId: string) {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token

  if (!token) {
    logService('matches', 'getScoredPendingLikes — no session')
    return []
  }

  try {
    const { data, error } = await supabase.functions.invoke('score-seekers', {
      body: { property_id: propertyId },
    })

    if (error) {
      logService('matches', 'getScoredPendingLikes edge fn error', undefined, error)
      return getPendingLikesForProperty(propertyId)
    }

    logService('matches', 'getScoredPendingLikes', data)
    return data?.data || []
  } catch (err) {
    logService('matches', 'getScoredPendingLikes', undefined, err)
    return getPendingLikesForProperty(propertyId)
  }
}

export async function getUserInteractions(userId: string) {
  const { data, error } = await supabase
    .from('interactions')
    .select('property_id, action')
    .eq('actor_id', userId)

  if (error) throw error

  const liked = data.filter(i => i.action === 'like' || i.action === 'super_like').map(i => i.property_id)
  const passed = data.filter(i => i.action === 'pass').map(i => i.property_id)

  return { liked, passed }
}

