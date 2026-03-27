import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchVerificationQueue, approveUser, rejectUser } from "@/lib/api/verification"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@roomi/ui"
import { Button } from "@roomi/ui"
import { Card, CardContent } from "@roomi/ui"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import type { Profile } from "@roomi/types"

export function VerificationQueue() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["verification", page],
    queryFn: () => fetchVerificationQueue(page),
  })

  const approveMutation = useMutation({
    mutationFn: approveUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["verification"] }),
  })

  const rejectMutation = useMutation({
    mutationFn: rejectUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["verification"] }),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  const users = data?.data || []

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No users pending verification
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {users.map((user: Profile) => (
        <Card key={user.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>{user.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{user.full_name}</p>
                    {user.is_seeker && <Badge variant="secondary">Seeker</Badge>}
                    {user.is_host && <Badge variant="outline">Host</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined {format(new Date(user.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => rejectMutation.mutate(user.id)}
                  disabled={rejectMutation.isPending}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => approveMutation.mutate(user.id)}
                  disabled={approveMutation.isPending}
                >
                  Approve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {(data?.total || 0) > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page * 20 >= (data?.total || 0)}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
