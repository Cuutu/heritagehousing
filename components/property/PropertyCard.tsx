import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Bed, Bath } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCLP } from "@/lib/utils";

interface PropertyCardProps {
  property: {
    id: string;
    slug: string;
    name: string;
    location: string;
    pricePerNight: unknown;
    maxGuests: number;
    bedrooms: number;
    bathrooms: number;
    images: string[];
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={property.images[0] || "/placeholder.jpg"}
          alt={property.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge className="absolute top-3 left-3" variant="secondary">
          ${formatCLP(Number(property.pricePerNight))}/noche
        </Badge>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
          {property.name}
        </h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4" />
          <span>{property.location}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{property.maxGuests}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/alquileres/${property.slug}`}>Ver Detalles</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
