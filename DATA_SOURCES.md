# Data sources

Everything on screen, where it comes from, and how far to trust it.

| What | Source | Licence | Live? |
| --- | --- | --- | --- |
| The base, crews, sites and work orders | **Synthetic**, written for this app (`data/work-orders.sample.json`) | part of the code (MIT) | No |
| The task lifecycle | **Simulated** in the browser | — | No |
| Routes from the base | Unmap Routing API, on the OpenStreetMap road network | ODbL, © OpenStreetMap contributors | Live |
| Aboriginal lands, municipal boundaries, protected areas | Unmap catalog overlays, from the federal and provincial sources each names at unmap.dev/coverage | as each names | Live |
| Wells, pipelines, facilities (Energy add-on) | Unmap catalog overlays from Alberta Energy Regulator open data (ST37, ST76, ST102) | per the catalog record | Live, never copied here |
| Crown petroleum and mineral tenure (Energy add-on) | Unmap catalog overlays from Alberta Energy | Open Government Licence – Alberta | Live, never copied here |
| Legal land and the survey grid (Legal Land add-on) | Unmap, from provincial and federal open survey data | per unmap.dev/attribution | Live |
| Basemap | Unmap Maps API: OpenStreetMap | ODbL, © OpenStreetMap contributors | Live |

No site is a real well, pipeline or facility, and no location is an operator's: the sites are
points near Drayton Valley, Alberta, chosen for the demo. The real energy data the app can show
comes only from the Unmap gateway, only to a key with the add-on, and none of it is stored in this
repository. Which energy layers the app composes is in `lib/layers.ts`: only those whose
redistribution the catalog records as cleared.
