"use client";

import type React from "react";
import { useRef } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";

// --- Interface Definitions ---
interface Property {
  id: string;
  name: string;
  type: string;
  listingType: string;
  size: string;
  area: string;
  price: string;
  coordinates: { x: number; y: number };
  sector: string;
}

interface PropertyMapProps {
  properties: Property[];
  selectedProperty: Property | null;
  /** The ID of the property being hovered over in the list view */
  hoveredPropertyId: string | null;
  onPropertyClick: (property: Property) => void;
  isAddMode: boolean;
  onMapClick: (coordinates: { x: number; y: number }) => void;
}

export default function PropertyMap({
  properties,
  selectedProperty,
  hoveredPropertyId, // New prop for hover interaction
  onPropertyClick,
  isAddMode,
  onMapClick,
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reference dimensions for coordinate normalization
  const REFERENCE_WIDTH = 800;
  const REFERENCE_HEIGHT = 600;

  // --- Updated to handle hover state ---
  const getPropertyColor = (property: Property) => {
    // Selected property always gets priority color
    if (selectedProperty?.id === property.id) return "#ef4444"; // red for selected

    // Hovered property gets a highlight color
    if (hoveredPropertyId === property.id) return "#f87171"; // light-red for hovered

    switch (property.type.toLowerCase()) {
      case "villa":
        return "#22c55e"; // green
      case "apartment":
        return "#3b82f6"; // blue
      case "plot":
        return "#eab308"; // yellow
      case "commercial":
        return "#a855f7"; // purple
      default:
        return "#6b7280"; // gray
    }
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const displayedWidth = rect.width;
    const displayedHeight = rect.height;

    const normalizedX = (clickX / displayedWidth) * REFERENCE_WIDTH;
    const normalizedY = (clickY / displayedHeight) * REFERENCE_HEIGHT;

    if (isAddMode) {
      onMapClick({ x: normalizedX, y: normalizedY });
    }
  };

  return (
    <div className="relative">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-y-2">
        <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-xs sm:text-sm">
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
        {isAddMode && (
          <p className="text-sm text-blue-600 font-medium animate-pulse">
            📍 Click to place property
          </p>
        )}
      </div>

      <div
        ref={mapRef}
        className={`relative border rounded-lg overflow-hidden bg-white ${
          isAddMode
            ? "cursor-crosshair ring-2 ring-blue-500"
            : "cursor-grab active:cursor-grabbing"
        }`}
        onClick={handleMapClick}
      >
        <Image
          ref={imageRef}
          src="/sushant-lok-map.png"
          alt="Sushant Lok Property Map"
          width={REFERENCE_WIDTH}
          height={REFERENCE_HEIGHT}
          className="w-full h-auto select-none"
          priority
          draggable="false"
        />

        {/* Property Markers */}
        {properties.map((property) => (
          <div
            key={property.id}
            className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer group"
            style={{
              left: `${(property.coordinates.x / REFERENCE_WIDTH) * 100}%`,
              top: `${(property.coordinates.y / REFERENCE_HEIGHT) * 100}%`,
            }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent map click when clicking a pin
              onPropertyClick(property);
            }}
          >
            <div
              className="relative flex justify-center items-center"
              style={{ color: getPropertyColor(property) }}
            >
              <MapPin
                // --- Dynamic classes for selected and hovered states ---
                className={`w-3 h-3 drop-shadow-lg transition-transform ${
                  selectedProperty?.id === property.id
                    ? "animate-bounce"
                    : "group-hover:scale-110"
                } ${
                  hoveredPropertyId === property.id &&
                  selectedProperty?.id !== property.id
                    ? "scale-125"
                    : ""
                }`}
                fill="currentColor"
              />

              {/* Property Info Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
                <div className="font-medium">{property.name}</div>
                <div>{property.price}</div>
                <div className="text-gray-300">{property.type}</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* This info box can be kept or removed, depending on your preference. The list view already shows this info. */}
      {selectedProperty && !isAddMode && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-in fade-in-50">
          <h3 className="font-semibold text-blue-900 mb-2">
            Selected: {selectedProperty.name}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Type:</span> {selectedProperty.type}
            </div>
            <div>
              <span className="font-medium">Listing:</span>{" "}
              {selectedProperty.listingType}
            </div>
            <div>
              <span className="font-medium">Price:</span>{" "}
              {selectedProperty.price}
            </div>
            <div>
              <span className="font-medium">Size:</span> {selectedProperty.size}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
