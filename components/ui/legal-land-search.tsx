"use client";

/**
 * <LegalLandSearch> - search box for Canadian legal land descriptions.
 *
 * Sends the query string only. The gateway detects LSD vs civic; this widget does not pass
 * `profile=` or `layers=` as a search source.
 *
 * Coordinates typed into the box are searched as text, not reverse geocoded: a civic address is
 * not what an LSD box is for. Pass `reverseGeocode` to turn the lookup back on.
 *
 * Copied into your project by `npx shadcn add`. Edit freely.
 */

import { Geocoder, type GeocoderProps } from "@/components/ui/geocoder";

export type LegalLandSearchProps = GeocoderProps;

export function LegalLandSearch({ placeholder, reverseGeocode = false, ...props }: LegalLandSearchProps) {
  // The default speaks the language the box searches in.
  const label = placeholder ?? (props.lang === "fr" ? "Chercher une terre légale" : "Search legal land");
  return <Geocoder {...props} placeholder={label} reverseGeocode={reverseGeocode} />;
}
