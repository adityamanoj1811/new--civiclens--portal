"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { departmentResolutionData, slaComplianceData, issueTypesData, analyticsConfig } from "@/lib/analytics-data"
import { useAuth } from "@/contexts/auth-context"
import { TrendingUp, Target, PieChartIcon, BarChart3 } from "lucide-react"

export function AnalyticsPage() {
  const { user } = useAuth()

  // Filter data for Department Officers
  const filteredDepartmentData =
    user?.role === "Department Officer" && user.department
      ? departmentResolutionData.filter((dept) => dept.department === user.department)
      : departmentResolutionData

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Analytics Dashboard</h1>
          <p className="text-muted-foreground text-pretty">
            {user?.role === "Department Officer"
              ? `Performance metrics for ${user.department}`
              : "Comprehensive performance metrics and insights"}
          </p>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department-wise Resolution Rate Bar Chart */}
        <Card className="card-professional">
          <CardHeader className="card-professional-content pb-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 rounded-lg p-2">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Department Resolution Rates</CardTitle>
                <CardDescription>
                  {user?.role === "Department Officer"
                    ? "Your department's performance"
                    : "Performance comparison across departments"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="card-professional-content pt-0">
            <ChartContainer config={analyticsConfig} className="h-[300px]">
              <BarChart data={filteredDepartmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [`${value}%`, name === "rate" ? "Resolution Rate" : name]}
                />
                <Bar dataKey="rate" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Resolution Rate" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* SLA Compliance Trends Line Chart */}
        <Card className="card-professional">
          <CardHeader className="card-professional-content pb-4">
            <div className="flex items-center gap-2">
              <div className="bg-chart-2/10 rounded-lg p-2">
                <TrendingUp className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <CardTitle>SLA Compliance Trends</CardTitle>
                <CardDescription>Monthly compliance vs target performance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="card-professional-content pt-0">
            <ChartContainer config={analyticsConfig} className="h-[300px]">
              <LineChart data={slaComplianceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} domain={[70, 100]} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [`${value}%`, name === "compliance" ? "Compliance" : "Target"]}
                />
                <Line
                  type="monotone"
                  dataKey="compliance"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                  name="Compliance"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Target"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Common Issue Types Donut Chart */}
        <Card className="card-professional lg:col-span-2">
          <CardHeader className="card-professional-content pb-4">
            <div className="flex items-center gap-2">
              <div className="bg-chart-3/10 rounded-lg p-2">
                <PieChartIcon className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <CardTitle>Issue Types Distribution</CardTitle>
                <CardDescription>
                  {user?.role === "Department Officer"
                    ? "Issue types handled by your department"
                    : "Most common civic issues reported"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="card-professional-content pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer config={analyticsConfig} className="h-[300px]">
                <PieChart>
                  <Pie
                    data={issueTypesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {issueTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [`${value} issues`, name]}
                  />
                </PieChart>
              </ChartContainer>

              {/* Legend and Stats */}
              <div className="flex flex-col justify-center space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {issueTypesData.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.type}</p>
                        <p className="text-xs text-muted-foreground">{item.count} issues</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Total Issues:</span>
                    <span className="font-semibold">{issueTypesData.reduce((sum, item) => sum + item.count, 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
