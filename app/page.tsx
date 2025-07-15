// @ts-nocheck
"use client";

import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Plus,
  Home,
  DollarSign,
  Ruler,
  Maximize,
  Filter,
  ArrowUpDown,
  X,
} from "lucide-react";
import PropertyMap, { type PropertyMapRef } from "./components/property-map";
import AddPropertyModal from "./components/add-property-modal";

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
  dateListed: string;
}

const areas = [
  "Sushant Lok - I",
  // "DLF Phase 1", "DLF Phase 2", "Sector 43", "Sector 44", "Golf Course Road"
];

// --- More diverse initial properties for better testing ---
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
    dateListed: "2024-06-01",
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
    dateListed: "2024-06-03",
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
    dateListed: "2024-05-28",
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
    dateListed: "2024-06-05",
  },
  {
    id: "5",
    name: "Cozy Studio A-Block",
    type: "Apartment",
    listingType: "Rent",
    size: "80 sq.m",
    area: "861 sq.ft",
    price: "₹25,000/month",
    coordinates: { x: 50, y: 350 },
    sector: "A",
    dateListed: "2024-05-30",
  },
  {
    id: "6",
    name: "Spacious Plot C2-Block",
    type: "Plot",
    listingType: "Buy",
    size: "500 sq.m",
    area: "5382 sq.ft",
    price: "₹4.8 Cr",
    coordinates: { x: 700, y: 420 },
    sector: "C2",
    dateListed: "2024-06-02",
  },
];

// --- Helper function to parse price string to a number for sorting ---
const parsePrice = (priceStr: string): number => {
  const numericString = priceStr.replace(/[^0-9.]/g, "");
  let value = parseFloat(numericString);
  if (priceStr.toLowerCase().includes("cr")) {
    value *= 10000000;
  } else if (priceStr.toLowerCase().includes("lakh")) {
    value *= 100000;
  }
  // We don't adjust for /month, assuming rent values are inherently lower than buy values
  return value;
};

// --- Helper function to parse size string to a number for sorting ---
const parseSize = (sizeStr: string): number => {
  return parseFloat(sizeStr.replace(/[^0-9.]/g, ""));
};

