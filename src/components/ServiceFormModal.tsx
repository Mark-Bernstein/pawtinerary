import { useState, type FormEvent } from "react";
import { styled } from "styled-components";
import { useApp } from "../context/AppContext";
import type { Group, Service } from "../types";
import { todayKey } from "../utils/dates";
import { currency } from "../utils/earnings";
import { Button, Field, Input, Select, Stack, Muted } from "../styles";
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
  const dog = data.dogs.find((item) => item.id === dogId);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!dog || !date || duration < 15 || duration > 720 || duration % 15 !== 0)
      return;
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
        <form onSubmit={submit}>
          <Stack>
            <Field>
              Dog
              <Select
                value={dogId}
                onChange={(event) => setDogId(event.target.value)}
                required
              >
                {data.dogs.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              Date
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </Field>
            <Field>
              Group
              <Select
                value={group}
                onChange={(event) => setGroup(event.target.value as Group)}
              >
                {GROUPS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Select>
            </Field>
            <Field>
              Duration
              <Select
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value))}
              >
                {Array.from({ length: 48 }, (_, index) => (index + 1) * 15).map(
                  (minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes / 60} {minutes === 60 ? "hour" : "hours"}
                    </option>
                  ),
                )}
              </Select>
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
