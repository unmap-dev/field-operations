# Field Operations, built with Unmap

A field operations map for a Canadian energy operator, on a live Unmap map: work orders and
crews, filters by category and status, a simulated task lifecycle, routes from the base to a site
that say when they end short of it, context layers, and, with the add-ons switched on, the real
Alberta energy layers, well search, click-to-identify and legal land. One of the
[Unmap apps](https://unmap.dev/apps); live at
[apps.unmap.dev/field-operations](https://apps.unmap.dev/field-operations/) with both add-ons on.

**The operation is synthetic.** The base, the crews, the ten sites and their work orders are made
up, around Drayton Valley, Alberta, and no site is a real well, pipeline or facility. The task
lifecycle is simulated: nothing is sent anywhere. The map, the routes and the context layers are
live Unmap, and so, with the add-ons, are the energy layers and legal land, which come from the
gateway and are never copied into this repository. It is a starter, not an operational or
regulatory tool.

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

## Sample mode and the add-ons

`NEXT_PUBLIC_UNMAP_ADDONS` says which Unmap add-ons your key has, comma-separated:

| Value | What switches on |
| --- | --- |
| *(empty)* | **Sample mode.** Work orders, routes and the free context layers (Aboriginal lands, municipal boundaries, protected areas). The energy and legal-land sections say which add-on they need and call nothing. |
| `legal-land` | Legal land search (LSD, quarter, section) and the Dominion Land Survey grid. |
| `energy` | Alberta wells, pipelines, facilities and Crown petroleum and mineral tenure; well search by UWI or licence; click a feature to identify it. Energy includes Legal Land. |

It is a setting rather than a probe on purpose: a deployment turns a feature on by saying its key
has it. The public app at apps.unmap.dev runs with `energy,legal-land`. List only an add-on your
key has; the gateway answers any other with `addon_required`, which the app shows.

The energy layers are only the Alberta ones whose licences the gateway's own catalog records as
cleared (AER open data for wells, pipelines and facilities, and the Open Government Licence –
Alberta for Crown tenure). Field outlines, carbon capture and geothermal are left out because the
catalog marks their redistribution unverified; `lib/layers.ts` holds the list.

## Routes

`router.route(base, site, { mode: "auto" })`, one request when you ask for a site's route. A lease
road or a pad is often not in the road graph, so the engine moves the endpoint to the nearest road
it can use; the API then attaches `ENDPOINT_RELOCATED` with the distance, and the app shows it
beside the route. Winter, resource and private lease roads are not routable, and the app says so.

## Use your own operation

Write `data/work-orders.sample.json` yourself: a `base` (`name`, `coordinates`), `crews` (`id`,
`name`) and `workOrders` (`id`, `title`, `category`, `asset`, `status`, `priority`, `crew`,
`window` as two "HH:MM", `coordinates` `[lng, lat]`, `notes`). `parseOperation()` in
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
lib/addons.ts  lib/layers.ts which add-ons are on, and the overlays they allow
lib/manifest.ts              what the Built with Unmap panel lists
lib/text.ts                  this app's words in English and French
```

Layers run one way: components → hooks → `lib/` (plain TypeScript, unit-tested) → `@unmap/sdk`
and the registry components. Install the same pieces in your own project with
`npx @unmap/cli add map layer-legend energy-popup well-search legal-land-search route-line marker-popup map-controls`.

In the Unmap monorepo the copied files are kept in step by `pnpm sync` and `test/sync.test.ts`; in
your own copy they are ordinary source you can edit.

## Licence

Code: MIT. The sample operation is synthetic and part of the code. Map data © OpenStreetMap
contributors (ODbL); overlays and energy layers served by Unmap from the sources each names at
[unmap.dev/coverage](https://unmap.dev/coverage).
