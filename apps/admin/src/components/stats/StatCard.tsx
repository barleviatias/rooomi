import { Card, CardContent, CardHeader, CardTitle } from "@roomi/ui"
import { cn } from "@roomi/ui"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  className?: string
}

export function StatCard({ title, value, description, className }: StatCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  )
}
