import { supabase } from '../supabase'
import { isNative } from '../platform'
import { logService } from '../debug'

function getRedirectUrl() {
  if (isNative) {
    return 'com.roomi.app://auth/callback'
  }
  return `${window.location.origin}/auth/callback`
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getRedirectUrl(),
    },
  })

  if (error) throw error
  return data
}

export async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: getRedirectUrl(),
    },
  })

  if (error) throw error
  return data
}

export async function signInWithEmail(email: string, password: string) {
  logService('auth', 'signInWithEmail', { email })
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    logService('auth', 'signInWithEmail', undefined, error)
    throw error
  }
  logService('auth', 'signInWithEmail OK', { userId: data.user?.id })
  return data
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  logService('auth', 'signUpWithEmail', { email, fullName })
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    logService('auth', 'signUpWithEmail', undefined, error)
    throw error
  }

  logService('auth', 'signUpWithEmail OK', { userId: data.user?.id })
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

export function onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
  return supabase.auth.onAuthStateChange(callback)
}

export async function createProfile(profile: { id: string; email: string; full_name: string }) {
  logService('auth', 'createProfile', profile)
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    logService('auth', 'createProfile', undefined, error)
    throw error
  }
  logService('auth', 'createProfile OK', data)
  return data
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      lifestyle:profile_lifestyle(*),
      preferences:seeker_preferences(*)
    `)
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    logService('auth', 'getProfile', undefined, error)
    throw error
  }
  logService('auth', 'getProfile', data)
  return data
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProfileLifestyle(profileId: string, lifestyle: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('profile_lifestyle')
    .upsert({ ...lifestyle, profile_id: profileId }, { onConflict: 'profile_id' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSeekerPreferences(profileId: string, preferences: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('seeker_preferences')
    .upsert({ ...preferences, profile_id: profileId }, { onConflict: 'profile_id' })
    .select()
    .single()

  if (error) throw error
  return data
}
