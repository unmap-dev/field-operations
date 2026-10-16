/**
 * Which Unmap add-ons this deployment's key has, from NEXT_PUBLIC_UNMAP_ADDONS (comma-separated:
 * `energy`, `legal-land`). Unset is sample mode: the work orders and the free layers work, and
 * every add-on feature says which add-on it needs instead of calling for it.
 *
 * A setting rather than a probe on purpose: a deployment turns a feature on by saying it paid for
 * it. The public app at apps.unmap.dev is built with both, because its key holds every add-on.
 * Listing an add-on the key does not have makes the gateway answer `addon_required`, which the app
 * shows.
 */
export type Addon = "energy" | "legal-land";

export function parseAddons(value: string | undefined): ReadonlySet<Addon> {
  const known: Addon[] = ["energy", "legal-land"];
  return new Set(
    (value ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s): s is Addon => (known as string[]).includes(s)),
  );
}

export const ADDONS = parseAddons(process.env.NEXT_PUBLIC_UNMAP_ADDONS);
