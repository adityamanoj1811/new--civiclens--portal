"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssignmentDialog } from "@/components/assignment-dialog"
import { IssueLifecycleTimeline } from "@/components/issue-lifecycle-timeline" // Added timeline import
import { AdminOnly } from "@/components/role-guard"
import { useAuth } from "@/contexts/auth-context"
import type { Issue } from "@/lib/mock-data"
import { Search, Eye, UserPlus, MapPin, Calendar, User, AlertTriangle, Shield } from "lucide-react"

interface IssuesTableProps {
  issues: Issue[]
  activeView: string
}

export function IssuesTable({ issues, activeView }: IssuesTableProps) {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("reportedAt")
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [assignmentIssue, setAssignmentIssue] = useState<Issue | null>(null)
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false)
  const [localFilteredIssues, setLocalFilteredIssues] = useState<Issue[]>([])

  useEffect(() => {
    const filtered = issues.filter((issue) => {
      // Role-based filtering
      if (user?.role === "Department Officer" && user.department) {
        if (issue.department !== user.department) return false
      }

      // Status filtering
      if (activeView !== "all" && activeView !== "analytics") {
        const statusMap = {
          pending: "Pending",
          "in-progress": "In-Progress",
          resolved: "Resolved",
        }
        if (issue.status !== statusMap[activeView as keyof typeof statusMap]) return false
      }

      // Search filtering
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          issue.title.toLowerCase().includes(searchLower) ||
          issue.department.toLowerCase().includes(searchLower) ||
          issue.id.toLowerCase().includes(searchLower) ||
          issue.reportedBy.toLowerCase().includes(searchLower)
        )
      }

      return true
    })

    setLocalFilteredIssues(filtered)
  }, [issues, activeView, user, searchTerm])

  // Sort issues
  const sortedIssues = [...localFilteredIssues].sort((a, b) => {
    if (sortBy === "reportedAt") {
      return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
    }
    if (sortBy === "priority") {
      const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    return a[sortBy as keyof Issue]?.toString().localeCompare(b[sortBy as keyof Issue]?.toString() || "") || 0
  })

  const getStatusBadgeVariant = (status: Issue["status"]) => {
    switch (status) {
      case "Pending":
        return "destructive"
      case "In-Progress":
        return "default"
      case "Resolved":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getSLABadgeVariant = (sla: string) => {
    if (sla === "Overdue") return "destructive"
    if (sla === "Closed") return "secondary"
    if (sla.includes("left")) return "default"
    return "outline"
  }

  const getPriorityBadgeVariant = (priority: Issue["priority"]) => {
    switch (priority) {
      case "Critical":
        return "destructive"
      case "High":
        return "default"
      case "Medium":
        return "secondary"
      case "Low":
        return "outline"
      default:
        return "outline"
    }
  }

  const handleAssignIssue = (issue: Issue) => {
    setAssignmentIssue(issue)
    setIsAssignmentDialogOpen(true)
  }

  const handleAssignmentComplete = (issueId: string, assignedTo: string, priority: Issue["priority"]) => {
    // In a real app, this would make an API call to update the issue
    console.log("Issue assigned:", { issueId, assignedTo, priority })
    // For demo purposes, show success message
    alert(`Issue ${issueId} has been assigned to ${assignedTo} with ${priority} priority`)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Issues ({localFilteredIssues.length})</span>
              {user?.role === "Department Officer" && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  {user.department} Only
                </Badge>
              )}
              {user?.role === "Admin" && (
                <Badge variant="secondary" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  All Departments
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reportedAt">Latest</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedIssues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No issues found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedIssues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-mono text-sm">{issue.id}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate font-medium">{issue.title}</div>
                        <div className="text-sm text-muted-foreground truncate">{issue.description}</div>
                      </TableCell>
                      <TableCell>{issue.department}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(issue.status)}>{issue.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityBadgeVariant(issue.priority)}>{issue.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSLABadgeVariant(issue.sla)}>{issue.sla}</Badge>
                      </TableCell>
                      <TableCell>{issue.reportedBy}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedIssue(issue)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Issue Details - {selectedIssue?.id}</DialogTitle>
                              </DialogHeader>
                              {selectedIssue && (
                                <Tabs defaultValue="details" className="w-full">
                                  <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="details">Issue Details</TabsTrigger>
                                    <TabsTrigger value="timeline">Lifecycle Timeline</TabsTrigger>
                                  </TabsList>

                                  <TabsContent value="details" className="space-y-4 mt-6">
                                    <div>
                                      <h3 className="font-semibold text-lg text-balance">{selectedIssue.title}</h3>
                                      <p className="text-muted-foreground text-pretty">{selectedIssue.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <AlertTriangle className="h-4 w-4" />
                                          <span className="text-sm font-medium">Priority:</span>
                                          <Badge variant={getPriorityBadgeVariant(selectedIssue.priority)}>
                                            {selectedIssue.priority}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <User className="h-4 w-4" />
                                          <span className="text-sm font-medium">Reported by:</span>
                                          <span className="text-sm">{selectedIssue.reportedBy}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-4 w-4" />
                                          <span className="text-sm font-medium">Reported:</span>
                                          <span className="text-sm">
                                            {new Date(selectedIssue.reportedAt).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <MapPin className="h-4 w-4" />
                                          <span className="text-sm font-medium">Location:</span>
                                          <span className="text-sm">
                                            {selectedIssue.lat.toFixed(4)}, {selectedIssue.lng.toFixed(4)}
                                          </span>
                                        </div>
                                        {selectedIssue.assignedTo && (
                                          <div className="flex items-center gap-2">
                                            <UserPlus className="h-4 w-4" />
                                            <span className="text-sm font-medium">Assigned to:</span>
                                            <span className="text-sm">{selectedIssue.assignedTo}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="timeline" className="mt-6">
                                    <IssueLifecycleTimeline lifecycle={selectedIssue.lifecycle} />
                                  </TabsContent>
                                </Tabs>
                              )}
                            </DialogContent>
                          </Dialog>

                          {issue.status === "Pending" && (
                            <AdminOnly showMessage={false}>
                              <Button variant="default" size="sm" onClick={() => handleAssignIssue(issue)}>
                                <UserPlus className="h-4 w-4 mr-1" />
                                Assign
                              </Button>
                            </AdminOnly>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AssignmentDialog
        issue={assignmentIssue}
        isOpen={isAssignmentDialogOpen}
        onClose={() => {
          setIsAssignmentDialogOpen(false)
          setAssignmentIssue(null)
        }}
        onAssign={handleAssignmentComplete}
      />
    </>
  )
}
