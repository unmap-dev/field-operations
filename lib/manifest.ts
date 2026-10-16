import type { AppManifest } from "@/lib/kit/provenance";

/**
 * What the "Built with Unmap" panel and the header say about Field Operations. Lists only what
 * the app really calls; a service is added here in the same change that starts calling it. The
 * energy and legal-land services are called only when the deployment says it has the add-on.
 */
export const MANIFEST: AppManifest = {
  slug: "field-operations",
  name: { en: "Field Operations", fr: "Opérations sur le terrain" },
  tagline: {
    en: "Work orders and crews for a Canadian energy operator on a live Unmap map, with routes from base to site and, with the add-ons, energy layers and legal land.",
    fr: "Bons de travail et équipes d'un exploitant énergétique canadien sur une carte Unmap en direct, avec itinéraires de la base au site et, avec les modules, couches énergie et terres légales.",
  },
  services: [
    {
      name: "Maps · Layers",
      role: {
        en: "The muted basemap with named catalog overlays: Aboriginal lands, municipal boundaries and protected areas on every plan; Alberta wells, pipelines, facilities and Crown tenure with the Energy add-on, and the Dominion Land Survey grid with Legal Land.",
        fr: "La carte de base sobre avec les surcouches du catalogue : terres autochtones, limites municipales et aires protégées avec tous les forfaits; puits, pipelines, installations et tenures de la Couronne de l'Alberta avec le module Énergie, et la grille de l'arpentage du Dominion avec Terres légales.",
      },
      calls: ['<Map apiKey={key} style="muted" overlays={["aboriginal-lands", "municipalities", "parks", …energy, …survey]} />', "<LayerLegend items={…} />"],
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
    {
      name: "Energy (add-on)",
      role: {
        en: "Well search by UWI or licence, and click-to-identify on wells, pipelines and facilities. Only with the Energy add-on.",
        fr: "Recherche de puits par UWI ou permis, et identification au clic des puits, pipelines et installations. Seulement avec le module Énergie.",
      },
      calls: ["<WellSearch apiKey={key} />  // GET /geocode/search", "<EnergyPopup apiKey={key} />  // GET /identify"],
      docs: "https://unmap.dev/docs/overlays/energy",
    },
    {
      name: "Legal land (add-on)",
      role: {
        en: "Legal land descriptions (LSD, quarter section, section) to a place on the map. Only with the Legal Land add-on, which Energy includes.",
        fr: "Descriptions de terres légales (LSD, quart de section, section) vers un lieu sur la carte. Seulement avec le module Terres légales, inclus dans Énergie.",
      },
      calls: ["<LegalLandSearch apiKey={key} />  // GET /geocode/search"],
      docs: "https://unmap.dev/docs/apis/geocoding",
    },
  ],
  items: ["map", "layer-legend", "energy-popup", "well-search", "legal-land-search", "route-line", "marker-popup", "map-controls"],
  provenance: [
    {
      kind: "sample",
      label: {
        en: "The base, crews, sites and work orders. Synthetic: no site is a real well, pipeline or facility",
        fr: "La base, les équipes, les sites et les bons de travail. Synthétiques : aucun site n'est un vrai puits, pipeline ou installation",
      },
    },
    {
      kind: "simulated",
      label: { en: "The task lifecycle: dispatching, arriving and completing", fr: "Le cycle des tâches : affectation, arrivée et fin" },
    },
    {
      kind: "live",
      label: { en: "Energy layers, identify and well search (Energy add-on)", fr: "Couches énergie, identification et recherche de puits (module Énergie)" },
      source: "Unmap",
      attribution: "Alberta Energy Regulator open data, and the sources each layer names at unmap.dev/coverage",
    },
    {
      kind: "live",
      label: { en: "Legal land and the survey grid (Legal Land add-on)", fr: "Terres légales et grille d'arpentage (module Terres légales)" },
      source: "Unmap",
      attribution: "Provincial and federal open survey data, see unmap.dev/attribution",
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
