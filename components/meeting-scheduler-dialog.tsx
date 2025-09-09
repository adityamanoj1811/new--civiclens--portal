"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Users, MapPin, Video } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { addMeeting, type Meeting } from "@/lib/meeting-data"

interface MeetingSchedulerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMeetingScheduled?: (meeting: Meeting) => void
}

export function MeetingSchedulerDialog({ open, onOpenChange, onMeetingScheduled }: MeetingSchedulerDialogProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "30",
    type: "team" as const,
    location: "",
    meetingLink: "",
    attendees: [] as string[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.email) return

    const meetingDate = new Date(formData.date + "T" + formData.time)

    const newMeeting = addMeeting({
      title: formData.title,
      description: formData.description,
      date: meetingDate,
      time: formData.time,
      duration: Number.parseInt(formData.duration),
      organizer: user.email,
      attendees: formData.attendees,
      type: formData.type,
      status: "scheduled",
      location: formData.location || undefined,
      meetingLink: formData.meetingLink || undefined,
    })

    onMeetingScheduled?.(newMeeting)
    onOpenChange(false)

    // Reset form
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      duration: "30",
      type: "team",
      location: "",
      meetingLink: "",
      attendees: [],
    })
  }

  const handleAttendeeChange = (value: string) => {
    const attendees = value
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean)
    setFormData((prev) => ({ ...prev, attendees }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Schedule Meeting
          </DialogTitle>
          <DialogDescription>Create a new meeting and invite team members</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter meeting title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Meeting Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team">Team Meeting</SelectItem>
                  <SelectItem value="department">Department Meeting</SelectItem>
                  <SelectItem value="project">Project Meeting</SelectItem>
                  <SelectItem value="review">Review Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Meeting agenda and details"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, duration: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Attendees (comma-separated emails)
            </Label>
            <Input
              id="attendees"
              value={formData.attendees.join(", ")}
              onChange={(e) => handleAttendeeChange(e.target.value)}
              placeholder="member@civiclens.com, dept@civiclens.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location (optional)
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Conference Room A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meetingLink" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Meeting Link (optional)
              </Label>
              <Input
                id="meetingLink"
                value={formData.meetingLink}
                onChange={(e) => setFormData((prev) => ({ ...prev, meetingLink: e.target.value }))}
                placeholder="https://meet.google.com/..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Schedule Meeting
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
