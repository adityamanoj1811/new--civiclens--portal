// Mock analytics data for CivicLens admin portal
export const departmentResolutionData = [
  { department: "Road Maintenance", resolved: 85, total: 100, rate: 85 },
  { department: "Sanitation", resolved: 92, total: 108, rate: 85.2 },
  { department: "Water & Sewage", resolved: 78, total: 95, rate: 82.1 },
  { department: "Parks & Recreation", resolved: 45, total: 52, rate: 86.5 },
  { department: "Public Safety", resolved: 67, total: 75, rate: 89.3 },
  { department: "Utilities", resolved: 34, total: 40, rate: 85.0 },
]

export const slaComplianceData = [
  { month: "Jan", compliance: 78, target: 85 },
  { month: "Feb", compliance: 82, target: 85 },
  { month: "Mar", compliance: 79, target: 85 },
  { month: "Apr", compliance: 85, target: 85 },
  { month: "May", compliance: 88, target: 85 },
  { month: "Jun", compliance: 91, target: 85 },
  { month: "Jul", compliance: 87, target: 85 },
  { month: "Aug", compliance: 89, target: 85 },
  { month: "Sep", compliance: 92, target: 85 },
  { month: "Oct", compliance: 88, target: 85 },
  { month: "Nov", compliance: 90, target: 85 },
  { month: "Dec", compliance: 93, target: 85 },
]

export const issueTypesData = [
  { type: "Potholes", count: 145, fill: "hsl(var(--chart-1))" },
  { type: "Streetlights", count: 89, fill: "hsl(var(--chart-2))" },
  { type: "Waste Management", count: 76, fill: "hsl(var(--chart-3))" },
  { type: "Water Issues", count: 54, fill: "hsl(var(--chart-4))" },
  { type: "Public Safety", count: 43, fill: "hsl(var(--chart-5))" },
  { type: "Other", count: 32, fill: "hsl(var(--muted-foreground))" },
]

export const analyticsConfig = {
  resolved: {
    label: "Resolved",
    color: "hsl(var(--chart-2))",
  },
  compliance: {
    label: "SLA Compliance",
    color: "hsl(var(--chart-1))",
  },
  target: {
    label: "Target",
    color: "hsl(var(--muted-foreground))",
  },
  potholes: {
    label: "Potholes",
    color: "hsl(var(--chart-1))",
  },
  streetlights: {
    label: "Streetlights",
    color: "hsl(var(--chart-2))",
  },
  waste: {
    label: "Waste Management",
    color: "hsl(var(--chart-3))",
  },
  water: {
    label: "Water Issues",
    color: "hsl(var(--chart-4))",
  },
  safety: {
    label: "Public Safety",
    color: "hsl(var(--chart-5))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--muted-foreground))",
  },
}

export const kpiData = {
  avgResolutionTime: "4.2 days",
  avgResolutionHours: 101,
  mostActiveDept: "Sanitation",
  mostActiveDeptCount: 108,
  totalIssuesThisMonth: 439,
  resolutionRateOverall: 86.1,
}
