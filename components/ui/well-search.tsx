"use client";

/**
 * <WellSearch> - search box for UWIs and well licences.
 *
 * Sends the query string only. The gateway detects UWI vs civic; this widget does not pass
 * `profile=` or `layers=` as a search source.
 *
 * Coordinates typed into the box are searched as text, not reverse geocoded: a civic address is
 * not what a UWI box is for. Pass `reverseGeocode` to turn the lookup back on.
 *
 * Copied into your project by `npx shadcn add`. Edit freely.
 */

import { Geocoder, type GeocoderProps } from "@/components/ui/geocoder";

export type WellSearchProps = GeocoderProps;

export function WellSearch({ placeholder, reverseGeocode = false, ...props }: WellSearchProps) {
  // The default speaks the language the box searches in.
  const label = placeholder ?? (props.lang === "fr" ? "Chercher un UWI ou un permis de puits" : "Search UWI or well licence");
  return <Geocoder {...props} placeholder={label} reverseGeocode={reverseGeocode} />;
}
