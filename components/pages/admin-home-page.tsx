"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LeafletServerWrapper } from "@/components/leaflet-server-wrapper"
import { mockIssues } from "@/lib/mock-data"
import { MapPin, AlertTriangle, CheckCircle, Shield, Filter, Target } from "lucide-react"
import { MeetingsWidget } from "@/components/meetings-widget"

export function AdminHomePage() {
  const { user } = useAuth()
  const [activeFilter, setActiveFilter] = useState("all")

  const getFilteredIssues = () => {
    if (activeFilter === "all") return mockIssues

    const statusMap = {
      pending: "Pending",
      "in-progress": "In-Progress",
      resolved: "Resolved",
    }

    return mockIssues.filter((issue) => issue.status === statusMap[activeFilter as keyof typeof statusMap])
  }

  const filteredIssues = getFilteredIssues()

  const issuesCount = {
    total: mockIssues.length,
    pending: mockIssues.filter((issue) => issue.status === "Pending").length,
    inProgress: mockIssues.filter((issue) => issue.status === "In-Progress").length,
    resolved: mockIssues.filter((issue) => issue.status === "Resolved").length,
  }

  const slaPercentage = Math.round(
    (mockIssues.filter((issue) => issue.sla !== "Overdue").length / mockIssues.length) * 100,
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
          <h1 className="text-3xl font-bold text-gray-900 text-balance">Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-600 text-pretty">Comprehensive overview of all civic issues across Jharkhand</p>
            <Badge className="text-xs bg-blue-600 text-white">
              <Shield className="h-3 w-3 mr-1" />
              {user?.role}
            </Badge>
          </div>
        </div>
        <MeetingsWidget />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 rounded-2xl p-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{issuesCount.total}</p>
                <p className="text-xs text-gray-400 mt-1">All civic issues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-50 rounded-2xl p-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{issuesCount.pending}</p>
                <p className="text-xs text-gray-400 mt-1">Awaiting action</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 rounded-2xl p-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{issuesCount.resolved}</p>
                <p className="text-xs text-gray-400 mt-1">Successfully resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 rounded-2xl p-4">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">SLA %</p>
                <p className="text-3xl font-bold text-gray-900">{slaPercentage}%</p>
                <p className="text-xs text-gray-400 mt-1">On-time completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <div className="bg-blue-50 rounded-lg p-2">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            Filter Map View
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3">
            {filterButtons.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                onClick={() => setActiveFilter(filter.id)}
                className={`gap-2 rounded-xl ${
                  activeFilter === filter.id
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {filter.label}
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    activeFilter === filter.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {filter.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <LeafletServerWrapper issues={filteredIssues} />
      </div>
    </div>
  )
}
