"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import type { Satellite } from "@/lib/satellite-data"
import { getSatelliteInfo } from "@/ai/flows/satellite-info-assistant"
import { Sparkles } from "lucide-react"

interface SatelliteDetailsDialogProps {
  satellite: Satellite;
  onOpenChange: (open: boolean) => void;
}

export function SatelliteDetailsDialog({ satellite, onOpenChange }: SatelliteDetailsDialogProps) {
  const [summary, setSummary] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()

  const handleGetSummary = async () => {
    setIsLoading(true)
    setSummary(null)
    try {
      const result = await getSatelliteInfo({ satelliteName: satellite.name })
      setSummary(result.summary)
    } catch (error) {
      console.error("AI summary failed:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not retrieve AI summary.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={!!satellite} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{satellite.name}</DialogTitle>
          <DialogDescription>
            {satellite.operator} - NORAD ID: {satellite.noradId}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="font-semibold">Orbital Slot:</div>
            <div>{satellite.slotLongitude}°</div>
            <div className="font-semibold">Frequency Band:</div>
            <div><Badge variant="secondary">{satellite.band}</Badge></div>
            <div className="font-semibold">Status:</div>
            <div><Badge variant={satellite.status === 'operational' ? 'default' : 'outline'}>{satellite.status}</Badge></div>
             <div className="font-semibold">Elevation:</div>
            <div>{satellite.elevation?.toFixed(2)}°</div>
          </div>
          
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold">AI Satellite Assistant</h4>
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            )}
            {summary && <p className="text-sm text-muted-foreground">{summary}</p>}
            {!summary && !isLoading && <p className="text-sm text-muted-foreground">Click the button to get an AI-generated summary.</p>}
          </div>

        </div>
        <DialogFooter>
          <Button onClick={handleGetSummary} disabled={isLoading}>
            <Sparkles className="mr-2 h-4 w-4" />
            {isLoading ? "Generating..." : "Get AI Summary"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
