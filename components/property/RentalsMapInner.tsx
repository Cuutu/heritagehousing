"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RentalsMapMarker } from "./RentalsMap";
import { formatCLP, formatPriceMapPin } from "@/lib/utils";

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 14 });
  }, [map, points]);
  return null;
}

const DEFAULT_CENTER: [number, number] = [-33.45, -70.65];

function createPriceDivIcon(priceText: string, selected: boolean): L.DivIcon {
  const sel = selected ? "rentals-map-price-pill--selected" : "";
  return L.divIcon({
    className: "rentals-map-marker-root",
    html: `<div class="rentals-map-pin-wrap"><div class="rentals-map-price-pill ${sel}"><span>${priceText}</span></div></div>`,
    iconSize: [88, 44],
    iconAnchor: [44, 44],
    popupAnchor: [0, -46],
  });
}

export function RentalsMapInner({ markers }: { markers: RentalsMapMarker[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const icons = useMemo(() => {
    const map = new Map<string, L.DivIcon>();
    for (const m of markers) {
      const label = formatPriceMapPin(m.pricePerNight);
      map.set(
        m.id,
        createPriceDivIcon(label, activeId === m.id)
      );
    }
    return map;
  }, [markers, activeId]);

  return (
    <MapContainer
      center={center}
      zoom={points.length === 1 ? 14 : 6}
      zoomControl
      scrollWheelZoom
      className="rentals-map-container z-0 h-[min(480px,72vh)] min-h-[340px] w-full overflow-hidden rounded-2xl ring-1 ring-border/50"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      <FitBounds points={points} />
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.latitude, m.longitude]}
          icon={icons.get(m.id)!}
          eventHandlers={{
            popupopen: () => setActiveId(m.id),
            popupclose: () =>
              setActiveId((prev) => (prev === m.id ? null : prev)),
          }}
        >
          <Popup className="rentals-map-popup" minWidth={260} maxWidth={280}>
            <div className="rentals-map-popup-inner font-sans">
              {m.imageUrl ? (
                <Link
                  href={`/alquileres/${m.slug}`}
                  className="relative block aspect-[16/10] w-full overflow-hidden bg-muted"
                >
                  <Image
                    src={m.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="280px"
                    unoptimized
                  />
                </Link>
              ) : null}
              <div className="space-y-2 p-3">
                <p className="line-clamp-2 font-semibold leading-snug text-foreground">
                  {m.name}
                </p>
                <p className="text-xs text-muted-foreground">{m.location}</p>
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {formatCLP(m.pricePerNight)}
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    / noche
                  </span>
                </p>
                <Link
                  href={`/alquileres/${m.slug}`}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[hsl(16,74%,41%)] py-2.5 text-center text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Ver propiedad
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
