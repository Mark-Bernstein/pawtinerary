import type { Dog, Period, Service } from "../types";
import { inPeriod } from "./dates";

export interface Totals {
  earned: number;
  potential: number;
}
export const zeroTotals = (): Totals => ({ earned: 0, potential: 0 });
export const currency = (amount: number) =>
  new Intl.NumberFormat("en", { style: "currency", currency: "EUR" }).format(
    amount,
  );
export const serviceAmount = (service: Service, dog: Dog) => {
  const rate =
    service.status === "completed"
      ? (service.completedHourlyRate ?? dog.hourlyRate)
      : dog.hourlyRate;
  return (
    Math.round(((rate * service.durationMinutes) / 60 + Number.EPSILON) * 100) /
    100
  );
};
export const getTotals = (
  services: Service[],
  dogs: Dog[],
  period: Period = "lifetime",
  anchor = new Date(),
  dogId?: string,
): Totals => {
  const dogMap = new Map(dogs.map((dog) => [dog.id, dog]));
  return services.reduce((totals, service) => {
    if (dogId && service.dogId !== dogId) return totals;
    if (period !== "lifetime" && !inPeriod(service.date, period, anchor))
      return totals;
    const dog = dogMap.get(service.dogId);
    if (!dog) return totals;
    if (service.status === "completed")
      totals.earned += serviceAmount(service, dog);
    if (service.status === "scheduled")
      totals.potential += serviceAmount(service, dog);
    return totals;
  }, zeroTotals());
};
export const durationLabel = (minutes: number) =>
  minutes % 60 === 0 ? `${minutes / 60} hr` : `${minutes / 60} hrs`;
