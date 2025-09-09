"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Issue {
  id: string
  lat: number
  lng: number
  title: string
  status: "Pending" | "In-Progress" | "Resolved"
  department: string
}

interface MapPlaceholderProps {
  issues: Issue[]
}

export function MapPlaceholder({ issues }: MapPlaceholderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Issues Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-lg p-8 text-center space-y-4">
          <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Interactive Map View</h3>
            <p className="text-muted-foreground text-pretty">
              Leaflet integration will display {issues.length} issue markers with GPS coordinates
            </p>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Leaflet map with OpenStreetMap tiles will show interactive markers for all issues.
            </AlertDescription>
          </Alert>

          {/* Mock map markers preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
            {issues.slice(0, 8).map((issue) => (
              <div key={issue.id} className="bg-background rounded p-2 text-xs border">
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      issue.status === "Pending"
                        ? "bg-destructive"
                        : issue.status === "In-Progress"
                          ? "bg-chart-3"
                          : "bg-chart-2"
                    }`}
                  />
                  <span className="truncate">{issue.title}</span>
                </div>
                <p className="text-muted-foreground truncate">{issue.department}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
