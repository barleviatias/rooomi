import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, ProfileLifestyle, SeekerPreferences } from '@roomi/types'
import { supabase } from '@/lib/supabase'
import * as authService from '@/lib/services/auth'
import { mockProfiles } from '@/lib/mock-data'
import { initPushNotifications, teardownPushNotifications } from '@/lib/services/push'
import { logService } from '@/lib/debug'

export type ActiveMode = 'seeker' | 'host'

interface AuthState {
  user: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  pendingLikePropertyId: string | null
  activeMode: ActiveMode
  lifestyle: ProfileLifestyle | null
  seekerPreferences: SeekerPreferences | null
  useMockData: boolean

  login: (userId?: string) => void
  loginWithGoogle: () => Promise<void>
  loginWithApple: () => Promise<void>
  loginWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => Promise<void>
  setPendingLike: (propertyId: string | null) => void
  clearPendingLike: () => string | null
  setActiveMode: (mode: ActiveMode) => void
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  updateLifestyle: (updates: Partial<ProfileLifestyle>) => Promise<void>
  updateSeekerPreferences: (updates: Partial<SeekerPreferences>) => Promise<void>
  setUseMockData: (useMock: boolean) => void
  clearError: () => void
}

const defaultSeekerPreferences: SeekerPreferences = {
  budget_min: 2000,
  budget_max: 6000,
  preferred_city: 'Tel Aviv',
  preferred_cities: [],
  preferred_neighborhoods: [],
  must_have_balcony: false,
  must_have_elevator: false,
  must_have_parking: false,
  must_have_ac: false,
  must_have_furnished: false,
  must_have_pets_allowed: false,
  must_have_safe_room: false,
  roommate_smoker_ok: true,
  roommate_pet_ok: true,
  roommate_kosher_required: false,
}

const defaultLifestyle: ProfileLifestyle = {
  id: '',
  profile_id: '',
  is_smoker: false,
  has_pet: false,
  keeps_kosher: false,
  is_student: false,
  hosting_level: 3,
  sleeping_level: 3,
  cleanliness_level: 3,
  noise_level: 3,
  occupation: '',
  work_schedule: 'office',
  interests: [],
}

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'

if (import.meta.env.DEV) {
  console.log(
    `%c[Roomi] %cData mode: %c${USE_MOCK_DATA ? 'MOCK' : 'SUPABASE (real)'}`,
    'color: #f43f5e; font-weight: bold',
    'color: inherit',
    USE_MOCK_DATA ? 'color: #f59e0b; font-weight: bold' : 'color: #10b981; font-weight: bold'
  )
}

async function fetchAndSetProfile(userId: string, email?: string, fullName?: string): Promise<boolean> {
  try {
    let profile = await authService.getProfile(userId)
    if (!profile && email) {
      await authService.createProfile({
        id: userId,
        email,
        full_name: fullName || email.split('@')[0] || 'User',
      })
      profile = await authService.getProfile(userId)
    }
    if (profile) {
      const profileWithRelations = profile as Profile & { lifestyle?: ProfileLifestyle; preferences?: SeekerPreferences }
      const activeMode: ActiveMode = profileWithRelations.is_seeker ? 'seeker' : 'host'
      useAuthStore.setState({
        user: profileWithRelations,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        activeMode,
        lifestyle: profileWithRelations.lifestyle || { ...defaultLifestyle, profile_id: profileWithRelations.id },
        seekerPreferences: profileWithRelations.preferences || (profileWithRelations.is_seeker ? { ...defaultSeekerPreferences } : null),
      })
      initPushNotifications(profileWithRelations.id).catch(() => {})
      return true
    }
    return false
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load profile'
    logService('auth-store', 'fetchAndSetProfile', undefined, error)
    useAuthStore.setState({ error: message, isLoading: false })
    return false
  }
}

