import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@roomi/ui"

interface TimeSeriesChartProps {
  title: string
  data: { date: string; count: number }[]
}

export function TimeSeriesChart({ title, data }: TimeSeriesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tickFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })}
            />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{ backgroundColor: "var(--popover)", border: "1px solid var(--border)", borderRadius: "8px" }}
              labelFormatter={(v) => new Date(v).toLocaleDateString()}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="oklch(0.59 0.22 1)"
              fill="oklch(0.59 0.22 1 / 0.2)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
