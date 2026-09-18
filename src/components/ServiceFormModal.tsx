import { useRef, useState, type FormEvent } from "react";
import { useApp } from "../context/AppContext";
import type { Group, Service } from "../types";
import { isValidDateKey, todayKey } from "../utils/dates";
import { useLanguage } from "../i18n/LanguageContext";
import {
  Button,
  ErrorSummary,
  Field,
  FieldError,
  Input,
  Select,
  Stack,
  Muted,
} from "../styles";
import { Modal } from "./Modal";
import { MultiDateCalendar } from "./MultiDateCalendar";

const GROUPS: Group[] = ["Group 1", "Group 2", "Group 3"];
export const ServiceFormModal = ({
  onClose,
  initialDogId,
  initialDate,
  service,
}: {
  onClose: () => void;
  initialDogId?: string;
  initialDate?: string;
  service?: Service;
}) => {
  const { data, addServices, updateService } = useApp();
  const { t, shortDay, group: groupLabel } = useLanguage();
  const [dogId, setDogId] = useState(
    service?.dogId ?? initialDogId ?? data.dogs[0]?.id ?? "",
  );
  const [date, setDate] = useState(service?.date ?? initialDate ?? todayKey());
  const [selectedDates, setSelectedDates] = useState<string[]>([
    service?.date ?? initialDate ?? todayKey(),
  ]);
  const [group, setGroup] = useState<Group>(service?.group ?? "Group 1");
  const [attempted, setAttempted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const dog = data.dogs.find((item) => item.id === dogId);
  const validation: Record<string, string> = {};
  if (!dog) validation.dogId = t("Choose a dog for this service.");
  if (!service && selectedDates.length === 0)
    validation.date = t("Choose a service date.");
  else if (service && !date) validation.date = t("Choose a service date.");
  else if (
    service
      ? !isValidDateKey(date)
      : selectedDates.some((key) => !isValidDateKey(key))
  )
    validation.date = t("Choose a valid service date.");
  if (!GROUPS.includes(group)) validation.group = t("Choose a service group.");
  const conflictingDate =
    dog &&
    !validation.date &&
    !validation.group &&
    (service ? [date] : selectedDates).find((key) =>
      data.services.some(
        (item) =>
          item.id !== service?.id &&
          item.status !== "cancelled" &&
          item.dogId === dogId &&
          item.date === key &&
          item.group === group,
      ),
    );
  if (conflictingDate && dog) {
    if (service) {
      validation.group = t(
        "{dog} already has a {group} service on this date. Choose another group or date.",
        { dog: dog.name, group: groupLabel(group) },
      );
    } else {
      validation.date = t(
        "{dog} already has a {group} service on {date}. Remove that date or choose another group.",
        {
          dog: dog.name,
          group: groupLabel(group),
          date: shortDay(conflictingDate),
        },
      );
    }
  }
  const errors: Record<string, string> = attempted ? validation : {};
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    const firstError = Object.keys(validation)[0];
    if (firstError) {
      requestAnimationFrame(() => {
        const fields = formRef.current?.querySelectorAll<HTMLElement>(
          "[data-validation-key]",
        );
        Array.from(fields ?? [])
          .find((field) => field.dataset.validationKey === firstError)
          ?.focus();
      });
      return;
    }
    const success = service
      ? updateService(service.id, { dogId, date, group })
      : addServices(selectedDates.map((key) => ({ dogId, date: key, group })));
    if (success) onClose();
  };
  return (
    <Modal
      title={t(service ? "Edit service" : "Add service")}
      onClose={onClose}
    >
      {data.dogs.length === 0 ? (
        <Stack>
          <Muted>{t("Create a dog before scheduling a service.")}</Muted>
          <Button type="button" onClick={onClose}>
            {t("Close")}
          </Button>
        </Stack>
      ) : (
        <form ref={formRef} onSubmit={submit} noValidate>
          <Stack>
            {Object.keys(errors).length > 0 && (
              <ErrorSummary role="alert">
                {t(
                  service
                    ? Object.keys(errors).length === 1
                      ? "Please fix the highlighted field before saving this service."
                      : "Please fix the highlighted fields before saving this service."
                    : Object.keys(errors).length === 1
                      ? "Please fix the highlighted field before adding this service."
                      : "Please fix the highlighted fields before adding this service.",
                )}
              </ErrorSummary>
            )}
            <Field>
              {t("Dog")}
              <Select
                value={dogId}
                onChange={(event) => setDogId(event.target.value)}
                required
                aria-label={t("Dog")}
                aria-invalid={Boolean(errors.dogId)}
                aria-describedby={
                  errors.dogId ? "service-dog-error" : undefined
                }
                data-validation-key="dogId"
              >
                {data.dogs.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
              {errors.dogId && (
                <FieldError id="service-dog-error">{errors.dogId}</FieldError>
              )}
            </Field>
            {service ? (
              <Field>
                {t("Date")}
                <Input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  required
                  aria-label={t("Date")}
                  aria-invalid={Boolean(errors.date)}
                  aria-describedby={
                    errors.date ? "service-date-error" : undefined
                  }
                  data-validation-key="date"
                />
                {errors.date && (
                  <FieldError id="service-date-error">{errors.date}</FieldError>
                )}
              </Field>
            ) : (
              <div style={{ display: "grid", gap: 7 }}>
                <strong style={{ fontSize: 12 }}>{t("Service dates")}</strong>
                <Muted>{t("Tap dates to add or remove them.")}</Muted>
                <MultiDateCalendar
                  selectedDates={selectedDates}
                  initialDate={initialDate}
                  onToggle={(key) =>
                    setSelectedDates((current) =>
                      current.includes(key)
                        ? current.filter((item) => item !== key)
                        : [...current, key].sort(),
                    )
                  }
                  invalid={Boolean(errors.date)}
                  errorId={errors.date ? "service-date-error" : undefined}
                  validationKey="date"
                />
                {errors.date && (
                  <FieldError id="service-date-error">{errors.date}</FieldError>
                )}
              </div>
            )}
            <Field>
              {t("Group")}
              <Select
                value={group}
                onChange={(event) => setGroup(event.target.value as Group)}
                aria-label={t("Group")}
                aria-invalid={Boolean(errors.group)}
                aria-describedby={
                  errors.group ? "service-group-error" : undefined
                }
                data-validation-key="group"
              >
                {GROUPS.map((item) => (
                  <option key={item} value={item}>
                    {groupLabel(item)}
                  </option>
                ))}
              </Select>
              {errors.group && (
                <FieldError id="service-group-error">{errors.group}</FieldError>
              )}
            </Field>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                paddingTop: 7,
              }}
            >
              <Button $variant="primary" type="submit">
                {service
                  ? t("Save changes")
                  : selectedDates.length <= 1
                    ? t("Add service")
                    : t("Add {count} services", {
                        count: selectedDates.length,
                      })}
              </Button>
            </div>
          </Stack>
        </form>
      )}
    </Modal>
  );
};
