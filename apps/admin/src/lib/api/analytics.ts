import { api } from "./client"
import type { AnalyticsOverview, TimeSeriesPoint, MatchFunnel } from "@roomi/types"

export function fetchOverview() {
  return api.get<AnalyticsOverview>("admin-analytics", { type: "overview" })
}

export function fetchSignups(days = 30) {
  return api.get<TimeSeriesPoint[]>("admin-analytics", {
    type: "signups",
    days: String(days),
  })
}

export function fetchPropertyStatus() {
  return api.get<Record<string, number>>("admin-analytics", {
    type: "property_status",
  })
}

export function fetchMatchFunnel() {
  return api.get<MatchFunnel>("admin-analytics", { type: "match_funnel" })
}
