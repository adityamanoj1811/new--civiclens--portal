"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { FileText, Clock, PlayCircle, CheckCircle, LogOut, Menu, X, Shield, BarChart3 } from "lucide-react"

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { user, logout } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navigationItems = [
    {
      id: "all",
      label: "All Issues",
      icon: FileText,
    },
    {
      id: "pending",
      label: "Pending",
      icon: Clock,
    },
    {
      id: "in-progress",
      label: "In-Progress",
      icon: PlayCircle,
    },
    {
      id: "resolved",
      label: "Resolved",
      icon: CheckCircle,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
    },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="bg-sidebar-primary rounded-lg p-2">
            <Shield className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-sidebar-foreground">CivicLens</h2>
            <p className="text-sm text-muted-foreground">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="text-sm">
          <p className="font-medium text-sidebar-foreground">{user?.email}</p>
          <p className="text-muted-foreground">{user?.role}</p>
          {user?.department && <p className="text-xs text-muted-foreground mt-1">{user.department}</p>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeView === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  activeView === item.id && "bg-sidebar-accent text-sidebar-accent-foreground",
                )}
                onClick={() => {
                  onViewChange(item.id)
                  setIsMobileOpen(false)
                }}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            )
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 bg-transparent"
          onClick={() => {
            logout()
            setIsMobileOpen(false)
          }}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 z-50 w-64 h-full bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
