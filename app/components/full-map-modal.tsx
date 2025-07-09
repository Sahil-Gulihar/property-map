"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { MapPin, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Property {
  id: string
  name: string
  type: string
  listingType: string
  size: string
  area: string
  price: string
  coordinates: { x: number; y: number }
  sector: string
}

interface FullMapModalProps {
  isOpen: boolean
  onClose: () => void
  properties: Property[]
  selectedProperty: Property | null
  onPropertyClick: (property: Property) => void
  isAddMode: boolean
  onMapClick: (coordinates: { x: number; y: number }) => void
}

export default function FullMapModal({
  isOpen,
  onClose,
  properties,
  selectedProperty,
  onPropertyClick,
  isAddMode,
  onMapClick,
}: FullMapModalProps) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const mapRef = useRef<HTMLDivElement>(null)

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current || isDragging) return

    const rect = mapRef.current.getBoundingClientRect()
    const x = (event.clientX - rect.left - panOffset.x) / zoomLevel
    const y = (event.clientY - rect.top - panOffset.y) / zoomLevel

    if (isAddMode) {
      onMapClick({ x, y })
      return
    }

    // Check if clicking on an existing property
    const clickedProperty = properties.find((property) => {
      const distance = Math.sqrt(Math.pow(property.coordinates.x - x, 2) + Math.pow(property.coordinates.y - y, 2))
      return distance < 20 // 20px radius for clicking
    })

    if (clickedProperty) {
      onPropertyClick(clickedProperty)
    }
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true)
      setDragStart({ x: event.clientX - panOffset.x, y: event.clientY - panOffset.y })
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanOffset({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const getPropertyColor = (property: Property) => {
    if (selectedProperty?.id === property.id) return "#ef4444" // red for selected

    switch (property.type.toLowerCase()) {
      case "villa":
        return "#22c55e" // green
      case "apartment":
        return "#3b82f6" // blue
      case "plot":
        return "#eab308" // yellow
      case "commercial":
        return "#a855f7" // purple
      default:
        return "#6b7280" // gray
    }
  }

  const resetView = () => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              🗺️ Property Map - Full View
              {isAddMode && <span className="text-blue-600 text-sm animate-pulse">📍 Click to place property</span>}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm px-3 py-1 bg-gray-100 rounded min-w-[60px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                disabled={zoomLevel >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetView}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 overflow-hidden max-h-[calc(95vh-100px)] relative">
          <div
            ref={mapRef}
            className={`relative border rounded-lg overflow-hidden bg-white mx-auto select-none ${
              isAddMode ? "cursor-crosshair ring-2 ring-blue-500" : zoomLevel > 1 ? "cursor-grab" : "cursor-pointer"
            } ${isDragging ? "cursor-grabbing" : ""}`}
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              transformOrigin: "0 0",
              width: "800px",
              height: "600px",
            }}
            onClick={handleMapClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <Image
              src="/sushant-lok-map.png"
              alt="Sushant Lok Property Map"
              width={800}
              height={600}
              className="w-full h-auto pointer-events-none"
              priority
              draggable={false}
            />

            {/* Property Markers */}
            {properties.map((property) => (
              <div
                key={property.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{
                  left: `${(property.coordinates.x / 800) * 100}%`,
                  top: `${(property.coordinates.y / 600) * 100}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onPropertyClick(property)
                }}
              >
                <div className="relative" style={{ color: getPropertyColor(property) }}>
                  <MapPin
                    className={`w-3 h-3 drop-shadow-lg transition-transform group-hover:scale-125 ${
                      selectedProperty?.id === property.id ? "animate-bounce" : ""
                    }`}
                    fill="currentColor"
                  />

                  {/* Property Info Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    <div className="font-medium">{property.name}</div>
                    <div>{property.price}</div>
                    <div className="text-gray-300">{property.listingType}</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-600 max-w-xs">
            <div className="font-medium mb-1">Controls:</div>
            <div>• Use zoom buttons to zoom in/out</div>
            <div>• Drag to pan when zoomed in</div>
            <div>• Click properties to select them</div>
            {isAddMode && <div className="text-blue-600 font-medium">• Click anywhere to place new property</div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
