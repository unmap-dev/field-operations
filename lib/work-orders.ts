/**
 * The sample operation: a base, crews and work orders, all synthetic, and the plain logic over
 * them: validation, filters, and the field-task lifecycle the app simulates. No React, no fetch;
 * unit-tested in test/work-orders.test.ts.
 */
import sample from "@/data/work-orders.sample.json";

export const CATEGORIES = ["inspection", "maintenance", "repair", "survey"] as const;
export type Category = (typeof CATEGORIES)[number];

export const ASSETS = ["well", "pipeline", "facility", "site"] as const;
export type Asset = (typeof ASSETS)[number];

/** The lifecycle, in order. A task only ever moves forward, one step at a time. */
export const STATUSES = ["scheduled", "dispatched", "on-site", "complete"] as const;
export type Status = (typeof STATUSES)[number];

export const PRIORITIES = ["high", "normal", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface Crew {
  id: string;
  name: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  category: Category;
  asset: Asset;
  status: Status;
  priority: Priority;
  crew: string;
  /** Local time window, "HH:MM". */
  window: [string, string];
  coordinates: [number, number];
  notes: string;
}

export interface Operation {
  base: { name: string; coordinates: [number, number] };
  crews: Crew[];
  workOrders: WorkOrder[];
}

export class OperationError extends Error {
  constructor(readonly problems: string[]) {
    super(problems.join("; "));
    this.name = "OperationError";
  }
}

const isLngLat = (c: unknown): c is [number, number] =>
  Array.isArray(c) && c.length === 2 && c.every((n) => typeof n === "number" && Number.isFinite(n)) && Math.abs(c[0]) <= 180 && Math.abs(c[1]) <= 90;
const isTime = (s: unknown) => typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

/** Check the operation file and list every problem: bad values, unknown crews, duplicate ids. */
export function parseOperation(data: unknown): Operation {
  const problems: string[] = [];
  const d = data as Partial<Operation>;
  if (!d?.base || typeof d.base.name !== "string" || !isLngLat(d.base.coordinates)) problems.push("base: needs a name and coordinates");
  const crews = Array.isArray(d?.crews) ? d.crews : [];
  if (!crews.length) problems.push("crews: none");
  const crewIds = new Set(crews.map((c) => c.id));
  const ids = new Set<string>();
  (Array.isArray(d?.workOrders) ? d.workOrders : []).forEach((w, i) => {
    const at = `work order ${i + 1}`;
    if (typeof w.id !== "string" || !w.id) problems.push(`${at}: no id`);
    else if (ids.has(w.id)) problems.push(`${at}: duplicate id ${w.id}`);
    else ids.add(w.id);
    if (!CATEGORIES.includes(w.category)) problems.push(`${at}: unknown category ${String(w.category)}`);
    if (!ASSETS.includes(w.asset)) problems.push(`${at}: unknown asset ${String(w.asset)}`);
    if (!STATUSES.includes(w.status)) problems.push(`${at}: unknown status ${String(w.status)}`);
    if (!PRIORITIES.includes(w.priority)) problems.push(`${at}: unknown priority ${String(w.priority)}`);
    if (!crewIds.has(w.crew)) problems.push(`${at}: unknown crew ${String(w.crew)}`);
    if (!Array.isArray(w.window) || !isTime(w.window[0]) || !isTime(w.window[1])) problems.push(`${at}: bad window`);
    if (!isLngLat(w.coordinates)) problems.push(`${at}: bad coordinates`);
  });
  if (!ids.size) problems.push("workOrders: none");
  if (problems.length) throw new OperationError(problems);
  return d as Operation;
}

export const SAMPLE_OPERATION: Operation = parseOperation(sample);

export interface OrderFilters {
  /** Categories to show; empty shows all. */
  categories: Category[];
  /** Statuses to show; empty shows all. */
  statuses: Status[];
  /** Free text over the id and title. */
  query: string;
}

export const NO_FILTERS: OrderFilters = { categories: [], statuses: [], query: "" };

export function filterOrders(orders: readonly WorkOrder[], f: OrderFilters): WorkOrder[] {
  const q = f.query.trim().toLowerCase();
  return orders.filter(
    (w) =>
      (!f.categories.length || f.categories.includes(w.category)) &&
      (!f.statuses.length || f.statuses.includes(w.status)) &&
      (!q || w.id.toLowerCase().includes(q) || w.title.toLowerCase().includes(q)),
  );
}

/** The next status in the lifecycle, or null once complete. */
export function nextStatus(status: Status): Status | null {
  const i = STATUSES.indexOf(status);
  return i < STATUSES.length - 1 ? STATUSES[i + 1]! : null;
}

/** Orders grouped by crew, in the crews' order, each group by priority then window start. */
export function byCrew(orders: readonly WorkOrder[], crews: readonly Crew[]): { crew: Crew; orders: WorkOrder[] }[] {
  const rank = (p: Priority) => PRIORITIES.indexOf(p);
  return crews
    .map((crew) => ({
      crew,
      orders: orders
        .filter((w) => w.crew === crew.id)
        .sort((a, b) => rank(a.priority) - rank(b.priority) || a.window[0].localeCompare(b.window[0])),
    }))
    .filter((g) => g.orders.length);
}
