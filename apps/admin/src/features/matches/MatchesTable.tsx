import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/DataTable"
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar"
import { Badge } from "@roomi/ui"
import { Button } from "@roomi/ui"
import { fetchMatches, forceUnmatch, deletePendingMatch } from "@/lib/api/matches"
import type { Match } from "@roomi/types"
import { format } from "date-fns"

interface MatchesTableProps {
  onViewConversation: (conversationId: string) => void
}

export function MatchesTable({ onViewConversation }: MatchesTableProps) {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})

  const { data, isLoading } = useQuery({
    queryKey: ["matches", page, filters],
    queryFn: () =>
      fetchMatches({
        page,
        limit: 20,
        status: filters.status !== "all" ? filters.status : undefined,
      }),
  })

  const unmatchMutation = useMutation({
    mutationFn: forceUnmatch,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["matches"] }),
  })

  const deletePendingMutation = useMutation({
    mutationFn: deletePendingMatch,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["matches"] }),
  })

  const statusBadge = (status: string) => {
    const variants: Record<string, "success" | "secondary" | "warning" | "destructive" | "outline"> = {
      matched: "success",
      pending: "warning",
      rejected: "secondary",
      expired: "outline",
      unmatched: "destructive",
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  const columns: ColumnDef<Match>[] = useMemo(() => [
    {
      accessorKey: "seeker",
      header: "Seeker",
      cell: ({ row }) => <span className="text-sm font-medium">{(row.original.seeker as { full_name: string } | undefined)?.full_name || "—"}</span>,
    },
    {
      accessorKey: "host",
      header: "Host",
      cell: ({ row }) => <span className="text-sm font-medium">{(row.original.host as { full_name: string } | undefined)?.full_name || "—"}</span>,
    },
    {
      accessorKey: "property",
      header: "Property",
      cell: ({ row }) => <span className="text-sm">{(row.original.property as { title: string } | undefined)?.title || "—"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => statusBadge(row.original.status),
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => format(new Date(row.original.created_at), "MMM d, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.conversation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewConversation((row.original.conversation as { id: string }).id)}
            >
              Chat
            </Button>
          )}
          {row.original.status === "matched" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => unmatchMutation.mutate(row.original.id)}
              disabled={unmatchMutation.isPending}
            >
              Unmatch
            </Button>
          )}
          {row.original.status === "pending" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => deletePendingMutation.mutate(row.original.id)}
              disabled={deletePendingMutation.isPending}
            >
              Undo
            </Button>
          )}
        </div>
      ),
    },
  ], [onViewConversation, unmatchMutation, deletePendingMutation])

  return (
    <div className="space-y-4">
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        searchPlaceholder="Search matches..."
        filters={[
          { key: "status", label: "Status", options: [
            { label: "Pending", value: "pending" },
            { label: "Matched", value: "matched" },
            { label: "Rejected", value: "rejected" },
            { label: "Expired", value: "expired" },
            { label: "Unmatched", value: "unmatched" },
          ]},
        ]}
        filterValues={filters}
        onFilterChange={(k, v) => { setFilters((p) => ({ ...p, [k]: v })); setPage(1) }}
        onReset={() => { setFilters({}); setSearch(""); setPage(1) }}
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
