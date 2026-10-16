"use client";

import { useMemo, useState } from "react";
import { FlaskConicalIcon, TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { Field, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useRoute } from "@/hooks/use-route";
import { ADDONS } from "@/lib/addons";
import { AppHeader } from "@/lib/kit/app-header";
import { API_KEY } from "@/lib/kit/config";
import { format, type Lang } from "@/lib/kit/i18n";
import { MissingKey } from "@/lib/kit/missing-key";
import { useLang } from "@/lib/kit/use-lang";
import { MANIFEST } from "@/lib/manifest";
import { TEXT } from "@/lib/text";
import { CATEGORIES, NO_FILTERS, SAMPLE_OPERATION, STATUSES, filterOrders, nextStatus, type Category, type OrderFilters, type Status, type WorkOrder } from "@/lib/work-orders";
import { FieldMap } from "./field-map";
import { LayersInMap, LayersPanel } from "./layers-panel";
import { OrderDetails, type LogEntry } from "./order-details";
import { OrderList } from "./order-list";

const op = SAMPLE_OPERATION;

/** The always-visible notice: synthetic operation, simulated lifecycle, not for operational use. */
function Notice({ lang }: { lang: Lang }) {
  const t = TEXT[lang];
  return (
    <Alert data-notice="">
      <TriangleAlertIcon />
      <AlertTitle>{t.noticeTitle}</AlertTitle>
      <AlertDescription>{t.notice}</AlertDescription>
    </Alert>
  );
}

/** The time a simulated step happened at, as the reader's clock shows it. */
const clock = (lang: Lang) => new Date().toLocaleTimeString(lang === "fr" ? "fr-CA" : "en-CA", { hour: "2-digit", minute: "2-digit" });

/**
 * Field Operations: a synthetic energy operator's work orders on a live Unmap map. The base, the
 * crews, the sites and the lifecycle are sample data and simulation; the map, the context layers
 * and the routes are live Unmap, and with the add-ons switched on, so are the energy layers, well
 * search, identify and legal land.
 */
export function FieldApp() {
  const [lang, setLang] = useLang();
  const t = TEXT[lang];
  const [filters, setFilters] = useState<OrderFilters>(NO_FILTERS);
  const [selected, setSelected] = useState<string | null>(null);
  // The simulated lifecycle: a status per order once it has moved, and when it moved.
  const [moved, setMoved] = useState<Record<string, Status>>({});
  const [log, setLog] = useState<Record<string, LogEntry[]>>({});
  const [routeTo, setRouteTo] = useState<string | null>(null);
  const [slots, setSlots] = useState<{ free: HTMLDivElement | null; energy: HTMLDivElement | null; legal: HTMLDivElement | null }>({ free: null, energy: null, legal: null });
  // Stable ref callbacks: a new function each render would detach and reattach every slot.
  const slotRefs = useMemo(() => {
    const set = (name: "free" | "energy" | "legal") => (el: HTMLDivElement | null) => setSlots((prev) => (prev[name] === el ? prev : { ...prev, [name]: el }));
    return { free: set("free"), energy: set("energy"), legal: set("legal") };
  }, []);

  const statusOf = (w: WorkOrder): Status => moved[w.id] ?? w.status;
  const withStatus = useMemo(() => op.workOrders.map((w) => ({ ...w, status: moved[w.id] ?? w.status })), [moved]);
  const shown = useMemo(() => filterOrders(withStatus, filters), [withStatus, filters]);
  const current = withStatus.find((w) => w.id === selected) ?? null;
  const routeTarget = current && routeTo === current.id ? current.coordinates : null;
  const [route, retryRoute] = useRoute(op.base.coordinates, API_KEY ? routeTarget : null);
  const sampleMode = ADDONS.size === 0;

  const advance = (w: WorkOrder) => {
    const next = nextStatus(statusOf(w));
    if (!next) return;
    setMoved((prev) => ({ ...prev, [w.id]: next }));
    setLog((prev) => ({ ...prev, [w.id]: [...(prev[w.id] ?? []), { status: next, at: clock(lang) }] }));
  };

  return (
    <div className="flex h-dvh flex-col">
      <AppHeader manifest={MANIFEST} lang={lang} onLang={setLang} />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="order-last flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto border-t p-3 lg:order-first lg:w-[440px] lg:flex-none lg:border-t-0 lg:border-r">
          <Notice lang={lang} />
          {sampleMode ? (
            <Alert data-sample-mode="">
              <FlaskConicalIcon />
              <AlertTitle>{t.sampleMode}</AlertTitle>
              <AlertDescription>{t.sampleModeNote}</AlertDescription>
            </Alert>
          ) : null}
          {current ? (
            <OrderDetails
              key={current.id}
              order={current}
              crew={op.crews.find((c) => c.id === current.crew)}
              status={statusOf(current)}
              log={log[current.id] ?? []}
              onAdvance={() => advance(current)}
              routing={routeTo === current.id}
              onRoute={() => setRouteTo(current.id)}
              route={route}
              onRetryRoute={retryRoute}
              onClose={() => setSelected(null)}
              lang={lang}
            />
          ) : null}
          <section aria-labelledby="orders-title" className="flex flex-col gap-3">
            <h2 id="orders-title" className="text-sm font-medium">
              {t.ordersTitle}
            </h2>
            <Field>
              <FieldLabel htmlFor="order-search">{t.search}</FieldLabel>
              <Input id="order-search" type="search" value={filters.query} placeholder={t.searchPlaceholder} onChange={(e) => setFilters({ ...filters, query: e.currentTarget.value })} />
            </Field>
            <FieldSet>
              <FieldLegend variant="label">{t.category}</FieldLegend>
              <ToggleGroup variant="outline" size="sm" multiple value={filters.categories} onValueChange={(v) => setFilters({ ...filters, categories: v as Category[] })} aria-label={t.category} className="flex-wrap">
                {CATEGORIES.map((c) => (
                  <ToggleGroupItem key={c} value={c}>
                    {t.categories[c]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FieldSet>
            <FieldSet>
              <FieldLegend variant="label">{t.status}</FieldLegend>
              <ToggleGroup variant="outline" size="sm" multiple value={filters.statuses} onValueChange={(v) => setFilters({ ...filters, statuses: v as Status[] })} aria-label={t.status} className="flex-wrap">
                {STATUSES.map((s) => (
                  <ToggleGroupItem key={s} value={s}>
                    {t.statuses[s]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FieldSet>
            <p className="text-xs text-muted-foreground tabular-nums" aria-live="polite" data-order-count="">
              {shown.length === op.workOrders.length ? format(t.count, { n: shown.length }) : format(t.countOf, { n: shown.length, total: op.workOrders.length })}
            </p>
            {shown.length ? (
              <OrderList orders={shown} crews={op.crews} statusOf={statusOf} selected={selected} onSelect={setSelected} lang={lang} />
            ) : (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyDescription>{t.noneMatch}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button variant="outline" size="sm" onClick={() => setFilters(NO_FILTERS)}>
                    {t.clearFilters}
                  </Button>
                </EmptyContent>
              </Empty>
            )}
          </section>
          <Separator />
          {API_KEY ? <LayersPanel freeSlot={slotRefs.free} energySlot={slotRefs.energy} legalSlot={slotRefs.legal} lang={lang} /> : null}
        </aside>
        <main className="h-[45dvh] shrink-0 lg:h-auto lg:min-w-0 lg:flex-1">
          {API_KEY ? (
            <FieldMap
              operation={op}
              orders={shown}
              statusOf={statusOf}
              selected={selected}
              route={route.status === "done" && routeTarget ? route.data : null}
              onSelect={setSelected}
              lang={lang}
            >
              <LayersInMap targets={slots} lang={lang} />
            </FieldMap>
          ) : (
            <MissingKey lang={lang} />
          )}
        </main>
      </div>
    </div>
  );
}
