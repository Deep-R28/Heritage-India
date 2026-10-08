"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import type { Site } from "@/lib/data";
import { brand } from "@/lib/tokens";
import { cn } from "@/lib/cn";

function goldPinIcon(highlighted = false) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: ${highlighted ? 36 : 28}px;
      height: ${highlighted ? 36 : 28}px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: ${brand.gold};
      border: 2px solid rgba(11,11,11,0.6);
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span class="material-symbols-outlined" style="
        transform: rotate(45deg);
        color: #0B0B0B;
        font-size: ${highlighted ? 18 : 14}px;
      ">account_balance</span>
    </div>`,
    iconSize: [highlighted ? 36 : 28, highlighted ? 36 : 28],
    iconAnchor: [highlighted ? 18 : 14, highlighted ? 36 : 28],
  });
}

function FlyTo({ lat, lng }: { lat?: number; lng?: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.flyTo([lat, lng], 12, { duration: 0.8 });
  }, [lat, lng, map]);
  return null;
}

export function SiteMap({
  sites,
  selectedId,
  onSelect,
  flyTo,
  className,
  tileTheme = "dark",
}: {
  sites: Site[];
  selectedId?: string;
  onSelect?: (site: Site) => void;
  flyTo?: { lat: number; lng: number };
  className?: string;
  tileTheme?: "dark" | "light";
}) {
  return (
    <MapContainer
      center={[22.5, 79]}
      zoom={5}
      scrollWheelZoom
      className={cn(className, tileTheme === "dark" && "map-dark-filter")}
      style={{ width: "100%", height: "100%", background: "rgb(var(--background))" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {flyTo && <FlyTo lat={flyTo.lat} lng={flyTo.lng} />}
      {sites.map((site) => (
        <Marker
          key={site.id}
          position={[site.lat, site.lng]}
          icon={goldPinIcon(site.id === selectedId)}
          eventHandlers={{ click: () => onSelect?.(site) }}
        >
          <Popup>{site.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
