import type { DogInput, Group, Service, ServiceInput } from "../types";
import { isValidDateKey } from "./dates";
import { formatGroup, translate, type Language } from "../i18n/LanguageContext";

export type PlannedService = Omit<ServiceInput, "dogId"> & { key: string };
export type FormErrors = Record<string, string>;

export const validateDogForm = (
  input: DogInput,
  rateText: string,
  planned: PlannedService[],
  existingServices: Service[] = [],
  dogId?: string,
  language: Language = "en",
) => {
  const errors: FormErrors = {};
  const normalizedRate = rateText.trim().replace(",", ".");
  const numericRate = Number(normalizedRate);

  if (!input.name.trim())
    errors.name = translate(language, "Enter the dog's name.");
  if (!normalizedRate)
    errors.rate = translate(language, "Enter a rate in euros.");
  else if (!Number.isFinite(numericRate))
    errors.rate = translate(
      language,
      "Enter a numeric rate, such as 20 or 20.50.",
    );
  else if (numericRate <= 0)
    errors.rate = translate(language, "The rate must be greater than €0.");
  else if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(normalizedRate))
    errors.rate = translate(
      language,
      "Use digits and no more than two decimal places.",
    );
  if (!input.address.trim())
    errors.address = translate(language, "Enter the dog's address.");

  const email = input.ownerEmail.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.ownerEmail = translate(
      language,
      "Enter a valid email address, such as pat@example.com.",
    );

  const seen = new Set<string>();
  const groups: Group[] = ["Group 1", "Group 2", "Group 3"];
  for (const item of planned) {
    const dateField = `date:${item.key}`;
    const groupField = `group:${item.key}`;
    if (!item.date)
      errors[dateField] = translate(language, "Choose a service date.");
    else if (!isValidDateKey(item.date))
      errors[dateField] = translate(language, "Choose a valid service date.");
    if (!groups.includes(item.group))
      errors[groupField] = translate(
        language,
        "Choose Group 1, Group 2, or Group 3.",
      );
    if (!errors[dateField] && !errors[groupField]) {
      const combination = `${item.date}|${item.group}`;
      if (seen.has(combination))
        errors[groupField] = translate(
          language,
          "{group} is already planned for this date.",
          { group: formatGroup(item.group, language) },
        );
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
        errors[groupField] = translate(
          language,
          "{group} already has a service on this date.",
          { group: formatGroup(item.group, language) },
        );
      seen.add(combination);
    }
  }

  return { errors, rate: numericRate };
};
