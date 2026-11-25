# Data sources

Everything on screen, where it comes from, and how far to trust it.

| What | Source | Licence | Live? |
| --- | --- | --- | --- |
| The base, crews, sites and work orders | **Synthetic**, written for this app (`data/work-orders.sample.json`) | part of the code (MIT) | No |
| The task lifecycle | **Simulated** in the browser | — | No |
| Routes from the base | Unmap Routing API, on the OpenStreetMap road network | ODbL, © OpenStreetMap contributors | Live |
| Aboriginal lands, municipal boundaries, protected areas | Unmap catalog overlays, from the federal and provincial sources each names at unmap.dev/coverage | as each names | Live |
| Basemap | Unmap Maps API: OpenStreetMap | ODbL, © OpenStreetMap contributors | Live |

No site is a real building, piece of equipment or utility line, and no location is a customer's:
the sites are points near Drayton Valley, Alberta, chosen for the demo. The context layers come
only from the Unmap gateway and none of them is stored in this repository; which ones the app
composes is in `lib/layers.ts`.
