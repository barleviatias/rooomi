export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          phone: string | null
          full_name: string
          display_name: string | null
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          avatar_url: string | null
          bio: string | null
          is_seeker: boolean
          is_host: boolean
          instagram_handle: string | null
          preferred_language: string
          preferred_city: string | null
          is_verified: boolean
          is_phone_verified: boolean
          is_email_verified: boolean
          is_admin: boolean
          profile_completion_pct: number
          last_active_at: string | null
          avg_response_time_hours: number | null
          banned_at: string | null
          ban_reason: string | null
          suspended_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          phone?: string | null
          full_name: string
          display_name?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          avatar_url?: string | null
          bio?: string | null
          is_seeker?: boolean
          is_host?: boolean
          instagram_handle?: string | null
          preferred_language?: string
          preferred_city?: string | null
          is_verified?: boolean
          is_phone_verified?: boolean
          is_email_verified?: boolean
          is_admin?: boolean
          profile_completion_pct?: number
          last_active_at?: string | null
          avg_response_time_hours?: number | null
          banned_at?: string | null
          ban_reason?: string | null
          suspended_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          full_name?: string
          display_name?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          avatar_url?: string | null
          bio?: string | null
          is_seeker?: boolean
          is_host?: boolean
          instagram_handle?: string | null
          preferred_language?: string
          preferred_city?: string | null
          is_verified?: boolean
          is_phone_verified?: boolean
          is_email_verified?: boolean
          is_admin?: boolean
          profile_completion_pct?: number
          last_active_at?: string | null
          avg_response_time_hours?: number | null
          banned_at?: string | null
          ban_reason?: string | null
          suspended_until?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profile_lifestyle: {
        Row: {
          id: string
          profile_id: string
          is_smoker: boolean
          has_pet: boolean
          keeps_kosher: boolean
          is_student: boolean
          hosting_level: number | null
          sleeping_level: number | null
          cleanliness_level: number | null
          noise_level: number | null
          occupation: string | null
          work_schedule: string | null
          interests: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          is_smoker?: boolean
          has_pet?: boolean
          keeps_kosher?: boolean
          is_student?: boolean
          hosting_level?: number | null
          sleeping_level?: number | null
          cleanliness_level?: number | null
          noise_level?: number | null
          occupation?: string | null
          work_schedule?: string | null
          interests?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          is_smoker?: boolean
          has_pet?: boolean
          keeps_kosher?: boolean
          is_student?: boolean
          hosting_level?: number | null
          sleeping_level?: number | null
          cleanliness_level?: number | null
          noise_level?: number | null
          occupation?: string | null
          work_schedule?: string | null
          interests?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      seeker_preferences: {
        Row: {
          id: string
          profile_id: string
          budget_min: number | null
          budget_max: number | null
          preferred_cities: string[] | null
          preferred_neighborhoods: string[] | null
          max_distance_km: number | null
          move_in_date_earliest: string | null
          move_in_date_latest: string | null
          must_have_balcony: boolean
          must_have_elevator: boolean
          must_have_parking: boolean
          must_have_safe_room: boolean
          must_have_furnished: boolean
          must_have_pets_allowed: boolean
          must_have_ac: boolean
          preferred_gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          preferred_age_min: number | null
          preferred_age_max: number | null
          roommate_smoker_ok: boolean
          roommate_pet_ok: boolean
          roommate_kosher_required: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          budget_min?: number | null
          budget_max?: number | null
          preferred_cities?: string[] | null
          preferred_neighborhoods?: string[] | null
          max_distance_km?: number | null
          move_in_date_earliest?: string | null
          move_in_date_latest?: string | null
          must_have_balcony?: boolean
          must_have_elevator?: boolean
          must_have_parking?: boolean
          must_have_safe_room?: boolean
          must_have_furnished?: boolean
          must_have_pets_allowed?: boolean
          must_have_ac?: boolean
          preferred_gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          preferred_age_min?: number | null
          preferred_age_max?: number | null
          roommate_smoker_ok?: boolean
          roommate_pet_ok?: boolean
          roommate_kosher_required?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          budget_min?: number | null
          budget_max?: number | null
          preferred_cities?: string[] | null
          preferred_neighborhoods?: string[] | null
          max_distance_km?: number | null
          move_in_date_earliest?: string | null
          move_in_date_latest?: string | null
          must_have_balcony?: boolean
          must_have_elevator?: boolean
          must_have_parking?: boolean
          must_have_safe_room?: boolean
          must_have_furnished?: boolean
          must_have_pets_allowed?: boolean
          must_have_ac?: boolean
          preferred_gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
          preferred_age_min?: number | null
          preferred_age_max?: number | null
          roommate_smoker_ok?: boolean
          roommate_pet_ok?: boolean
          roommate_kosher_required?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      profile_photos: {
        Row: {
          id: string
          profile_id: string
          photo_url: string
          thumbnail_url: string | null
          display_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          photo_url: string
          thumbnail_url?: string | null
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          photo_url?: string
          thumbnail_url?: string | null
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          host_id: string
          title: string
          description: string | null
          price_monthly: number
          price_bills_included: boolean
          deposit_months: number
          address_street: string | null
          address_city: string
          address_neighborhood: string | null
          address_country: string
          location: unknown | null
          location_lat: number | null
          location_lng: number | null
          hide_exact_address: boolean
          property_type: string | null
          total_rooms: number
          available_rooms: number
          bathrooms: number
          size_sqm: number | null
          floor_number: number | null
          total_floors: number | null
          available_from: string
          minimum_lease_months: number
          has_balcony: boolean
          has_elevator: boolean
          has_parking: boolean
          has_safe_room: boolean
          has_furnished: boolean
          has_pets_allowed: boolean
          has_ac: boolean
          amenities_extra: Json
          rules: Json
          current_roommates_count: number
          current_roommates_description: string | null
          status: 'active' | 'paused' | 'rented' | 'deleted'
          is_featured: boolean
          view_count: number
          like_count: number
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          host_id: string
          title: string
          description?: string | null
          price_monthly: number
          price_bills_included?: boolean
          deposit_months?: number
          address_street?: string | null
          address_city: string
          address_neighborhood?: string | null
          address_country?: string
          location?: unknown | null
          location_lat?: number | null
          location_lng?: number | null
          hide_exact_address?: boolean
          property_type?: string | null
          total_rooms: number
          available_rooms?: number
          bathrooms?: number
          size_sqm?: number | null
          floor_number?: number | null
          total_floors?: number | null
          available_from: string
          minimum_lease_months?: number
          has_balcony?: boolean
          has_elevator?: boolean
          has_parking?: boolean
          has_safe_room?: boolean
          has_furnished?: boolean
          has_pets_allowed?: boolean
          has_ac?: boolean
          amenities_extra?: Json
          rules?: Json
          current_roommates_count?: number
          current_roommates_description?: string | null
          status?: 'active' | 'paused' | 'rented' | 'deleted'
          is_featured?: boolean
          view_count?: number
          like_count?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          host_id?: string
          title?: string
          description?: string | null
          price_monthly?: number
          price_bills_included?: boolean
          deposit_months?: number
          address_street?: string | null
          address_city?: string
          address_neighborhood?: string | null
          address_country?: string
          location?: unknown | null
          location_lat?: number | null
          location_lng?: number | null
          hide_exact_address?: boolean
          property_type?: string | null
          total_rooms?: number
          available_rooms?: number
          bathrooms?: number
          size_sqm?: number | null
          floor_number?: number | null
          total_floors?: number | null
          available_from?: string
          minimum_lease_months?: number
          has_balcony?: boolean
          has_elevator?: boolean
          has_parking?: boolean
          has_safe_room?: boolean
          has_furnished?: boolean
          has_pets_allowed?: boolean
          has_ac?: boolean
          amenities_extra?: Json
          rules?: Json
          current_roommates_count?: number
          current_roommates_description?: string | null
          status?: 'active' | 'paused' | 'rented' | 'deleted'
          is_featured?: boolean
          view_count?: number
          like_count?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      property_photos: {
        Row: {
          id: string
          property_id: string
          photo_url: string
          thumbnail_url: string | null
          display_order: number
          is_primary: boolean
          room_type: string | null
          caption: string | null
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          photo_url: string
          thumbnail_url?: string | null
          display_order?: number
          is_primary?: boolean
          room_type?: string | null
          caption?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          photo_url?: string
          thumbnail_url?: string | null
          display_order?: number
          is_primary?: boolean
          room_type?: string | null
          caption?: string | null
          created_at?: string
        }
      }
      interactions: {
        Row: {
          id: string
          actor_id: string
          property_id: string
          action: 'like' | 'pass' | 'super_like'
          created_at: string
        }
        Insert: {
          id?: string
          actor_id: string
          property_id: string
          action: 'like' | 'pass' | 'super_like'
          created_at?: string
        }
        Update: {
          id?: string
          actor_id?: string
          property_id?: string
          action?: 'like' | 'pass' | 'super_like'
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          seeker_id: string
          property_id: string
          host_id: string
          status: 'pending' | 'matched' | 'rejected' | 'expired' | 'unmatched'
          seeker_liked_at: string
          host_responded_at: string | null
          matched_at: string | null
          unmatched_at: string | null
          unmatched_by: string | null
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seeker_id: string
          property_id: string
          host_id: string
          status?: 'pending' | 'matched' | 'rejected' | 'expired' | 'unmatched'
          seeker_liked_at?: string
          host_responded_at?: string | null
          matched_at?: string | null
          unmatched_at?: string | null
          unmatched_by?: string | null
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seeker_id?: string
          property_id?: string
          host_id?: string
          status?: 'pending' | 'matched' | 'rejected' | 'expired' | 'unmatched'
          seeker_liked_at?: string
          host_responded_at?: string | null
          matched_at?: string | null
          unmatched_at?: string | null
          unmatched_by?: string | null
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          match_id: string
          last_message_text: string | null
          last_message_at: string | null
          last_message_by: string | null
          seeker_unread_count: number
          host_unread_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_id: string
          last_message_text?: string | null
          last_message_at?: string | null
          last_message_by?: string | null
          seeker_unread_count?: number
          host_unread_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          last_message_text?: string | null
          last_message_at?: string | null
          last_message_by?: string | null
          seeker_unread_count?: number
          host_unread_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          message_type: 'text' | 'image' | 'system' | 'open_house_invite'
          metadata: Json | null
          is_read: boolean
          read_at: string | null
          is_deleted: boolean
          deleted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          message_type?: 'text' | 'image' | 'system' | 'open_house_invite'
          metadata?: Json | null
          is_read?: boolean
          read_at?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          message_type?: 'text' | 'image' | 'system' | 'open_house_invite'
          metadata?: Json | null
          is_read?: boolean
          read_at?: string | null
          is_deleted?: boolean
          deleted_at?: string | null
          created_at?: string
        }
      }
      open_houses: {
        Row: {
          id: string
          property_id: string
          host_id: string
          title: string | null
          description: string | null
          scheduled_at: string
          duration_minutes: number
          max_attendees: number | null
          is_cancelled: boolean
          cancelled_at: string | null
          cancellation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          host_id: string
          title?: string | null
          description?: string | null
          scheduled_at: string
          duration_minutes?: number
          max_attendees?: number | null
          is_cancelled?: boolean
          cancelled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          host_id?: string
          title?: string | null
          description?: string | null
          scheduled_at?: string
          duration_minutes?: number
          max_attendees?: number | null
          is_cancelled?: boolean
          cancelled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      open_house_invites: {
        Row: {
          id: string
          open_house_id: string
          invitee_id: string
          match_id: string
          rsvp_status: 'going' | 'maybe' | 'not_going' | null
          rsvp_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          open_house_id: string
          invitee_id: string
          match_id: string
          rsvp_status?: 'going' | 'maybe' | 'not_going' | null
          rsvp_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          open_house_id?: string
          invitee_id?: string
          match_id?: string
          rsvp_status?: 'going' | 'maybe' | 'not_going' | null
          rsvp_at?: string | null
          created_at?: string
        }
      }
      saved_properties: {
        Row: {
          id: string
          profile_id: string
          property_id: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          property_id: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          property_id?: string
          notes?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          type: string
          title: string
          body: string | null
          related_match_id: string | null
          related_property_id: string | null
          related_profile_id: string | null
          action_url: string | null
          is_read: boolean
          read_at: string | null
          push_sent: boolean
          push_sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          type: string
          title: string
          body?: string | null
          related_match_id?: string | null
          related_property_id?: string | null
          related_profile_id?: string | null
          action_url?: string | null
          is_read?: boolean
          read_at?: string | null
          push_sent?: boolean
          push_sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          type?: string
          title?: string
          body?: string | null
          related_match_id?: string | null
          related_property_id?: string | null
          related_profile_id?: string | null
          action_url?: string | null
          is_read?: boolean
          read_at?: string | null
          push_sent?: boolean
          push_sent_at?: string | null
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_profile_id: string | null
          reported_property_id: string | null
          reason: string
          description: string | null
          status: string
          reviewed_at: string | null
          reviewed_by: string | null
          resolution_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_profile_id?: string | null
          reported_property_id?: string | null
          reason: string
          description?: string | null
          status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          resolution_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_profile_id?: string | null
          reported_property_id?: string | null
          reason?: string
          description?: string | null
          status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          resolution_notes?: string | null
          created_at?: string
        }
      }
      blocks: {
        Row: {
          id: string
          blocker_id: string
          blocked_id: string
          created_at: string
        }
        Insert: {
          id?: string
          blocker_id: string
          blocked_id: string
          created_at?: string
        }
        Update: {
          id?: string
          blocker_id?: string
          blocked_id?: string
          created_at?: string
        }
      }
      property_views: {
        Row: {
          id: string
          property_id: string
          viewer_id: string | null
          session_id: string | null
          source: string | null
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          viewer_id?: string | null
          session_id?: string | null
          source?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          viewer_id?: string | null
          session_id?: string | null
          source?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      properties_feed: {
        Row: {
          id: string | null
          host_id: string | null
          title: string | null
          description: string | null
          price_monthly: number | null
          address_city: string | null
          address_neighborhood: string | null
          total_rooms: number | null
          available_rooms: number | null
          available_from: string | null
          status: 'active' | 'paused' | 'rented' | 'deleted' | null
          primary_photo_url: string | null
          host_name: string | null
          host_avatar: string | null
          host_response_time: number | null
        }
      }
      seeker_match_activity: {
        Row: {
          id: string | null
          seeker_id: string | null
          property_id: string | null
          host_id: string | null
          status: 'pending' | 'matched' | 'rejected' | 'expired' | 'unmatched' | null
          property_title: string | null
          price_monthly: number | null
          address_neighborhood: string | null
          property_photo: string | null
          host_name: string | null
          last_message_text: string | null
          last_message_at: string | null
          unread_count: number | null
        }
      }
      host_match_activity: {
        Row: {
          id: string | null
          seeker_id: string | null
          property_id: string | null
          host_id: string | null
          status: 'pending' | 'matched' | 'rejected' | 'expired' | 'unmatched' | null
          property_title: string | null
          seeker_name: string | null
          seeker_avatar: string | null
          seeker_bio: string | null
          seeker_occupation: string | null
          last_message_text: string | null
          last_message_at: string | null
          unread_count: number | null
        }
      }
    }
    Functions: {
      expire_pending_matches: {
        Args: Record<string, never>
        Returns: undefined
      }
    }
    Enums: {
      gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
      interaction_type: 'like' | 'pass' | 'super_like'
      match_status: 'pending' | 'matched' | 'rejected' | 'expired' | 'unmatched'
      property_status: 'active' | 'paused' | 'rented' | 'deleted'
      message_type: 'text' | 'image' | 'system' | 'open_house_invite'
      rsvp_status: 'going' | 'maybe' | 'not_going'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
