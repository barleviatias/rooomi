import { createClient, type SupabaseClientOptions } from '@supabase/supabase-js'
import type { Database } from './types'

export function createRoomiClient(
  url: string,
  anonKey: string,
  options?: SupabaseClientOptions<'public'>
) {
  if (!url || !anonKey) {
    throw new Error('Missing Supabase URL or anon key. Check your environment variables.')
  }

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    ...options,
  })
}

export function createTypedRoomiClient(
  url: string,
  anonKey: string,
  options?: SupabaseClientOptions<'public'>
) {
  if (!url || !anonKey) {
    throw new Error('Missing Supabase URL or anon key. Check your environment variables.')
  }

  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    ...options,
  })
}
