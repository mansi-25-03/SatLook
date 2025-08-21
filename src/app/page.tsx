"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { SATELLITES, type Satellite } from "@/lib/satellite-data"
import { calculateSatelliteElevation } from "@/lib/geospatial"
import { Header } from "@/components/header"
import { SatelliteControls } from "@/components/satellite-controls"
import { SatelliteDetailsDialog } from "@/components/satellite-details-dialog"
import dynamic from "next/dynamic"

const Globe = dynamic(() => import("@/components/globe").then((mod) => mod.Globe), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center bg-gray-900"><p>Loading Globe...</p></div>,
})

function HomeComponent() {
  const searchParams = useSearchParams()

  const [observerCoords, setObserverCoords] = React.useState({
    lat: 40.7128,
    lon: -74.006,
  })
  const [minElevation, setMinElevation] = React.useState(10)
  const [visibleSatellites, setVisibleSatellites] = React.useState<Satellite[]>([])
  const [selectedSatellite, setSelectedSatellite] = React.useState<Satellite | null>(null)

  React.useEffect(() => {
    const lat = searchParams.get("lat")
    const lon = searchParams.get("lon")
    const minElev = searchParams.get("minElev")

    if (lat && lon) {
      setObserverCoords({ lat: Number(lat), lon: Number(lon) })
    }
    if (minElev) {
      setMinElevation(Number(minElev))
    }
  }, [searchParams])

  React.useEffect(() => {
    const visible = SATELLITES.filter((sat) => {
      const elevation = calculateSatelliteElevation(observerCoords, sat.slotLongitude)
      return elevation >= minElevation
    }).map(sat => ({
      ...sat,
      elevation: calculateSatelliteElevation(observerCoords, sat.slotLongitude)
    })).sort((a,b) => b.elevation! - a.elevation!);
    setVisibleSatellites(visible)
  }, [observerCoords, minElevation])
  
  const handleUpdateView = (lat: number, lon: number) => {
    setObserverCoords({ lat, lon })
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <Header coords={observerCoords} minElevation={minElevation} />
      <main className="flex flex-1 overflow-hidden">
        <div className="w-full max-w-sm border-r border-border p-4 overflow-y-auto">
          <SatelliteControls
            observerCoords={observerCoords}
            minElevation={minElevation}
            onUpdateView={handleUpdateView}
            onSetMinElevation={setMinElevation}
            visibleSatellites={visibleSatellites}
            onSelectSatellite={setSelectedSatellite}
          />
        </div>
        <div className="flex-1 relative">
          <Globe
            key={`${observerCoords.lat}-${observerCoords.lon}`}
            observer={observerCoords}
            satellites={visibleSatellites}
            onSatelliteClick={setSelectedSatellite}
          />
        </div>
      </main>
      {selectedSatellite && (
        <SatelliteDetailsDialog
          satellite={selectedSatellite}
          onOpenChange={(isOpen) => !isOpen && setSelectedSatellite(null)}
        />
      )}
    </div>
  )
}


export default function Home() {
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient ? <HomeComponent /> : null;
}
