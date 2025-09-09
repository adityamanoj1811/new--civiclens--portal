import type { Issue } from "./mock-data"

export interface TeamMemberKPI {
  totalTasks: number
  pendingTasks: number
  inProgressTasks: number
  completedTasks: number
  overdueCount: number
  avgResolutionTime: string
}

export interface TeamMemberTask extends Issue {
  dueDate: string
  estimatedHours: number
  actualHours?: number
}

// Mock team member data - in production this would come from API
export const getTeamMemberTasks = (memberEmail: string): TeamMemberTask[] => {
  // Filter issues assigned to the current team member and add task-specific fields
  const memberTasks: TeamMemberTask[] = [
    {
      id: "TSK-001",
      title: "Fix broken streetlight on Main Street",
      department: "Public Works",
      status: "In-Progress",
      sla: "2h left",
      lat: 23.6345,
      lng: 85.3803,
      description: "Replace faulty bulb and check electrical connections for streetlight pole #45",
      reportedBy: "John Smith",
      reportedAt: "2024-01-15T10:30:00Z",
      assignedTo: "Team Member",
      priority: "High",
      dueDate: "2024-01-16T18:00:00Z",
      estimatedHours: 2,
      actualHours: 1.5,
      lifecycle: [
        { step: "Reported", status: "completed", timestamp: "2024-01-15T10:30:00Z" },
        { step: "Acknowledged", status: "completed", timestamp: "2024-01-15T11:00:00Z" },
        { step: "Assigned", status: "completed", timestamp: "2024-01-15T11:30:00Z", assignedTo: "Team Member" },
        { step: "Resolved", status: "current" },
        { step: "Citizen Verified", status: "pending" },
      ],
    },
    {
      id: "TSK-002",
      title: "Clean blocked storm drain on Oak Avenue",
      department: "Public Works",
      status: "Pending",
      sla: "4h left",
      lat: 23.3441,
      lng: 85.3096,
      description: "Remove debris and leaves blocking storm drain causing water accumulation",
      reportedBy: "Sarah Johnson",
      reportedAt: "2024-01-15T14:20:00Z",
      assignedTo: "Team Member",
      priority: "Medium",
      dueDate: "2024-01-17T12:00:00Z",
      estimatedHours: 1,
      lifecycle: [
        { step: "Reported", status: "completed", timestamp: "2024-01-15T14:20:00Z" },
        { step: "Acknowledged", status: "completed", timestamp: "2024-01-15T14:45:00Z" },
        { step: "Assigned", status: "completed", timestamp: "2024-01-15T15:00:00Z", assignedTo: "Team Member" },
        { step: "Resolved", status: "pending" },
        { step: "Citizen Verified", status: "pending" },
      ],
    },
    {
      id: "TSK-003",
      title: "Repair damaged sidewalk on Pine Street",
      department: "Public Works",
      status: "Pending",
      sla: "8h left",
      lat: 23.5041,
      lng: 85.4298,
      description: "Fix cracked concrete sidewalk section that poses safety hazard to pedestrians",
      reportedBy: "Robert Davis",
      reportedAt: "2024-01-14T08:15:00Z",
      assignedTo: "Team Member",
      priority: "High",
      dueDate: "2024-01-18T16:00:00Z",
      estimatedHours: 4,
      lifecycle: [
        { step: "Reported", status: "completed", timestamp: "2024-01-14T08:15:00Z" },
        { step: "Acknowledged", status: "completed", timestamp: "2024-01-14T08:30:00Z" },
        { step: "Assigned", status: "completed", timestamp: "2024-01-14T09:00:00Z", assignedTo: "Team Member" },
        { step: "Resolved", status: "pending" },
        { step: "Citizen Verified", status: "pending" },
      ],
    },
    {
      id: "TSK-004",
      title: "Install new park bench in Central Park",
      department: "Public Works",
      status: "Resolved",
      sla: "Closed",
      lat: 23.3739,
      lng: 85.3262,
      description: "Install replacement bench near playground area as requested by community",
      reportedBy: "Emily Brown",
      reportedAt: "2024-01-12T16:45:00Z",
      assignedTo: "Team Member",
      priority: "Low",
      dueDate: "2024-01-15T17:00:00Z",
      estimatedHours: 3,
      actualHours: 2.5,
      lifecycle: [
        { step: "Reported", status: "completed", timestamp: "2024-01-12T16:45:00Z" },
        { step: "Acknowledged", status: "completed", timestamp: "2024-01-12T17:00:00Z" },
        { step: "Assigned", status: "completed", timestamp: "2024-01-13T09:00:00Z", assignedTo: "Team Member" },
        {
          step: "Resolved",
          status: "completed",
          timestamp: "2024-01-15T15:30:00Z",
          notes: "Bench installed and secured",
        },
        { step: "Citizen Verified", status: "completed", timestamp: "2024-01-15T18:00:00Z" },
      ],
    },
    {
      id: "TSK-005",
      title: "Remove graffiti from community center",
      department: "Public Works",
      status: "Resolved",
      sla: "Closed",
      lat: 23.4241,
      lng: 85.3811,
      description: "Clean graffiti from exterior walls of community center building",
      reportedBy: "David Wilson",
      reportedAt: "2024-01-11T12:00:00Z",
      assignedTo: "Team Member",
      priority: "Medium",
      dueDate: "2024-01-14T16:00:00Z",
      estimatedHours: 2,
      actualHours: 1.5,
      lifecycle: [
        { step: "Reported", status: "completed", timestamp: "2024-01-11T12:00:00Z" },
        { step: "Acknowledged", status: "completed", timestamp: "2024-01-11T12:15:00Z" },
        { step: "Assigned", status: "completed", timestamp: "2024-01-11T13:00:00Z", assignedTo: "Team Member" },
        {
          step: "Resolved",
          status: "completed",
          timestamp: "2024-01-14T14:30:00Z",
          notes: "Graffiti removed, surface cleaned",
        },
        { step: "Citizen Verified", status: "completed", timestamp: "2024-01-14T16:00:00Z" },
      ],
    },
  ]

  return memberTasks
}

export const getTeamMemberKPIs = (memberEmail: string): TeamMemberKPI => {
  const tasks = getTeamMemberTasks(memberEmail)

  const totalTasks = tasks.length
  const pendingTasks = tasks.filter((task) => task.status === "Pending").length
  const inProgressTasks = tasks.filter((task) => task.status === "In-Progress").length
  const completedTasks = tasks.filter((task) => task.status === "Resolved").length

  // Calculate overdue tasks (simplified logic)
  const now = new Date()
  const overdueCount = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate)
    return task.status !== "Resolved" && dueDate < now
  }).length

  return {
    totalTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    overdueCount,
    avgResolutionTime: "2.3 days",
  }
}
