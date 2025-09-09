"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, User, AlertCircle } from "lucide-react"
import { getTeamMemberTasks, type TeamMemberTask } from "@/lib/team-member-data"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  id: string
  title: string
  date: Date
  task: TeamMemberTask
  type: "task" | "deadline"
}

export function TeamMemberCalendarPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<TeamMemberTask[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [view, setView] = useState<"month" | "week">("month")

  useEffect(() => {
    if (user?.email) {
      const memberTasks = getTeamMemberTasks(user.email)
      setTasks(memberTasks)
    }
  }, [user?.email])

  // Generate calendar events from tasks
  const generateEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = []

    tasks.forEach((task) => {
      // Add task due date as event
      events.push({
        id: `${task.id}-due`,
        title: task.title,
        date: new Date(task.dueDate),
        task,
        type: "deadline",
      })

      // Add task start date if in progress
      if (task.status === "In-Progress") {
        const startDate = new Date(task.reportedAt)
        startDate.setDate(startDate.getDate() + 1) // Assume started next day
        events.push({
          id: `${task.id}-start`,
          title: `Started: ${task.title}`,
          date: startDate,
          task,
          type: "task",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500"
      case "In-Progress":
        return "bg-blue-500"
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Task Calendar</h1>
          <p className="text-muted-foreground text-pretty">View and manage your scheduled tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={view === "month" ? "default" : "outline"} size="sm" onClick={() => setView("month")}>
            Month
          </Button>
          <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => setView("week")}>
            Week
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => (view === "month" ? navigateMonth("prev") : navigateWeek("prev"))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {view === "month"
                  ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                  : `Week of ${currentDate.toLocaleDateString()}`}
              </h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => (view === "month" ? navigateMonth("next") : navigateWeek("next"))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {view === "month" ? (
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
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
                      "min-h-[100px] p-2 border border-border rounded-lg",
                      isToday(date) && "bg-primary/10 border-primary",
                      !isCurrentMonth(date) && "text-muted-foreground bg-muted/30",
                    )}
                  >
                    <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "text-xs p-1 rounded cursor-pointer hover:opacity-80",
                            event.type === "deadline" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800",
                          )}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="truncate">{event.title}</div>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
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
                      "p-4 border border-border rounded-lg",
                      isToday(date) && "bg-primary/10 border-primary",
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">
                        {dayNames[date.getDay()]} {date.getDate()}
                      </h3>
                      <Badge variant="outline">{dayEvents.length} tasks</Badge>
                    </div>
                    <div className="space-y-2">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "p-3 rounded-lg border-l-4 cursor-pointer hover:bg-muted/50",
                            getPriorityColor(event.task.priority),
                          )}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{event.title}</p>
                              <p className="text-sm text-muted-foreground">{event.task.department}</p>
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
                        <p className="text-sm text-muted-foreground text-center py-4">No tasks scheduled</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Task Details
            </DialogTitle>
            <DialogDescription>View task information and update status</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">{selectedEvent.task.title}</h3>
                <p className="text-muted-foreground">{selectedEvent.task.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Reported by {selectedEvent.task.reportedBy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Due: {new Date(selectedEvent.task.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedEvent.task.department}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", getStatusColor(selectedEvent.task.status))}>
                      {selectedEvent.task.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {selectedEvent.task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Est. {selectedEvent.task.estimatedHours}h</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
                {selectedEvent.task.status !== "Resolved" && (
                  <Button>{selectedEvent.task.status === "Pending" ? "Start Task" : "Mark Complete"}</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
