export interface Meeting {
  id: string
  title: string
  description: string
  date: Date
  time: string
  duration: number // in minutes
  organizer: string
  attendees: string[]
  type: "team" | "department" | "project" | "review"
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  location?: string
  meetingLink?: string
}

// Mock meetings data
export const mockMeetings: Meeting[] = [
  {
    id: "1",
    title: "Weekly Team Standup",
    description: "Review progress and discuss upcoming tasks",
    date: new Date(2024, 11, 16), // December 16, 2024
    time: "10:00 AM",
    duration: 30,
    organizer: "admin@civiclens.com",
    attendees: ["member@civiclens.com", "dept@civiclens.com"],
    type: "team",
    status: "scheduled",
    meetingLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "2",
    title: "Department Review",
    description: "Monthly department performance review",
    date: new Date(2024, 11, 18), // December 18, 2024
    time: "2:00 PM",
    duration: 60,
    organizer: "dept@civiclens.com",
    attendees: ["admin@civiclens.com", "member@civiclens.com"],
    type: "department",
    status: "scheduled",
    location: "Conference Room A",
  },
  {
    id: "3",
    title: "Project Planning Session",
    description: "Plan Q1 2025 civic improvement projects",
    date: new Date(2024, 11, 20), // December 20, 2024
    time: "11:00 AM",
    duration: 90,
    organizer: "admin@civiclens.com",
    attendees: ["dept@civiclens.com"],
    type: "project",
    status: "scheduled",
    meetingLink: "https://zoom.us/j/123456789",
  },
]

export const getMeetingsForUser = (userEmail: string): Meeting[] => {
  return mockMeetings.filter((meeting) => meeting.organizer === userEmail || meeting.attendees.includes(userEmail))
}

export const getUpcomingMeetings = (userEmail: string, limit = 3): Meeting[] => {
  const userMeetings = getMeetingsForUser(userEmail)
  const now = new Date()

  return userMeetings
    .filter((meeting) => meeting.date >= now && meeting.status === "scheduled")
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, limit)
}

export const addMeeting = (meeting: Omit<Meeting, "id">): Meeting => {
  const newMeeting: Meeting = {
    ...meeting,
    id: Date.now().toString(),
  }
  mockMeetings.push(newMeeting)
  return newMeeting
}
