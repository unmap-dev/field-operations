import type { Addon } from "./addons";

/**
 * The catalog overlays the map composes, by what the deployment may show. Explicit ids rather than
 * `profile="energy"`: the energy profile also carries field outlines, CCS and geothermal, whose
 * redistribution the gateway's own records mark unverified, and this app shows only the Alberta
 * layers those records clear (wells, pipelines and facilities from AER open data, and Crown tenure
 * under the Open Government Licence – Alberta).
 */
export const FREE_OVERLAYS = ["aboriginal-lands", "municipalities", "parks"] as const;
export const ENERGY_OVERLAYS = ["energy.wells", "energy.pipelines", "energy.facilities", "energy.petroleum-tenure", "energy.mineral-tenure"] as const;
export const LEGAL_OVERLAYS = ["survey.dls"] as const;

export function overlaysFor(addons: ReadonlySet<Addon>): string[] {
  return [
    ...FREE_OVERLAYS,
    ...(addons.has("energy") ? ENERGY_OVERLAYS : []),
    ...(addons.has("energy") || addons.has("legal-land") ? LEGAL_OVERLAYS : []),
  ];
}

/** Style layers the gateway adds for an overlay: `overlay_<id>_*`, with dots as the id has them. */
export const styleLayersOf = (id: string) => [`overlay_${id}_*`];
