import { api } from "./client"
import type { PaginatedResponse, Property } from "@roomi/types"

export interface PropertyFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  city?: string
  featured?: string
}

export function fetchProperties(filters: PropertyFilters) {
  const params: Record<string, string> = {}
  if (filters.page) params.page = String(filters.page)
  if (filters.limit) params.limit = String(filters.limit)
  if (filters.search) params.search = filters.search
  if (filters.status) params.status = filters.status
  if (filters.city) params.city = filters.city
  if (filters.featured) params.featured = filters.featured
  return api.get<PaginatedResponse<Property>>("admin-properties", params)
}

export function fetchProperty(id: string) {
  return api.get<Property & { stats: { likes: number; passes: number } }>(
    "admin-properties",
    { id },
  )
}

export function updateProperty(id: string, updates: Record<string, unknown>) {
  return api.put<{ success: boolean }>("admin-properties", { id, updates })
}

export function deleteProperty(id: string) {
  return api.delete<{ success: boolean }>("admin-properties", { id })
}
