import type { Dog, Period, Service } from "../types";
import { inPeriod } from "./dates";

export interface Totals {
  earned: number;
  potential: number;
}

export const zeroTotals = (): Totals => ({ earned: 0, potential: 0 });
const cents = (amount: number) =>
  Math.round((amount + Number.EPSILON) * 100) / 100;

export const serviceAmount = (service: Service, dog: Dog) =>
  service.status === "cancelled"
    ? 0
    : cents(
        service.status === "completed"
          ? (service.completedRate ?? dog.rate)
          : dog.rate,
      );

export const getTotals = (
  services: Service[],
  dogs: Dog[],
  period: Period = "lifetime",
  anchor = new Date(),
  dogId?: string,
): Totals => {
  const dogMap = new Map(dogs.map((dog) => [dog.id, dog]));
  const totals = services.reduce((result, service) => {
    if (dogId && service.dogId !== dogId) return result;
    if (period !== "lifetime" && !inPeriod(service.date, period, anchor))
      return result;
    const dog = dogMap.get(service.dogId);
    if (!dog) return result;
    if (service.status === "completed")
      result.earned += serviceAmount(service, dog);
    if (service.status === "scheduled")
      result.potential += serviceAmount(service, dog);
    return result;
  }, zeroTotals());
  return {
    earned: cents(totals.earned),
    potential: cents(totals.potential),
  };
};