export default function PropertyApp() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedArea, setSelectedArea] = useState("");
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPropertyCoords, setNewPropertyCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isFullscreenAddMode, setIsFullscreenAddMode] = useState(false);

  // Ref to access PropertyMap methods
  const mapRef = useRef<PropertyMapRef>(null);

  // --- QoL State Variables ---
  const [sortOption, setSortOption] = useState("default");
  const [filters, setFilters] = useState<{
    type: string;
    listingType: string;
    date: string;
  }>({ type: "all", listingType: "all", date: "all" });
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(
    null
  );

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area);
    setCurrentStep(2);
  };

  const handleAddPropertyClick = () => {
    setIsFullscreenAddMode(true);
    setIsAddMode(true); // Enable add mode when opening fullscreen
  };

  const handleMapClick = (coordinates: { x: number; y: number }) => {
    if (isAddMode) {
      setNewPropertyCoords(coordinates);
      setIsAddModalOpen(true);
      setIsAddMode(false);
      setIsFullscreenAddMode(false);
    }
  };

  const handleCloseFullscreenAdd = () => {
    setIsFullscreenAddMode(false);
    setIsAddMode(false);
    mapRef.current?.resetView();
  };

  const handleAddProperty = (
    propertyData: Omit<Property, "id" | "coordinates">
  ) => {
    if (newPropertyCoords) {
      const newProperty: Property = {
        ...propertyData,
        id: Date.now().toString(),
        coordinates: newPropertyCoords,
      };
      setProperties([...properties, newProperty]);
      setIsAddModalOpen(false);
      setNewPropertyCoords(null);
    }
  };

  const getPropertyTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "villa":
        return "bg-green-100 text-green-800";
      case "apartment":
        return "bg-blue-100 text-blue-800";
      case "plot":
        return "bg-yellow-100 text-yellow-800";
      case "commercial":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // --- Memoized hook for filtering and sorting properties ---
  const displayedProperties = useMemo(() => {
    let filteredProperties = [...properties];

    // Apply filters
    if (filters.type !== "all") {
      filteredProperties = filteredProperties.filter(
        (p) => p.type === filters.type
      );
    }
    if (filters.listingType !== "all") {
      filteredProperties = filteredProperties.filter(
        (p) => p.listingType === filters.listingType
      );
    }

    // Apply sorting
    switch (sortOption) {
      case "price-desc":
        filteredProperties.sort(
          (a, b) => parsePrice(b.price) - parsePrice(a.price)
        );
        break;
      case "price-asc":
        filteredProperties.sort(
          (a, b) => parsePrice(a.price) - parsePrice(b.price)
        );
        break;
      case "size-desc":
        filteredProperties.sort(
          (a, b) => parseSize(b.size) - parseSize(a.size)
        );
        break;
      case "size-asc":
        filteredProperties.sort(
          (a, b) => parseSize(a.size) - parseSize(b.size)
        );
        break;
      default:
        // No sort or default sort
        break;
    }

    return filteredProperties;
  }, [properties, filters, sortOption]);

  // --- Handlers for filters and sorting ---
  const handleFilterChange = (
    filterType: "type" | "listingType",
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const resetFiltersAndSort = () => {
    setFilters({ type: "all", listingType: "all", date: "all" });
    setSortOption("default");
  };

  const propertyTypes = ["all", ...new Set(properties.map((p) => p.type))];
  const listingTypes = [
    "all",
    ...new Set(properties.map((p) => p.listingType)),
  ];

  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Property Explorer
            </h1>
            <p className="text-lg text-gray-600">
              Discover premium properties in Gurgaon
            </p>
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                ← Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedArea}
                </h1>
                <p className="text-gray-600">
                  Showing {displayedProperties.length} of {properties.length}{" "}
                  properties
                </p>
              </div>
            </div>
            <Button
              onClick={handleAddPropertyClick}
              disabled={isFullscreenAddMode}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {isFullscreenAddMode ? "Selecting Location..." : "Add Property"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Property List and Controls */}
          <div className="flex flex-col space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters & Sorting
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFiltersAndSort}
                  >
                    <X className="w-4 h-4 mr-1" /> Reset
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* Sort Select */}
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="price-desc">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="price-asc">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="size-desc">
                      Size: Large to Small
                    </SelectItem>
                    <SelectItem value="size-asc">
                      Size: Small to Large
                    </SelectItem>
                    <SelectItem value="date-desc">
                      Date: Newest First
                    </SelectItem>
                    <SelectItem value="date-asc">Date: Oldest First</SelectItem>
                  </SelectContent>
                </Select>
                {/* Filter by Property Type */}
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Filter by Listing Type */}
                <Select
                  value={filters.listingType}
                  onValueChange={(value) =>
                    handleFilterChange("listingType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Listing" />
                  </SelectTrigger>
                  <SelectContent>
                    {listingTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Filter by Date Listed */}
                <Select
                  value={filters.date || "all"}
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, date: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="last7">Last 7 Days</SelectItem>
                    <SelectItem value="last30">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <div className="space-y-4 flex-grow overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
              {displayedProperties.length > 0 ? (
                displayedProperties.map((property) => (
                  <Card
                    key={property.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedProperty?.id === property.id
                        ? "ring-2 ring-blue-500 shadow-lg"
                        : ""
                    }`}
                    onClick={() => setSelectedProperty(property)}
                    onMouseEnter={() => setHoveredPropertyId(property.id)}
                    onMouseLeave={() => setHoveredPropertyId(null)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {property.name}
                        </h3>
                        <Badge className={getPropertyTypeColor(property.type)}>
                          {property.type}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Ruler className="w-4 h-4 text-gray-500" />
                          <span>{property.size}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-gray-500" />
                          <span>{property.area}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-green-600">
                            {property.price}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>Sector: {property.sector}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                          <ArrowUpDown className="w-4 h-4 text-gray-500" />
                          <span>
                            Listed:{" "}
                            {property.dateListed
                              ? new Date(
                                  property.dateListed
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Badge variant="secondary">
                          {property.listingType}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p>No properties match your criteria.</p>
                  <p className="text-sm">Try adjusting your filters.</p>
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="space-y-4 sticky top-[160px]">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Property Map
              </h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Maximize className="w-4 h-4 mr-2" />
                    Full View
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Full Property Map View</DialogTitle>
                  </DialogHeader>
                  <div className="w-full h-full p-4">
                    <PropertyMap
                      properties={properties}
                      selectedProperty={selectedProperty}
                      onPropertyClick={setSelectedProperty}
                      isAddMode={false} // Disable add mode in full view
                      onMapClick={() => {}}
                      hoveredPropertyId={hoveredPropertyId}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Card>
              <CardContent className="p-2 md:p-4">
                <PropertyMap
                  ref={mapRef}
                  properties={properties}
                  selectedProperty={selectedProperty}
                  onPropertyClick={setSelectedProperty}
                  isAddMode={isAddMode}
                  onMapClick={handleMapClick}
                  hoveredPropertyId={hoveredPropertyId}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Fullscreen Add Property Mode */}
      <Dialog open={isFullscreenAddMode} onOpenChange={setIsFullscreenAddMode}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center justify-between text-xl">
              <span className="flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                Add Property - Select Location
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseFullscreenAdd}
                className="ml-4"
              >
                Cancel
              </Button>
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Use zoom controls and click precisely where you want to place the
              property
            </p>
          </DialogHeader>
          <div className="flex-1 p-6 pt-2">
            <PropertyMap
              ref={mapRef}
              properties={properties}
              selectedProperty={selectedProperty}
              onPropertyClick={setSelectedProperty}
              isAddMode={isAddMode}
              onMapClick={handleMapClick}
              hoveredPropertyId={hoveredPropertyId}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setNewPropertyCoords(null);
          setIsAddMode(false);
          setIsFullscreenAddMode(false);
          mapRef.current?.resetView(); // Reset zoom when cancelling
        }}
        onAdd={handleAddProperty}
        coordinates={newPropertyCoords}
      />
    </div>
  );
}
