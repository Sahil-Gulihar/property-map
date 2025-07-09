"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, Home, DollarSign, Ruler } from "lucide-react"
import PropertyMap from "./components/property-map"
import AddPropertyModal from "./components/add-property-modal"

interface Property {
  id: string
  name: string
  type: string
  listingType: string // Add this new field
  size: string
  area: string
  price: string
  coordinates: { x: number; y: number }
  sector: string
}

const areas = ["Sushant Lok - I", 
  // "DLF Phase 1", "DLF Phase 2", "Sector 43", "Sector 44", "Golf Course Road"
]

const initialProperties: Property[] = [
  {
    id: "1",
    name: "Luxury Villa A-Block",
    type: "Villa",
    listingType: "Buy",
    size: "250 sq.m",
    area: "2691 sq.ft",
    price: "₹2.5 Cr",
    coordinates: { x: 150, y: 400 },
    sector: "A",
  },
  {
    id: "2",
    name: "Modern Apartment B-Block",
    type: "Apartment",
    listingType: "Rent",
    size: "180 sq.m",
    area: "1938 sq.ft",
    price: "₹45,000/month",
    coordinates: { x: 400, y: 400 },
    sector: "B",
  },
  {
    id: "3",
    name: "Premium Plot C1-Block",
    type: "Plot",
    listingType: "Buy",
    size: "200 sq.m",
    area: "2153 sq.ft",
    price: "₹1.2 Cr",
    coordinates: { x: 600, y: 250 },
    sector: "C1",
  },
  {
    id: "4",
    name: "Commercial Space D-Block",
    type: "Commercial",
    listingType: "Lease",
    size: "300 sq.m",
    area: "3229 sq.ft",
    price: "₹80,000/month",
    coordinates: { x: 500, y: 400 },
    sector: "D",
  },
]

export default function PropertyApp() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedArea, setSelectedArea] = useState("")
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newPropertyCoords, setNewPropertyCoords] = useState<{ x: number; y: number } | null>(null)
  const [isAddMode, setIsAddMode] = useState(false)

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area)
    setCurrentStep(2)
  }

  const handleAddPropertyClick = () => {
    setIsAddMode(true)
  }

  const handleMapClick = (coordinates: { x: number; y: number }) => {
    if (isAddMode) {
      setNewPropertyCoords(coordinates)
      setIsAddModalOpen(true)
      setIsAddMode(false)
    }
  }

  const handleAddProperty = (propertyData: Omit<Property, "id" | "coordinates">) => {
    if (newPropertyCoords) {
      const newProperty: Property = {
        ...propertyData,
        id: Date.now().toString(),
        coordinates: newPropertyCoords,
      }
      setProperties([...properties, newProperty])
      setIsAddModalOpen(false)
      setNewPropertyCoords(null)
    }
  }

  // Add this helper function
  const getSectorCoordinates = (sector: string): { x: number; y: number } => {
    const sectorMap: { [key: string]: { x: number; y: number } } = {
      A: { x: 150, y: 200 },
      B: { x: 400, y: 300 },
      C1: { x: 600, y: 150 },
      C2: { x: 650, y: 100 },
      D: { x: 500, y: 400 },
      E: { x: 750, y: 200 },
    }
    return sectorMap[sector] || { x: 400, y: 300 } // Default to center if sector not found
  }

  const getPropertyTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "villa":
        return "bg-green-100 text-green-800"
      case "apartment":
        return "bg-blue-100 text-blue-800"
      case "plot":
        return "bg-yellow-100 text-yellow-800"
      case "commercial":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Property Explorer</h1>
            <p className="text-lg text-gray-600">Discover premium properties in Gurgaon</p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Select Area
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select onValueChange={handleAreaSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an area to explore" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                ← Back to Areas
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedArea}</h1>
                <p className="text-gray-600">{properties.length} properties available</p>
              </div>
            </div>
            <Button onClick={handleAddPropertyClick} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {isAddMode ? "Click on map to place property" : "Add Property"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Property List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Available Properties</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {properties.map((property) => (
                <Card
                  key={property.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedProperty?.id === property.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedProperty(property)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg text-gray-900">{property.name}</h3>
                      <Badge className={getPropertyTypeColor(property.type)}>{property.type}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Size:</span>
                        <span className="font-medium">{property.size}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Area:</span>
                        <span className="font-medium">{property.area}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium text-green-600">{property.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Sector:</span>
                        <span className="font-medium">{property.sector}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <Badge variant="outline" className="text-xs">
                        {property.listingType}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Property Map</h2>
            <Card>
              <CardContent className="p-4">
                <PropertyMap
                  properties={properties}
                  selectedProperty={selectedProperty}
                  onPropertyClick={setSelectedProperty}
                  isAddMode={isAddMode}
                  onMapClick={handleMapClick}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setNewPropertyCoords(null)
          setIsAddMode(false)
        }}
        onAdd={handleAddProperty}
        coordinates={newPropertyCoords}
      />
    </div>
  )
}
