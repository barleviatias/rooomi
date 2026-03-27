import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/DataTable"
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar"
import { Badge } from "@roomi/ui"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@roomi/ui"
import { fetchUsers } from "@/lib/api/users"
import type { Profile } from "@roomi/types"
import { format } from "date-fns"

export function UsersTable() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, search, filters],
    queryFn: () =>
      fetchUsers({
        page,
        limit: 20,
        search: search || undefined,
        verified: filters.verified !== "all" ? filters.verified : undefined,
        banned: filters.banned !== "all" ? filters.banned : undefined,
        role: filters.role !== "all" ? filters.role : undefined,
      }),
  })

  const columns: ColumnDef<Profile>[] = useMemo(() => [
    {
      accessorKey: "full_name",
      header: "User",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.avatar_url} />
            <AvatarFallback>{row.original.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.original.full_name}</div>
            <div className="text-xs text-muted-foreground">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.is_seeker && <Badge variant="secondary">Seeker</Badge>}
          {row.original.is_host && <Badge variant="outline">Host</Badge>}
        </div>
      ),
    },
    {
      accessorKey: "is_verified",
      header: "Status",
      cell: ({ row }) => {
        if (row.original.banned_at) return <Badge variant="destructive">Banned</Badge>
        if (row.original.is_verified) return <Badge variant="success">Verified</Badge>
        return <Badge variant="warning">Unverified</Badge>
      },
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) => format(new Date(row.original.created_at), "MMM d, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/users/${row.original.id}`)}>
          View
        </Button>
      ),
    },
  ], [navigate])

  return (
    <div className="space-y-4">
      <DataTableToolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        searchPlaceholder="Search users..."
        filters={[
          { key: "verified", label: "Verified", options: [{ label: "Verified", value: "true" }, { label: "Unverified", value: "false" }] },
          { key: "banned", label: "Banned", options: [{ label: "Banned", value: "true" }, { label: "Not banned", value: "false" }] },
          { key: "role", label: "Role", options: [{ label: "Seeker", value: "seeker" }, { label: "Host", value: "host" }] },
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
