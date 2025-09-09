"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, User, AlertCircle, Filter } from "lucide-react"
import { mockIssues, type Issue } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  id: string
  title: string
  date: Date
  task: Issue
  type: "task" | "deadline" | "reported"
}

export function AdminCalendarPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Issue[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [view, setView] = useState<"month" | "week">("month")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in-progress" | "resolved">("all")

  useEffect(() => {
    setTasks(mockIssues)
  }, [])

  // Generate calendar events from tasks
  const generateEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = []
    const filteredTasks =
      statusFilter === "all"
        ? tasks
        : tasks.filter((task) => {
            const statusMap = {
              pending: "Pending",
              "in-progress": "In-Progress",
              resolved: "Resolved",
            }
            return task.status === statusMap[statusFilter as keyof typeof statusMap]
          })

    filteredTasks.forEach((task) => {
      // Add task reported date
      events.push({
        id: `${task.id}-reported`,
        title: `Reported: ${task.title}`,
        date: new Date(task.reportedAt),
        task,
        type: "reported",
      })

      // Add estimated completion date (3-7 days from reported date based on priority)
      const completionDate = new Date(task.reportedAt)
      const daysToAdd =
        task.priority === "Critical" ? 1 : task.priority === "High" ? 3 : task.priority === "Medium" ? 5 : 7
      completionDate.setDate(completionDate.getDate() + daysToAdd)

      if (task.status !== "Resolved") {
        events.push({
          id: `${task.id}-deadline`,
          title: `Due: ${task.title}`,
          date: completionDate,
          task,
          type: "deadline",
        })
      }
    })

    return events
  }

  const events = generateEvents()

  // Calendar navigation
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setDate(newDate.getDate() - 7)
      } else {
        newDate.setDate(newDate.getDate() + 7)
      }
      return newDate
    })
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Generate calendar days for month view
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  // Generate week days for week view
  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getEventColor = (event: CalendarEvent) => {
    if (event.type === "deadline") {
      return event.task.status === "Pending"
        ? "bg-red-100 text-red-800 border-red-200"
        : "bg-orange-100 text-orange-800 border-orange-200"
    }
    if (event.type === "reported") {
      return "bg-blue-100 text-blue-800 border-blue-200"
    }
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-red-500"
      case "In-Progress":
        return "bg-orange-500"
      case "Resolved":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "border-red-500"
      case "High":
        return "border-orange-500"
      case "Medium":
        return "border-yellow-500"
      case "Low":
        return "border-green-500"
      default:
        return "border-gray-500"
    }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === "Pending").length,
    inProgress: tasks.filter((task) => task.status === "In-Progress").length,
    resolved: tasks.filter((task) => task.status === "Resolved").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-balance">Calendar</h1>
          <p className="text-gray-600 text-pretty">Monthly and weekly task calendar with event scheduling</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("month")}
            className={view === "month" ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            Month
          </Button>
          <Button
            variant={view === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("week")}
            className={view === "week" ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            Week
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 rounded-2xl p-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-50 rounded-2xl p-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{taskStats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 rounded-2xl p-4">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">{taskStats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 rounded-2xl p-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{taskStats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <div className="bg-blue-50 rounded-lg p-2">
              <Filter className="h-5 w-5 text-blue-600" />
            </div>
            Filter Events
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3">
            {[
              { id: "all", label: "All", count: taskStats.total },
              { id: "pending", label: "Pending", count: taskStats.pending },
              { id: "in-progress", label: "In Progress", count: taskStats.inProgress },
              { id: "resolved", label: "Resolved", count: taskStats.resolved },
            ].map((filter) => (
              <Button
                key={filter.id}
                variant={statusFilter === filter.id ? "default" : "outline"}
                onClick={() => setStatusFilter(filter.id as any)}
                className={`gap-2 rounded-xl ${
                  statusFilter === filter.id
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {filter.label}
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    statusFilter === filter.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {filter.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => (view === "month" ? navigateMonth("prev") : navigateWeek("prev"))}
                className="rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold text-gray-900">
                {view === "month"
                  ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                  : `Week of ${currentDate.toLocaleDateString()}`}
              </h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => (view === "month" ? navigateMonth("next") : navigateWeek("next"))}
                className="rounded-xl"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="rounded-xl">
              Today
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {view === "month" ? (
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {generateCalendarDays().map((date, index) => {
                const dayEvents = getEventsForDate(date)
                return (
                  <div
                    key={index}
                    className={cn(
                      "min-h-[120px] p-2 border border-gray-200 rounded-lg",
                      isToday(date) && "bg-blue-50 border-blue-300",
                      !isCurrentMonth(date) && "text-gray-400 bg-gray-50",
                    )}
                  >
                    <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "text-xs p-1 rounded cursor-pointer hover:opacity-80 border",
                            getEventColor(event),
                          )}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="truncate font-medium">{event.title}</div>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {generateWeekDays().map((date) => {
                const dayEvents = getEventsForDate(date)
                return (
                  <div
                    key={date.toISOString()}
                    className={cn(
                      "p-4 border border-gray-200 rounded-lg",
                      isToday(date) && "bg-blue-50 border-blue-300",
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">
                        {dayNames[date.getDay()]} {date.getDate()}
                      </h3>
                      <Badge variant="outline" className="bg-gray-100 text-gray-600">
                        {dayEvents.length} events
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "p-3 rounded-lg border-l-4 cursor-pointer hover:bg-gray-50",
                            getPriorityColor(event.task.priority),
                          )}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{event.title}</p>
                              <p className="text-sm text-gray-500">{event.task.department}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-3 h-3 rounded-full", getStatusColor(event.task.status))} />
                              <Badge variant="outline" className="text-xs">
                                {event.task.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                      {dayEvents.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">No events scheduled</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Details
            </DialogTitle>
            <DialogDescription>View task information and manage assignments</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{selectedEvent.task.title}</h3>
                <p className="text-gray-600">{selectedEvent.task.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Reported by {selectedEvent.task.reportedBy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {selectedEvent.type === "reported" ? "Reported" : "Due"}:{" "}
                      {selectedEvent.date.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedEvent.task.department}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs text-white", getStatusColor(selectedEvent.task.status))}>
                      {selectedEvent.task.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {selectedEvent.task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">SLA: {selectedEvent.task.sla}</span>
                  </div>
                  {selectedEvent.task.assignedTo && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Assigned to: {selectedEvent.task.assignedTo}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={() => setSelectedEvent(null)} className="rounded-xl">
                  Close
                </Button>
                {selectedEvent.task.status !== "Resolved" && (
                  <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                    {selectedEvent.task.status === "Pending" ? "Assign Task" : "Update Status"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
