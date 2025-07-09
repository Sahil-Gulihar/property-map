"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin } from "lucide-react"

interface Property {
  name: string
  type: string
  listingType: string
  size: string
  area: string
  price: string
  sector: string
}

interface AddPropertyModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (property: Property) => void
  coordinates: { x: number; y: number } | null
}

export default function AddPropertyModal({ isOpen, onClose, onAdd, coordinates }: AddPropertyModalProps) {
  const [formData, setFormData] = useState<Property>({
    name: "",
    type: "",
    listingType: "",
    size: "",
    area: "",
    price: "",
    sector: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (coordinates && Object.values(formData).every((value) => value.trim() !== "")) {
      onAdd(formData)
      setFormData({
        name: "",
        type: "",
        listingType: "",
        size: "",
        area: "",
        price: "",
        sector: "",
      })
    }
  }

  const handleInputChange = (field: keyof Property, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Add New Property
          </DialogTitle>
        </DialogHeader>

        {coordinates && (
          <div className="text-sm text-gray-600 mb-4 p-2 bg-blue-50 rounded">
            📍 Property will be placed at: ({Math.round(coordinates.x)}, {Math.round(coordinates.y)})
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Property Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Luxury Villa A-Block"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Property Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Villa">Villa</SelectItem>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Plot">Plot</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="listingType">Listing Type</Label>
            <Select value={formData.listingType} onValueChange={(value) => handleInputChange("listingType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select listing type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Buy">Buy</SelectItem>
                <SelectItem value="Rent">Rent</SelectItem>
                <SelectItem value="Lease">Lease</SelectItem>
                <SelectItem value="PG">PG</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="size">Size (sq.m)</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => handleInputChange("size", e.target.value)}
                placeholder="e.g., 250 sq.m"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area (sq.ft)</Label>
              <Input
                id="area"
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
                placeholder="e.g., 2691 sq.ft"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="e.g., ₹2.5 Cr"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Select value={formData.sector} onValueChange={(value) => handleInputChange("sector", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Sector A</SelectItem>
                  <SelectItem value="B">Sector B</SelectItem>
                  <SelectItem value="C1">Sector C1</SelectItem>
                  <SelectItem value="C2">Sector C2</SelectItem>
                  <SelectItem value="D">Sector D</SelectItem>
                  <SelectItem value="E">Sector E</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Property
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
