"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area } from "recharts"
import { useAuth } from "@/contexts/auth-context"
import { mockIssues } from "@/lib/mock-data"
import { MapboxHeatmap } from "@/components/mapbox-heatmap"
import { TrendingUp, Target, PieChartIcon, BarChart3, Clock, Building2, Activity, CheckCircle } from "lucide-react"

export function AdminAnalyticsPage() {
  const { user } = useAuth()

  // Generate analytics data from mock issues
  const generateAnalyticsData = () => {
    // Department resolution data
    const departmentStats = mockIssues.reduce(
      (acc, issue) => {
        if (!acc[issue.department]) {
          acc[issue.department] = { total: 0, resolved: 0, pending: 0, inProgress: 0 }
        }
        acc[issue.department].total++
        if (issue.status === "Resolved") acc[issue.department].resolved++
        if (issue.status === "Pending") acc[issue.department].pending++
        if (issue.status === "In-Progress") acc[issue.department].inProgress++
        return acc
      },
      {} as Record<string, { total: number; resolved: number; pending: number; inProgress: number }>,
    )

    const departmentResolutionData = Object.entries(departmentStats).map(([dept, stats]) => ({
      department: dept,
      resolved: stats.resolved,
      total: stats.total,
      rate: Math.round((stats.resolved / stats.total) * 100),
      pending: stats.pending,
      inProgress: stats.inProgress,
    }))

    // Priority distribution
    const priorityStats = mockIssues.reduce(
      (acc, issue) => {
        acc[issue.priority] = (acc[issue.priority] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const priorityData = Object.entries(priorityStats).map(([priority, count], index) => ({
      priority,
      count,
      fill:
        [
          "hsl(220, 70%, 50%)", // Blue
          "hsl(142, 76%, 36%)", // Green
          "hsl(38, 92%, 50%)", // Orange
          "hsl(0, 84%, 60%)", // Red
        ][index] || "hsl(220, 14%, 96%)",
    }))

    // Monthly trends (simulated)
    const monthlyTrends = [
      { month: "Jan", issues: 45, resolved: 38, slaCompliance: 84 },
      { month: "Feb", issues: 52, resolved: 47, slaCompliance: 90 },
      { month: "Mar", issues: 38, resolved: 35, slaCompliance: 92 },
      { month: "Apr", issues: 61, resolved: 54, slaCompliance: 88 },
      { month: "May", issues: 47, resolved: 43, slaCompliance: 91 },
      { month: "Jun", issues: 55, resolved: 51, slaCompliance: 93 },
    ]

    // Response time data (simulated)
    const responseTimeData = [
      { timeRange: "0-2h", count: 12, percentage: 35 },
      { timeRange: "2-6h", count: 15, percentage: 44 },
      { timeRange: "6-24h", count: 5, percentage: 15 },
      { timeRange: "1-3d", count: 2, percentage: 6 },
    ]

    return {
      departmentResolutionData,
      priorityData,
      monthlyTrends,
      responseTimeData,
      totalIssues: mockIssues.length,
      resolvedIssues: mockIssues.filter((i) => i.status === "Resolved").length,
      pendingIssues: mockIssues.filter((i) => i.status === "Pending").length,
      inProgressIssues: mockIssues.filter((i) => i.status === "In-Progress").length,
      avgResolutionTime: "2.3 days",
      slaCompliance: 89,
    }
  }

  const analytics = generateAnalyticsData()

  const chartConfig = {
    resolved: { label: "Resolved", color: "hsl(142, 76%, 36%)" },
    pending: { label: "Pending", color: "hsl(38, 92%, 50%)" },
    inProgress: { label: "In Progress", color: "hsl(220, 70%, 50%)" },
    issues: { label: "Issues", color: "hsl(220, 70%, 50%)" },
    slaCompliance: { label: "SLA Compliance", color: "hsl(142, 76%, 36%)" },
    count: { label: "Count", color: "hsl(220, 70%, 50%)" },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-balance">Analytics</h1>
          <p className="text-gray-600 text-pretty">Comprehensive performance metrics and insights</p>
        </div>
      </div>

      <MapboxHeatmap issues={mockIssues} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 rounded-2xl p-4">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Issues</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalIssues}</p>
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
                <p className="text-sm text-gray-500 font-medium">Resolved</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.resolvedIssues}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 rounded-2xl p-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Avg Resolution</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.avgResolutionTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 rounded-2xl p-4">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">SLA Compliance</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.slaCompliance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance Bar Chart */}
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-50 rounded-lg p-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-gray-900">Department Performance</CardTitle>
                <CardDescription className="text-gray-600">Resolution rates by department</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={analytics.departmentResolutionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    name === "rate" ? `${value}%` : value,
                    name === "rate" ? "Resolution Rate" : name === "resolved" ? "Resolved" : "Total",
                  ]}
                />
                <Bar dataKey="rate" fill="#3B82F6" radius={[4, 4, 0, 0]} name="rate" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends Line Chart */}
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-2">
              <div className="bg-green-50 rounded-lg p-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-gray-900">Monthly Trends</CardTitle>
                <CardDescription className="text-gray-600">Issues reported and resolved over time</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <AreaChart data={analytics.monthlyTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    value,
                    name === "issues" ? "Issues Reported" : name === "resolved" ? "Issues Resolved" : name,
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="issues"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="issues"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stackId="2"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.8}
                  name="resolved"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution Pie Chart */}
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-2">
              <div className="bg-purple-50 rounded-lg p-2">
                <PieChartIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-gray-900">Priority Distribution</CardTitle>
                <CardDescription className="text-gray-600">Issues breakdown by priority level</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer config={chartConfig} className="h-[250px]">
                <PieChart>
                  <Pie
                    data={analytics.priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {analytics.priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [`${value} issues`, name]}
                  />
                </PieChart>
              </ChartContainer>

              <div className="flex flex-col justify-center space-y-3">
                {analytics.priorityData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.priority}</p>
                      <p className="text-xs text-gray-500">{item.count} issues</p>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {Math.round((item.count / analytics.totalIssues) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Time Analysis */}
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center gap-2">
              <div className="bg-orange-50 rounded-lg p-2">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-gray-900">Response Time Analysis</CardTitle>
                <CardDescription className="text-gray-600">Time to first response distribution</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <ChartContainer config={chartConfig} className="h-[250px]">
              <BarChart data={analytics.responseTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis dataKey="timeRange" tick={{ fontSize: 12, fill: "#6B7280" }} />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    name === "count" ? `${value} issues` : `${value}%`,
                    name === "count" ? "Issues" : "Percentage",
                  ]}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} name="count" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown Table */}
      <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="bg-gray-50 rounded-lg p-2">
              <Building2 className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-gray-900">Department Breakdown</CardTitle>
              <CardDescription className="text-gray-600">Detailed performance metrics by department</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Total Issues</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Resolved</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">In Progress</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Pending</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Resolution Rate</th>
                </tr>
              </thead>
              <tbody>
                {analytics.departmentResolutionData.map((dept, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{dept.department}</td>
                    <td className="text-center py-3 px-4 text-gray-600">{dept.total}</td>
                    <td className="text-center py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {dept.resolved}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {dept.inProgress}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {dept.pending}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${dept.rate}%` }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{dept.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
