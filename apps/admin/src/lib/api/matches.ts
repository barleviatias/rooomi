import { api } from "./client"
import type { PaginatedResponse, Match } from "@roomi/types"

export interface MatchFilters {
  page?: number
  limit?: number
  status?: string
}

export function fetchMatches(filters: MatchFilters) {
  const params: Record<string, string> = {}
  if (filters.page) params.page = String(filters.page)
  if (filters.limit) params.limit = String(filters.limit)
  if (filters.status) params.status = filters.status
  return api.get<PaginatedResponse<Match>>("admin-matches", params)
}

export function forceUnmatch(id: string) {
  return api.put<{ success: boolean }>("admin-matches", { id, action: "unmatch" })
}

export function deletePendingMatch(id: string) {
  return api.put<{ success: boolean }>("admin-matches", { id, action: "delete_pending" })
}

export function resetPendingMatches(seekerId: string) {
  return api.put<{ success: boolean; deleted_count: number }>("admin-matches", {
    seeker_id: seekerId,
    action: "reset_pending",
  })
}

export function resetDiscover(seekerId: string) {
  return api.put<{ success: boolean; deleted_interactions: number; deleted_matches: number }>("admin-matches", {
    seeker_id: seekerId,
    action: "reset_discover",
  })
}

export function fetchConversation(id: string, page = 1) {
  return api.get<{
    conversation: unknown
    messages: unknown[]
    total_messages: number
    page: number
    limit: number
  }>("admin-conversations", { id, page: String(page) })
}
