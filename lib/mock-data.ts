export interface LifecycleStep {
  step: "Reported" | "Acknowledged" | "Assigned" | "Resolved" | "Citizen Verified"
  status: "completed" | "current" | "pending"
  timestamp?: string
  assignedTo?: string
  notes?: string
}

export interface Issue {
  id: string
  title: string
  department: string
  status: "Pending" | "In-Progress" | "Resolved"
  sla: string
  lat: number
  lng: number
  description: string
  reportedBy: string
  reportedAt: string
  assignedTo?: string
  priority: "Low" | "Medium" | "High" | "Critical"
  lifecycle: LifecycleStep[] // Added lifecycle tracking
}

export const mockIssues: Issue[] = [
  {
    id: "ISS-001",
    title: "Broken streetlight on Main Street",
    department: "Public Works",
    status: "Pending",
    sla: "Overdue",
    lat: 28.6139,
    lng: 77.209,
    description: "The streetlight at the intersection of Main St and 1st Ave has been out for 3 days",
    reportedBy: "John Smith",
    reportedAt: "2024-01-15T10:30:00Z",
    priority: "High",
    lifecycle: [
      { step: "Reported", status: "completed", timestamp: "2024-01-15T10:30:00Z" },
      { step: "Acknowledged", status: "current", timestamp: "2024-01-15T11:00:00Z" },
      { step: "Assigned", status: "pending" },
      { step: "Resolved", status: "pending" },
      { step: "Citizen Verified", status: "pending" },
    ],
  },
  {
    id: "ISS-002",
    title: "Large pothole on Oak Avenue",
    department: "Public Works",
    status: "In-Progress",
    sla: "2h left",
    lat: 19.076,
    lng: 72.8777,
    description: "Deep pothole causing vehicle damage near Oak Ave and 3rd Street",
    reportedBy: "Sarah Johnson",
    reportedAt: "2024-01-14T14:20:00Z",
    assignedTo: "Mike Wilson",
    priority: "Critical",
    lifecycle: [
      { step: "Reported", status: "completed", timestamp: "2024-01-14T14:20:00Z" },
      { step: "Acknowledged", status: "completed", timestamp: "2024-01-14T14:45:00Z" },
      { step: "Assigned", status: "completed", timestamp: "2024-01-14T15:30:00Z", assignedTo: "Mike Wilson" },
      { step: "Resolved", status: "current" },
      { step: "Citizen Verified", status: "pending" },
    ],
  },
  {
    id: "ISS-003",
    title: "Missed garbage collection on Elm Street",
    department: "Sanitation Dept",
    status: "Resolved",
    sla: "Closed",
    lat: 12.9716,
    lng: 77.5946,
    description: "Garbage was not collected on scheduled pickup day",
    reportedBy: "Robert Davis",
    reportedAt: "2024-01-13T08:15:00Z",
    assignedTo: "Lisa Chen",
    priority: "Medium",
    lifecycle: [
      { step: "Reported", status: "completed", timestamp: "2024-01-13T08:15:00Z" },
      { step: "Acknowledged", status: "completed", timestamp: "2024-01-13T08:30:00Z" },
      { step: "Assigned", status: "completed", timestamp: "2024-01-13T09:00:00Z", assignedTo: "Lisa Chen" },
      { step: "Resolved", status: "completed", timestamp: "2024-01-13T14:30:00Z", notes: "Collection completed" },
      { step: "Citizen Verified", status: "current" },
    ],
  },
  {
    id: "ISS-004",
    title: "Overflowing trash bin in Central Park",
    department: "Sanitation Dept",
    status: "Pending",
    sla: "4h left",
    lat: 13.0827,
    lng: 80.2707,
    description: "Trash bin near the playground is overflowing and attracting pests",
    reportedBy: "Emily Brown",
    reportedAt: "2024-01-15T16:45:00Z",
    priority: "Medium",
    lifecycle: [
      { step: "Reported", status: "completed", timestamp: "2024-01-15T16:45:00Z" },
      { step: "Acknowledged", status: "current", timestamp: "2024-01-15T17:00:00Z" },
      { step: "Assigned", status: "pending" },
      { step: "Resolved", status: "pending" },
      { step: "Citizen Verified", status: "pending" },
    ],
  },
  {
    id: "ISS-005",
    title: "Water main leak on Pine Street",
    department: "Water Department",
    status: "In-Progress",
    sla: "1h left",
    lat: 22.5726,
    lng: 88.3639,
    description: "Water is flooding the street from a broken main",
    reportedBy: "David Wilson",
    reportedAt: "2024-01-15T12:00:00Z",
    assignedTo: "Tom Rodriguez",
    priority: "Critical",
    lifecycle: [
      { step: "Reported", status: "completed", timestamp: "2024-01-15T12:00:00Z" },
      { step: "Acknowledged", status: "completed", timestamp: "2024-01-15T12:05:00Z" },
      { step: "Assigned", status: "completed", timestamp: "2024-01-15T12:15:00Z", assignedTo: "Tom Rodriguez" },
      { step: "Resolved", status: "current", notes: "Repair crew on site" },
      { step: "Citizen Verified", status: "pending" },
    ],
  },
  {
    id: "ISS-006",
    title: "Graffiti on public building",
    department: "Public Works",
    status: "Pending",
    sla: "6h left",
    lat: 17.385,
    lng: 78.4867,
    description: "Vandalism on the side of the community center building",
    reportedBy: "Maria Garcia",
    reportedAt: "2024-01-15T09:30:00Z",
    priority: "Low",
    lifecycle: [
      { step: "Reported", status: "completed", timestamp: "2024-01-15T09:30:00Z" },
      { step: "Acknowledged", status: "current", timestamp: "2024-01-15T10:00:00Z" },
      { step: "Assigned", status: "pending" },
      { step: "Resolved", status: "pending" },
      { step: "Citizen Verified", status: "pending" },
    ],
  },
  {
    id: "ISS-007",
    title: "Blocked storm drain causing flooding",
    department: "Public Works",
    status: "Resolved",
    sla: "Closed",
    lat: 18.5204,
    lng: 73.8567,
    description: "Storm drain blocked with debris causing street flooding during rain",
    reportedBy: "James Miller",
    reportedAt: "2024-01-12T11:20:00Z",
    assignedTo: "Mike Wilson",
    priority: "High",
    lifecycle: [
      { step: "Reported", status: "completed", timestamp: "2024-01-12T11:20:00Z" },
      { step: "Acknowledged", status: "completed", timestamp: "2024-01-12T11:30:00Z" },
      { step: "Assigned", status: "completed", timestamp: "2024-01-12T12:00:00Z", assignedTo: "Mike Wilson" },
      { step: "Resolved", status: "completed", timestamp: "2024-01-12T16:45:00Z", notes: "Drain cleared and tested" },
      { step: "Citizen Verified", status: "completed", timestamp: "2024-01-13T08:00:00Z" },
    ],
  },
  {
    id: "ISS-008",
    title: "Illegal dumping in alley",
    department: "Sanitation Dept",
    status: "In-Progress",
    sla: "3h left",
    lat: 23.0225,
    lng: 72.5714,
    description: "Large furniture and appliances dumped illegally behind commercial buildings",
    reportedBy: "Jennifer Lee",
    reportedAt: "2024-01-14T13:15:00Z",
    assignedTo: "Lisa Chen",
    priority: "Medium",
    lifecycle: [
      { step: "Reported", status: "completed", timestamp: "2024-01-14T13:15:00Z" },
      { step: "Acknowledged", status: "completed", timestamp: "2024-01-14T13:30:00Z" },
      { step: "Assigned", status: "completed", timestamp: "2024-01-14T14:00:00Z", assignedTo: "Lisa Chen" },
      { step: "Resolved", status: "current", notes: "Cleanup crew scheduled" },
      { step: "Citizen Verified", status: "pending" },
    ],
  },
]
