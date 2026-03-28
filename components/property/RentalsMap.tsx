"use client";

import dynamic from "next/dynamic";

const Inner = dynamic(
  () => import("./RentalsMapInner").then((m) => m.RentalsMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(480px,72vh)] min-h-[340px] w-full animate-pulse items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
        Cargando mapa…
      </div>
    ),
  }
);

export type RentalsMapMarker = {
  id: string;
  slug: string;
  name: string;
  location: string;
  mapAddress: string | null;
  latitude: number;
  longitude: number;
  pricePerNight: number;
  imageUrl: string | null;
};

export function RentalsMap({ markers }: { markers: RentalsMapMarker[] }) {
  if (markers.length === 0) return null;
  return <Inner markers={markers} />;
}
