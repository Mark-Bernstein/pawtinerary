import { describe, expect, it } from "vitest";
import { emptyData, parseData } from "./data";

describe("stored data", () => {
  it("starts empty for missing, malformed, or unsupported data", () => {
    expect(parseData(null)).toEqual(emptyData());
    expect(parseData("{bad")).toEqual(emptyData());
    expect(parseData('{"version":2,"dogs":[],"services":[]}')).toEqual(
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
    expect(data.dogs).toHaveLength(1);
    expect(data.services).toHaveLength(1);
    expect(data.dogs[0].ownerName).toBe("");
  });
});
