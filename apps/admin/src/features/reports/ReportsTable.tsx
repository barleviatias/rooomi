import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/DataTable"
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar"
import { Badge } from "@roomi/ui"
import { Button } from "@roomi/ui"
import { fetchReports } from "@/lib/api/reports"
import type { Report } from "@roomi/types"
import { format } from "date-fns"

interface ReportsTableProps {
  onResolve: (report: Report) => void
}

export function ReportsTable({ onResolve }: ReportsTableProps) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({ status: "pending" })

  const { data, isLoading } = useQuery({
    queryKey: ["reports", page, filters],
    queryFn: () =>
      fetchReports({
        page,
        limit: 20,
        status: filters.status !== "all" ? filters.status : undefined,
      }),
  })

  const columns: ColumnDef<Report>[] = useMemo(() => [
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.reason}</div>
          {row.original.description && (
            <div className="text-xs text-muted-foreground truncate max-w-xs">{row.original.description}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "reporter",
      header: "Reporter",
      cell: ({ row }) => <span className="text-sm">{row.original.reporter?.full_name || "—"}</span>,
    },
    {
      accessorKey: "reported",
      header: "Reported",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.reported_profile?.full_name || row.original.reported_property?.title || "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const variants: Record<string, "warning" | "success" | "secondary"> = {
          pending: "warning",
          resolved: "success",
          dismissed: "secondary",
        }
        return <Badge variant={variants[row.original.status] || "secondary"}>{row.original.status}</Badge>
      },
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => format(new Date(row.original.created_at), "MMM d, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        row.original.status === "pending" && (
          <Button variant="outline" size="sm" onClick={() => onResolve(row.original)}>
            Resolve
          </Button>
        )
      ),
    },
  ], [onResolve])

  return (
    <div className="space-y-4">
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        searchPlaceholder="Search reports..."
        filters={[
          { key: "status", label: "Status", options: [
            { label: "Pending", value: "pending" },
            { label: "Resolved", value: "resolved" },
            { label: "Dismissed", value: "dismissed" },
          ]},
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => { setFilters((p) => ({ ...p, [k]: v })); setPage(1) }}
        onReset={() => { setFilters({ status: "pending" }); setSearch(""); setPage(1) }}
      />
      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.total || 0}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  )
}
