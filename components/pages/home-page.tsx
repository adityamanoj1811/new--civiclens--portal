"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LeafletServerWrapper } from "@/components/leaflet-server-wrapper"
import { IssuesTable } from "@/components/issues-table"
import { mockIssues } from "@/lib/mock-data"
import { MapPin, AlertTriangle, Clock, CheckCircle, Shield, Filter } from "lucide-react"

export function HomePage() {
  const { user } = useAuth()
  const [activeFilter, setActiveFilter] = useState("all")

  // Filter issues based on user role for counting
  const userIssues =
    user?.role === "Department Officer" && user.department
      ? mockIssues.filter((issue) => issue.department === user.department)
      : mockIssues

  const getFilteredIssues = () => {
    if (activeFilter === "all") return userIssues

    const statusMap = {
      pending: "Pending",
      "in-progress": "In-Progress",
      resolved: "Resolved",
    }

    return userIssues.filter((issue) => issue.status === statusMap[activeFilter as keyof typeof statusMap])
  }

  const filteredIssues = getFilteredIssues()

  const issuesCount = {
    total: userIssues.length,
    pending: userIssues.filter((issue) => issue.status === "Pending").length,
    inProgress: userIssues.filter((issue) => issue.status === "In-Progress").length,
    resolved: userIssues.filter((issue) => issue.status === "Resolved").length,
  }

  const slaPercentage = Math.round(
    (userIssues.filter((issue) => issue.sla !== "Overdue").length / userIssues.length) * 100,
  )

  const filterButtons = [
    { id: "all", label: "All", count: issuesCount.total },
    { id: "pending", label: "Pending", count: issuesCount.pending },
    { id: "in-progress", label: "In-Progress", count: issuesCount.inProgress },
    { id: "resolved", label: "Resolved", count: issuesCount.resolved },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground text-pretty">
              {user?.role === "Department Officer"
                ? `Showing issues for ${user.department}`
                : "Overview of all civic issues in the system"}
            </p>
            <Badge variant={user?.role === "Admin" ? "default" : "secondary"} className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              {user?.role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-professional">
          <CardContent className="card-professional-content">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-2xl p-3">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Issues</p>
                <p className="text-2xl font-bold">{issuesCount.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="card-professional-content">
            <div className="flex items-center gap-3">
              <div className="bg-destructive/10 rounded-2xl p-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Pending</p>
                <p className="text-2xl font-bold">{issuesCount.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="card-professional-content">
            <div className="flex items-center gap-3">
              <div className="bg-chart-4/10 rounded-2xl p-3">
                <Clock className="h-6 w-6 text-chart-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">In Progress</p>
                <p className="text-2xl font-bold">{issuesCount.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="card-professional-content">
            <div className="flex items-center gap-3">
              <div className="bg-chart-3/10 rounded-2xl p-3">
                <CheckCircle className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">SLA %</p>
                <p className="text-2xl font-bold">{slaPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                onClick={() => setActiveFilter(filter.id)}
                className="gap-2"
              >
                {filter.label}
                <Badge variant="secondary" className="text-xs">
                  {filter.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <LeafletServerWrapper issues={filteredIssues} />

      {/* Issues List */}
      <IssuesTable issues={mockIssues} activeView={activeFilter} />
    </div>
  )
}
