"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { Satellite } from "@/lib/satellite-data"
import { Badge } from "./ui/badge"
import { useToast } from "@/hooks/use-toast"
import { MapPin } from "lucide-react"

interface SatelliteControlsProps {
  observerCoords: { lat: number, lon: number };
  minElevation: number;
  onUpdateView: (lat: number, lon: number) => void;
  onSetMinElevation: (value: number) => void;
  visibleSatellites: Satellite[];
  onSelectSatellite: (satellite: Satellite) => void;
}

export function SatelliteControls({
  observerCoords,
  minElevation,
  onUpdateView,
  onSetMinElevation,
  visibleSatellites,
  onSelectSatellite
}: SatelliteControlsProps) {
  const [lat, setLat] = React.useState(observerCoords.lat.toString())
  const [lon, setLon] = React.useState(observerCoords.lon.toString())
  const { toast } = useToast()

  React.useEffect(() => {
    setLat(observerCoords.lat.toString());
    setLon(observerCoords.lon.toString());
  }, [observerCoords]);

  const handleUpdate = () => {
    onUpdateView(parseFloat(lat), parseFloat(lon))
  }

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          onUpdateView(latitude, longitude)
          toast({
            title: "Location Updated",
            description: "Satellite view is now based on your current location.",
          })
        },
        (error) => {
          console.error("Geolocation error:", error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not get your location. Please check your browser settings.",
          })
        }
      )
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Geolocation is not supported by your browser.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Observer Location</CardTitle>
          <CardDescription>Enter coordinates to find visible satellites.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" type="number" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="e.g., 40.7128" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" type="number" value={lon} onChange={(e) => setLon(e.target.value)} placeholder="e.g., -74.0060" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleUpdate} className="w-full">Update View</Button>
            <Button onClick={handleUseMyLocation} variant="outline" className="w-full">
              <MapPin className="mr-2 h-4 w-4" />
              Use My Location
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine the satellites shown on the globe.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="elevation">Minimum Elevation: {minElevation}°</Label>
            <Slider
              id="elevation"
              min={0}
              max={90}
              step={1}
              value={[minElevation]}
              onValueChange={(value) => onSetMinElevation(value[0])}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visible Satellites ({visibleSatellites.length})</CardTitle>
          <CardDescription>Satellites currently visible from your location.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {visibleSatellites.length > 0 ? (
              visibleSatellites.map((sat) => (
                <AccordionItem value={sat.noradId.toString()} key={sat.noradId}>
                  <AccordionTrigger className="text-left">
                    <div>
                      {sat.name}
                      <p className="text-xs text-muted-foreground">{sat.operator}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                       <p><strong>Elevation:</strong> {sat.elevation?.toFixed(2)}°</p>
                      <p><strong>Longitude:</strong> {sat.slotLongitude}°</p>
                      <div className="flex items-center"><strong>Band:&nbsp;</strong><Badge variant="secondary">{sat.band}</Badge></div>
                      <div className="flex items-center"><strong>Status:&nbsp;</strong><Badge variant={sat.status === 'operational' ? 'default' : 'outline'}>{sat.status}</Badge></div>
                      <Button variant="link" className="p-0 h-auto" onClick={() => onSelectSatellite(sat)}>
                        More Details & AI Summary
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No satellites visible with current filters.</p>
            )}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
