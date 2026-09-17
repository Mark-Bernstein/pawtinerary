import type { DogInput, Group, Service, ServiceInput } from "../types";
import { isValidDateKey } from "./dates";

export type PlannedService = Omit<ServiceInput, "dogId"> & { key: string };
export type FormErrors = Record<string, string>;

export const validateDogForm = (
  input: DogInput,
  rateText: string,
  planned: PlannedService[],
  existingServices: Service[] = [],
  dogId?: string,
) => {
  const errors: FormErrors = {};
  const normalizedRate = rateText.trim().replace(",", ".");
  const numericRate = Number(normalizedRate);

  if (!input.name.trim()) errors.name = "Enter the dog's name.";
  if (!normalizedRate) errors.hourlyRate = "Enter an hourly rate in euros.";
  else if (!Number.isFinite(numericRate))
    errors.hourlyRate = "Enter a numeric hourly rate, such as 20 or 20.50.";
  else if (numericRate <= 0)
    errors.hourlyRate = "The hourly rate must be greater than €0.";
  else if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(normalizedRate))
    errors.hourlyRate = "Use digits and no more than two decimal places.";
  if (!input.address.trim()) errors.address = "Enter the dog's address.";

  const email = input.ownerEmail.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.ownerEmail = "Enter a valid email address, such as pat@example.com.";

  const seen = new Set<string>();
  const groups: Group[] = ["Group 1", "Group 2", "Group 3"];
  for (const item of planned) {
    const dateField = `date:${item.key}`;
    const groupField = `group:${item.key}`;
    const durationField = `duration:${item.key}`;
    if (!item.date) errors[dateField] = "Choose a service date.";
    else if (!isValidDateKey(item.date))
      errors[dateField] = "Choose a valid service date.";
    if (!groups.includes(item.group))
      errors[groupField] = "Choose Group 1, Group 2, or Group 3.";
    if (
      !Number.isFinite(item.durationMinutes) ||
      item.durationMinutes < 15 ||
      item.durationMinutes > 720 ||
      item.durationMinutes % 15 !== 0
    )
      errors[durationField] = "Choose a duration in 15-minute increments.";

    if (!errors[dateField] && !errors[groupField]) {
      const combination = `${item.date}|${item.group}`;
      if (seen.has(combination))
        errors[groupField] = `${item.group} is already planned for this date.`;
      else if (
        dogId &&
        existingServices.some(
          (service) =>
            service.dogId === dogId &&
            service.date === item.date &&
            service.group === item.group &&
            service.status !== "cancelled",
        )
      )
        errors[groupField] = `${item.group} already has a service on this date.`;
      seen.add(combination);
    }
  }

  return { errors, hourlyRate: numericRate };
};
