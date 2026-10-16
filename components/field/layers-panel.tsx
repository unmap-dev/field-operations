"use client";

import { ExternalLinkIcon, LockIcon } from "lucide-react";
import { createPortal } from "react-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LayerLegend, type LayerLegendItem } from "@/components/ui/layer-legend";
import { LegalLandSearch } from "@/components/ui/legal-land-search";
import { WellSearch } from "@/components/ui/well-search";
import { ADDONS } from "@/lib/addons";
import { API_KEY, GATEWAY } from "@/lib/kit/config";
import type { Lang } from "@/lib/kit/i18n";
import { ENERGY_OVERLAYS, FREE_OVERLAYS, LEGAL_OVERLAYS, styleLayersOf } from "@/lib/layers";
import { TEXT } from "@/lib/text";

const PRICING = "https://unmap.dev/pricing";

const ENERGY_LABELS: Record<Lang, Record<string, string>> = {
  en: { "energy.wells": "Wells", "energy.pipelines": "Pipelines", "energy.facilities": "Facilities", "energy.petroleum-tenure": "Petroleum tenure", "energy.mineral-tenure": "Mineral tenure", "survey.dls": "Dominion Land Survey grid" },
  fr: { "energy.wells": "Puits", "energy.pipelines": "Pipelines", "energy.facilities": "Installations", "energy.petroleum-tenure": "Tenures pétrolières", "energy.mineral-tenure": "Tenures minérales", "survey.dls": "Grille de l'arpentage du Dominion" },
};

/** What an add-on would show, said where it would be. Never a call the key cannot make. */
function Needs({ title, body, lang }: { title: string; body: string; lang: Lang }) {
  return (
    <Alert data-addon-needed="">
      <LockIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{body}</p>
        <a href={PRICING} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-3">
          {TEXT[lang].addonLink}
          <ExternalLinkIcon className="size-3" aria-hidden />
        </a>
      </AlertDescription>
    </Alert>
  );
}

/** The part of the layers panel outside the map: headings, slots and the add-on notes. */
type Slot = (el: HTMLDivElement | null) => void;

export function LayersPanel({ freeSlot, energySlot, legalSlot, lang }: { freeSlot: Slot; energySlot: Slot; legalSlot: Slot; lang: Lang }) {
  const t = TEXT[lang];
  const energy = ADDONS.has("energy");
  const legal = energy || ADDONS.has("legal-land");
  return (
    <section aria-labelledby="layers-title" className="flex flex-col gap-3" data-layers="">
      <h2 id="layers-title" className="text-sm font-medium">
        {t.layersTitle}
      </h2>
      <div ref={freeSlot} />
      {energy ? <div ref={energySlot} className="flex flex-col gap-2" /> : <Needs title={t.energyTitle} body={t.energyNeeds} lang={lang} />}
      {legal ? <div ref={legalSlot} className="flex flex-col gap-2" /> : <Needs title={t.legalTitle} body={t.legalNeeds} lang={lang} />}
    </section>
  );
}

/** The map-aware parts of the layers panel, rendered inside the map and portalled into the slots. */
export function LayersInMap({ targets, lang }: { targets: { free: HTMLDivElement | null; energy: HTMLDivElement | null; legal: HTMLDivElement | null }; lang: Lang }) {
  const t = TEXT[lang];
  const free: LayerLegendItem[] = FREE_OVERLAYS.map((id) => ({ id, label: t.overlays[id] ?? id, layers: styleLayersOf(id) }));
  const energyRows: LayerLegendItem[] = ENERGY_OVERLAYS.map((id) => ({ id, label: ENERGY_LABELS[lang][id] ?? id, layers: styleLayersOf(id) }));
  const legalRows: LayerLegendItem[] = LEGAL_OVERLAYS.map((id) => ({ id, label: ENERGY_LABELS[lang][id] ?? id, layers: styleLayersOf(id) }));
  return (
    <>
      {targets.free ? createPortal(<LayerLegend items={free} title={t.freeLayers} />, targets.free) : null}
      {targets.energy
        ? createPortal(
            <>
              <LayerLegend items={energyRows} title={t.energyTitle} />
              <WellSearch apiKey={API_KEY} gateway={GATEWAY} lang={lang} placeholder={t.wellSearch} />
              <p className="text-xs text-muted-foreground">{t.energyClick}</p>
            </>,
            targets.energy,
          )
        : null}
      {targets.legal
        ? createPortal(
            <>
              <LayerLegend items={legalRows} title={t.legalTitle} />
              <LegalLandSearch apiKey={API_KEY} gateway={GATEWAY} lang={lang} placeholder={t.legalSearch} />
            </>,
            targets.legal,
          )
        : null}
    </>
  );
}
