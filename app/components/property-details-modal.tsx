"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Phone,
  MapPin,
  Home,
  Ruler,
  Tag,
  Banknote,
  Percent,
} from "lucide-react";

// The full Property interface
export interface Property {
  id: string;
  name: string;
  plotNo: string;
  sector: string;
  type: string;
  listingType: string;
  size: string;
  area: string;
  price: string;
  rate: string;
  white: string;
  sellerName: string;
  contact: string;
  coordinates: { x: number; y: number };
}

interface PropertyDetailsModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | undefined;
}) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4">
      <div className="text-muted-foreground mt-1 flex-shrink-0 w-5 h-5">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export function PropertyDetailsModal({
  property,
  isOpen,
  onClose,
}: PropertyDetailsModalProps) {
  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {property.name}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4 pt-1">
            <Badge variant="outline">{property.type}</Badge>
            <Badge variant="secondary">{property.listingType}</Badge>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
          {/* Seller Info */}
          <DetailRow
            icon={<User size={18} />}
            label="Seller Name"
            value={property.sellerName}
          />
          <DetailRow
            icon={<Phone size={18} />}
            label="Contact"
            value={property.contact}
          />

          {/* Location Info */}
          <DetailRow
            icon={<MapPin size={18} />}
            label="Plot Number"
            value={property.plotNo}
          />
          <DetailRow
            icon={<Home size={18} />}
            label="Sector"
            value={property.sector}
          />

          {/* Size & Price Info */}
          <DetailRow
            icon={<Ruler size={18} />}
            label="Size"
            value={`${property.size} (${property.area})`}
          />
          <DetailRow
            icon={<Tag size={18} />}
            label="Rate"
            value={property.rate}
          />
          <DetailRow
            icon={<Banknote size={18} />}
            label="Total Price"
            value={property.price}
          />
          <DetailRow
            icon={<Percent size={18} />}
            label="White Component"
            value={property.white}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
