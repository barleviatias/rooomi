import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/store/auth-store'
import { useMatchStore } from '@/lib/store/match-store'
import * as matchesService from '@/lib/services/matches'
import { mockMatches, mockPendingLikes } from '@/lib/mock-data'

export function useSeekerMatches(status?: 'pending' | 'matched' | 'rejected' | 'expired' | 'unmatched') {
  const { user, useMockData } = useAuthStore()

  return useQuery({
    queryKey: ['seekerMatches', user?.id, status],
    queryFn: async () => {
      if (useMockData || !user) {
        let matches = mockMatches.filter(m => m.seeker_id === user?.id)
        if (status) {
          matches = matches.filter(m => m.status === status)
        }
        return matches
      }
      const matches = await matchesService.getSeekerMatches(user.id, status)
      return matches
    },
    enabled: !!user,
  })
}

export function useHostMatches(status?: 'pending' | 'matched' | 'rejected' | 'expired' | 'unmatched') {
  const { user, useMockData } = useAuthStore()

  return useQuery({
    queryKey: ['hostMatches', user?.id, status],
    queryFn: async () => {
      if (useMockData || !user) {
        let matches = mockMatches.filter(m => m.host_id === user?.id)
        if (status) {
          matches = matches.filter(m => m.status === status)
        }
        return matches
      }
      const matches = await matchesService.getHostMatches(user.id, status)
      return matches
    },
    enabled: !!user,
  })
}

export function usePendingLikesForProperty(propertyId: string) {
  const { useMockData } = useAuthStore()

  return useQuery({
    queryKey: ['pendingLikes', propertyId],
    queryFn: async () => {
      if (useMockData) {
        return mockPendingLikes.filter(like => like.property_id === propertyId)
      }
      return matchesService.getPendingLikesForProperty(propertyId)
    },
    enabled: !!propertyId,
  })
}

export function useScoredPendingLikes(propertyId: string) {
  const { useMockData } = useAuthStore()

  return useQuery({
    queryKey: ['scoredPendingLikes', propertyId],
    queryFn: async () => {
      if (useMockData) {
        return mockPendingLikes
          .filter(like => like.property_id === propertyId)
          .map(like => ({ ...like, compatibility_score: 0 }))
      }
      return matchesService.getScoredPendingLikes(propertyId)
    },
    enabled: !!propertyId,
  })
}

export function useAcceptMatch() {
  const queryClient = useQueryClient()
  const { useMockData } = useAuthStore()

  return useMutation({
    mutationFn: async (matchId: string) => {
      if (useMockData) {
        return { id: matchId, status: 'matched' }
      }
      return matchesService.acceptMatch(matchId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostMatches'] })
      queryClient.invalidateQueries({ queryKey: ['pendingLikes'] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useRejectMatch() {
  const queryClient = useQueryClient()
  const { useMockData } = useAuthStore()

  return useMutation({
    mutationFn: async (matchId: string) => {
      if (useMockData) {
        return { id: matchId, status: 'rejected' }
      }
      return matchesService.rejectMatch(matchId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostMatches'] })
      queryClient.invalidateQueries({ queryKey: ['pendingLikes'] })
    },
  })
}

export function useUnmatch() {
  const queryClient = useQueryClient()
  const { user, useMockData } = useAuthStore()

  return useMutation({
    mutationFn: async (matchId: string) => {
      if (useMockData || !user) {
        return { id: matchId, status: 'unmatched' }
      }
      return matchesService.unmatch(matchId, user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seekerMatches'] })
      queryClient.invalidateQueries({ queryKey: ['hostMatches'] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useUnseenMatchCount() {
  const getUnseenCount = useMatchStore((s) => s.getUnseenCount)
  const { data: matchedData } = useSeekerMatches('matched')
  const matchIds = (matchedData || []).map((m: { id: string }) => m.id)
  return getUnseenCount(matchIds)
}
