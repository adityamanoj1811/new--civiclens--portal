import { LeafletMapClient } from "./leaflet-map-client"
import type { Issue } from "@/lib/mock-data"

interface LeafletServerWrapperProps {
  issues: Issue[]
}

export async function LeafletServerWrapper({ issues }: LeafletServerWrapperProps) {
  return <LeafletMapClient issues={issues} />
}
