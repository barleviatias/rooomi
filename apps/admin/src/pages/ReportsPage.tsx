import { useState } from "react"
import { ReportsTable } from "@/features/reports/ReportsTable"
import { ResolveReportDialog } from "@/features/reports/ResolveReportDialog"
import type { Report } from "@roomi/types"

export function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <ReportsTable onResolve={setSelectedReport} />
      <ResolveReportDialog
        report={selectedReport}
        open={!!selectedReport}
        onOpenChange={(open) => { if (!open) setSelectedReport(null) }}
      />
    </div>
  )
}
