"use client";

import { format, type Lang } from "@/lib/kit/i18n";
import { TEXT } from "@/lib/text";
import { cn } from "@/lib/utils";
import { byCrew, type Crew, type Status, type WorkOrder } from "@/lib/work-orders";
import { StatusBadge } from "./status-badge";

/** The assignment panel: work orders under their crew, by priority then time window. */
export function OrderList({
  orders,
  crews,
  statusOf,
  selected,
  onSelect,
  lang,
}: {
  orders: readonly WorkOrder[];
  crews: readonly Crew[];
  statusOf: (order: WorkOrder) => Status;
  selected: string | null;
  onSelect: (id: string) => void;
  lang: Lang;
}) {
  const t = TEXT[lang];
  return (
    <div className="flex flex-col gap-3" data-orders="">
      {byCrew(orders, crews).map(({ crew, orders: list }) => (
        <section key={crew.id} aria-labelledby={`crew-${crew.id}`} className="flex flex-col gap-1">
          <h3 id={`crew-${crew.id}`} className="text-xs font-medium text-muted-foreground">
            {crew.name}
          </h3>
          <ul className="flex flex-col divide-y rounded-lg border">
            {list.map((w) => (
              <li key={w.id} data-order={w.id}>
                <button
                  type="button"
                  aria-label={format(t.select, { id: w.id })}
                  aria-pressed={selected === w.id}
                  onClick={() => onSelect(w.id)}
                  className={cn("flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-muted", selected === w.id && "bg-muted")}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{w.id}</span>
                    <StatusBadge status={statusOf(w)} lang={lang} />
                  </span>
                  <span className="truncate text-sm font-medium">{w.title}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {t.categories[w.category]} · {t.priorities[w.priority]} · {format(t.window, { start: w.window[0], end: w.window[1] })}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
