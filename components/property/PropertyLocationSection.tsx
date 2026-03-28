import dynamic from "next/dynamic";
import Link from "next/link";
import { ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const SinglePropertyMap = dynamic(
  () =>
    import("./SinglePropertyMap").then((m) => m.SinglePropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(380px,55vh)] min-h-[280px] items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
        Cargando mapa…
      </div>
    ),
  }
);

type PropertyLocationSectionProps = {
  name: string;
  location: string;
  mapAddress: string | null;
  googleMapsLink: string | null;
  latitude: number | null;
  longitude: number | null;
};

function openMapsHref(p: PropertyLocationSectionProps): string {
  if (p.googleMapsLink?.trim()) return p.googleMapsLink.trim();
  if (p.latitude != null && p.longitude != null) {
    return `https://www.google.com/maps?q=${p.latitude},${p.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    p.mapAddress || p.location
  )}`;
}

export function PropertyLocationSection(p: PropertyLocationSectionProps) {
  const hasCoords =
    p.latitude != null &&
    p.longitude != null &&
    Number.isFinite(p.latitude) &&
    Number.isFinite(p.longitude);

  const addressLine = p.mapAddress?.trim() || p.location;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{addressLine}</span>
        </div>
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <Link href={openMapsHref(p)} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Abrir en Google Maps
          </Link>
        </Button>
      </div>

      {hasCoords ? (
        <SinglePropertyMap
          latitude={p.latitude!}
          longitude={p.longitude!}
          title={p.name}
          subtitle={p.mapAddress}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Para ver el mapa aquí, en el admin cargá un{" "}
            <strong>enlace de Google Maps</strong> y usá &quot;Extraer
            coordenadas&quot;, o ingresá latitud y longitud manualmente.
          </p>
        </div>
      )}
    </div>
  );
}
