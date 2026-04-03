import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/store/auth-store'
import { useFeedStore } from '@/lib/store/feed-store'
import * as propertiesService from '@/lib/services/properties'
import * as matchesService from '@/lib/services/matches'
import { mockProperties } from '@/lib/mock-data'
import { logHook } from '@/lib/debug'
import type { PropertyFilters } from '@/lib/services/properties'

const PAGE_SIZE = 5

export function useProperties(filters?: PropertyFilters) {
  const { useMockData, isAuthenticated, user } = useAuthStore()

  return useInfiniteQuery({
    queryKey: isAuthenticated && user ? ['properties', 'recommended', user.id] : ['properties', filters],
    queryFn: async ({ pageParam = 0 }) => {
      if (useMockData) {
        logHook('useProperties', 'using MOCK data')
        let properties = [...mockProperties]

        if (filters?.city) {
          properties = properties.filter(p => p.address_city === filters.city)
        }
        if (filters?.priceMin) {
          properties = properties.filter(p => p.price_monthly >= filters.priceMin!)
        }
        if (filters?.priceMax) {
          properties = properties.filter(p => p.price_monthly <= filters.priceMax!)
        }

        return properties.slice(pageParam, pageParam + PAGE_SIZE)
      }

      if (isAuthenticated && user) {
        logHook('useProperties', 'fetching RECOMMENDED from edge function', { offset: pageParam })
        const result = await propertiesService.getRecommendedProperties(user.id, {
          limit: PAGE_SIZE,
          offset: pageParam,
        })
        return result.data
      }

      logHook('useProperties', 'fetching from SUPABASE (unauth)', { filters, offset: pageParam })
      const properties = await propertiesService.getProperties(filters, undefined, {
        limit: PAGE_SIZE,
        offset: pageParam,
      })
      return properties
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      return allPages.length * PAGE_SIZE
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useProperty(id: string) {
  const { useMockData } = useAuthStore()

  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      if (useMockData) {
        return mockProperties.find(p => p.id === id) || null
      }
      return propertiesService.getPropertyById(id)
    },
    enabled: !!id,
  })
}

export function useHostProperties() {
  const { user, useMockData } = useAuthStore()

  return useQuery({
    queryKey: ['hostProperties', user?.id],
    queryFn: async () => {
      if (useMockData || !user) {
        return mockProperties.filter(p => p.host_id === user?.id)
      }
      return propertiesService.getPropertiesByHost(user.id)
    },
    enabled: !!user,
  })
}

export function useLikeProperty() {
  const queryClient = useQueryClient()
  const { user, useMockData } = useAuthStore()
  const { addLikedProperty } = useFeedStore()

  return useMutation({
    mutationFn: async ({ propertyId, hostId }: { propertyId: string; hostId: string }) => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      addLikedProperty(propertyId)

      if (useMockData) {
        return { id: `mock-match-${Date.now()}`, status: 'pending' }
      }

      const result = await matchesService.likeProperty(user.id, propertyId, hostId)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['matches'] })
    },
  })
}

export function usePassProperty() {
  const queryClient = useQueryClient()
  const { user, useMockData } = useAuthStore()
  const { addPassedProperty } = useFeedStore()

  return useMutation({
    mutationFn: async (propertyId: string) => {
      addPassedProperty(propertyId)

      if (useMockData || !user) {
        return { success: true }
      }

      const result = await matchesService.passProperty(user.id, propertyId)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

export function useCreateProperty() {
  const queryClient = useQueryClient()
  const { user, useMockData } = useAuthStore()

  return useMutation({
    mutationFn: async (propertyData: Record<string, unknown>) => {
      if (!user) throw new Error('User not authenticated')

      if (useMockData) {
        return { id: `mock-property-${Date.now()}`, ...propertyData }
      }

      return propertiesService.createProperty({
        ...propertyData,
        host_id: user.id,
        status: 'active',
      } as Parameters<typeof propertiesService.createProperty>[0])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostProperties'] })
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}

export function useUpdateProperty() {
  const queryClient = useQueryClient()
  const { useMockData } = useAuthStore()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      if (useMockData) {
        return { id, ...updates }
      }

      return propertiesService.updateProperty(id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostProperties'] })
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['property'] })
    },
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()
  const { useMockData } = useAuthStore()

  return useMutation({
    mutationFn: async (id: string) => {
      if (useMockData) {
        return { success: true }
      }

      return propertiesService.deleteProperty(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostProperties'] })
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })
}
