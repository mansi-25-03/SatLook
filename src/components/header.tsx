"use client"

import * as React from "react"
import { Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"

interface HeaderProps {
  coords: { lat: number, lon: number };
  minElevation: number;
}

export function Header({ coords, minElevation }: HeaderProps) {
  const { toast } = useToast()

  const handleShare = () => {
    const url = new URL(window.location.href)
    url.searchParams.set("lat", coords.lat.toFixed(4))
    url.searchParams.set("lon", coords.lon.toFixed(4))
    url.searchParams.set("minElev", minElevation.toString())
    
    navigator.clipboard.writeText(url.toString())
    toast({
      title: "Link Copied!",
      description: "You can now share this view with others.",
    })
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-4 py-2 shrink-0">
      <div className="flex items-center gap-2">
        <Icons.logo className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tighter text-foreground">
          SatLook
        </h1>
      </div>
      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="mr-2 h-4 w-4" />
        Share View
      </Button>
    </header>
  )
}
