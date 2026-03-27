import { useQuery } from "@tanstack/react-query"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts"
import { fetchPropertyStatus, fetchMatchFunnel } from "@/lib/api/analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@roomi/ui"
import { Skeleton } from "@/components/ui/skeleton"

const COLORS = [
  "oklch(0.59 0.22 1)",
  "oklch(0.73 0.18 350)",
  "oklch(0.82 0.11 346)",
  "oklch(0.52 0.20 4)",
]

export function PropertyStatusChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "property_status"],
    queryFn: fetchPropertyStatus,
  })

  if (isLoading) return <Skeleton className="h-80" />

  const chartData = data
    ? Object.entries(data).map(([status, count]) => ({ status, count }))
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Property Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ status, count }) => `${status}: ${count}`}
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function MatchFunnelChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "match_funnel"],
    queryFn: fetchMatchFunnel,
  })

  if (isLoading) return <Skeleton className="h-80" />

  const chartData = data
    ? [
        { stage: "Likes", value: data.likes },
        { stage: "Pending", value: data.pending },
        { stage: "Matched", value: data.matched },
      ]
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Match Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="stage" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Bar dataKey="value" fill="oklch(0.59 0.22 1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
