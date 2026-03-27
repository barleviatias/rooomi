import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FeedState {
  passedPropertyIds: string[]
  likedPropertyIds: string[]
  currentIndex: number

  addPassedProperty: (id: string) => void
  addLikedProperty: (id: string) => void
  setCurrentIndex: (index: number) => void
  resetFeed: () => void
  hasInteracted: (id: string) => boolean
  getExcludeSet: () => Set<string>
}

export const useFeedStore = create<FeedState>()(
  persist(
    (set, get) => ({
      passedPropertyIds: [],
      likedPropertyIds: [],
      currentIndex: 0,

      addPassedProperty: (id) =>
        set((state) => ({
          passedPropertyIds: [...state.passedPropertyIds, id],
        })),

      addLikedProperty: (id) =>
        set((state) => ({
          likedPropertyIds: [...state.likedPropertyIds, id],
        })),

      setCurrentIndex: (index) => set({ currentIndex: index }),

      resetFeed: () =>
        set({
          passedPropertyIds: [],
          likedPropertyIds: [],
          currentIndex: 0,
        }),

      hasInteracted: (id) => {
        const { passedPropertyIds, likedPropertyIds } = get()
        const set = new Set([...passedPropertyIds, ...likedPropertyIds])
        return set.has(id)
      },

      getExcludeSet: () => {
        const { passedPropertyIds, likedPropertyIds } = get()
        return new Set([...passedPropertyIds, ...likedPropertyIds])
      },
    }),
    {
      name: 'roomi-feed',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        if (version < 2) {
          return {
            passedPropertyIds: [],
            likedPropertyIds: [],
            currentIndex: 0,
          }
        }
        return persistedState as Record<string, unknown>
      },
    }
  )
)
