"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { MapPin, AlertTriangle } from "lucide-react"
import type { Issue } from "@/lib/mock-data"
import jharkhandBoundary from "@/lib/jharkhand-boundary.json"

interface LeafletMapClientProps {
  issues: Issue[]
}

// Leaflet types (simplified)
interface Leaflet {
  map: (container: string | HTMLElement, options?: any) => any
  tileLayer: (urlTemplate: string, options?: any) => any
  marker: (latlng: [number, number], options?: any) => any
  divIcon: (options?: any) => any
  popup: (options?: any) => any
  geoJSON: (geojson?: any, options?: any) => any
}

declare global {
  interface Window {
    L?: Leaflet
  }
}

export function LeafletMapClient({ issues }: LeafletMapClientProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      try {
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          const link = document.createElement("link")
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          link.rel = "stylesheet"
          link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          link.crossOrigin = ""
          document.head.appendChild(link)
        }

        // Load Leaflet JS
        if (!window.L) {
          const script = document.createElement("script")
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          script.crossOrigin = ""
          script.onload = initializeMap
          script.onerror = () => setMapError("Failed to load Leaflet")
          document.head.appendChild(script)
        } else {
          initializeMap()
        }
      } catch (error) {
        setMapError("Failed to load Leaflet")
      }
    }

    const initializeMap = () => {
      if (!window.L || !mapContainer.current) return

      try {
        const jharkhandCenter = [23.6139, 85.279] // Approximate center of Jharkhand

        // Initialize map centered on Jharkhand
        map.current = window.L.map(mapContainer.current).setView(jharkhandCenter, 7)

        // Add OpenStreetMap tiles
        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map.current)

        addJharkhandBoundary()

        setMapLoaded(true)
        addIssueMarkers()
      } catch (error) {
        setMapError("Failed to initialize map")
      }
    }

    const addJharkhandBoundary = () => {
      if (!map.current || !window.L) return

      try {
        // Add Jharkhand boundary with red dotted line, no fill
        window.L.geoJSON(jharkhandBoundary, {
          style: {
            color: "#ef4444", // Red color
            weight: 3,
            opacity: 1,
            dashArray: "10, 10", // Dotted line pattern
            fillOpacity: 0, // No fill
            fillColor: "transparent",
          },
        }).addTo(map.current)

        // Fit map bounds to Jharkhand boundary
        const geoJsonLayer = window.L.geoJSON(jharkhandBoundary)
        map.current.fitBounds(geoJsonLayer.getBounds(), {
          padding: [20, 20], // Add some padding around the boundary
        })
      } catch (error) {
        console.error("Failed to add Jharkhand boundary:", error)
      }
    }

    const addIssueMarkers = () => {
      if (!map.current || !window.L) return

      issues.forEach((issue) => {
        let markerColor, markerSize, pulseEffect, markerContent

        if (issue.status === "Reported") {
          markerColor = "#dc2626" // Darker red for pending
          markerSize = 32 // Larger size
          pulseEffect = "animation: pulse 2s infinite;"
          markerContent = `
            <div style="
              width: 4px;
              height: 12px;
              background-color: white;
              border-radius: 2px;
              margin-bottom: 2px;
            "></div>
            <div style="
              width: 4px;
              height: 4px;
              background-color: white;
              border-radius: 50%;
            "></div>
          `
        } else if (issue.status === "In Progress") {
          markerColor = "#ea580c" // Darker orange for in-progress
          markerSize = 30 // Larger size
          pulseEffect = "animation: pulse 2s infinite;"
          markerContent = `
            <div style="
              width: 8px;
              height: 8px;
              background-color: white;
              border-radius: 50%;
            "></div>
          `
        } else {
          markerColor = "#16a34a" // Green for resolved
          markerSize = 24 // Normal size
          pulseEffect = ""
          markerContent = `
            <div style="
              width: 12px;
              height: 6px;
              border-left: 3px solid white;
              border-bottom: 3px solid white;
              transform: rotate(-45deg);
              margin-top: -2px;
            "></div>
          `
        }

        // Create custom marker icon with enhanced visibility
        const customIcon = window.L.divIcon({
          html: `
            <style>
              @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
              }
            </style>
            <div style="
              width: ${markerSize}px;
              height: ${markerSize}px;
              border-radius: 50%;
              background-color: ${markerColor};
              border: 3px solid white;
              box-shadow: 0 4px 8px rgba(0,0,0,0.4), 0 0 0 4px rgba(${markerColor.slice(1)}, 0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              ${pulseEffect}
              position: relative;
              z-index: ${issue.status === "Reported" ? 1000 : issue.status === "In Progress" ? 999 : 998};
            ">
              ${markerContent}
            </div>
          `,
          className: "custom-div-icon",
          iconSize: [markerSize, markerSize],
          iconAnchor: [markerSize / 2, markerSize / 2],
        })

        // Create popup content
        const popupContent = `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">${issue.title}</h3>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${issue.description}</p>
            <div style="display: flex; gap: 4px; margin-bottom: 8px;">
              <span style="background: ${markerColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${issue.status}</span>
              <span style="background: #f3f4f6; color: #374151; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${issue.priority}</span>
            </div>
            <div style="font-size: 11px; color: #666;">
              <div><strong>Department:</strong> ${issue.department}</div>
              <div><strong>Reported by:</strong> ${issue.reportedBy}</div>
              <div><strong>SLA:</strong> ${issue.sla}</div>
            </div>
          </div>
        `

        // Create marker with popup
        window.L.marker([issue.lat, issue.lng], { icon: customIcon }).addTo(map.current).bindPopup(popupContent)
      })
    }

    loadLeaflet()

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [issues])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Issues Map - Jharkhand
          {mapLoaded && (
            <Badge variant="secondary" className="ml-auto">
              {issues.length} markers
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mapError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{mapError}</AlertDescription>
          </Alert>
        )}

        <div className="relative">
          <div ref={mapContainer} className="w-full h-96 rounded-lg overflow-hidden bg-muted" />

          {!mapLoaded && !mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
        </div>

        {mapLoaded && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-md" />
                <span>Pending ({issues.filter((i) => i.status === "Reported").length}) - Pulsing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-600 border-2 border-white shadow-md" />
                <span>In-Progress ({issues.filter((i) => i.status === "In Progress").length}) - Pulsing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600" />
                <span>Resolved ({issues.filter((i) => i.status === "Resolved").length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1 bg-destructive" style={{ borderTop: "2px dashed #ef4444" }} />
                <span>Jharkhand Boundary</span>
              </div>
            </div>
            <span>Click markers for details</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
