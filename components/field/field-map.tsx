"use client";

import { useEffect, type ReactNode } from "react";
import type { RouteResult } from "@unmap/sdk";
import { EnergyPopup } from "@/components/ui/energy-popup";
import { Map } from "@/components/ui/map";
import { MapControls } from "@/components/ui/map-controls";
import { Marker } from "@/components/ui/marker-popup";
import { RouteLine } from "@/components/ui/route-line";
import { ADDONS } from "@/lib/addons";
import { API_KEY, GATEWAY } from "@/lib/kit/config";
import type { Lang } from "@/lib/kit/i18n";
import { overlaysFor } from "@/lib/layers";
import { useMap, useMapReady } from "@/lib/map-context";
import { TEXT } from "@/lib/text";
import { cn } from "@/lib/utils";
import type { Operation, Status, WorkOrder } from "@/lib/work-orders";

const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const OVERLAYS = overlaysFor(ADDONS);

/** Fits the base and every work order once, then follows a chosen order or its route. */
function Camera({ points, selected, route }: { points: [number, number][]; selected: WorkOrder | null; route: RouteResult | null }) {
  const map = useMap();
  const ready = useMapReady();
  const fit = (coords: readonly [number, number][], maxZoom: number) => {
    if (!map || !coords.length) return;
    const xs = coords.map((c) => c[0]);
    const ys = coords.map((c) => c[1]);
    map.fitBounds([[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]], { padding: 56, maxZoom, duration: reduceMotion() ? 0 : 600 });
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready) fit(points, 11); }, [map, ready]);
  useEffect(() => {
    if (!map || !ready || !selected || route) return;
    map.easeTo({ center: selected.coordinates, zoom: Math.max(map.getZoom(), 12), duration: reduceMotion() ? 0 : 500 });
  }, [map, ready, selected, route]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (ready && route) fit(route.geometry.coordinates as [number, number][], 14); }, [map, ready, route]);
  return null;
}

const DOT: Record<Status, string> = {
  scheduled: "bg-background border-foreground",
  dispatched: "bg-muted-foreground border-background",
  "on-site": "bg-primary border-background",
  complete: "bg-muted border-muted-foreground",
};

export interface FieldMapProps {
  operation: Operation;
  orders: readonly WorkOrder[];
  statusOf: (order: WorkOrder) => Status;
  selected: string | null;
  route: RouteResult | null;
  onSelect: (id: string) => void;
  lang: Lang;
  /** The panel's map-aware registry parts (legends, search boxes), as portals into the panel. */
  children?: ReactNode;
}

/**
 * The live map: the muted basemap with the catalog overlays this deployment may show, the base,
 * every work order as a dot by status, the route to the chosen one, and with the Energy add-on
 * the registry's click-to-identify on wells, pipelines and facilities.
 */
export function FieldMap({ operation, orders, statusOf, selected, route, onSelect, lang, children }: FieldMapProps) {
  const t = TEXT[lang];
  const current = orders.find((w) => w.id === selected) ?? null;
  return (
    <div role="region" aria-label={t.mapLabel} className="relative h-full min-h-0">
      <Map apiKey={API_KEY} gateway={GATEWAY} style="muted" lang={lang} overlays={OVERLAYS} center={operation.base.coordinates} zoom={9} controls={false} className="rounded-none" containerStyle={{ position: "absolute", inset: 0, minHeight: 0 }}>
        <Camera points={[operation.base.coordinates, ...operation.workOrders.map((w) => w.coordinates)]} selected={current} route={route} />
        <MapControls position="bottom-right" />
        {route ? <RouteLine coordinates={route.geometry.coordinates as [number, number][]} /> : null}
        <Marker
          lngLat={operation.base.coordinates}
          markerContent={<span aria-label={`${t.base}: ${operation.base.name}`} data-base-pin="" className="block size-5 rotate-45 rounded-sm border-[3px] border-background bg-foreground shadow-lg" />}
        />
        {orders.map((w) => {
          const status = statusOf(w);
          return (
            <Marker
              key={w.id}
              lngLat={w.coordinates}
              markerContent={
                <button
                  type="button"
                  aria-label={`${w.id}: ${w.title}`}
                  aria-pressed={selected === w.id}
                  data-order-pin={w.id}
                  onClick={() => onSelect(w.id)}
                  className={cn("block rounded-full border-[3px] shadow-md", DOT[status], selected === w.id ? "size-6 ring-2 ring-primary ring-offset-2 ring-offset-background" : "size-4")}
                />
              }
            />
          );
        })}
        {ADDONS.has("energy") ? <EnergyPopup apiKey={API_KEY} gateway={GATEWAY} /> : null}
        {children}
      </Map>
    </div>
  );
}
