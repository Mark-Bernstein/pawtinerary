import { describe, expect, it, vi } from "vitest";
import { emptyData, parseData, readData, STORAGE_KEY } from "./data";

describe("stored data", () => {
  it("starts empty for missing, malformed, or unsupported data", () => {
    expect(parseData(null)).toEqual(emptyData());
    expect(parseData("{bad")).toEqual(emptyData());
    expect(parseData('{"version":3,"dogs":[],"services":[]}')).toEqual(
      emptyData(),
    );
  });
  it("filters orphaned and malformed service records", () => {
    const raw = JSON.stringify({
      version: 1,
      dogs: [{ id: "d", name: "Dog", address: "Street", hourlyRate: 20 }],
      services: [
        {
          id: "one",
          dogId: "d",
          date: "2026-09-17",
          group: "Group 1",
          durationMinutes: 60,
          status: "scheduled",
        },
        {
          id: "two",
          dogId: "missing",
          date: "2026-09-17",
          group: "Group 1",
          durationMinutes: 60,
          status: "scheduled",
        },
        {
          id: "invalid-date",
          dogId: "d",
          date: "2026-99-99",
          group: "Group 1",
          durationMinutes: 60,
          status: "scheduled",
        },
      ],
    });
    const data = parseData(raw);
    expect(data.version).toBe(2);
    expect(data.dogs).toHaveLength(1);
    expect(data.services).toHaveLength(1);
    expect(data.services[0]).not.toHaveProperty("durationMinutes");
    expect(data.dogs[0].ownerName).toBe("");
  });

  it("migrates existing browser records without losing dogs or services", () => {
    const legacy = JSON.stringify({
      version: 1,
      dogs: [{ id: "d", name: "Dog", address: "Street", hourlyRate: 20 }],
      services: [{
        id: "completed",
        dogId: "d",
        date: "2026-09-17",
        group: "Group 1",
        durationMinutes: 90,
        status: "completed",
        completedHourlyRate: 18,
      }],
    });
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) =>
          key === STORAGE_KEY ? null : key === "pawtinerary.data.v1" ? legacy : null,
      },
    });
    try {
      const migrated = readData();
      expect(migrated.version).toBe(2);
      expect(migrated.dogs[0].hourlyRate).toBe(20);
      expect(migrated.services).toHaveLength(1);
      expect(migrated.services[0]).not.toHaveProperty("durationMinutes");
      expect(migrated.services[0]).not.toHaveProperty("completedHourlyRate");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
