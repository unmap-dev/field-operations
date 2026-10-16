"use client";

import type { RouteResult } from "@unmap/sdk";
import { getUnmap } from "@/lib/kit/client";
import { useAsync } from "@/lib/use-async";

/**
 * The road route from the base to a site, from the Unmap Routing API, by car. Its `warnings` say
 * when the engine moved an endpoint to the nearest road it could use: a lease road or a pad is
 * often not in the graph, and the route then ends short of the site.
 */
export function useRoute(from: [number, number], to: [number, number] | null) {
  const key = to ? `${from.join(",")}|${to.join(",")}` : null;
  return useAsync<RouteResult>(key, async (signal) => {
    const unmap = getUnmap();
    if (!unmap || !to) throw new Error("No API key");
    return unmap.router.route(from, to, { mode: "auto", signal });
  });
}
