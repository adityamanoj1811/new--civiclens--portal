"use client"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, AlertCircle } from "lucide-react"
import type { Issue } from "@/lib/mock-data"

declare global {
  interface Window {
    mapboxgl?: any
  }
}

interface MapboxHeatmapProps {
  issues: Issue[]
}

export function MapboxHeatmap({ issues }: MapboxHeatmapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [filter, setFilter] = useState("All")
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Convert issues into GeoJSON
  const getGeoJson = (status: string) => {
    const filtered =
      status === "All"
        ? issues
        : issues.filter((i) => {
            if (status === "Pending") return i.status === "Pending" || i.status === "Reported"
            if (status === "In-Progress") return i.status === "In-Progress"
            if (status === "Resolved") return i.status === "Resolved"
            return true
          })
    return {
      type: "FeatureCollection",
      features: filtered.map((i) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [i.lng, i.lat],
        },
        properties: {
          status: i.status,
          title: i.title,
          department: i.department,
          priority: i.priority,
        },
      })),
    }
  }

  useEffect(() => {
    if (mapRef.current) return // initialize map only once

    const loadMapbox = async () => {
      try {
        setIsLoading(true)
        setMapError(null)

        if (!window.mapboxgl) {
          await new Promise<void>((resolve, reject) => {
            // Load CSS first
            const link = document.createElement("link")
            link.href = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css"
            link.rel = "stylesheet"
            document.head.appendChild(link)

            // Load JS
            const script = document.createElement("script")
            script.src = "https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"
            script.onload = () => resolve()
            script.onerror = () => reject(new Error("Failed to load Mapbox GL JS"))
            document.head.appendChild(script)
          })
        }

        if (!mapContainer.current) {
          throw new Error("Map container not ready")
        }

        initializeMap()
      } catch (error) {
        console.error("Failed to load Mapbox:", error)
        setMapError("Failed to load map. Please refresh the page.")
        setIsLoading(false)
      }
    }

    const initializeMap = () => {
      try {
        if (!window.mapboxgl || !mapContainer.current) return

        window.mapboxgl.accessToken =
          "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"

        mapRef.current = new window.mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: [85.279, 23.6139], // Jharkhand center
          zoom: 7,
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: true,
        })

        mapRef.current.on("error", (e: any) => {
          console.error("Map error:", e)
          setMapError("Map failed to load properly. Using fallback view.")
          setIsLoading(false)
        })

        mapRef.current.on("load", () => {
          console.log("[v0] Map loaded successfully")
          setMapLoaded(true)
          setIsLoading(false)
          updateHeatmap()
        })

        setTimeout(() => {
          if (!mapLoaded && !mapError) {
            setMapError("Map is taking too long to load. Please refresh the page.")
            setIsLoading(false)
          }
        }, 10000)
      } catch (error) {
        console.error("Map initialization error:", error)
        setMapError("Failed to initialize map. Please refresh the page.")
        setIsLoading(false)
      }
    }

    loadMapbox()
  }, [])

  const updateHeatmap = () => {
    if (!mapRef.current || !mapLoaded) return

    try {
      // Remove existing layers and sources
      if (mapRef.current.getLayer("issues-heatmap")) {
        mapRef.current.removeLayer("issues-heatmap")
      }
      if (mapRef.current.getSource("issues")) {
        mapRef.current.removeSource("issues")
      }

      // Add source
      mapRef.current.addSource("issues", {
        type: "geojson",
        data: getGeoJson(filter),
      })

      mapRef.current.addLayer({
        id: "issues-heatmap",
        type: "heatmap",
        source: "issues",
        maxzoom: 15,
        paint: {
          "heatmap-weight": 1,
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 15, 3],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 20, 15, 40],
          "heatmap-opacity": 0.8,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(33,102,172,0)",
            0.2,
            "rgb(103,169,207)",
            0.4,
            "rgb(209,229,240)",
            0.6,
            "rgb(253,219,199)",
            0.8,
            "rgb(239,138,98)",
            1,
            "rgb(178,24,43)",
          ],
        },
      })

      console.log("[v0] Heatmap updated successfully")
    } catch (error) {
      console.error("Error updating heatmap:", error)
    }
  }

  // Update data on filter change
  useEffect(() => {
    if (mapLoaded) {
      updateHeatmap()
    }
  }, [filter, mapLoaded])

  const filterButtons = [
    { key: "All", label: "All Issues", count: issues.length },
    {
      key: "Pending",
      label: "Pending",
      count: issues.filter((i) => i.status === "Pending" || i.status === "Reported").length,
    },
    { key: "In-Progress", label: "In-Progress", count: issues.filter((i) => i.status === "In-Progress").length },
    { key: "Resolved", label: "Resolved", count: issues.filter((i) => i.status === "Resolved").length },
  ]

  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <MapPin className="h-5 w-5" />
            Issues Heatmap - Jharkhand
            {mapLoaded && (
              <Badge variant="secondary" className="ml-2">
                {getGeoJson(filter).features.length} issues
              </Badge>
            )}
          </CardTitle>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {filterButtons.map((filterBtn) => (
            <Button
              key={filterBtn.key}
              variant={filter === filterBtn.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterBtn.key)}
              className={`rounded-xl ${
                filter === filterBtn.key
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              {filterBtn.label} ({filterBtn.count})
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <div className="relative">
          {/* Map container */}
          <div ref={mapContainer} className="w-full h-[500px] rounded-2xl overflow-hidden bg-muted shadow-lg" />

          {isLoading && !mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-2xl">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                <p className="text-sm text-muted-foreground">Loading heatmap...</p>
              </div>
            </div>
          )}

          {mapError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-2xl">
              <div className="text-center space-y-2">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
                <p className="text-sm text-red-600">{mapError}</p>
                <Button size="sm" onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
                  Refresh Page
                </Button>
              </div>
            </div>
          )}
        </div>

        {mapLoaded && !mapError && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p className="text-center">
              Heatmap shows issue density across Jharkhand. Darker areas indicate higher issue concentration.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
