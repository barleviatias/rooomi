import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { resolveReport } from "@/lib/api/reports"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@roomi/ui"
import type { Report } from "@roomi/types"

interface ResolveReportDialogProps {
  report: Report | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResolveReportDialog({ report, open, onOpenChange }: ResolveReportDialogProps) {
  const [notes, setNotes] = useState("")
  const [action, setAction] = useState("dismiss")
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => {
      if (!report) throw new Error("No report")
      const status = action === "dismiss" ? "dismissed" : "resolved"
      return resolveReport(report.id, status, notes, action)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      onOpenChange(false)
      setNotes("")
      setAction("dismiss")
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Report</DialogTitle>
          <DialogDescription>
            {report?.reason}: {report?.description || "No description"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dismiss">Dismiss Report</SelectItem>
                <SelectItem value="warn">Warn User</SelectItem>
                <SelectItem value="ban">Ban User</SelectItem>
                <SelectItem value="remove_property">Remove Property</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Resolution notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {action === "dismiss" ? "Dismiss" : "Resolve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
