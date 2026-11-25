import type { AppManifest } from "@/lib/kit/provenance";

/**
 * What the "Built with Unmap" panel and the header say about Field Operations. Lists only what
 * the app really calls; a service is added here in the same change that starts calling it.
 */
export const MANIFEST: AppManifest = {
  slug: "field-operations",
  name: { en: "Field Operations", fr: "Opérations sur le terrain" },
  tagline: {
    en: "Work orders and crews for a field-service team on a live Unmap map, with routes from base to site and Canadian context layers.",
    fr: "Bons de travail et équipes d'un service sur le terrain sur une carte Unmap en direct, avec itinéraires de la base au site et couches de contexte canadiennes.",
  },
  services: [
    {
      name: "Maps · Layers",
      role: {
        en: "The muted basemap with named catalog overlays: Aboriginal lands, municipal boundaries and protected areas, included in every plan.",
        fr: "La carte de base sobre avec les surcouches du catalogue : terres autochtones, limites municipales et aires protégées, incluses dans tous les forfaits.",
      },
      calls: ['<Map apiKey={key} style="muted" overlays={["aboriginal-lands", "municipalities", "parks"]} />', "<LayerLegend items={…} />"],
      docs: "https://unmap.dev/docs/apis/maps",
    },
    {
      name: "Routing",
      role: {
        en: "The road route from the base to a site, by car, with any warning the API attaches; ENDPOINT_RELOCATED is shown when the route ends at the nearest road rather than the site.",
        fr: "L'itinéraire routier de la base au site, en voiture, avec les avertissements de l'API; ENDPOINT_RELOCATED est affiché quand l'itinéraire s'arrête à la route la plus proche plutôt qu'au site.",
      },
      calls: ['unmap.router.route(base, site, { mode: "auto" })'],
      docs: "https://unmap.dev/docs/apis/routing",
    },
  ],
  items: ["map", "layer-legend", "route-line", "marker-popup", "map-controls"],
  provenance: [
    {
      kind: "sample",
      label: {
        en: "The base, crews, sites and work orders. Synthetic: no site is a real building, piece of equipment or customer location",
        fr: "La base, les équipes, les sites et les bons de travail. Synthétiques : aucun site n'est un vrai bâtiment, un vrai équipement ou le lieu d'un vrai client",
      },
    },
    {
      kind: "simulated",
      label: { en: "The task lifecycle: dispatching, arriving and completing", fr: "Le cycle des tâches : affectation, arrivée et fin" },
    },
    {
      kind: "live",
      label: { en: "Basemap, context layers and routes", fr: "Carte de base, couches de contexte et itinéraires" },
      source: "Unmap",
      attribution: "© unmap © OpenStreetMap contributors; layer sources at unmap.dev/coverage",
    },
  ],
  source: "https://github.com/unmap-dev/field-operations",
};
