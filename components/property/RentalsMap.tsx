"use client";

import dynamic from "next/dynamic";

const Inner = dynamic(
  () => import("./RentalsMapInner").then((m) => m.RentalsMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(420px,70vh)] min-h-[320px] w-full animate-pulse items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
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
};

export function RentalsMap({ markers }: { markers: RentalsMapMarker[] }) {
  if (markers.length === 0) return null;
  return <Inner markers={markers} />;
}
