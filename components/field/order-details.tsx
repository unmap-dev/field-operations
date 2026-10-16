"use client";

import { NavigationIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import type { RouteResult } from "@unmap/sdk";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ApiProblemAlert } from "@/lib/kit/api-problem";
import { API_KEY } from "@/lib/kit/config";
import { format, formatDistance, formatDuration, type Lang } from "@/lib/kit/i18n";
import { TEXT } from "@/lib/text";
import type { AsyncState } from "@/lib/use-async";
import { STATUSES, nextStatus, type Crew, type Status, type WorkOrder } from "@/lib/work-orders";

export interface LogEntry {
  status: Status;
  at: string;
}

/**
 * One work order opened: what and where, the simulated lifecycle with a step to advance it, and
 * the road route from the base with every warning the API attaches.
 */
export function OrderDetails({
  order,
  crew,
  status,
  log,
  onAdvance,
  routing,
  onRoute,
  route,
  onRetryRoute,
  onClose,
  lang,
}: {
  order: WorkOrder;
  crew: Crew | undefined;
  status: Status;
  log: readonly LogEntry[];
  onAdvance: () => void;
  routing: boolean;
  onRoute: () => void;
  route: AsyncState<RouteResult>;
  onRetryRoute: () => void;
  onClose: () => void;
  lang: Lang;
}) {
  const t = TEXT[lang];
  const next = nextStatus(status);
  const step = STATUSES.indexOf(status);
  return (
    <Card size="sm" data-order-details={order.id}>
      <CardHeader className="flex flex-row items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{order.id}</span>
            <Badge variant="outline">{t.synthetic}</Badge>
          </span>
          <CardTitle className="text-base">{order.title}</CardTitle>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label={t.closeAria} onClick={onClose}>
          <XIcon />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
          <dt className="text-muted-foreground">{t.category}</dt>
          <dd>{t.categories[order.category]}</dd>
          <dt className="text-muted-foreground">{t.assetLabel}</dt>
          <dd>{t.assets[order.asset]}</dd>
          <dt className="text-muted-foreground">{t.crewLabel}</dt>
          <dd>{crew?.name ?? order.crew}</dd>
          <dt className="text-muted-foreground">{t.windowLabel}</dt>
          <dd className="tabular-nums">{format(t.window, { start: order.window[0], end: order.window[1] })}</dd>
        </dl>
        <p className="text-sm text-muted-foreground">{order.notes}</p>

        <section aria-labelledby="lifecycle-title" className="flex flex-col gap-2" data-lifecycle={status}>
          <div className="flex items-center gap-2">
            <h3 id="lifecycle-title" className="text-xs font-medium text-muted-foreground">
              {t.lifecycle}
            </h3>
            <Badge variant="secondary">{t.simulated}</Badge>
          </div>
          <ol className="flex flex-wrap items-center gap-1 text-xs">
            {STATUSES.map((s, i) => (
              <li key={s} className={i <= step ? "font-medium" : "text-muted-foreground"} aria-current={s === status ? "step" : undefined}>
                {i > 0 ? <span aria-hidden className="mx-1 text-muted-foreground">→</span> : null}
                {t.statuses[s]}
              </li>
            ))}
          </ol>
          {next ? (
            <Button size="sm" variant="outline" className="self-start" onClick={onAdvance}>
              {format(t.advance, { status: t.statuses[next].toLowerCase() })}
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">{t.complete}</p>
          )}
          {log.length ? (
            <ul className="flex flex-col gap-0.5 text-xs text-muted-foreground">
              {log.map((entry) => (
                <li key={`${entry.status}-${entry.at}`}>{format(t.advanced, { status: t.statuses[entry.status].toLowerCase(), time: entry.at })}</li>
              ))}
            </ul>
          ) : null}
        </section>

        {API_KEY ? (
          <section aria-labelledby="route-title" className="flex flex-col gap-2" data-route="">
            <h3 id="route-title" className="text-xs font-medium text-muted-foreground">
              {t.routeTitle}
            </h3>
            {!routing ? (
              <Button size="sm" className="self-start" onClick={onRoute}>
                <NavigationIcon />
                {t.route}
              </Button>
            ) : route.status === "loading" ? (
              <Spinner />
            ) : route.status === "error" ? (
              <ApiProblemAlert error={route.error} lang={lang} onRetry={onRetryRoute} />
            ) : route.status === "done" ? (
              <>
                <p className="text-sm font-medium tabular-nums" data-route-summary="">
                  {format(t.routeSummary, { distance: formatDistance(route.data.distanceMeters, lang), duration: formatDuration(route.data.durationSeconds, lang) })}
                </p>
                {(route.data.warnings ?? []).map((w) => (
                  <Alert key={`${w.code}-${w.where ?? ""}`} data-route-warning={w.code}>
                    <TriangleAlertIcon />
                    <AlertDescription>{w.code === "ENDPOINT_RELOCATED" ? format(t.relocated, { message: w.message }) : w.message}</AlertDescription>
                  </Alert>
                ))}
                <p className="text-xs text-muted-foreground">{t.routeNote}</p>
              </>
            ) : null}
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}
