import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/DataTable"
import { Badge } from "@roomi/ui"
import { api } from "@/lib/api/client"
import type { AuditLogEntry, PaginatedResponse } from "@roomi/types"
import { format } from "date-fns"

function fetchAuditLog(page: number) {
  return api.get<PaginatedResponse<AuditLogEntry>>("admin-users", {
    audit: "true",
    page: String(page),
    limit: "30",
  })
}

export function AuditLogPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["audit-log", page],
    queryFn: () => fetchAuditLog(page),
  })

  const columns: ColumnDef<AuditLogEntry>[] = [
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => <Badge variant="outline">{row.original.action}</Badge>,
    },
    {
      accessorKey: "target_table",
      header: "Target",
      cell: ({ row }) => (
        <div className="text-sm">
          <span className="font-medium">{row.original.target_table}</span>
          {row.original.target_id && (
            <span className="text-muted-foreground ml-1 font-mono text-xs">
              {row.original.target_id.slice(0, 8)}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => {
        const details = row.original.details
        if (!details || Object.keys(details).length === 0) return "—"
        return (
          <pre className="text-xs text-muted-foreground max-w-xs truncate">
            {JSON.stringify(details)}
          </pre>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Time",
      cell: ({ row }) => format(new Date(row.original.created_at), "MMM d, yyyy HH:mm"),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Log</h1>
      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.total || 0}
        page={page}
        pageSize={30}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  )
}
