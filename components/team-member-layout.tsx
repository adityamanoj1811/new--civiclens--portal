"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Home, Calendar, User, Settings, LogOut, Menu, X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface TeamMemberLayoutProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
}

const navigationItems = [
  { id: "home", label: "My Tasks", icon: Home },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
]

export function TeamMemberLayout({ children, currentPage, onPageChange }: TeamMemberLayoutProps) {
  const { user, logout } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    setIsMobileOpen(false)
  }

  const handlePageChange = (page: string) => {
    onPageChange(page)
    setIsMobileOpen(false)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className={cn("p-6 border-b border-sidebar-border", isCollapsed && "p-4")}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">CL</span>
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-sidebar-foreground">CivicLens</h2>
              <p className="text-xs text-muted-foreground">Team Portal</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className={cn("p-6 border-b border-sidebar-border", isCollapsed && "p-4")}>
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sidebar-foreground truncate">{user?.name || user?.email}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
              {user?.department && <p className="text-xs text-muted-foreground">{user.department}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id

            return (
              <li key={item.id}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full h-11",
                    isCollapsed ? "justify-center px-0" : "justify-start gap-3",
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                  onClick={() => handlePageChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5" />
                  {!isCollapsed && item.label}
                </Button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Collapse Toggle - Desktop Only */}
      <div className="hidden md:block p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full h-11 text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground",
            isCollapsed ? "justify-center px-0" : "justify-start gap-3",
          )}
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && "Logout"}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-background border border-border"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:block h-screen fixed left-0 top-0 transition-all duration-200",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed left-0 top-0 w-64 h-screen z-50 md:hidden">{sidebarContent}</div>
        </>
      )}

      {/* Main Content */}
      <div className={cn("transition-all duration-200", isCollapsed ? "md:ml-20" : "md:ml-64")}>
        <main className="min-h-screen p-4 md:p-6">{children}</main>
      </div>
    </>
  )
}
