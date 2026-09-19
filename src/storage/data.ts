import type { Dog, PawtineraryData, Service } from "../types";
import { format, isValid, parseISO } from "date-fns";

export const STORAGE_KEY = "pawtinerary.data.v3";
const LEGACY_STORAGE_KEYS = ["pawtinerary.data.v2", "pawtinerary.data.v1"];
export const emptyData = (): PawtineraryData => ({
  version: 3,
  dogs: [],
  services: [],
});

const positiveNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;
const storedDogRate = (dog: Record<string, unknown>) =>
  positiveNumber(dog.rate)
    ? dog.rate
    : positiveNumber(dog.hourlyRate)
      ? dog.hourlyRate
      : undefined;
const validStoredDog = (value: unknown) => {
  if (!value || typeof value !== "object") return false;
  const dog = value as Record<string, unknown>;
  return (
    typeof dog.id === "string" &&
    typeof dog.name === "string" &&
    typeof dog.address === "string" &&
    storedDogRate(dog) !== undefined
  );
};
const validStoredService = (value: unknown) => {
  if (!value || typeof value !== "object") return false;
  const service = value as Record<string, unknown>;
  const parsedDate =
    typeof service.date === "string" ? parseISO(service.date) : new Date(NaN);
  return (
    typeof service.id === "string" &&
    typeof service.dogId === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(String(service.date)) &&
    isValid(parsedDate) &&
    format(parsedDate, "yyyy-MM-dd") === service.date &&
    ["Group 1", "Group 2", "Group 3"].includes(String(service.group)) &&
    ["scheduled", "completed", "cancelled"].includes(String(service.status)) &&
    (service.completedRate === undefined ||
      positiveNumber(service.completedRate))
  );
};
const cents = (amount: number) =>
  Math.round((amount + Number.EPSILON) * 100) / 100;

export const parseData = (raw: string | null): PawtineraryData => {
  if (!raw) return emptyData();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyData();
    const data = parsed as Record<string, unknown>;
    if (
      (data.version !== 1 && data.version !== 2 && data.version !== 3) ||
      !Array.isArray(data.dogs) ||
      !Array.isArray(data.services)
    )
      return emptyData();

    const dogs: Dog[] = data.dogs.filter(validStoredDog).map((value) => {
      const dog = value as Record<string, unknown>;
      return {
        id: dog.id as string,
        name: dog.name as string,
        address: dog.address as string,
        ownerName: typeof dog.ownerName === "string" ? dog.ownerName : "",
        ownerPhone: typeof dog.ownerPhone === "string" ? dog.ownerPhone : "",
        ownerEmail: typeof dog.ownerEmail === "string" ? dog.ownerEmail : "",
        notes: typeof dog.notes === "string" ? dog.notes : "",
        accessInstructions:
          typeof dog.accessInstructions === "string"
            ? dog.accessInstructions
            : "",
        rate: storedDogRate(dog)!,
        createdAt: typeof dog.createdAt === "string" ? dog.createdAt : "",
        updatedAt: typeof dog.updatedAt === "string" ? dog.updatedAt : "",
      };
    });
    const dogMap = new Map(dogs.map((dog) => [dog.id, dog]));
    const version = data.version;
    const services: Service[] = data.services
      .filter(validStoredService)
      .filter((value) =>
        dogMap.has((value as Record<string, unknown>).dogId as string),
      )
      .map((value) => {
        const service = value as Record<string, unknown>;
        const dog = dogMap.get(service.dogId as string)!;
        let completedRate: number | undefined;
        if (service.status === "completed") {
          if (positiveNumber(service.completedRate)) {
            completedRate = service.completedRate;
          } else if (
            version === 1 &&
            positiveNumber(service.completedHourlyRate) &&
            positiveNumber(service.durationMinutes)
          ) {
            completedRate = cents(
              (service.completedHourlyRate * service.durationMinutes) / 60,
            );
          } else {
            completedRate = dog.rate;
          }
        }
        return {
          id: service.id as string,
          dogId: service.dogId as string,
          date: service.date as string,
          group: service.group as Service["group"],
          status: service.status as Service["status"],
          ...(completedRate === undefined ? {} : { completedRate }),
          createdAt:
            typeof service.createdAt === "string" ? service.createdAt : "",
          updatedAt:
            typeof service.updatedAt === "string" ? service.updatedAt : "",
        };
      });
    return { version: 3, dogs, services };
  } catch {
    return emptyData();
  }
};

export const readData = () => {
  try {
    const current = window.localStorage.getItem(STORAGE_KEY);
    if (current !== null) return parseData(current);
    for (const key of LEGACY_STORAGE_KEYS) {
      const legacy = window.localStorage.getItem(key);
      if (legacy !== null) return parseData(legacy);
    }
    return emptyData();
  } catch {
    return emptyData();
  }
};
export const writeData = (data: PawtineraryData) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
};
export const removeDog = (
  data: PawtineraryData,
  dogId: string,
): PawtineraryData => ({
  ...data,
  dogs: data.dogs.filter((dog) => dog.id !== dogId),
  services: data.services.filter((service) => service.dogId !== dogId),
});
