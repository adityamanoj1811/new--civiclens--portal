"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Video, MapPin, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getUpcomingMeetings, type Meeting } from "@/lib/meeting-data"
import { MeetingSchedulerDialog } from "./meeting-scheduler-dialog"

export function MeetingsWidget() {
  const { user } = useAuth()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [showScheduler, setShowScheduler] = useState(false)

  useEffect(() => {
    if (user?.email) {
      const upcomingMeetings = getUpcomingMeetings(user.email)
      setMeetings(upcomingMeetings)
    }
  }, [user?.email])

  const handleMeetingScheduled = (newMeeting: Meeting) => {
    if (user?.email) {
      const updatedMeetings = getUpcomingMeetings(user.email)
      setMeetings(updatedMeetings)
    }
  }

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case "team":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "department":
        return "bg-green-100 text-green-800 border-green-200"
      case "project":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "review":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        weekday: "short",
      })
    }
  }

  return (
    <>
      <Card className="bg-white rounded-2xl shadow-sm border border-gray-200 w-80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Upcoming Meetings
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setShowScheduler(true)}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-1" />
              Schedule
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {meetings.length > 0 ? (
            meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm leading-tight">{meeting.title}</h4>
                  <Badge className={`text-xs ${getMeetingTypeColor(meeting.type)}`}>{meeting.type}</Badge>
                </div>

                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {formatDate(meeting.date)} at {meeting.time}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{meeting.duration} minutes</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>{meeting.attendees.length + 1} attendees</span>
                  </div>

                  {meeting.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span>{meeting.location}</span>
                    </div>
                  )}

                  {meeting.meetingLink && (
                    <div className="flex items-center gap-2">
                      <Video className="h-3 w-3" />
                      <span className="text-blue-600 hover:underline cursor-pointer">Join Meeting</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">No upcoming meetings</p>
              <Button size="sm" variant="outline" onClick={() => setShowScheduler(true)} className="rounded-xl">
                Schedule Your First Meeting
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <MeetingSchedulerDialog
        open={showScheduler}
        onOpenChange={setShowScheduler}
        onMeetingScheduled={handleMeetingScheduled}
      />
    </>
  )
}
