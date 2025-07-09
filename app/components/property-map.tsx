"use client"

import type React from "react"

import { useRef, useState } from "react"
import Image from "next/image"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import FullMapModal from "./full-map-modal"

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

interface PropertyMapProps {
  properties: Property[]
  selectedProperty: Property | null
  onPropertyClick: (property: Property) => void
  isAddMode: boolean
  onMapClick: (coordinates: { x: number; y: number }) => void
}

export default function PropertyMap({
  properties,
  selectedProperty,
  onPropertyClick,
  isAddMode,
  onMapClick,
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isFullMapOpen, setIsFullMapOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  const handlePropertyClick = (property: Property) => {
    onPropertyClick(property)
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

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return

    const rect = mapRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

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

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Villa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Apartment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Plot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Commercial</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAddMode && (
            <p className="text-sm text-blue-600 font-medium animate-pulse">
              📍 Click anywhere on the map to place your property
            </p>
          )}
          <Button variant="outline" size="sm" onClick={() => setIsFullMapOpen(true)}>
            🔍 View Full Map
          </Button>
        </div>
      </div>

      <div
        ref={mapRef}
        className={`relative border rounded-lg overflow-hidden bg-white ${
          isAddMode ? "cursor-crosshair ring-2 ring-blue-500" : "cursor-pointer"
        }`}
        onClick={handleMapClick}
      >
        <Image
          src="/sushant-lok-map.png"
          alt="Sushant Lok Property Map"
          width={800}
          height={600}
          className="w-full h-auto"
          priority
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
            onClick={() => handlePropertyClick(property)}
          >
            <div className="relative" style={{ color: getPropertyColor(property) }}>
              <MapPin
                className={`w-4 h-4 drop-shadow-lg transition-transform group-hover:scale-110 ${
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

      {selectedProperty && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Selected Property</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Name:</span> {selectedProperty.name}
            </div>
            <div>
              <span className="font-medium">Type:</span> {selectedProperty.type}
            </div>
            <div>
              <span className="font-medium">Listing:</span> {selectedProperty.listingType}
            </div>
            <div>
              <span className="font-medium">Size:</span> {selectedProperty.size}
            </div>
            <div>
              <span className="font-medium">Price:</span> {selectedProperty.price}
            </div>
            <div>
              <span className="font-medium">Sector:</span> {selectedProperty.sector}
            </div>
          </div>
        </div>
      )}
      <FullMapModal
        isOpen={isFullMapOpen}
        onClose={() => setIsFullMapOpen(false)}
        properties={properties}
        selectedProperty={selectedProperty}
        onPropertyClick={onPropertyClick}
        isAddMode={isAddMode}
        onMapClick={onMapClick}
      />
    </div>
  )
}
