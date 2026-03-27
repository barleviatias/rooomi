import { api } from "./client"
import type { PaginatedResponse, Profile } from "@roomi/types"

export interface UserFilters {
  page?: number
  limit?: number
  search?: string
  verified?: string
  banned?: string
  role?: string
}

export function fetchUsers(filters: UserFilters) {
  const params: Record<string, string> = {}
  if (filters.page) params.page = String(filters.page)
  if (filters.limit) params.limit = String(filters.limit)
  if (filters.search) params.search = filters.search
  if (filters.verified) params.verified = filters.verified
  if (filters.banned) params.banned = filters.banned
  if (filters.role) params.role = filters.role
  return api.get<PaginatedResponse<Profile>>("admin-users", params)
}

export function fetchUser(id: string) {
  return api.get<Profile & { lifestyle: unknown; properties: unknown[]; recent_matches: unknown[] }>(
    "admin-users",
    { id },
  )
}

export function updateUser(id: string, updates: Record<string, unknown>) {
  return api.put<{ success: boolean }>("admin-users", { id, updates })
}

export function deleteUser(id: string) {
  return api.delete<{ success: boolean }>("admin-users", { id })
}
