"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Site } from "@/lib/data";
import { brand } from "@/lib/tokens";
import { cn } from "@/lib/cn";
import { categoryLabelKey } from "@/lib/categories";

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
  const { t } = useTranslation();

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
          <Popup minWidth={240} maxWidth={280}>
            <div className="w-64 p-3 font-sans text-left">
              <div className="relative mb-2.5 h-32 w-full overflow-hidden rounded-lg bg-black/60">
                {site.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={site.image}
                    alt={site.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
                    No image
                  </div>
                )}
                <span className="absolute left-2 top-2 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400 backdrop-blur-sm">
                  {t(categoryLabelKey(site.category))}
                </span>
                {site.googleRating && (
                  <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-semibold text-amber-300 backdrop-blur-sm">
                    ★ {site.googleRating}
                  </span>
                )}
              </div>

              <h4 className="mb-0.5 line-clamp-1 font-headline text-base font-bold text-foreground">
                {site.name}
              </h4>
              <p className="mb-2 line-clamp-1 text-xs text-stone-400">
                {site.region} {site.zone ? `· ${site.zone}` : ""}
              </p>

              <div className="mb-3 flex items-center justify-between border-t border-b border-white/10 py-1.5 text-xs">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-stone-400">{t("siteDetail.entryFee") || "Entry Fee"}</span>
                  <span className="font-semibold text-amber-400">
                    {site.priceInr === 0 ? (t("explore.freeEntry") || "Free Entry") : `₹${site.priceInr}`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] uppercase tracking-wider text-stone-400">{t("siteDetail.crowd.heading") || "Crowd"}</span>
                  <span
                    className={cn(
                      "text-[11px] font-semibold",
                      site.crowdPercent < 40
                        ? "text-emerald-400"
                        : site.crowdPercent < 75
                        ? "text-amber-400"
                        : "text-rose-400",
                    )}
                  >
                    {site.crowdPercent < 40 ? (t("map.crowdFilters.quiet") || "Quiet") : site.crowdPercent < 75 ? (t("map.crowdFilters.moderate") || "Moderate") : (t("map.crowdFilters.busy") || "Busy")} ({site.crowdPercent}%)
                  </span>
                </div>
              </div>

              <a
                href={`/sites/${site.slug}`}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-center text-xs font-semibold text-black transition-colors hover:bg-amber-400"
              >
                {t("explore.viewDetails") || "View Site Details"}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
