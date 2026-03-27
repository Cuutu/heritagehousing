import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Bed, Bath } from "lucide-react";
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
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border/60 transition-shadow duration-300 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)]">
      <Link
        href={`/alquileres/${property.slug}`}
        className="relative aspect-[16/11] overflow-hidden"
      >
        <Image
          src={property.images[0] || "/placeholder.jpg"}
          alt={property.name}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
        <p className="absolute bottom-3 left-3 font-display text-sm font-semibold text-white drop-shadow-sm">
          {formatCLP(Number(property.pricePerNight))}{" "}
          <span className="font-normal opacity-90">/ noche</span>
        </p>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-foreground line-clamp-2">
          <Link
            href={`/alquileres/${property.slug}`}
            className="transition-colors hover:text-primary"
          >
            {property.name}
          </Link>
        </h3>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <span className="line-clamp-1">{property.location}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
            {property.maxGuests} huéspedes
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bed className="h-3.5 w-3.5" strokeWidth={1.75} />
            {property.bedrooms}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bath className="h-3.5 w-3.5" strokeWidth={1.75} />
            {property.bathrooms}
          </span>
        </div>

        <Button
          asChild
          className="mt-6 w-full rounded-full"
          variant="secondary"
        >
          <Link href={`/alquileres/${property.slug}`}>Ver detalle</Link>
        </Button>
      </div>
    </article>
  );
}
