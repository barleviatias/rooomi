export type UserType = 'seeker' | 'host'
export type InteractionType = 'like' | 'pass' | 'super_like'
export type MatchStatus = 'pending' | 'matched' | 'rejected' | 'expired' | 'unmatched'
export type PropertyStatus = 'active' | 'paused' | 'rented' | 'deleted'
export type MessageType = 'text' | 'image' | 'system' | 'open_house_invite'
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'
export type ListingType = 'room' | 'apartment' | 'sublet'

export interface Profile {
  id: string
  email: string
  phone?: string
  full_name: string
  display_name?: string
  date_of_birth?: string
  gender?: Gender
  avatar_url?: string
  bio?: string
  is_seeker: boolean
  is_host: boolean
  instagram_handle?: string
  preferred_language: 'he' | 'en'
  preferred_city?: string
  is_verified: boolean
  is_admin?: boolean
  banned_at?: string
  ban_reason?: string
  suspended_until?: string
  last_active_at?: string
  avg_response_time_hours?: number
  created_at: string
  updated_at: string
}

export interface ProfileLifestyle {
  id: string
  profile_id: string
  is_smoker: boolean
  has_pet: boolean
  keeps_kosher: boolean
  is_student: boolean
  hosting_level?: number
  sleeping_level?: number
  cleanliness_level?: number
  noise_level?: number
  occupation?: string
  work_schedule?: 'office' | 'remote' | 'hybrid' | 'shift'
  interests?: string[]
}

export interface Property {
  id: string
  host_id: string
  title: string
  description?: string
  listing_type?: ListingType
  price_monthly: number
  price_bills_included: boolean
  deposit_months: number
  address_street?: string
  address_city: string
  address_neighborhood?: string
  location_lat?: number
  location_lng?: number
  hide_exact_address: boolean
  property_type?: 'apartment' | 'house' | 'room' | 'studio'
  total_rooms: number
  available_rooms: number
  bathrooms: number
  size_sqm?: number
  floor_number?: number
  total_floors?: number
  available_from: string
  minimum_lease_months: number
  has_balcony: boolean
  has_elevator: boolean
  has_parking: boolean
  has_safe_room: boolean
  has_furnished: boolean
  has_pets_allowed: boolean
  has_ac: boolean
  amenities_extra?: Record<string, boolean>
  rules?: Record<string, boolean>
  current_roommates_count: number
  current_roommates_description?: string
  status: PropertyStatus
  is_featured: boolean
  view_count: number
  like_count: number
  created_at: string
  updated_at: string
  photos?: PropertyPhoto[]
  host?: Profile
}

export interface PropertyPhoto {
  id: string
  property_id: string
  photo_url: string
  thumbnail_url?: string
  display_order: number
  is_primary: boolean
  room_type?: 'living_room' | 'bedroom' | 'kitchen' | 'bathroom' | 'exterior'
  caption?: string
}

export interface Interaction {
  id: string
  actor_id: string
  property_id: string
  action: InteractionType
  created_at: string
}

export interface Match {
  id: string
  seeker_id: string
  property_id: string
  host_id: string
  status: MatchStatus
  seeker_liked_at: string
  host_responded_at?: string
  matched_at?: string
  unmatched_at?: string
  expires_at: string
  created_at: string
  property?: Property
  seeker?: Profile
  host?: Profile
  conversation?: Conversation
}

export interface Conversation {
  id: string
  match_id: string
  last_message_text?: string
  last_message_at?: string
  last_message_by?: string
  seeker_unread_count: number
  host_unread_count: number
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: MessageType
  is_read: boolean
  read_at?: string
  created_at: string
}

export type ScoredProperty = Property & { relevance_score: number }
export type ScoredMatch = Match & { compatibility_score: number }

export interface Report {
  id: string
  reporter_id: string
  reported_profile_id?: string
  reported_property_id?: string
  reason: string
  description?: string
  status: string
  reviewed_at?: string
  reviewed_by?: string
  resolution_notes?: string
  created_at: string
  reporter?: Profile
  reported_profile?: Profile
  reported_property?: Property
}

export interface AuditLogEntry {
  id: string
  admin_id: string
  action: string
  target_table: string
  target_id?: string
  details: Record<string, unknown>
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface SeekerPreferences {
  budget_min?: number
  budget_max?: number
  preferred_city?: string
  preferred_cities?: string[]
  preferred_neighborhoods?: string[]
  max_distance_km?: number
  move_in_date_earliest?: string
  move_in_date_latest?: string
  must_have_balcony: boolean
  must_have_elevator: boolean
  must_have_parking: boolean
  must_have_ac: boolean
  must_have_furnished: boolean
  must_have_pets_allowed: boolean
  must_have_safe_room: boolean
  preferred_gender?: string
  preferred_age_min?: number
  preferred_age_max?: number
  roommate_smoker_ok: boolean
  roommate_pet_ok: boolean
  roommate_kosher_required: boolean
}

export interface AnalyticsOverview {
  total_users: number
  total_properties: number
  total_matches: number
  pending_reports: number
  new_users_30d: number
  new_matches_30d: number
}

export interface TimeSeriesPoint {
  date: string
  count: number
}

export interface MatchFunnel {
  likes: number
  pending: number
  matched: number
}
