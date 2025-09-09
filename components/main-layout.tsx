"use client"

import type React from "react"
import { SidebarNavigation } from "@/components/sidebar-navigation"

interface MainLayoutProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
}

export function MainLayout({ children, currentPage, onPageChange }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNavigation currentPage={currentPage} onPageChange={onPageChange} />

      {/* Main Content */}
      <div className="md:ml-64">
        <main className="min-h-screen p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
