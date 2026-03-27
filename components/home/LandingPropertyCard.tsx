import Link from "next/link";
import Image from "next/image";
import { Bed, Bath, Users } from "lucide-react";
import { formatCLP, cn } from "@/lib/utils";

type Property = {
  id: string;
  slug: string;
  name: string;
  location: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
};

type LandingPropertyCardProps = {
  property: Property;
  variant: "large" | "small";
  featured?: boolean;
  className?: string;
};

export function LandingPropertyCard({
  property,
  variant,
  featured,
  className,
}: LandingPropertyCardProps) {
  const imgHeight = variant === "large" ? "min-h-[280px] sm:min-h-[400px] lg:min-h-[480px]" : "min-h-[180px] sm:min-h-[200px]";
  const priceClass =
    variant === "large" ? "font-mono text-lg sm:text-xl" : "font-mono text-base";

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded border border-[var(--brand-border)] bg-white shadow-sm transition-all duration-300",
        "hover:-translate-y-[3px] hover:border-[var(--brand-border-h)] hover:shadow-[0_12px_40px_rgba(181,69,27,0.1)]",
        "focus-within:border-[var(--brand-border-h)]",
        className
      )}
    >
      <Link
        href={`/alquileres/${property.slug}`}
        className={cn("relative block overflow-hidden", imgHeight)}
      >
        <Image
          src={property.images[0] || "/placeholder.jpg"}
          alt={property.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          sizes={
            variant === "large"
              ? "(max-width: 1024px) 100vw, 55vw"
              : "(max-width: 1024px) 100vw, 32vw"
          }
        />
        {featured && (
          <span className="absolute left-3 top-3 bg-[var(--brand-accent)] px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-wider text-white">
            Destacada
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--brand-accent)]/80">
          {property.location}
        </p>
        <h3
          className={cn(
            "font-display font-normal leading-tight text-[var(--headline)]",
            variant === "large" ? "mt-2 text-2xl sm:text-[28px]" : "mt-1.5 text-lg sm:text-xl"
          )}
        >
          <Link
            href={`/alquileres/${property.slug}`}
            className="transition-colors hover:text-[var(--brand-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]/40"
          >
            {property.name}
          </Link>
        </h3>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-sans text-xs text-[var(--paragraph)]">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            {property.maxGuests} huéspedes
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bed className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            {property.bedrooms}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bath className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            {property.bathrooms}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className={cn(priceClass, "text-[var(--brand-accent)]")}>
            {formatCLP(property.pricePerNight)}{" "}
            <span className="font-sans text-xs font-normal text-[var(--paragraph)]">
              / noche
            </span>
          </p>
          <Link
            href={`/alquileres/${property.slug}`}
            className="font-mono text-[11px] uppercase tracking-wide text-[var(--brand-accent)] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:translate-x-1"
          >
            Ver detalles →
          </Link>
        </div>
      </div>
    </article>
  );
}
