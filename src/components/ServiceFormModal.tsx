import { useRef, useState, type FormEvent } from "react";
import { styled } from "styled-components";
import { useApp } from "../context/AppContext";
import type { Group, Service } from "../types";
import { isValidDateKey, todayKey } from "../utils/dates";
import { currency } from "../utils/earnings";
import { Button, ErrorSummary, Field, FieldError, Input, Select, Stack, Muted } from "../styles";
import { Modal } from "./Modal";

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 7px;
  strong {
    font:
      700 23px Outfit,
      sans-serif;
  }
`;
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
  const [dogId, setDogId] = useState(
    service?.dogId ?? initialDogId ?? data.dogs[0]?.id ?? "",
  );
  const [date, setDate] = useState(service?.date ?? initialDate ?? todayKey());
  const [group, setGroup] = useState<Group>(service?.group ?? "Group 1");
  const [duration, setDuration] = useState(service?.durationMinutes ?? 60);
  const [attempted, setAttempted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const dog = data.dogs.find((item) => item.id === dogId);
  const validation: Record<string, string> = {};
  if (!dog) validation.dogId = "Choose a dog for this service.";
  if (!date) validation.date = "Choose a service date.";
  else if (!isValidDateKey(date)) validation.date = "Choose a valid service date.";
  if (!GROUPS.includes(group)) validation.group = "Choose a service group.";
  if (!Number.isFinite(duration) || duration < 15 || duration > 720 || duration % 15 !== 0)
    validation.duration = "Choose a duration in 15-minute increments.";
  if (dog && !validation.date && !validation.group && data.services.some((item) =>
    item.id !== service?.id && item.status !== "cancelled" && item.dogId === dogId && item.date === date && item.group === group,
  )) validation.group = `${dog.name} already has a ${group} service on this date. Choose another group or date.`;
  const errors: Record<string, string> = attempted ? validation : {};
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    const firstError = Object.keys(validation)[0];
    if (firstError) {
      requestAnimationFrame(() => {
        const fields = formRef.current?.querySelectorAll<HTMLElement>("[data-validation-key]");
        Array.from(fields ?? []).find((field) => field.dataset.validationKey === firstError)?.focus();
      });
      return;
    }
    const input = { dogId, date, group, durationMinutes: duration };
    const success = service
      ? updateService(service.id, input)
      : addService(input);
    if (success) onClose();
  };
  return (
    <Modal title={service ? "Edit service" : "Add service"} onClose={onClose}>
      {data.dogs.length === 0 ? (
        <Stack>
          <Muted>Create a dog before scheduling a service.</Muted>
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </Stack>
      ) : (
        <form ref={formRef} onSubmit={submit} noValidate>
          <Stack>
            {Object.keys(errors).length > 0 && <ErrorSummary role="alert">Please fix the highlighted {Object.keys(errors).length === 1 ? "field" : "fields"} before {service ? "saving" : "adding"} this service.</ErrorSummary>}
            <Field>
              Dog
              <Select
                value={dogId}
                onChange={(event) => setDogId(event.target.value)}
                required
                aria-label="Dog"
                aria-invalid={Boolean(errors.dogId)}
                aria-describedby={errors.dogId ? "service-dog-error" : undefined}
                data-validation-key="dogId"
              >
                {data.dogs.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
              {errors.dogId && <FieldError id="service-dog-error">{errors.dogId}</FieldError>}
            </Field>
            <Field>
              Date
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
                aria-label="Date"
                aria-invalid={Boolean(errors.date)}
                aria-describedby={errors.date ? "service-date-error" : undefined}
                data-validation-key="date"
              />
              {errors.date && <FieldError id="service-date-error">{errors.date}</FieldError>}
            </Field>
            <Field>
              Group
              <Select
                value={group}
                onChange={(event) => setGroup(event.target.value as Group)}
                aria-label="Group"
                aria-invalid={Boolean(errors.group)}
                aria-describedby={errors.group ? "service-group-error" : undefined}
                data-validation-key="group"
              >
                {GROUPS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Select>
              {errors.group && <FieldError id="service-group-error">{errors.group}</FieldError>}
            </Field>
            <Field>
              Duration
              <Select
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value))}
                aria-label="Duration"
                aria-invalid={Boolean(errors.duration)}
                aria-describedby={errors.duration ? "service-duration-error" : undefined}
                data-validation-key="duration"
              >
                {Array.from({ length: 48 }, (_, index) => (index + 1) * 15).map(
                  (minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes / 60} {minutes === 60 ? "hour" : "hours"}
                    </option>
                  ),
                )}
              </Select>
              {errors.duration && <FieldError id="service-duration-error">{errors.duration}</FieldError>}
            </Field>
            <Footer>
              <div>
                <Muted>Service amount</Muted>
                <br />
                <strong>
                  {currency(((dog?.hourlyRate ?? 0) * duration) / 60)}
                </strong>
              </div>
              <Button $variant="primary" type="submit">
                {service ? "Save changes" : "Add service"}
              </Button>
            </Footer>
          </Stack>
        </form>
      )}
    </Modal>
  );
};
