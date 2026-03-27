import { api } from "./client"
import type { PaginatedResponse, Report } from "@roomi/types"

export interface ReportFilters {
  page?: number
  limit?: number
  status?: string
}

export function fetchReports(filters: ReportFilters) {
  const params: Record<string, string> = {}
  if (filters.page) params.page = String(filters.page)
  if (filters.limit) params.limit = String(filters.limit)
  if (filters.status) params.status = filters.status
  return api.get<PaginatedResponse<Report>>("admin-reports", params)
}

export function fetchReport(id: string) {
  return api.get<Report>("admin-reports", { id })
}

export function resolveReport(
  id: string,
  status: string,
  notes: string,
  action?: string,
) {
  return api.put<{ success: boolean }>("admin-reports", {
    id,
    status,
    notes,
    action,
  })
}
