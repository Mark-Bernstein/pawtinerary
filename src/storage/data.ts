import type { Dog, PawtineraryData, Service } from "../types";
import { format, isValid, parseISO } from "date-fns";

export const STORAGE_KEY = "pawtinerary.data.v1";
export const emptyData = (): PawtineraryData => ({
  version: 1,
  dogs: [],
  services: [],
});
const validDog = (value: unknown): value is Dog => {
  if (!value || typeof value !== "object") return false;
  const dog = value as Record<string, unknown>;
  return (
    typeof dog.id === "string" &&
    typeof dog.name === "string" &&
    typeof dog.address === "string" &&
    typeof dog.hourlyRate === "number" &&
    Number.isFinite(dog.hourlyRate) &&
    dog.hourlyRate > 0
  );
};
const validService = (value: unknown): value is Service => {
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
    typeof service.durationMinutes === "number" &&
    Number.isFinite(service.durationMinutes) &&
    service.durationMinutes > 0 &&
    ["scheduled", "completed", "cancelled"].includes(String(service.status)) &&
    (service.completedHourlyRate === undefined ||
      (typeof service.completedHourlyRate === "number" &&
        Number.isFinite(service.completedHourlyRate) &&
        service.completedHourlyRate > 0))
  );
};
export const parseData = (raw: string | null): PawtineraryData => {
  if (!raw) return emptyData();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyData();
    const data = parsed as Record<string, unknown>;
    if (
      data.version !== 1 ||
      !Array.isArray(data.dogs) ||
      !Array.isArray(data.services)
    )
      return emptyData();
    const dogs = data.dogs
      .filter(validDog)
      .map((dog) => ({
        ...dog,
        ownerName: typeof dog.ownerName === "string" ? dog.ownerName : "",
        ownerPhone: typeof dog.ownerPhone === "string" ? dog.ownerPhone : "",
        ownerEmail: typeof dog.ownerEmail === "string" ? dog.ownerEmail : "",
        notes: typeof dog.notes === "string" ? dog.notes : "",
        accessInstructions:
          typeof dog.accessInstructions === "string"
            ? dog.accessInstructions
            : "",
        createdAt: typeof dog.createdAt === "string" ? dog.createdAt : "",
        updatedAt: typeof dog.updatedAt === "string" ? dog.updatedAt : "",
      }));
    const dogIds = new Set(dogs.map((dog) => dog.id));
    return {
      version: 1,
      dogs,
      services: data.services
        .filter(validService)
        .filter((service) => dogIds.has(service.dogId)),
    };
  } catch {
    return emptyData();
  }
};
export const readData = () => {
  try {
    return parseData(window.localStorage.getItem(STORAGE_KEY));
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
