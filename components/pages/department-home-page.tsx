"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, ClipboardList, TrendingUp, Clock, CheckCircle, AlertTriangle, Target, Award } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { mockIssues } from "@/lib/mock-data"
import { LeafletServerWrapper } from "@/components/leaflet-server-wrapper"
import { MeetingSchedulerDialog } from "@/components/meeting-scheduler-dialog"
import { MeetingsWidget } from "@/components/meetings-widget"

// Mock department team data
const departmentTeam = [
  {
    id: 1,
    name: "Rajesh Kumar",
    role: "Senior Officer",
    avatar: "/member-avatar.png",
    tasksCompleted: 24,
    tasksTotal: 30,
    performance: 80,
  },
  {
    id: 2,
    name: "Priya Singh",
    role: "Field Inspector",
    avatar: "/member-avatar.png",
    tasksCompleted: 18,
    tasksTotal: 22,
    performance: 82,
  },
  {
    id: 3,
    name: "Amit Sharma",
    role: "Data Analyst",
    avatar: "/member-avatar.png",
    tasksCompleted: 15,
    tasksTotal: 20,
    performance: 75,
  },
  {
    id: 4,
    name: "Sunita Devi",
    role: "Community Liaison",
    avatar: "/member-avatar.png",
    tasksCompleted: 21,
    tasksTotal: 25,
    performance: 84,
  },
]

const recentActivities = [
  {
    id: 1,
    action: "Task completed",
    description: "Water supply issue resolved in Ranchi",
    time: "2 hours ago",
    type: "success",
  },
  {
    id: 2,
    action: "New assignment",
    description: "Road repair task assigned to Rajesh Kumar",
    time: "4 hours ago",
    type: "info",
  },
  { id: 3, action: "SLA breach", description: "Garbage collection task overdue", time: "6 hours ago", type: "warning" },
  {
    id: 4,
    action: "Team update",
    description: "Priya Singh submitted field report",
    time: "8 hours ago",
    type: "info",
  },
]

export function DepartmentHomePage() {
  const { user } = useAuth()
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false)

  // Filter issues by department (assuming user has department info)
  const departmentIssues = useMemo(() => {
    return mockIssues.filter((issue) => (user?.department ? issue.department === user.department : true))
  }, [user?.department])

  const filteredIssues = useMemo(() => {
    if (selectedFilter === "all") return departmentIssues
    return departmentIssues.filter((issue) => issue.status === selectedFilter)
  }, [departmentIssues, selectedFilter])

  // Calculate department KPIs
  const totalIssues = departmentIssues.length
  const pendingIssues = departmentIssues.filter((issue) => issue.status === "Reported").length
  const inProgressIssues = departmentIssues.filter((issue) => issue.status === "In Progress").length
  const resolvedIssues = departmentIssues.filter((issue) => issue.status === "Resolved").length
  const slaCompliance = Math.round((resolvedIssues / totalIssues) * 100) || 0

  // Team performance metrics
  const teamPerformance = Math.round(
    departmentTeam.reduce((acc, member) => acc + member.performance, 0) / departmentTeam.length,
  )
  const totalTeamTasks = departmentTeam.reduce((acc, member) => acc + member.tasksTotal, 0)
  const completedTeamTasks = departmentTeam.reduce((acc, member) => acc + member.tasksCompleted, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Department Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}! Here's your department overview.</p>
        </div>
        <div className="flex gap-2">
          <MeetingsWidget />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Issues</CardTitle>
            <ClipboardList className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalIssues}</div>
            <p className="text-xs text-gray-500 mt-1">Department wide</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Team Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{teamPerformance}%</div>
            <p className="text-xs text-gray-500 mt-1">Average team score</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">SLA Compliance</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{slaCompliance}%</div>
            <p className="text-xs text-gray-500 mt-1">On-time resolution</p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Team</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{departmentTeam.length}</div>
            <p className="text-xs text-gray-500 mt-1">Team members</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">Department Issues Map</CardTitle>
                <div className="flex gap-2">
                  {[
                    { key: "all", label: "All", count: totalIssues },
                    { key: "Reported", label: "Pending", count: pendingIssues },
                    { key: "In Progress", label: "In Progress", count: inProgressIssues },
                    { key: "Resolved", label: "Resolved", count: resolvedIssues },
                  ].map((filter) => (
                    <Button
                      key={filter.key}
                      variant={selectedFilter === filter.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter(filter.key)}
                      className="text-xs"
                    >
                      {filter.label} ({filter.count})
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] rounded-lg overflow-hidden">
                <LeafletServerWrapper issues={filteredIssues} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Performance */}
        <div className="space-y-6">
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Team Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {departmentTeam.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                      <span className="text-xs text-gray-500">{member.performance}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={member.performance} className="flex-1 h-2" />
                      <span className="text-xs text-gray-500">
                        {member.tasksCompleted}/{member.tasksTotal}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "success"
                        ? "bg-green-500"
                        : activity.type === "warning"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Tasks Completed</p>
                <p className="text-2xl font-bold text-blue-900">{completedTeamTasks}</p>
                <p className="text-xs text-blue-600">Out of {totalTeamTasks} total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl shadow-sm border border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Resolution Rate</p>
                <p className="text-2xl font-bold text-green-900">{Math.round((resolvedIssues / totalIssues) * 100)}%</p>
                <p className="text-xs text-green-600">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl shadow-sm border border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-600 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-700 font-medium">Urgent Issues</p>
                <p className="text-2xl font-bold text-orange-900">
                  {departmentIssues.filter((i) => i.priority === "High").length}
                </p>
                <p className="text-xs text-orange-600">Requires attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meeting Scheduler Dialog */}
      <MeetingSchedulerDialog open={showMeetingScheduler} onOpenChange={setShowMeetingScheduler} />
    </div>
  )
}
