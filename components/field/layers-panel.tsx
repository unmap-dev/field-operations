"use client";

import { createPortal } from "react-dom";
import { LayerLegend, type LayerLegendItem } from "@/components/ui/layer-legend";
import type { Lang } from "@/lib/kit/i18n";
import { OVERLAYS, styleLayersOf } from "@/lib/layers";
import { TEXT } from "@/lib/text";

/** The part of the layers panel outside the map: the heading and the slot the legend fills. */
export function LayersPanel({ slot, lang }: { slot: (el: HTMLDivElement | null) => void; lang: Lang }) {
  const t = TEXT[lang];
  return (
    <section aria-labelledby="layers-title" className="flex flex-col gap-3" data-layers="">
      <h2 id="layers-title" className="text-sm font-medium">
        {t.layersTitle}
      </h2>
      <div ref={slot} />
    </section>
  );
}

/** The map-aware part of the layers panel, rendered inside the map and portalled into the slot. */
export function LayersInMap({ target, lang }: { target: HTMLDivElement | null; lang: Lang }) {
  const t = TEXT[lang];
  const items: LayerLegendItem[] = OVERLAYS.map((id) => ({ id, label: t.overlays[id] ?? id, layers: styleLayersOf(id) }));
  return target ? createPortal(<LayerLegend items={items} title={t.freeLayers} />, target) : null;
}
