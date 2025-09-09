"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, AlertTriangle, Clock, CheckCircle, Shield } from "lucide-react"

interface DashboardHeaderProps {
  activeView: string
  issuesCount: {
    total: number
    pending: number
    inProgress: number
    resolved: number
  }
}

export function DashboardHeader({ activeView, issuesCount }: DashboardHeaderProps) {
  const { user } = useAuth()

  const getViewTitle = () => {
    switch (activeView) {
      case "all":
        return "All Issues"
      case "pending":
        return "Pending Issues"
      case "in-progress":
        return "In-Progress Issues"
      case "resolved":
        return "Resolved Issues"
      default:
        return "Dashboard"
    }
  }

  const getViewDescription = () => {
    if (user?.role === "Department Officer") {
      return `Showing issues for ${user.department}`
    }
    return "Overview of all civic issues in the system"
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">{getViewTitle()}</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground text-pretty">{getViewDescription()}</p>
            <Badge variant={user?.role === "Admin" ? "default" : "secondary"} className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              {user?.role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
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
              <div className="bg-chart-3/10 rounded-2xl p-3">
                <Clock className="h-6 w-6 text-chart-3" />
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
              <div className="bg-chart-2/10 rounded-2xl p-3">
                <CheckCircle className="h-6 w-6 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Resolved</p>
                <p className="text-2xl font-bold">{issuesCount.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
