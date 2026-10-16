# Features

What Field Operations does, which Unmap API does it, and what it deliberately does not do (spec §8).

## Implemented

| Feature | How | Unmap |
| --- | --- | --- |
| Map | registry `map`, `muted` style, light or dark with the page, labels in English or French | Maps API |
| Sample operation | `data/work-orders.sample.json`: a base, three crews, ten work orders at synthetic sites, validated on load; labelled synthetic in the notice and on every work order | — |
| Work orders on the map | a dot per work order by status, the base, the chosen one ringed (registry `marker-popup`) | — |
| Search and filters | by ID or title, by category and by status (several at once) | — |
| Assignment panel | work orders under their crew, high priority first, then by time window | — |
| Simulated lifecycle | scheduled → dispatched → on site → complete, one step at a time, logged with the time; labelled simulated | — |
| Route from base | by car, on request; distance and time; `ENDPOINT_RELOCATED` shown when the route ends at the nearest road, not the site; other warnings as the API sends them (registry `route-line`) | Routing (`/route`) |
| Context layers | Aboriginal lands, municipal boundaries and protected areas, each switchable (registry `layer-legend`) | Maps (`overlays=`) |
| Energy layers (add-on) | Alberta wells, pipelines, facilities and Crown tenure, switchable; only the layers the catalog records as cleared | Maps (`overlays=energy.*`) |
| Well search (add-on) | registry `well-search` by UWI or licence | Geocoding (`/geocode/search`) |
| Identify (add-on) | registry `energy-popup`: click a well, pipeline or facility for its attributes | `/identify` |
| Legal land (add-on) | registry `legal-land-search` and the Dominion Land Survey grid | Geocoding, Maps |
| Sample mode | no add-on listed: every add-on feature says which add-on it needs and calls nothing | — |
| Errors | every API failure shown where its answer would have been, in en/fr, with a retry when waiting could help | — |
| English and French | the header switch; map labels follow | Maps `lang` |
| No-key state | the work orders still list, filter and step through the lifecycle; the map pane explains how to get a key | — |
| Built with Unmap | the services, calls, components and data sources behind the page | — |

## Not goals

Real operational, customer or industrial data; regulatory or safety compliance; routing on winter,
resource or private lease roads; dispatching or notifying real crews; offline use (spec §8).
