import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/DataTable"
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar"
import { Badge } from "@roomi/ui"
import { Button } from "@roomi/ui"
import { fetchProperties, updateProperty } from "@/lib/api/properties"
import type { Property } from "@roomi/types"
import { format } from "date-fns"

export function PropertiesTable() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})

  const { data, isLoading } = useQuery({
    queryKey: ["properties", page, search, filters],
    queryFn: () =>
      fetchProperties({
        page,
        limit: 20,
        search: search || undefined,
        status: filters.status !== "all" ? filters.status : undefined,
        featured: filters.featured !== "all" ? filters.featured : undefined,
      }),
  })

  const toggleFeatured = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      updateProperty(id, { is_featured: featured }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["properties"] }),
  })

  const statusBadge = (status: string) => {
    const variants: Record<string, "success" | "secondary" | "warning" | "destructive"> = {
      active: "success",
      paused: "warning",
      rented: "secondary",
      deleted: "destructive",
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  const columns: ColumnDef<Property>[] = useMemo(() => [
    {
      accessorKey: "title",
      header: "Property",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
          <div className="text-xs text-muted-foreground">{row.original.address_city}</div>
        </div>
      ),
    },
    {
      accessorKey: "host",
      header: "Host",
      cell: ({ row }) => (
        <span className="text-sm">{(row.original.host as { full_name: string } | undefined)?.full_name || "—"}</span>
      ),
    },
    {
      accessorKey: "price_monthly",
      header: "Price",
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.price_monthly?.toLocaleString()} /mo</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => statusBadge(row.original.status),
    },
    {
      accessorKey: "is_featured",
      header: "Featured",
      cell: ({ row }) => (
        <Button
          variant={row.original.is_featured ? "default" : "outline"}
          size="sm"
          onClick={() => toggleFeatured.mutate({ id: row.original.id, featured: !row.original.is_featured })}
        >
          {row.original.is_featured ? "Featured" : "Feature"}
        </Button>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => format(new Date(row.original.created_at), "MMM d, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/properties/${row.original.id}`)}>
          View
        </Button>
      ),
    },
  ], [navigate, toggleFeatured])

  return (
    <div className="space-y-4">
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        searchPlaceholder="Search properties..."
        filters={[
          { key: "status", label: "Status", options: [
            { label: "Active", value: "active" },
            { label: "Paused", value: "paused" },
            { label: "Rented", value: "rented" },
            { label: "Deleted", value: "deleted" },
          ]},
          { key: "featured", label: "Featured", options: [
            { label: "Featured", value: "true" },
            { label: "Not featured", value: "false" },
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
