import { supabase } from '../supabase'
import { logService } from '../debug'
import type { Property, PropertyPhoto, Profile, ScoredProperty } from '@roomi/types'

export type PropertyWithPhotos = Property & {
  photos: PropertyPhoto[]
  host?: Profile | null
}

export type PropertyFilters = {
  city?: string
  neighborhood?: string
  priceMin?: number
  priceMax?: number
  rooms?: number
  amenities?: {
    balcony?: boolean
    elevator?: boolean
    parking?: boolean
    safeRoom?: boolean
    furnished?: boolean
    petsAllowed?: boolean
    ac?: boolean
  }
}

export async function getProperties(
  filters?: PropertyFilters,
  excludeIds?: string[],
  pagination?: { limit: number; offset: number }
) {
  let query = supabase
    .from('properties')
    .select(`
      *,
      photos:property_photos(*),
      host:profiles(id, full_name, display_name, gender, avatar_url, bio, is_seeker, is_host, instagram_handle, preferred_city, is_verified, profile_completion_pct, last_active_at, created_at, updated_at)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (filters?.city) {
    query = query.eq('address_city', filters.city)
  }

  if (filters?.neighborhood) {
    query = query.eq('address_neighborhood', filters.neighborhood)
  }

  if (filters?.priceMin) {
    query = query.gte('price_monthly', filters.priceMin)
  }

  if (filters?.priceMax) {
    query = query.lte('price_monthly', filters.priceMax)
  }

  if (filters?.rooms) {
    query = query.eq('total_rooms', filters.rooms)
  }

  if (filters?.amenities) {
    if (filters.amenities.balcony) query = query.eq('has_balcony', true)
    if (filters.amenities.elevator) query = query.eq('has_elevator', true)
    if (filters.amenities.parking) query = query.eq('has_parking', true)
    if (filters.amenities.safeRoom) query = query.eq('has_safe_room', true)
    if (filters.amenities.furnished) query = query.eq('has_furnished', true)
    if (filters.amenities.petsAllowed) query = query.eq('has_pets_allowed', true)
    if (filters.amenities.ac) query = query.eq('has_ac', true)
  }

  if (excludeIds && excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const limit = pagination?.limit ?? 20
  const offset = pagination?.offset ?? 0
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    logService('properties', 'getProperties', undefined, error)
    throw error
  }

  logService('properties', 'getProperties', data)
  return data as PropertyWithPhotos[]
}

export async function getPropertyById(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      photos:property_photos(*),
      host:profiles(
        id, full_name, display_name, gender, avatar_url, bio, is_seeker, is_host, instagram_handle, preferred_city, is_verified, profile_completion_pct, last_active_at, created_at, updated_at,
        lifestyle:profile_lifestyle(*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    logService('properties', 'getPropertyById', undefined, error)
    throw error
  }
  logService('properties', 'getPropertyById', data)
  return data
}

export async function getPropertiesByHost(hostId: string, pagination?: { limit: number; offset: number }) {
  let query = supabase
    .from('properties')
    .select(`
      *,
      photos:property_photos(*)
    `)
    .eq('host_id', hostId)
    .order('created_at', { ascending: false })

  const limit = pagination?.limit ?? 50
  const offset = pagination?.offset ?? 0
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    logService('properties', 'getPropertiesByHost', undefined, error)
    throw error
  }
  logService('properties', 'getPropertiesByHost', data)
  return data
}

export async function createProperty(property: Record<string, unknown>) {
  logService('properties', 'createProperty (input)', property)
  const { data, error } = await supabase
    .from('properties')
    .insert(property)
    .select()
    .single()

  if (error) {
    logService('properties', 'createProperty', undefined, error)
    throw error
  }
  logService('properties', 'createProperty', data)
  return data
}

export async function updateProperty(id: string, updates: Record<string, unknown>) {
  logService('properties', 'updateProperty (input)', { id, updates })
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    logService('properties', 'updateProperty', undefined, error)
    throw error
  }
  logService('properties', 'updateProperty', data)
  return data
}

export async function deleteProperty(id: string) {
  logService('properties', 'deleteProperty', { id })
  const { error } = await supabase
    .from('properties')
    .update({ status: 'deleted' })
    .eq('id', id)

  if (error) {
    logService('properties', 'deleteProperty', undefined, error)
    throw error
  }
}

export async function addPropertyPhoto(photo: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('property_photos')
    .insert(photo)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePropertyPhoto(id: string) {
  const { error } = await supabase
    .from('property_photos')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function uploadPropertyPhoto(
  propertyId: string,
  file: File,
  displayOrder: number,
  isPrimary: boolean = false
): Promise<PropertyPhoto> {
  const fileExt = file.name.split('.').pop() || 'jpg'
  const fileName = `${propertyId}/${Date.now()}_${displayOrder}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('property-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    logService('properties', 'uploadPropertyPhoto', undefined, uploadError)
    throw uploadError
  }

  const { data: urlData } = supabase.storage
    .from('property-photos')
    .getPublicUrl(fileName)

  const photoRecord = await addPropertyPhoto({
    property_id: propertyId,
    photo_url: urlData.publicUrl,
    display_order: displayOrder,
    is_primary: isPrimary,
  })

  logService('properties', 'uploadPropertyPhoto OK', photoRecord)
  return photoRecord as PropertyPhoto
}

export async function uploadPropertyPhotos(
  propertyId: string,
  files: File[]
): Promise<PropertyPhoto[]> {
  const concurrency = 3
  const results: PropertyPhoto[] = []
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map((file, j) => uploadPropertyPhoto(propertyId, file, i + j, i + j === 0))
    )
    results.push(...batchResults)
  }
  return results
}

export async function getRecommendedProperties(
  _seekerId: string,
  pagination?: { limit: number; offset: number }
): Promise<{ data: ScoredProperty[]; total: number }> {
  const limit = pagination?.limit ?? 20
  const offset = pagination?.offset ?? 0

  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token

  if (!token) {
    logService('properties', 'getRecommendedProperties — no session, falling back')
    const fallback = await getProperties(undefined, undefined, { limit, offset })
    return { data: fallback.map(p => ({ ...p, relevance_score: 0 })), total: fallback.length }
  }

  try {
    const { data, error } = await supabase.functions.invoke('score-feed', {
      body: { limit, offset },
    })

    if (error) {
      logService('properties', 'getRecommendedProperties edge fn error', undefined, error)
      const fallback = await getProperties(undefined, undefined, { limit, offset })
      return { data: fallback.map(p => ({ ...p, relevance_score: 0 })), total: fallback.length }
    }

    logService('properties', 'getRecommendedProperties', data)
    return data as { data: ScoredProperty[]; total: number }
  } catch (err) {
    logService('properties', 'getRecommendedProperties', undefined, err)
    const fallback = await getProperties(undefined, undefined, { limit, offset })
    return { data: fallback.map(p => ({ ...p, relevance_score: 0 })), total: fallback.length }
  }
}

export async function incrementViewCount(propertyId: string, viewerId?: string, sessionId?: string) {
  await supabase.from('property_views').insert({
    property_id: propertyId,
    viewer_id: viewerId,
    session_id: sessionId,
    source: 'feed',
  })
}
