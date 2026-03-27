import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateUser } from "@/lib/api/users"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@roomi/ui"
import { Label } from "@roomi/ui"
import { Input } from "@roomi/ui"

interface BanUserDialogProps {
  userId: string
  userName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BanUserDialog({ userId, userName, open, onOpenChange }: BanUserDialogProps) {
  const [reason, setReason] = useState("")
  const queryClient = useQueryClient()

  const banMutation = useMutation({
    mutationFn: () =>
      updateUser(userId, {
        banned_at: new Date().toISOString(),
        ban_reason: reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] })
      queryClient.invalidateQueries({ queryKey: ["users"] })
      onOpenChange(false)
      setReason("")
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            This will ban <span className="font-medium">{userName}</span> from using Roomi. They will not be able to access the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reason">Ban Reason</Label>
          <Input
            id="reason"
            placeholder="Enter reason for ban..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => banMutation.mutate()} disabled={!reason || banMutation.isPending}>
            Ban User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
