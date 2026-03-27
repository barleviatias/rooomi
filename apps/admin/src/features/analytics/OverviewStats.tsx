import { useQuery } from "@tanstack/react-query"
import { fetchOverview } from "@/lib/api/analytics"
import { StatCard } from "@/components/stats/StatCard"
import { Skeleton } from "@/components/ui/skeleton"

export function OverviewStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: fetchOverview,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard title="Total Users" value={data.total_users.toLocaleString()} description={`+${data.new_users_30d} last 30 days`} />
      <StatCard title="Properties" value={data.total_properties.toLocaleString()} />
      <StatCard title="Matches" value={data.total_matches.toLocaleString()} description={`+${data.new_matches_30d} last 30 days`} />
      <StatCard title="Pending Reports" value={data.pending_reports.toLocaleString()} />
    </div>
  )
}
