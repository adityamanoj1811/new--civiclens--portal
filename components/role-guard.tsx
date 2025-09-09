"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface RoleGuardProps {
  allowedRoles: "Admin"[]
  children: React.ReactNode
  fallback?: React.ReactNode
  showMessage?: boolean
}

export function RoleGuard({ allowedRoles, children, fallback, showMessage = true }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback) return <>{fallback}</>

    if (showMessage) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>You don't have permission to access this feature.</AlertDescription>
        </Alert>
      )
    }

    return null
  }

  return <>{children}</>
}

export function AdminOnly({ children, fallback, showMessage = true }: Omit<RoleGuardProps, "allowedRoles">) {
  return (
    <RoleGuard allowedRoles={["Admin"]} fallback={fallback} showMessage={showMessage}>
      {children}
    </RoleGuard>
  )
}
