"use client";

/**
 * <EnergyPopup> - identify energy features on click and show a popup.
 *
 * Pair with a map already composed with `profile="energy"`. Click queries wells, pipelines,
 * and facilities. Identify is not a search call and does not send `profile=`. Each click is one
 * `GET /identify`; a newer click aborts the lookup before it, so a slow one never lands on a
 * newer point, and unmounting aborts the one in flight.
 *
 * `onLookup` fires as a click starts a lookup, then exactly one of `onIdentify` (a hit, the popup
 * opens), `onMiss` (nothing there, the popup closes) or `onError` (the lookup failed, the popup
 * closes; the error carries the gateway's `status` and `code`). Each is handed the clicked point.
 *
 * Copied into your project by `npx shadcn add`. Edit freely.
 */

import { useEffect, useMemo, useRef } from "react";
import { Geocoder, type IdentifyResult } from "@unmap/geocoding";
import { maplibregl } from "@unmap/maps";
import { useMap } from "@/lib/map-context";

/** Identify-capable energy layers shown on click. */
export const ENERGY_CLICK_LAYERS = ["energy.wells", "energy.pipelines", "energy.facilities"] as const;

export interface EnergyPopupProps {
  /** unmap API key. */
  apiKey: string;
  /** Gateway base URL. Defaults to the unmap production gateway. */
  gateway?: string;
  /** Map id when multiple maps share a page. Defaults to `"default"`. */
  mapId?: string;
  /** Called as a click starts a lookup, with the clicked [lng, lat]. */
  onLookup?: (at: [number, number]) => void;
  /** Called when identify returns a hit, with the clicked [lng, lat]. */
  onIdentify?: (result: IdentifyResult, at: [number, number]) => void;
  /** Called when identify finds nothing at the clicked [lng, lat]. */
  onMiss?: (at: [number, number]) => void;
  /** Called when identify fails. The error carries the gateway's `status` and `code`. */
  onError?: (error: unknown, at: [number, number]) => void;
}

function label(result: IdentifyResult): string {
  return [result.name, result.uwi, result.operator].filter(Boolean).join(" · ");
}

export function EnergyPopup({ apiKey, gateway, mapId, onLookup, onIdentify, onMiss, onError }: EnergyPopupProps) {
  const map = useMap(mapId);
  const client = useMemo(() => new Geocoder({ key: apiKey, gateway }), [apiKey, gateway]);
  // Read when a click answers, so new callbacks on a re-render never close an open popup.
  const handlers = useRef({ onLookup, onIdentify, onMiss, onError });
  handlers.current = { onLookup, onIdentify, onMiss, onError };

  useEffect(() => {
    if (!map) return;
    const popup = new maplibregl.Popup({ offset: 24, className: "unmap-popup" });
    let inFlight: AbortController | null = null;

    const onClick = (event: { lngLat: { lng: number; lat: number } }) => {
      const at: [number, number] = [event.lngLat.lng, event.lngLat.lat];
      inFlight?.abort();
      const controller = new AbortController();
      inFlight = controller;
      handlers.current.onLookup?.(at);
      void client
        .identify({ at, layers: ENERGY_CLICK_LAYERS, signal: controller.signal })
        .then(({ results }) => {
          if (controller.signal.aborted) return;
          const hit = results[0];
          if (!hit) {
            popup.remove();
            handlers.current.onMiss?.(at);
            return;
          }
          handlers.current.onIdentify?.(hit, at);
          popup.setLngLat(at).setText(label(hit)).addTo(map);
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          popup.remove();
          handlers.current.onError?.(error, at);
        });
    };

    map.on("click", onClick);
    return () => {
      inFlight?.abort();
      map.off("click", onClick);
      popup.remove();
    };
  }, [map, client]);

  return null;
}
