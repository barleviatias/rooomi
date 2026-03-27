import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Profile } from "@roomi/types"

interface AuthState {
  user: Profile | null
  isAuthenticated: boolean
  setUser: (user: Profile | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: "roomi-admin-auth" },
  ),
)
