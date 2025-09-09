"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import type { Issue } from "@/lib/mock-data"
import { UserPlus, CheckCircle } from "lucide-react"

interface AssignmentDialogProps {
  issue: Issue | null
  isOpen: boolean
  onClose: () => void
  onAssign: (issueId: string, assignedTo: string, priority: Issue["priority"]) => void
}

export function AssignmentDialog({ issue, isOpen, onClose, onAssign }: AssignmentDialogProps) {
  const { user } = useAuth()
  const [assignedTo, setAssignedTo] = useState("")
  const [priority, setPriority] = useState<Issue["priority"]>("Medium")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock staff members - in a real app, this would come from an API
  const staffMembers = {
    "Public Works": ["Mike Wilson", "Sarah Thompson", "David Chen"],
    "Sanitation Dept": ["Lisa Chen", "Robert Martinez", "Jennifer Kim"],
    "Water Department": ["Tom Rodriguez", "Maria Garcia", "James Miller"],
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!issue || !assignedTo) return

    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
      onAssign(issue.id, assignedTo, priority)
      onClose()
      setAssignedTo("")
      setPriority("Medium")
    } catch (error) {
      console.error("Assignment failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!issue) return null

  const availableStaff = staffMembers[issue.department as keyof typeof staffMembers] || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Issue
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Issue Details</Label>
            <div className="bg-muted p-3 rounded-lg space-y-1">
              <p className="font-medium text-sm">{issue.title}</p>
              <p className="text-xs text-muted-foreground">Department: {issue.department}</p>
              <p className="text-xs text-muted-foreground">Reported by: {issue.reportedBy}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assign to Staff Member</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo} required>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {availableStaff.map((staff) => (
                  <SelectItem key={staff} value={staff}>
                    {staff}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as Issue["priority"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {user?.role !== "Admin" && (
            <Alert>
              <AlertDescription>Only administrators can assign issues to staff members.</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || user?.role !== "Admin"}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Assigning...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Assign Issue
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
