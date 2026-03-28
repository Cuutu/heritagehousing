"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [map, lat, lng]);
  return null;
}

type SinglePropertyMapProps = {
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string | null;
};

export function SinglePropertyMap({
  latitude,
  longitude,
  title,
  subtitle,
}: SinglePropertyMapProps) {
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

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      zoomControl
      scrollWheelZoom
      className="z-0 h-[min(380px,55vh)] min-h-[280px] w-full rounded-xl ring-1 ring-border/60"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter lat={latitude} lng={longitude} />
      <Marker position={[latitude, longitude]}>
        <Popup>
          <div className="min-w-[180px] space-y-1 p-1 font-sans text-sm">
            <p className="font-semibold">{title}</p>
            {subtitle ? (
              <p className="text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
