"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { EnhancedHeader } from "@/components/enhanced-header"
import { DashboardHeader } from "@/components/dashboard-header"
import { AnalyticsPage } from "@/components/analytics-page"
import { LeafletServerWrapper } from "@/components/leaflet-server-wrapper"
import { IssuesTable } from "@/components/issues-table"
import { mockIssues } from "@/lib/mock-data"
import { useAuth } from "@/contexts/auth-context"

export function Dashboard() {
  const { user } = useAuth()
  const [activeView, setActiveView] = useState("all")

  // Filter issues based on user role for counting
  const userIssues =
    user?.role === "Department Officer" && user.department
      ? mockIssues.filter((issue) => issue.department === user.department)
      : mockIssues

  const getFilteredIssues = () => {
    if (activeView === "all" || activeView === "analytics") return userIssues

    const statusMap = {
      pending: "Pending",
      "in-progress": "In-Progress",
      resolved: "Resolved",
    }

    return userIssues.filter((issue) => issue.status === statusMap[activeView as keyof typeof statusMap])
  }

  const filteredIssues = getFilteredIssues()

  const issuesCount = {
    total: userIssues.length,
    pending: userIssues.filter((issue) => issue.status === "Pending").length,
    inProgress: userIssues.filter((issue) => issue.status === "In-Progress").length,
    resolved: userIssues.filter((issue) => issue.status === "Resolved").length,
  }

  const renderMainContent = () => {
    if (activeView === "analytics") {
      return <AnalyticsPage />
    }

    return (
      <>
        <DashboardHeader activeView={activeView} issuesCount={issuesCount} />
        <LeafletServerWrapper issues={filteredIssues} />
        <IssuesTable issues={mockIssues} activeView={activeView} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header - Fixed at top */}
      <EnhancedHeader />

      {/* Main Layout Container */}
      <div className="flex pt-20">
        {/* Sidebar */}
        <Sidebar activeView={activeView} onViewChange={setActiveView} />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {/* Content Container with proper spacing */}
          <div className="h-[calc(100vh-5rem)] overflow-y-auto">
            <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">{renderMainContent()}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
