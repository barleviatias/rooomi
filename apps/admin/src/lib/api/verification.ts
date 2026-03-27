import { api } from "./client"
import type { PaginatedResponse, Profile } from "@roomi/types"

export function fetchVerificationQueue(page = 1, limit = 20) {
  return api.get<PaginatedResponse<Profile>>("admin-verification", {
    page: String(page),
    limit: String(limit),
  })
}

export function approveUser(id: string) {
  return api.put<{ success: boolean }>("admin-verification", {
    id,
    action: "approve",
  })
}

export function rejectUser(id: string) {
  return api.put<{ success: boolean }>("admin-verification", {
    id,
    action: "reject",
  })
}
