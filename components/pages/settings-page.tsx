"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  Moon,
  Sun,
  Shield,
  Map,
  Filter,
  Mail,
  MessageSquare,
  Smartphone,
  Key,
  ShieldCheck,
  Save,
  SettingsIcon,
} from "lucide-react"

export function SettingsPage() {
  const { user } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    newIssues: true,
    slaAlerts: true,
    resolutionUpdates: false,
  })
  const [systemPrefs, setSystemPrefs] = useState({
    mapStyle: "light",
    defaultFilter: "all",
    autoRefresh: true,
    compactView: false,
  })
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: "30",
    loginAlerts: true,
  })

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))
  }

  const handleSystemPrefChange = (key: string, value: string | boolean) => {
    setSystemPrefs((prev) => ({ ...prev, [key]: value }))
  }

  const handleSecurityChange = (key: string, value: string | boolean) => {
    setSecurity((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = () => {
    // In a real app, this would make API calls to save settings
    console.log("Settings saved:", { notifications, systemPrefs, security, isDarkMode })
    alert("Settings saved successfully!")
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    // In a real app, this would apply the theme
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Settings</h1>
          <p className="text-muted-foreground text-pretty">Manage your account preferences and system settings</p>
        </div>
        <Button onClick={handleSaveSettings} className="gap-2">
          <Save className="h-4 w-4" />
          Save All Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Preferences */}
        <Card className="card-professional">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Notification Channels */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Notification Channels
              </h4>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor="email-notifications" className="font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-chart-3/10 rounded-lg p-2">
                    <MessageSquare className="h-4 w-4 text-chart-3" />
                  </div>
                  <div>
                    <Label htmlFor="sms-notifications" className="font-medium">
                      SMS Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive urgent alerts via SMS</p>
                  </div>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={notifications.sms}
                  onCheckedChange={(checked) => handleNotificationChange("sms", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-chart-4/10 rounded-lg p-2">
                    <Smartphone className="h-4 w-4 text-chart-4" />
                  </div>
                  <div>
                    <Label htmlFor="push-notifications" className="font-medium">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Browser push notifications</p>
                  </div>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notifications.push}
                  onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                />
              </div>
            </div>

            <Separator />

            {/* Notification Types */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Notification Types</h4>

              <div className="flex items-center justify-between">
                <Label htmlFor="new-issues" className="font-medium">
                  New Issues
                </Label>
                <Switch
                  id="new-issues"
                  checked={notifications.newIssues}
                  onCheckedChange={(checked) => handleNotificationChange("newIssues", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sla-alerts" className="font-medium">
                  SLA Alerts
                </Label>
                <Switch
                  id="sla-alerts"
                  checked={notifications.slaAlerts}
                  onCheckedChange={(checked) => handleNotificationChange("slaAlerts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="resolution-updates" className="font-medium">
                  Resolution Updates
                </Label>
                <Switch
                  id="resolution-updates"
                  checked={notifications.resolutionUpdates}
                  onCheckedChange={(checked) => handleNotificationChange("resolutionUpdates", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme & Appearance */}
        <Card className="card-professional">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Theme & Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  {isDarkMode ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
                </div>
                <div>
                  <Label htmlFor="dark-mode" className="font-medium">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isDarkMode ? "Dark theme enabled" : "Light theme enabled"}
                  </p>
                </div>
              </div>
              <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={toggleTheme} />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Display Options</h4>

              <div className="flex items-center justify-between">
                <Label htmlFor="compact-view" className="font-medium">
                  Compact View
                </Label>
                <Switch
                  id="compact-view"
                  checked={systemPrefs.compactView}
                  onCheckedChange={(checked) => handleSystemPrefChange("compactView", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-refresh" className="font-medium">
                  Auto Refresh
                </Label>
                <Switch
                  id="auto-refresh"
                  checked={systemPrefs.autoRefresh}
                  onCheckedChange={(checked) => handleSystemPrefChange("autoRefresh", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="card-professional">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-chart-2/10 rounded-lg p-2">
                  <ShieldCheck className="h-4 w-4 text-chart-2" />
                </div>
                <div>
                  <Label htmlFor="two-factor" className="font-medium">
                    Two-Factor Authentication
                  </Label>
                  <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {security.twoFactorEnabled && (
                  <Badge variant="secondary" className="text-xs">
                    Enabled
                  </Badge>
                )}
                <Switch
                  id="two-factor"
                  checked={security.twoFactorEnabled}
                  onCheckedChange={(checked) => handleSecurityChange("twoFactorEnabled", checked)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout</Label>
              <Select
                value={security.sessionTimeout}
                onValueChange={(value) => handleSecurityChange("sessionTimeout", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="240">4 hours</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="login-alerts" className="font-medium">
                Login Alerts
              </Label>
              <Switch
                id="login-alerts"
                checked={security.loginAlerts}
                onCheckedChange={(checked) => handleSecurityChange("loginAlerts", checked)}
              />
            </div>

            <Button variant="outline" className="w-full gap-2 bg-transparent">
              <Key className="h-4 w-4" />
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* System Preferences */}
        <Card className="card-professional">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              System Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="map-style" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Map Style
              </Label>
              <Select value={systemPrefs.mapStyle} onValueChange={(value) => handleSystemPrefChange("mapStyle", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="streets">Streets</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-filter" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Default Filter
              </Label>
              <Select
                value={systemPrefs.defaultFilter}
                onValueChange={(value) => handleSystemPrefChange("defaultFilter", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Issues</SelectItem>
                  <SelectItem value="pending">Pending Only</SelectItem>
                  <SelectItem value="in-progress">In-Progress Only</SelectItem>
                  <SelectItem value="resolved">Resolved Only</SelectItem>
                  {user?.role === "Department Officer" && <SelectItem value="my-department">My Department</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Role: <Badge variant="secondary">{user?.role}</Badge>
              </p>
              {user?.department && <p className="text-sm text-muted-foreground">Department: {user.department}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
