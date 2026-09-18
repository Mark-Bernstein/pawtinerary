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
  const { data, addService, updateService } = useApp();
  const { t, group: groupLabel } = useLanguage();
  const [dogId, setDogId] = useState(
    service?.dogId ?? initialDogId ?? data.dogs[0]?.id ?? "",
  );
  const [date, setDate] = useState(service?.date ?? initialDate ?? todayKey());
  const [group, setGroup] = useState<Group>(service?.group ?? "Group 1");
  const [attempted, setAttempted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const dog = data.dogs.find((item) => item.id === dogId);
  const validation: Record<string, string> = {};
  if (!dog) validation.dogId = t("Choose a dog for this service.");
  if (!date) validation.date = t("Choose a service date.");
  else if (!isValidDateKey(date))
    validation.date = t("Choose a valid service date.");
  if (!GROUPS.includes(group)) validation.group = t("Choose a service group.");
  if (
    dog &&
    !validation.date &&
    !validation.group &&
    data.services.some(
      (item) =>
        item.id !== service?.id &&
        item.status !== "cancelled" &&
        item.dogId === dogId &&
        item.date === date &&
        item.group === group,
    )
  )
    validation.group = t(
      "{dog} already has a {group} service on this date. Choose another group or date.",
      { dog: dog.name, group: groupLabel(group) },
    );
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
    const input = { dogId, date, group };
    const success = service
      ? updateService(service.id, input)
      : addService(input);
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
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 7 }}>
              <Button $variant="primary" type="submit">
                {t(service ? "Save changes" : "Add service")}
              </Button>
            </div>
          </Stack>
        </form>
      )}
    </Modal>
  );
};
