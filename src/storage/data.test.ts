import { describe, expect, it, vi } from "vitest";
import { emptyData, parseData, readData, STORAGE_KEY } from "./data";

describe("stored data", () => {
  it("starts empty for missing, malformed, or unsupported data", () => {
    expect(parseData(null)).toEqual(emptyData());
    expect(parseData("{bad")).toEqual(emptyData());
    expect(parseData('{"version":4,"dogs":[],"services":[]}')).toEqual(
      emptyData(),
    );
  });

  it("filters orphaned and malformed services", () => {
    const data = parseData(
      JSON.stringify({
        version: 3,
        dogs: [{ id: "d", name: "Dog", address: "Street", rate: 20 }],
        services: [
          {
            id: "one",
            dogId: "d",
            date: "2026-09-17",
            group: "Group 1",
            status: "scheduled",
          },
          {
            id: "orphan",
            dogId: "missing",
            date: "2026-09-17",
            group: "Group 1",
            status: "scheduled",
          },
          {
            id: "invalid-date",
            dogId: "d",
            date: "2026-99-99",
            group: "Group 1",
            status: "scheduled",
          },
        ],
      }),
    );
    expect(data.version).toBe(3);
    expect(data.dogs).toHaveLength(1);
    expect(data.services).toHaveLength(1);
    expect(data.dogs[0].ownerName).toBe("");
  });

  it("migrates version 2 rates and snapshots completed sessions", () => {
    const data = parseData(
      JSON.stringify({
        version: 2,
        dogs: [
          { id: "d", name: "Dog", address: "Street", hourlyRate: 20 },
        ],
        services: [
          {
            id: "completed",
            dogId: "d",
            date: "2026-09-17",
            group: "Group 1",
            status: "completed",
          },
        ],
      }),
    );
    expect(data.version).toBe(3);
    expect(data.dogs[0].rate).toBe(20);
    expect(data.dogs[0]).not.toHaveProperty("hourlyRate");
    expect(data.services[0].completedRate).toBe(20);
  });

  it("preserves the earned amount when migrating version 1 hourly data", () => {
    const data = parseData(
      JSON.stringify({
        version: 1,
        dogs: [
          { id: "d", name: "Dog", address: "Street", hourlyRate: 20 },
        ],
        services: [
          {
            id: "completed",
            dogId: "d",
            date: "2026-09-17",
            group: "Group 1",
            durationMinutes: 90,
            status: "completed",
            completedHourlyRate: 18,
          },
        ],
      }),
    );
    expect(data.services[0].completedRate).toBe(27);
    expect(data.services[0]).not.toHaveProperty("durationMinutes");
    expect(data.services[0]).not.toHaveProperty("completedHourlyRate");
  });

  it("reads version 2 data when version 3 has not been stored yet", () => {
    const legacy = JSON.stringify({
      version: 2,
      dogs: [{ id: "d", name: "Dog", address: "Street", hourlyRate: 20 }],
      services: [],
    });
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) =>
          key === STORAGE_KEY
            ? null
            : key === "pawtinerary.data.v2"
              ? legacy
              : null,
      },
    });
    try {
      const migrated = readData();
      expect(migrated.version).toBe(3);
      expect(migrated.dogs[0].rate).toBe(20);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
