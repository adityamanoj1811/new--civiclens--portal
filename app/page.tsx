"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/login-form"
import { AdminLayout } from "@/components/admin-layout"
import { TeamMemberLayout } from "@/components/team-member-layout"
import { AdminHomePage } from "@/components/pages/admin-home-page"
import { AdminTasksPage } from "@/components/pages/admin-tasks-page"
import { AdminCalendarPage } from "@/components/pages/admin-calendar-page"
import { AdminTeamPage } from "@/components/pages/admin-team-page"
import { AdminAnalyticsPage } from "@/components/pages/admin-analytics-page"
import { ProfilePage } from "@/components/pages/profile-page"
import { SettingsPage } from "@/components/pages/settings-page"
import { TeamMemberHomePage } from "@/components/pages/team-member-home-page"
import { TeamMemberCalendarPage } from "@/components/pages/team-member-calendar-page"
import { TeamMemberProfilePage } from "@/components/pages/team-member-profile-page"
import { TeamMemberSettingsPage } from "@/components/pages/team-member-settings-page"
import { DepartmentHomePage } from "@/components/pages/department-home-page"

export default function Home() {
  const { isAuthenticated, user } = useAuth()
  const [currentPage, setCurrentPage] = useState("home")

  if (!isAuthenticated) {
    return <LoginForm />
  }

  if (user?.role === "Team Member") {
    const renderTeamMemberPage = () => {
      switch (currentPage) {
        case "home":
          return <TeamMemberHomePage />
        case "calendar":
          return <TeamMemberCalendarPage />
        case "profile":
          return <TeamMemberProfilePage />
        case "settings":
          return <TeamMemberSettingsPage />
        default:
          return <TeamMemberHomePage />
      }
    }

    return (
      <TeamMemberLayout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderTeamMemberPage()}
      </TeamMemberLayout>
    )
  }

  if (user?.role === "Department Head") {
    const renderDepartmentPage = () => {
      switch (currentPage) {
        case "home":
          return <DepartmentHomePage />
        case "tasks":
          return <AdminTasksPage />
        case "calendar":
          return <AdminCalendarPage />
        case "team":
          return <AdminTeamPage />
        case "analytics":
          return <AdminAnalyticsPage />
        case "profile":
          return <ProfilePage />
        case "settings":
          return <SettingsPage />
        default:
          return <DepartmentHomePage />
      }
    }

    return (
      <AdminLayout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderDepartmentPage()}
      </AdminLayout>
    )
  }

  const renderAdminPage = () => {
    switch (currentPage) {
      case "home":
        return <AdminHomePage />
      case "tasks":
        return <AdminTasksPage />
      case "calendar":
        return <AdminCalendarPage />
      case "team":
        return <AdminTeamPage />
      case "analytics":
        return <AdminAnalyticsPage />
      case "profile":
        return <ProfilePage />
      case "settings":
        return <SettingsPage />
      default:
        return <AdminHomePage />
    }
  }

  return (
    <AdminLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderAdminPage()}
    </AdminLayout>
  )
}
