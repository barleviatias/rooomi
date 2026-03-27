import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MatchStoreState {
  seenMatchIds: string[]
  markMatchesSeen: (ids: string[]) => void
  getUnseenCount: (currentMatchIds: string[]) => number
  reset: () => void
}

export const useMatchStore = create<MatchStoreState>()(
  persist(
    (set, get) => ({
      seenMatchIds: [],
      markMatchesSeen: (ids) =>
        set({ seenMatchIds: [...new Set([...get().seenMatchIds, ...ids])] }),
      getUnseenCount: (currentMatchIds) => {
        const seen = new Set(get().seenMatchIds)
        return currentMatchIds.filter((id) => !seen.has(id)).length
      },
      reset: () => set({ seenMatchIds: [] }),
    }),
    {
      name: 'roomi-matches',
      version: 1,
    }
  )
)
