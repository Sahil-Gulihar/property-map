"use client";

import type React from "react";
import {
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import Image from "next/image";
import { MapPin, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export interface PropertyMapRef {
  resetView: () => void;
}

const PropertyMap = forwardRef<PropertyMapRef, PropertyMapProps>(
  (
    {
      properties,
      selectedProperty,
      hoveredPropertyId, // New prop for hover interaction
      onPropertyClick,
      isAddMode,
      onMapClick,
    },
    ref
  ) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Zoom and pan state
    const [scale, setScale] = useState(1);
    const [translateX, setTranslateX] = useState(0);
    const [translateY, setTranslateY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
    const [hasDraggedSignificantly, setHasDraggedSignificantly] =
      useState(false);
    const [mouseCoords, setMouseCoords] = useState<{
      x: number;
      y: number;
    } | null>(null);

    // Reference dimensions for coordinate normalization
    const REFERENCE_WIDTH = 800;
    const REFERENCE_HEIGHT = 600;
    const MIN_SCALE = 0.5;
    const MAX_SCALE = 4;
    const DRAG_THRESHOLD = 5; // Minimum pixels to consider it a drag vs click

    const handleResetView = useCallback(() => {
      setScale(1);
      setTranslateX(0);
      setTranslateY(0);
    }, []);

    // Zoom functions
    const handleZoomIn = useCallback(() => {
      setScale((prev) => Math.min(prev * 1.2, MAX_SCALE));
    }, [MAX_SCALE]);

    const handleZoomOut = useCallback(() => {
      setScale((prev) => Math.max(prev / 1.2, MIN_SCALE));
    }, [MIN_SCALE]);

    // Expose reset function via ref
    useImperativeHandle(
      ref,
      () => ({
        resetView: handleResetView,
      }),
      [handleResetView]
    );

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

    // Mouse wheel zoom
    const handleWheel = useCallback(
      (event: React.WheelEvent) => {
        event.preventDefault();
        const delta = -event.deltaY;
        const zoomFactor = delta > 0 ? 1.05 : 0.95; // Smoother zoom

        if (!mapRef.current || !imageRef.current) return;

        const rect = imageRef.current.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const newScale = Math.min(
          Math.max(scale * zoomFactor, MIN_SCALE),
          MAX_SCALE
        );

        if (newScale !== scale) {
          // Zoom towards mouse position with better calculation
          const scaleDiff = newScale - scale;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const newTranslateX =
            translateX - ((mouseX - centerX) * scaleDiff) / scale;
          const newTranslateY =
            translateY - ((mouseY - centerY) * scaleDiff) / scale;

          setScale(newScale);
          setTranslateX(newTranslateX);
          setTranslateY(newTranslateY);
        }
      },
      [scale, translateX, translateY, MIN_SCALE, MAX_SCALE]
    );

    // Pan functions
    const handleMouseDown = useCallback(
      (event: React.MouseEvent) => {
        setIsDragging(true);
        setHasDraggedSignificantly(false);
        setInitialMousePos({ x: event.clientX, y: event.clientY });
        setDragStart({
          x: event.clientX - translateX,
          y: event.clientY - translateY,
        });
      },
      [translateX, translateY]
    );

    const handleMouseMove = useCallback(
      (event: React.MouseEvent) => {
        if (isAddMode && !isDragging && mapRef.current && imageRef.current) {
          // Update mouse coordinates for display in add mode
          const rect = imageRef.current.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;

          // Convert mouse position to percentage of the image
          const percentX = (mouseX / rect.width) * 100;
          const percentY = (mouseY / rect.height) * 100;

          // Convert percentage to our reference coordinate system
          const normalizedX = (percentX / 100) * REFERENCE_WIDTH;
          const normalizedY = (percentY / 100) * REFERENCE_HEIGHT;

          setMouseCoords({
            x: Math.round(normalizedX),
            y: Math.round(normalizedY),
          });
        }

        if (isDragging) {
          // Check if we've dragged beyond the threshold
          const dragDistance = Math.sqrt(
            Math.pow(event.clientX - initialMousePos.x, 2) +
              Math.pow(event.clientY - initialMousePos.y, 2)
          );

          if (dragDistance > DRAG_THRESHOLD) {
            setHasDraggedSignificantly(true);
          }

          event.preventDefault();
          setTranslateX(event.clientX - dragStart.x);
          setTranslateY(event.clientY - dragStart.y);
        }
      },
      [
        isDragging,
        isAddMode,
        dragStart,
        scale,
        translateX,
        translateY,
        REFERENCE_WIDTH,
        REFERENCE_HEIGHT,
        initialMousePos,
        DRAG_THRESHOLD,
      ]
    );

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    const handleMouseLeave = useCallback(() => {
      setIsDragging(false);
      setHasDraggedSignificantly(false);
      setMouseCoords(null);
    }, []);

    const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (!mapRef.current || !imageRef.current) return;

      // Don't process click if we just finished dragging significantly
      if (hasDraggedSignificantly) {
        setHasDraggedSignificantly(false);
        return;
      }

      // Get the image element's bounding box (this is the actual rendered image)
      const rect = imageRef.current.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      // Convert click position to percentage of the image (0-100%)
      const percentX = (clickX / rect.width) * 100;
      const percentY = (clickY / rect.height) * 100;

      // Convert percentage to our reference coordinate system
      const normalizedX = (percentX / 100) * REFERENCE_WIDTH;
      const normalizedY = (percentY / 100) * REFERENCE_HEIGHT;

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
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-3 bg-white border rounded-lg p-1 shadow-sm">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomIn}
                disabled={scale >= MAX_SCALE}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600 min-w-[3rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomOut}
                disabled={scale <= MIN_SCALE}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleResetView}
                title="Reset view"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
            {isAddMode && (
              <div className="flex flex-col gap-1">
                <p className="text-sm text-blue-600 font-medium">
                  📍 Zoom & click to place property
                </p>
                {mouseCoords && (
                  <p className="text-xs text-gray-500">
                    Position: ({mouseCoords.x}, {mouseCoords.y})
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  💡 Use mouse wheel to zoom, drag to pan
                </p>
              </div>
            )}
            {!isAddMode && (
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400">
                  💡 Use mouse wheel to zoom, drag to pan
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          ref={mapRef}
          className={`relative border rounded-lg overflow-hidden bg-white ${
            isAddMode
              ? isDragging
                ? "cursor-grabbing ring-2 ring-blue-500"
                : "cursor-crosshair ring-2 ring-blue-500"
              : isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
          }`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="relative"
            style={{
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
              transformOrigin: "0 0",
              transition: isDragging
                ? "none"
                : "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onClick={handleMapClick}
          >
            <Image
              ref={imageRef}
              src="/sushant-lok-map.png"
              alt="Sushant Lok Property Map"
              width={REFERENCE_WIDTH}
              height={REFERENCE_HEIGHT}
              className="w-full h-auto select-none block"
              priority
              draggable="false"
            />

            {/* Property Markers */}
            {properties.map((property) => (
              <div
                key={property.id}
                className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer group z-10"
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
                    className={`w-6 h-6 drop-shadow-lg transition-transform ${
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
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-20 pointer-events-none">
                    <div className="font-medium">{property.name}</div>
                    <div>{property.price}</div>
                    <div className="text-gray-300">{property.type}</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* This info box can be kept or removed, depending on your preference. The list view already shows this info. */}
        {selectedProperty && !isAddMode && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-in fade-in-50">
            <h3 className="font-semibold text-blue-900 mb-2">
              Selected: {selectedProperty.name}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Type:</span>{" "}
                {selectedProperty.type}
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
                <span className="font-medium">Size:</span>{" "}
                {selectedProperty.size}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

PropertyMap.displayName = "PropertyMap";

export default PropertyMap;
