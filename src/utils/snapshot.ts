import type { Dog, PawtineraryData, Service } from "../types";
import { isValidDateKey } from "./dates";

export const SNAPSHOT_FORMAT = "pawtinerary-backup";
export const SNAPSHOT_VERSION = 1;

export interface SnapshotDocument {
  format: typeof SNAPSHOT_FORMAT;
  snapshotVersion: typeof SNAPSHOT_VERSION;
  exportedAt: string;
  data: PawtineraryData;
}

export type SnapshotParseResult =
  | { ok: true; snapshot: SnapshotDocument }
  | { ok: false; reason: "invalid" | "unsupported" };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const isPositiveNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;
const isString = (value: unknown): value is string => typeof value === "string";

const isDog = (value: unknown): value is Dog => {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    value.id.length > 0 &&
    isString(value.name) &&
    isString(value.address) &&
    isString(value.ownerName) &&
    isString(value.ownerPhone) &&
    isString(value.ownerEmail) &&
    isString(value.notes) &&
    isString(value.accessInstructions) &&
    isPositiveNumber(value.rate) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
};

const isService = (value: unknown): value is Service => {
  if (!isRecord(value)) return false;
  return (
    isString(value.id) &&
    value.id.length > 0 &&
    isString(value.dogId) &&
    isString(value.date) &&
    isValidDateKey(value.date) &&
    ["Group 1", "Group 2", "Group 3"].includes(String(value.group)) &&
    ["scheduled", "completed", "cancelled"].includes(String(value.status)) &&
    (value.completedRate === undefined ||
      isPositiveNumber(value.completedRate)) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
};

export const createSnapshot = (
  data: PawtineraryData,
  exportedAt = new Date(),
) =>
  JSON.stringify(
    {
      format: SNAPSHOT_FORMAT,
      snapshotVersion: SNAPSHOT_VERSION,
      exportedAt: exportedAt.toISOString(),
      data,
    } satisfies SnapshotDocument,
    null,
    2,
  );

export const snapshotFileName = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `Pawtinerary-Snapshot-${year}-${month}-${day}.json`;
};

export const parseSnapshot = (source: string): SnapshotParseResult => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (!isRecord(parsed) || parsed.format !== SNAPSHOT_FORMAT)
    return { ok: false, reason: "invalid" };
  if (parsed.snapshotVersion !== SNAPSHOT_VERSION)
    return { ok: false, reason: "unsupported" };
  if (
    !isString(parsed.exportedAt) ||
    !Number.isFinite(Date.parse(parsed.exportedAt)) ||
    !isRecord(parsed.data)
  )
    return { ok: false, reason: "invalid" };

  const data = parsed.data;
  if (
    data.version !== 3 ||
    !Array.isArray(data.dogs) ||
    !Array.isArray(data.services) ||
    !data.dogs.every(isDog) ||
    !data.services.every(isService)
  )
    return data.version === 3
      ? { ok: false, reason: "invalid" }
      : { ok: false, reason: "unsupported" };

  const dogs = (data.dogs as Dog[]).map((dog) => ({
    id: dog.id,
    name: dog.name,
    address: dog.address,
    ownerName: dog.ownerName,
    ownerPhone: dog.ownerPhone,
    ownerEmail: dog.ownerEmail,
    notes: dog.notes,
    accessInstructions: dog.accessInstructions,
    rate: dog.rate,
    createdAt: dog.createdAt,
    updatedAt: dog.updatedAt,
  }));
  const services = (data.services as Service[]).map((service) => ({
    id: service.id,
    dogId: service.dogId,
    date: service.date,
    group: service.group,
    status: service.status,
    ...(service.completedRate === undefined
      ? {}
      : { completedRate: service.completedRate }),
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  }));
  const dogIds = new Set(dogs.map((dog) => dog.id));
  const dogIdsAreUnique = dogIds.size === dogs.length;
  const serviceIdsAreUnique =
    new Set(services.map((service) => service.id)).size === services.length;
  if (
    !dogIdsAreUnique ||
    !serviceIdsAreUnique ||
    services.some((service) => !dogIds.has(service.dogId))
  )
    return { ok: false, reason: "invalid" };

  return {
    ok: true,
    snapshot: {
      format: SNAPSHOT_FORMAT,
      snapshotVersion: SNAPSHOT_VERSION,
      exportedAt: parsed.exportedAt,
      data: { version: 3, dogs, services },
    },
  };
};
