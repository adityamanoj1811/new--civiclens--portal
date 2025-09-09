"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockIssues, type Issue } from "@/lib/mock-data"
import {
  Users,
  Search,
  Filter,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MapPin,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TeamMember {
  id: string
  name: string
  email: string
  department: string
  role: string
  avatar?: string
  status: "active" | "busy" | "offline"
  totalTasks: number
  pendingTasks: number
  inProgressTasks: number
  completedTasks: number
  avgResolutionTime: string
  joinDate: string
}

interface TeamStats {
  totalMembers: number
  activeMembers: number
  totalTasks: number
  completedTasks: number
  avgResolutionTime: string
  departmentBreakdown: { [key: string]: number }
}

export function AdminTeamPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [showMemberDetails, setShowMemberDetails] = useState(false)

  // Mock team members data - in production this would come from API
  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "Mike Wilson",
      email: "mike.wilson@civiclens.com",
      department: "Public Works",
      role: "Senior Technician",
      status: "active",
      totalTasks: 24,
      pendingTasks: 3,
      inProgressTasks: 2,
      completedTasks: 19,
      avgResolutionTime: "2.1 days",
      joinDate: "2023-03-15",
    },
    {
      id: "2",
      name: "Sarah Thompson",
      email: "sarah.thompson@civiclens.com",
      department: "Public Works",
      role: "Field Coordinator",
      status: "busy",
      totalTasks: 18,
      pendingTasks: 1,
      inProgressTasks: 3,
      completedTasks: 14,
      avgResolutionTime: "1.8 days",
      joinDate: "2023-01-20",
    },
    {
      id: "3",
      name: "Lisa Chen",
      email: "lisa.chen@civiclens.com",
      department: "Sanitation Dept",
      role: "Sanitation Supervisor",
      status: "active",
      totalTasks: 31,
      pendingTasks: 4,
      inProgressTasks: 1,
      completedTasks: 26,
      avgResolutionTime: "1.5 days",
      joinDate: "2022-11-10",
    },
    {
      id: "4",
      name: "Robert Martinez",
      email: "robert.martinez@civiclens.com",
      department: "Sanitation Dept",
      role: "Collection Specialist",
      status: "active",
      totalTasks: 22,
      pendingTasks: 2,
      inProgressTasks: 2,
      completedTasks: 18,
      avgResolutionTime: "2.3 days",
      joinDate: "2023-05-08",
    },
    {
      id: "5",
      name: "Tom Rodriguez",
      email: "tom.rodriguez@civiclens.com",
      department: "Water Department",
      role: "Water Systems Engineer",
      status: "busy",
      totalTasks: 16,
      pendingTasks: 1,
      inProgressTasks: 4,
      completedTasks: 11,
      avgResolutionTime: "3.2 days",
      joinDate: "2023-02-14",
    },
    {
      id: "6",
      name: "Maria Garcia",
      email: "maria.garcia@civiclens.com",
      department: "Water Department",
      role: "Maintenance Technician",
      status: "offline",
      totalTasks: 13,
      pendingTasks: 0,
      inProgressTasks: 1,
      completedTasks: 12,
      avgResolutionTime: "2.7 days",
      joinDate: "2023-07-22",
    },
  ]

  const departments = ["Public Works", "Sanitation Dept", "Water Department"]

  // Calculate team stats
  const teamStats: TeamStats = {
    totalMembers: teamMembers.length,
    activeMembers: teamMembers.filter((m) => m.status === "active").length,
    totalTasks: teamMembers.reduce((sum, member) => sum + member.totalTasks, 0),
    completedTasks: teamMembers.reduce((sum, member) => sum + member.completedTasks, 0),
    avgResolutionTime: "2.3 days",
    departmentBreakdown: departments.reduce(
      (acc, dept) => {
        acc[dept] = teamMembers.filter((m) => m.department === dept).length
        return acc
      },
      {} as { [key: string]: number },
    ),
  }

  // Filter team members
  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === "all" || member.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "busy":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "offline":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "busy":
        return "bg-orange-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getMemberTasks = (memberName: string): Issue[] => {
    return mockIssues.filter((issue) => issue.assignedTo === memberName)
  }

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member)
    setShowMemberDetails(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-balance">Team Management</h1>
          <p className="text-gray-600 text-pretty">Manage team members, assignments, and performance metrics</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Team Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 rounded-2xl p-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Members</p>
                <p className="text-3xl font-bold text-gray-900">{teamStats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 rounded-2xl p-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Active Members</p>
                <p className="text-3xl font-bold text-gray-900">{teamStats.activeMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 rounded-2xl p-4">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{teamStats.totalTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 rounded-2xl p-4">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Avg Resolution</p>
                <p className="text-3xl font-bold text-gray-900">{teamStats.avgResolutionTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <div className="bg-blue-50 rounded-lg p-2">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            Filter Team Members
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-gray-200"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-64 rounded-xl border-gray-200">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept} ({teamStats.departmentBreakdown[dept]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card
            key={member.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleMemberClick(member)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                      getStatusIcon(member.status),
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{member.role}</p>
                  <Badge className={cn("text-xs mt-1", getStatusColor(member.status))}>{member.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Department</span>
                  <span className="font-medium text-gray-900">{member.department}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Tasks</span>
                  <span className="font-medium text-gray-900">{member.totalTasks}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-semibold text-yellow-600">{member.pendingTasks}</div>
                    <div className="text-gray-500">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{member.inProgressTasks}</div>
                    <div className="text-gray-500">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{member.completedTasks}</div>
                    <div className="text-gray-500">Completed</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Avg Resolution</span>
                  <span className="font-medium text-gray-900">{member.avgResolutionTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
            <p className="text-gray-500 text-center">Try adjusting your search criteria or department filter.</p>
          </CardContent>
        </Card>
      )}

      {/* Member Details Modal */}
      <Dialog open={showMemberDetails} onOpenChange={setShowMemberDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                  {selectedMember?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {selectedMember?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedMember?.role} • {selectedMember?.department}
            </DialogDescription>
          </DialogHeader>

          {selectedMember && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedMember.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedMember.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Joined {new Date(selectedMember.joinDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Current Status</h3>
                    <div className="space-y-2">
                      <Badge className={cn("text-sm", getStatusColor(selectedMember.status))}>
                        {selectedMember.status}
                      </Badge>
                      <div className="text-sm text-gray-600">
                        Currently has {selectedMember.pendingTasks + selectedMember.inProgressTasks} active tasks
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4 mt-6">
                <div className="space-y-4">
                  {getMemberTasks(selectedMember.name).map((task) => (
                    <Card key={task.id} className="rounded-xl">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                            <p className="text-sm text-gray-600">{task.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Reported: {new Date(task.reportedAt).toLocaleDateString()}</span>
                              <span>Priority: {task.priority}</span>
                            </div>
                          </div>
                          <Badge
                            className={cn(
                              "text-xs",
                              task.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : task.status === "In-Progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800",
                            )}
                          >
                            {task.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {getMemberTasks(selectedMember.name).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No tasks currently assigned to this team member.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-lg">Task Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Tasks</span>
                          <span className="font-semibold">{selectedMember.totalTasks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Completion Rate</span>
                          <span className="font-semibold">
                            {Math.round((selectedMember.completedTasks / selectedMember.totalTasks) * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Resolution Time</span>
                          <span className="font-semibold">{selectedMember.avgResolutionTime}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-lg">Current Workload</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-yellow-600">Pending</span>
                          <span className="font-semibold">{selectedMember.pendingTasks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">In Progress</span>
                          <span className="font-semibold">{selectedMember.inProgressTasks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-600">Completed</span>
                          <span className="font-semibold">{selectedMember.completedTasks}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
