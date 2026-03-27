import { useQuery } from "@tanstack/react-query"
import { OverviewStats } from "@/features/analytics/OverviewStats"
import { TimeSeriesChart } from "@/components/stats/TimeSeriesChart"
import { PropertyStatusChart, MatchFunnelChart } from "@/features/analytics/Charts"
import { fetchSignups } from "@/lib/api/analytics"

export function DashboardPage() {
  const { data: signups } = useQuery({
    queryKey: ["analytics", "signups"],
    queryFn: () => fetchSignups(30),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <OverviewStats />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TimeSeriesChart title="New Signups (30 days)" data={signups || []} />
        <MatchFunnelChart />
      </div>
      <PropertyStatusChart />
    </div>
  )
}
