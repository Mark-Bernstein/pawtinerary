import { describe, expect, it } from "vitest";
import type { PawtineraryData } from "../types";
import { createSnapshot, parseSnapshot, snapshotFileName } from "./snapshot";

const data: PawtineraryData = {
  version: 3,
  dogs: [
    {
      id: "dog",
      name: "Bailey",
      address: "1 Main Street",
      ownerName: "Pat",
      ownerPhone: "123",
      ownerEmail: "pat@example.com",
      notes: "Friendly",
      accessInstructions: "PRIVATE-CODE",
      rate: 25,
      createdAt: "2026-09-18T10:00:00.000Z",
      updatedAt: "2026-09-18T10:00:00.000Z",
    },
  ],
  services: [
    {
      id: "service",
      dogId: "dog",
      date: "2026-09-19",
      group: "Group 2",
      status: "completed",
      completedRate: 20,
      createdAt: "2026-09-18T10:00:00.000Z",
      updatedAt: "2026-09-19T10:00:00.000Z",
    },
  ],
};

describe("data snapshots", () => {
  it("round trips all stored data, including private access instructions", () => {
    const exportedAt = new Date("2026-09-19T12:00:00.000Z");
    const result = parseSnapshot(createSnapshot(data, exportedAt));
    expect(result).toEqual({
      ok: true,
      snapshot: {
        format: "pawtinerary-backup",
        snapshotVersion: 1,
        exportedAt: exportedAt.toISOString(),
        data,
      },
    });
  });

  it("rejects malformed and unrelated JSON", () => {
    expect(parseSnapshot("{bad")).toEqual({ ok: false, reason: "invalid" });
    expect(parseSnapshot('{"dogs":[]}')).toEqual({
      ok: false,
      reason: "invalid",
    });
  });

  it("rejects unsupported snapshot and data versions", () => {
    const snapshot = JSON.parse(createSnapshot(data));
    snapshot.snapshotVersion = 2;
    expect(parseSnapshot(JSON.stringify(snapshot))).toEqual({
      ok: false,
      reason: "unsupported",
    });
    snapshot.snapshotVersion = 1;
    snapshot.data.version = 4;
    expect(parseSnapshot(JSON.stringify(snapshot))).toEqual({
      ok: false,
      reason: "unsupported",
    });
  });

  it("rejects damaged records instead of partially restoring them", () => {
    const orphan = JSON.parse(createSnapshot(data));
    orphan.data.services[0].dogId = "missing";
    expect(parseSnapshot(JSON.stringify(orphan))).toEqual({
      ok: false,
      reason: "invalid",
    });

    const invalidRate = JSON.parse(createSnapshot(data));
    invalidRate.data.dogs[0].rate = -1;
    expect(parseSnapshot(JSON.stringify(invalidRate))).toEqual({
      ok: false,
      reason: "invalid",
    });
  });

  it("keeps only recognized fields from a valid snapshot", () => {
    const snapshot = JSON.parse(createSnapshot(data));
    snapshot.data.dogs[0].unexpected = "discard me";
    snapshot.data.services[0].unexpected = "discard me";
    const result = parseSnapshot(JSON.stringify(snapshot));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.snapshot.data.dogs[0]).not.toHaveProperty("unexpected");
    expect(result.snapshot.data.services[0]).not.toHaveProperty("unexpected");
  });

  it("creates a dated JSON filename", () => {
    expect(snapshotFileName(new Date(2026, 8, 19))).toBe(
      "Pawtinerary-Snapshot-2026-09-19.json",
    );
  });
});
