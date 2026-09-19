import { describe, expect, it } from "vitest";
import type { Dog, Service } from "../types";
import { getTotals, serviceAmount } from "./earnings";

const bailey: Dog = {
  id: "bailey",
  name: "Bailey",
  address: "1 Main St",
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
  notes: "",
  accessInstructions: "",
  rate: 20,
  createdAt: "",
  updatedAt: "",
};
const service = (overrides: Partial<Service> = {}): Service => ({
  id: "one",
  dogId: "bailey",
  date: "2026-09-17",
  group: "Group 1",
  status: "scheduled",
  createdAt: "",
  updatedAt: "",
  ...overrides,
});

describe("earnings calculations", () => {
  it("charges the full rate once for each service", () => {
    expect(serviceAmount(service(), { ...bailey, rate: 23.5 })).toBe(23.5);
  });

  it("charges two groups on the same date as two sessions", () => {
    const group1 = service({ status: "completed", completedRate: 20 });
    const group2 = service({ id: "two", group: "Group 2" });
    expect(
      getTotals(
        [group1, group2],
        [bailey],
        "day",
        new Date("2026-09-17T12:00:00"),
      ),
    ).toEqual({ earned: 20, potential: 20 });
  });

  it("excludes cancelled services and services whose dog is missing", () => {
    expect(serviceAmount(service({ status: "cancelled" }), bailey)).toBe(0);
    expect(
      getTotals(
        [
          service({ status: "cancelled" }),
          service({ id: "orphan", dogId: "missing" }),
        ],
        [bailey],
      ),
    ).toEqual({ earned: 0, potential: 0 });
  });

  it("uses Monday to Sunday weeks and calendar months", () => {
    const items = [
      service({ id: "mon", date: "2026-09-14" }),
      service({ id: "sun", date: "2026-09-20", group: "Group 2" }),
      service({ id: "next", date: "2026-09-21" }),
      service({ id: "oct", date: "2026-10-01" }),
    ];
    expect(
      getTotals(items, [bailey], "week", new Date("2026-09-17T12:00:00"))
        .potential,
    ).toBe(40);
    expect(
      getTotals(items, [bailey], "month", new Date("2026-09-17T12:00:00"))
        .potential,
    ).toBe(60);
    expect(getTotals(items, [bailey]).potential).toBe(80);
  });

  it("preserves a completed session's rate after the dog's rate changes", () => {
    expect(
      getTotals(
        [service({ status: "completed", completedRate: 20 })],
        [{ ...bailey, rate: 25 }],
      ),
    ).toEqual({ earned: 20, potential: 0 });
  });
});
