"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, PlayCircle, Calendar, User, Target } from "lucide-react"
import { getTeamMemberTasks, getTeamMemberKPIs, type TeamMemberTask, type TeamMemberKPI } from "@/lib/team-member-data"
import { cn } from "@/lib/utils"
import { MeetingsWidget } from "@/components/meetings-widget"

export function TeamMemberHomePage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<TeamMemberTask[]>([])
  const [kpis, setKPIs] = useState<TeamMemberKPI | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "in-progress" | "completed">("all")

  useEffect(() => {
    if (user?.email) {
      const memberTasks = getTeamMemberTasks(user.email)
      const memberKPIs = getTeamMemberKPIs(user.email)
      setTasks(memberTasks)
      setKPIs(memberKPIs)
    }
  }, [user?.email])

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true
    if (filter === "pending") return task.status === "Pending"
    if (filter === "in-progress") return task.status === "In-Progress"
    if (filter === "completed") return task.status === "Resolved"
    return true
  })

  const updateTaskStatus = (taskId: string, newStatus: "Pending" | "In-Progress" | "Resolved") => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))

    // Recalculate KPIs
    if (user?.email) {
      const updatedKPIs = getTeamMemberKPIs(user.email)
      setKPIs(updatedKPIs)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "In-Progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Resolved":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "Pending":
        return "In-Progress"
      case "In-Progress":
        return "Resolved"
      default:
        return currentStatus
    }
  }

  if (!kpis) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">My Tasks</h1>
          <p className="text-muted-foreground text-pretty">
            Welcome back, {user?.name || user?.email}! Here are your assigned tasks.
          </p>
        </div>
        <MeetingsWidget />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalTasks}</div>
            <p className="text-xs text-muted-foreground">All assigned tasks</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{kpis.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <PlayCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{kpis.inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpis.completedTasks}</div>
            <p className="text-xs text-muted-foreground">Successfully resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Task Filters */}
      <div className="flex gap-2">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
          All Tasks ({tasks.length})
        </Button>
        <Button variant={filter === "pending" ? "default" : "outline"} size="sm" onClick={() => setFilter("pending")}>
          Pending ({kpis.pendingTasks})
        </Button>
        <Button
          variant={filter === "in-progress" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("in-progress")}
        >
          In Progress ({kpis.inProgressTasks})
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed")}
        >
          Completed ({kpis.completedTasks})
        </Button>
      </div>

      {/* Task List */}
      <div className="grid gap-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="rounded-2xl">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <Badge className={cn("text-xs", getStatusColor(task.status))}>{task.status}</Badge>
                    <Badge className={cn("text-xs", getPriorityColor(task.priority))}>{task.priority}</Badge>
                  </div>
                  <CardDescription className="text-pretty">{task.description}</CardDescription>
                </div>
                {task.status !== "Resolved" && (
                  <Button
                    size="sm"
                    onClick={() => updateTaskStatus(task.id, getNextStatus(task.status) as any)}
                    className="shrink-0"
                  >
                    {task.status === "Pending" ? "Start Task" : "Mark Complete"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Reported by {task.reportedBy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Est. {task.estimatedHours}h</span>
                  {task.actualHours && <span>| Actual: {task.actualHours}h</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-muted-foreground text-center">
              {filter === "all"
                ? "You don't have any tasks assigned yet."
                : `No ${filter.replace("-", " ")} tasks at the moment.`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
