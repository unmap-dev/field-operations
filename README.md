# Field Operations, built with Unmap

A field-service starter on a live Unmap map: work orders and crews, filters by category and
status, a simulated task lifecycle, routes from the base to a site that say when they end short of
it, and Canadian context layers. One of the [Unmap apps](https://unmap.dev/apps); live at
[apps.unmap.dev/field-operations](https://apps.unmap.dev/field-operations/).

**The operation is synthetic.** The base, the crews, the ten sites and their work orders
(inspections, repairs, maintenance and installs) are made up, around Drayton Valley, Alberta, and
no site is a real building, piece of equipment or customer location. The task lifecycle is
simulated: nothing is sent anywhere. The map, the routes and the context layers are live Unmap.
It is a starter, not an operational or dispatch tool.

## Run it

You need Node 24 (22.18+ works), pnpm and a free Unmap browser key from
[unmap.dev/dashboard](https://unmap.dev/dashboard).

```bash
cp .env.example .env.local      # then set NEXT_PUBLIC_UNMAP_KEY
pnpm install
pnpm dev                        # http://localhost:3206
```

| Command | |
| --- | --- |
| `pnpm dev` | development server on port 3206 |
| `pnpm build` | static export in `out/` |
| `pnpm test` | unit tests (Vitest) |
| `pnpm lint` / `pnpm typecheck` | |
| `pnpm run deploy` | build, then `wrangler deploy` to your Cloudflare account (edit `wrangler.jsonc` first) |

## Context layers

Aboriginal lands, municipal boundaries and protected areas, each switchable. They are core catalog
layers included in every plan, so any browser key shows them and the app needs no add-on.
`lib/layers.ts` holds the list.

## Routes

`router.route(base, site, { mode: "auto" })`, one request when you ask for a site's route. A
private road or a yard is often not in the road graph, so the engine moves the endpoint to the
nearest road it can use; the API then attaches `ENDPOINT_RELOCATED` with the distance, and the app
shows it beside the route. Private roads and site access that is not on the map are not routable,
and the app says so.

Routes cover Canada. The app routes by car only, so an operation in one of ten US metros (Los
Angeles, New York, Miami, SF Bay Area, Seattle, Washington DC, Austin, Boston, Denver, Chicago)
routes too, when the base and every site are in the same metro; a site in another metro is
`422 no_route`, and a route across the border is `422 outside_coverage`. The context layers are
Canadian datasets and draw nothing in the US.

## Use your own operation

Write `data/work-orders.sample.json` yourself: a `base` (`name`, `coordinates`), `crews` (`id`,
`name`) and `workOrders` (`id`, `title`, `category`, `asset`, `status`, `priority`, `crew`,
`window` as two "HH:MM", `coordinates` `[lng, lat]`, `notes`). Categories are `inspection`,
`maintenance`, `repair` and `install`; assets are `building`, `equipment`, `utility` and `site`;
change the lists in `lib/work-orders.ts` and their words in `lib/text.ts` for your own trade.
`parseOperation()` in
`lib/work-orders.ts` checks it and lists every problem it finds. Do not put private operational
data in a public repository.

## How it is built

```
app/page.tsx                 the one page; renders the app in the browser
components/field/            the app: notice, filters, crew list, work order, layers, map
components/ui/  lib/map-*    Unmap registry components and shadcn primitives, copied in unmodified
lib/kit/                     the Unmap app kit (header, Built with Unmap panel, errors, en/fr), copied in
hooks/use-route.ts           the route from the base to a site
lib/work-orders.ts           the operation, its validator, filters and lifecycle (no React, no fetch)
lib/layers.ts                the context overlays the map composes
lib/manifest.ts              what the Built with Unmap panel lists
lib/text.ts                  this app's words in English and French
```

Layers run one way: components → hooks → `lib/` (plain TypeScript, unit-tested) → `@unmap/sdk`
and the registry components. Install the same pieces in your own project with
`npx @unmap/cli add map layer-legend route-line marker-popup map-controls`.

In the Unmap monorepo the copied files are kept in step by `pnpm sync` and `test/sync.test.ts`; in
your own copy they are ordinary source you can edit.

## Licence

Code: MIT. The sample operation is synthetic and part of the code. Map data © OpenStreetMap
contributors (ODbL); overlays served by Unmap from the sources each names at
[unmap.dev/coverage](https://unmap.dev/coverage).
