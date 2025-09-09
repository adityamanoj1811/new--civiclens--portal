"use client"

import type React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"

interface AdminLayoutProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
}

export function AdminLayout({ children, currentPage, onPageChange }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar currentPage={currentPage} onPageChange={onPageChange} />

      {/* Main Content */}
      <div className="md:ml-64 transition-all duration-200">
        <main className="min-h-screen p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