function clearAuthState() {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    activeMode: 'seeker',
    lifestyle: null,
    seekerPreferences: null,
  })
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      pendingLikePropertyId: null,
      activeMode: 'seeker',
      lifestyle: null,
      seekerPreferences: null,
      useMockData: USE_MOCK_DATA,

      login: (userId?: string) => {
        const user = userId
          ? mockProfiles.find(p => p.id === userId)
          : mockProfiles[1]

        if (user) {
          const activeMode: ActiveMode = user.is_seeker ? 'seeker' : 'host'
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            activeMode,
            lifestyle: { ...defaultLifestyle, profile_id: user.id },
            seekerPreferences: user.is_seeker ? { ...defaultSeekerPreferences } : null,
          })
        }
      },

      loginWithGoogle: async () => {
        await authService.signInWithGoogle()
      },

      loginWithApple: async () => {
        await authService.signInWithApple()
      },

      loginWithEmail: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const { user: authUser } = await authService.signInWithEmail(email, password)
          if (authUser) {
            const success = await fetchAndSetProfile(authUser.id)
            if (!success) {
              clearAuthState()
              throw new Error('Failed to load profile')
            }
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      signUpWithEmail: async (email: string, password: string, fullName: string) => {
        set({ isLoading: true })
        try {
          const { user: authUser, session } = await authService.signUpWithEmail(email, password, fullName)
          if (authUser && session) {
            const success = await fetchAndSetProfile(authUser.id, email, fullName)
            if (!success) {
              clearAuthState()
              throw new Error('Failed to create profile')
            }
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        const { useMockData } = get()

        teardownPushNotifications().catch(() => {})

        if (!useMockData) {
          try {
            await authService.signOut()
          } catch {
            // Continue with local logout
          }
        }

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          activeMode: 'seeker',
          lifestyle: null,
          seekerPreferences: null,
        })
      },

      setPendingLike: (propertyId) => {
        set({ pendingLikePropertyId: propertyId })
      },

      clearPendingLike: () => {
        const { pendingLikePropertyId } = get()
        set({ pendingLikePropertyId: null })
        return pendingLikePropertyId
      },

      setActiveMode: (mode) => {
        const { user, useMockData } = get()
        if (user) {
          const updates: Partial<Profile> = {}
          if (mode === 'seeker') {
            updates.is_seeker = true
          } else {
            updates.is_host = true
          }

          set({
            activeMode: mode,
            user: { ...user, ...updates },
            seekerPreferences: mode === 'seeker' ? (get().seekerPreferences || { ...defaultSeekerPreferences }) : get().seekerPreferences,
          })

          if (!useMockData) {
            authService.updateProfile(user.id, updates).catch((error) => {
              logService('auth-store', 'setActiveMode', undefined, error)
            })
          }
        }
      },

      updateProfile: async (updates) => {
        const { user, useMockData } = get()
        if (user) {
          set({ user: { ...user, ...updates, updated_at: new Date().toISOString() } })

          if (!useMockData) {
            try {
              await authService.updateProfile(user.id, updates)
            } catch (error) {
              logService('auth-store', 'updateProfile', undefined, error)
              set({ error: error instanceof Error ? error.message : 'Failed to update profile' })
            }
          }
        }
      },

      updateLifestyle: async (updates) => {
        const { lifestyle, user, useMockData } = get()
        const newLifestyle = lifestyle
          ? { ...lifestyle, ...updates }
          : { ...defaultLifestyle, ...updates }

        set({ lifestyle: newLifestyle })

        if (!useMockData && user) {
          try {
            await authService.updateProfileLifestyle(user.id, updates)
          } catch (error) {
            logService('auth-store', 'updateLifestyle', undefined, error)
            set({ error: error instanceof Error ? error.message : 'Failed to update lifestyle' })
          }
        }
      },

      updateSeekerPreferences: async (updates) => {
        const { seekerPreferences, user, useMockData } = get()
        const newPreferences = seekerPreferences
          ? { ...seekerPreferences, ...updates }
          : { ...defaultSeekerPreferences, ...updates }

        set({ seekerPreferences: newPreferences })

        if (!useMockData && user) {
          try {
            await authService.updateSeekerPreferences(user.id, updates)
          } catch (error) {
            logService('auth-store', 'updateSeekerPreferences', undefined, error)
            set({ error: error instanceof Error ? error.message : 'Failed to update preferences' })
          }
        }
      },

      setUseMockData: (useMock) => {
        set({ useMockData: useMock })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'roomi-auth',
      version: 2,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        pendingLikePropertyId: state.pendingLikePropertyId,
        activeMode: state.activeMode,
        lifestyle: state.lifestyle,
        seekerPreferences: state.seekerPreferences,
      }),
      migrate: (persistedState: unknown, version: number) => {
        if (version < 2) {
          return {
            user: null,
            isAuthenticated: false,
            pendingLikePropertyId: null,
            activeMode: 'seeker',
            lifestyle: null,
            seekerPreferences: null,
          }
        }
        return persistedState as Record<string, unknown>
      },
    }
  )
)

if (USE_MOCK_DATA) {
  useAuthStore.setState({ isLoading: false })
} else {
  const AUTH_TIMEOUT = 10000
  const authTimeout = setTimeout(() => {
    if (useAuthStore.getState().isLoading) {
      clearAuthState()
    }
  }, AUTH_TIMEOUT)

  supabase.auth.onAuthStateChange(async (event, session) => {
    clearTimeout(authTimeout)

    if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (session?.user) {
        const state = useAuthStore.getState()
        if (event === 'SIGNED_IN' && state.isAuthenticated && state.user?.id === session.user.id) {
          useAuthStore.setState({ isLoading: false })
          return
        }
        const email = session.user.email
        const fullName = session.user.user_metadata?.full_name || email?.split('@')[0] || 'User'
        const success = await fetchAndSetProfile(session.user.id, email, fullName)
        if (!success) {
          clearAuthState()
        }
      } else {
        clearAuthState()
      }
    } else if (event === 'SIGNED_OUT') {
      clearAuthState()
    }
  })
}
