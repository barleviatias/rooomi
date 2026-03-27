import { create } from 'zustand'

interface UIState {
  isLoginModalOpen: boolean
  loginModalPropertyId: string | null
  isPropertyDetailOpen: boolean
  selectedPropertyId: string | null

  // Actions
  openLoginModal: (propertyId?: string) => void
  closeLoginModal: () => void
  openPropertyDetail: (propertyId: string) => void
  closePropertyDetail: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isLoginModalOpen: false,
  loginModalPropertyId: null,
  isPropertyDetailOpen: false,
  selectedPropertyId: null,

  openLoginModal: (propertyId) =>
    set({
      isLoginModalOpen: true,
      loginModalPropertyId: propertyId || null,
    }),

  closeLoginModal: () =>
    set({
      isLoginModalOpen: false,
      loginModalPropertyId: null,
    }),

  openPropertyDetail: (propertyId) =>
    set({
      isPropertyDetailOpen: true,
      selectedPropertyId: propertyId,
    }),

  closePropertyDetail: () =>
    set({
      isPropertyDetailOpen: false,
      selectedPropertyId: null,
    }),
}))
