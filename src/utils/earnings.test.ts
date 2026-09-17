import { describe, expect, it } from "vitest";
import type { Dog, Service } from "../types";
import { getTotals, serviceAmount } from "./earnings";
import { removeDog } from "../storage/data";

const bailey: Dog = {
  id: "bailey",
  name: "Bailey",
  address: "1 Main St",
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
  notes: "",
  accessInstructions: "",
  hourlyRate: 20,
  createdAt: "",
  updatedAt: "",
};
const service = (overrides: Partial<Service> = {}): Service => ({
  id: "one",
  dogId: "bailey",
  date: "2026-09-17",
  group: "Group 1",
  durationMinutes: 60,
  status: "scheduled",
  createdAt: "",
  updatedAt: "",
  ...overrides,
});

describe("earnings calculations", () => {
  it("calculates quarter-hour and decimal hourly amounts", () => {
    expect(
      serviceAmount(service({ durationMinutes: 75 }), {
        ...bailey,
        hourlyRate: 23.5,
      }),
    ).toBe(29.38);
    expect(serviceAmount(service({ durationMinutes: 15 }), bailey)).toBe(5);
  });
  it("counts two groups on one day separately and separates earned from potential", () => {
    const first = service({ status: "completed", completedHourlyRate: 20 });
    const second = service({
      id: "two",
      group: "Group 3",
      durationMinutes: 90,
    });
    expect(
      getTotals(
        [first, second],
        [bailey],
        "day",
        new Date("2026-09-17T12:00:00"),
      ),
    ).toEqual({ earned: 20, potential: 30 });
  });
  it("excludes cancelled services and services whose dog is missing", () => {
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
  it("uses Monday to Sunday for week totals and calendar months for month totals", () => {
    const items = [
      service({ id: "mon", date: "2026-09-14" }),
      service({ id: "sun", date: "2026-09-20" }),
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
  it("preserves completed rate snapshots while future services use the new rate", () => {
    const items = [
      service({ status: "completed", completedHourlyRate: 20 }),
      service({ id: "two", group: "Group 3", durationMinutes: 90 }),
    ];
    expect(getTotals(items, [{ ...bailey, hourlyRate: 25 }])).toEqual({
      earned: 20,
      potential: 37.5,
    });
  });
  it("removes all related services and earnings when a dog is deleted", () => {
    const before = {
      version: 1 as const,
      dogs: [bailey],
      services: [
        service({ status: "completed", completedHourlyRate: 20 }),
        service({ id: "two", group: "Group 3", durationMinutes: 90 }),
      ],
    };
    const after = removeDog(before, bailey.id);
    expect(after.dogs).toHaveLength(0);
    expect(after.services).toHaveLength(0);
    expect(getTotals(after.services, after.dogs)).toEqual({
      earned: 0,
      potential: 0,
    });
  });
});
