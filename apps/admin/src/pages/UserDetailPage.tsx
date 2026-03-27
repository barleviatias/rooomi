import { useState } from "react"
import { useParams, useNavigate } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { UserDetailPanel } from "@/features/users/UserDetailPanel"
import { BanUserDialog } from "@/features/users/BanUserDialog"
import { Button } from "@roomi/ui"
import { fetchUser } from "@/lib/api/users"

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [banDialogOpen, setBanDialogOpen] = useState(false)

  const { data: user } = useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id!),
    enabled: !!id,
  })

  if (!id) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/users")}>
          Back
        </Button>
        <h1 className="text-2xl font-bold">User Detail</h1>
      </div>
      <UserDetailPanel userId={id} onBan={() => setBanDialogOpen(true)} />
      <BanUserDialog
        userId={id}
        userName={user?.full_name || ""}
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
      />
    </div>
  )
}
