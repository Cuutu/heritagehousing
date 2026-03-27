"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RentalsMapMarker } from "./RentalsMap";

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [map, points]);
  return null;
}

const DEFAULT_CENTER: [number, number] = [-33.45, -70.65];

export function RentalsMapInner({ markers }: { markers: RentalsMapMarker[] }) {
  useEffect(() => {
    const proto = L.Icon.Default.prototype as unknown as {
      _getIconUrl?: unknown;
    };
    delete proto._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  }, []);

  const points: [number, number][] = markers.map((m) => [
    m.latitude,
    m.longitude,
  ]);
  const center = points[0] ?? DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={points.length === 1 ? 14 : 6}
      zoomControl
      scrollWheelZoom
      className="z-0 h-[min(420px,70vh)] min-h-[320px] w-full rounded-2xl ring-1 ring-border/60"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />
      {markers.map((m) => (
        <Marker key={m.id} position={[m.latitude, m.longitude]}>
          <Popup>
            <div className="min-w-[200px] space-y-2 p-1 font-sans text-sm">
              <p className="font-semibold text-foreground">{m.name}</p>
              {m.mapAddress ? (
                <p className="text-muted-foreground">{m.mapAddress}</p>
              ) : null}
              <p className="text-muted-foreground">{m.location}</p>
              <Link
                href={`/alquileres/${m.slug}`}
                className="inline-block font-medium text-primary underline-offset-4 hover:underline"
              >
                Ver propiedad
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
