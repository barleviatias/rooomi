import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchUser, updateUser } from "@/lib/api/users"
import { resetPendingMatches, resetDiscover } from "@/lib/api/matches"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@roomi/ui"
import { Button } from "@roomi/ui"
import { Card, CardContent, CardHeader, CardTitle } from "@roomi/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@roomi/ui"
import { Separator } from "@roomi/ui"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

interface UserDetailPanelProps {
  userId: string
  onBan: () => void
}

export function UserDetailPanel({ userId, onBan }: UserDetailPanelProps) {
  const queryClient = useQueryClient()
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [discoverDialogOpen, setDiscoverDialogOpen] = useState(false)

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  })

  const verifyMutation = useMutation({
    mutationFn: () => updateUser(userId, { is_verified: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", userId] }),
  })

  const unbanMutation = useMutation({
    mutationFn: () => updateUser(userId, { banned_at: null, ban_reason: null }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", userId] }),
  })

  const resetPendingMutation = useMutation({
    mutationFn: () => resetPendingMatches(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] })
      queryClient.invalidateQueries({ queryKey: ["matches"] })
      setResetDialogOpen(false)
    },
  })

  const resetDiscoverMutation = useMutation({
    mutationFn: () => resetDiscover(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] })
      queryClient.invalidateQueries({ queryKey: ["matches"] })
      setDiscoverDialogOpen(false)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!user) return <p className="text-muted-foreground">User not found</p>

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="text-lg">{user.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{user.full_name}</h2>
                {user.is_verified && <Badge variant="success">Verified</Badge>}
                {user.banned_at && <Badge variant="destructive">Banned</Badge>}
                {user.is_admin && <Badge>Admin</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Joined {format(new Date(user.created_at), "MMMM d, yyyy")}
              </p>
            </div>
            <div className="flex gap-2">
              {user.is_seeker && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDiscoverDialogOpen(true)}
                  >
                    Reset Discover
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setResetDialogOpen(true)}
                  >
                    Reset Pending Matches
                  </Button>
                </>
              )}
              {!user.is_verified && (
                <Button size="sm" onClick={() => verifyMutation.mutate()} disabled={verifyMutation.isPending}>
                  Verify
                </Button>
              )}
              {user.banned_at ? (
                <Button size="sm" variant="outline" onClick={() => unbanMutation.mutate()} disabled={unbanMutation.isPending}>
                  Unban
                </Button>
              ) : (
                <Button size="sm" variant="destructive" onClick={onBan}>
                  Ban
                </Button>
              )}
            </div>
          </div>
          {user.banned_at && user.ban_reason && (
            <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm">
              <p className="font-medium text-destructive">Ban reason:</p>
              <p className="text-muted-foreground">{user.ban_reason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="properties">Properties ({(user.properties as unknown[])?.length || 0})</TabsTrigger>
          <TabsTrigger value="matches">Recent Matches</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Profile Info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Gender" value={user.gender || "Not set"} />
              <InfoRow label="Date of Birth" value={user.date_of_birth || "Not set"} />
              <InfoRow label="Phone" value={user.phone || "Not set"} />
              <InfoRow label="City" value={user.preferred_city || "Not set"} />
              <InfoRow label="Language" value={user.preferred_language} />
              <InfoRow label="Roles" value={[user.is_seeker && "Seeker", user.is_host && "Host"].filter(Boolean).join(", ")} />
              <Separator />
              <InfoRow label="Bio" value={user.bio || "No bio"} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="properties">
          <Card>
            <CardContent className="pt-6">
              {(user.properties as { id: string; title: string; status: string; address_city: string }[])?.length ? (
                <div className="space-y-2">
                  {(user.properties as { id: string; title: string; status: string; address_city: string }[]).map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.address_city}</p>
                      </div>
                      <Badge variant="secondary">{p.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No properties</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="matches">
          <Card>
            <CardContent className="pt-6">
              {(user.recent_matches as { id: string; status: string; created_at: string }[])?.length ? (
                <div className="space-y-2">
                  {(user.recent_matches as { id: string; status: string; created_at: string }[]).map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-md border p-3">
                      <p className="text-sm font-mono">{m.id.slice(0, 8)}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{m.status}</Badge>
                        <span className="text-xs text-muted-foreground">{format(new Date(m.created_at), "MMM d")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No matches</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Pending Matches</DialogTitle>
            <DialogDescription>
              This will delete all pending matches where <span className="font-medium">{user?.full_name}</span> is the seeker. Their swipes will be removed and they will be able to swipe on those properties again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => resetPendingMutation.mutate()}
              disabled={resetPendingMutation.isPending}
            >
              {resetPendingMutation.isPending ? "Resetting..." : "Reset All Pending"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={discoverDialogOpen} onOpenChange={setDiscoverDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Discover Feed</DialogTitle>
            <DialogDescription>
              This will delete all interactions (likes and passes) and pending matches for <span className="font-medium">{user?.full_name}</span>. All properties will reappear in their discover feed. Existing matched conversations will not be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscoverDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => resetDiscoverMutation.mutate()}
              disabled={resetDiscoverMutation.isPending}
            >
              {resetDiscoverMutation.isPending ? "Resetting..." : "Reset Discover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}
