import { describe, expect, it } from "vitest";
import { parseAddons } from "@/lib/addons";
import { ENERGY_OVERLAYS, FREE_OVERLAYS, LEGAL_OVERLAYS, overlaysFor } from "@/lib/layers";
import { NO_FILTERS, OperationError, SAMPLE_OPERATION, STATUSES, byCrew, filterOrders, nextStatus, parseOperation } from "@/lib/work-orders";

describe("the sample operation", () => {
  it("is a valid base, three crews and ten synthetic work orders around Drayton Valley", () => {
    expect(SAMPLE_OPERATION.crews).toHaveLength(3);
    expect(SAMPLE_OPERATION.workOrders).toHaveLength(10);
    for (const w of SAMPLE_OPERATION.workOrders) {
      expect(Math.abs(w.coordinates[0] - SAMPLE_OPERATION.base.coordinates[0])).toBeLessThan(0.5);
      expect(Math.abs(w.coordinates[1] - SAMPLE_OPERATION.base.coordinates[1])).toBeLessThan(0.3);
    }
  });

  it("lists every problem in a bad file", () => {
    const bad = {
      base: { name: "b", coordinates: [0, 0] },
      crews: [{ id: "a", name: "A" }],
      workOrders: [{ id: "x", title: "t", category: "dig", asset: "well", status: "lost", priority: "high", crew: "z", window: ["8:00", "12:00"], coordinates: [0, 99], notes: "" }],
    };
    try {
      parseOperation(bad);
      throw new Error("accepted");
    } catch (error) {
      expect(error).toBeInstanceOf(OperationError);
      expect((error as OperationError).problems).toEqual([
        "work order 1: unknown category dig",
        "work order 1: unknown status lost",
        "work order 1: unknown crew z",
        "work order 1: bad window",
        "work order 1: bad coordinates",
      ]);
    }
  });
});

describe("work orders", () => {
  it("filter by category, status and text", () => {
    const all = SAMPLE_OPERATION.workOrders;
    expect(filterOrders(all, NO_FILTERS)).toHaveLength(all.length);
    expect(filterOrders(all, { ...NO_FILTERS, categories: ["repair"] }).every((w) => w.category === "repair")).toBe(true);
    expect(filterOrders(all, { ...NO_FILTERS, statuses: ["complete"] }).map((w) => w.id)).toEqual(["WO-2046"]);
    expect(filterOrders(all, { ...NO_FILTERS, query: "cs-3" }).map((w) => w.id)).toEqual(["WO-2043"]);
  });

  it("move forward through the lifecycle one step at a time and stop at complete", () => {
    expect(STATUSES.map(nextStatus)).toEqual(["dispatched", "on-site", "complete", null]);
  });

  it("group under their crew, high priority first, then by start time", () => {
    const groups = byCrew(SAMPLE_OPERATION.workOrders, SAMPLE_OPERATION.crews);
    expect(groups.map((g) => g.crew.id)).toEqual(["crew-a", "crew-b", "crew-c"]);
    const b = groups.find((g) => g.crew.id === "crew-b")!.orders.map((w) => w.id);
    expect(b.slice(0, 2)).toEqual(["WO-2042", "WO-2048"]);
  });
});

describe("add-ons", () => {
  it("read only the add-ons it knows, case and spaces aside", () => {
    expect([...parseAddons(undefined)]).toEqual([]);
    expect([...parseAddons(" Energy , legal-land, mining")]).toEqual(["energy", "legal-land"]);
  });

  it("compose free layers always, Alberta energy layers with Energy, the survey grid with either", () => {
    expect(overlaysFor(new Set())).toEqual([...FREE_OVERLAYS]);
    expect(overlaysFor(new Set(["legal-land"]))).toEqual([...FREE_OVERLAYS, ...LEGAL_OVERLAYS]);
    expect(overlaysFor(new Set(["energy"]))).toEqual([...FREE_OVERLAYS, ...ENERGY_OVERLAYS, ...LEGAL_OVERLAYS]);
    // Never the layers the gateway's records mark unverified for redistribution.
    for (const id of ["energy.fields", "energy.ccs", "energy.geothermal"]) expect(overlaysFor(new Set(["energy"]))).not.toContain(id);
  });
});
