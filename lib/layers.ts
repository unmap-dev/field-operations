/**
 * The catalog overlays the map composes: the core context layers every plan includes, so the app
 * needs no add-on. Explicit ids rather than a `profile`, so the legend and the map always agree.
 */
export const OVERLAYS = ["aboriginal-lands", "municipalities", "parks"] as const;

/** Style layers the gateway adds for an overlay: `overlay_<id>_*`, with dots as the id has them. */
export const styleLayersOf = (id: string) => [`overlay_${id}_*`];
