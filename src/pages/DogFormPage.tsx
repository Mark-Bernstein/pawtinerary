import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { styled } from "styled-components";
import { useApp } from "../context/AppContext";
import type { DogInput, Group, ServiceInput } from "../types";
import { todayKey } from "../utils/dates";
import {
  Button,
  Card,
  Eyebrow,
  Field,
  Grid,
  Input,
  Muted,
  Page,
  Row,
  SectionTitle,
  Select,
  Stack,
  Subtitle,
  Textarea,
  Title,
  TopRow,
} from "../styles";

type Planned = Omit<ServiceInput, "dogId"> & { key: string };
const FormCard = styled(Card)`
  padding: 22px;
  @media (min-width: 700px) {
    padding: 28px;
  }
`;
const PlannerRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 14px;
  border: 1px solid #e6ece4;
  border-radius: 15px;
  @media (min-width: 650px) {
    grid-template-columns: 1.4fr 1fr 1fr auto;
    align-items: end;
  }
`;
const Error = styled.p`
  color: #a34232;
  font-size: 13px;
  margin: 0;
`;
const emptyInput: DogInput = {
  name: "",
  address: "",
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
  notes: "",
  accessInstructions: "",
  hourlyRate: 0,
};
const newPlan = (): Planned => ({
  key: crypto.randomUUID(),
  date: todayKey(),
  group: "Group 1",
  durationMinutes: 60,
});

export const DogFormPage = () => {
  const { id } = useParams();
  const { data, addDog, updateDog } = useApp();
  const navigate = useNavigate();
  const dog = data.dogs.find((item) => item.id === id);
  const [input, setInput] = useState<DogInput>(() =>
    dog
      ? {
          name: dog.name,
          address: dog.address,
          ownerName: dog.ownerName,
          ownerPhone: dog.ownerPhone,
          ownerEmail: dog.ownerEmail,
          notes: dog.notes,
          accessInstructions: dog.accessInstructions,
          hourlyRate: dog.hourlyRate,
        }
      : emptyInput,
  );
  const [rateText, setRateText] = useState(dog?.hourlyRate.toString() ?? "");
  const [planned, setPlanned] = useState<Planned[]>([]);
  const [error, setError] = useState("");
  const setField = <K extends keyof DogInput>(key: K, value: DogInput[K]) =>
    setInput((current) => ({ ...current, [key]: value }));
  const setPlan = (key: string, changes: Partial<Planned>) =>
    setPlanned((current) =>
      current.map((item) =>
        item.key === key ? { ...item, ...changes } : item,
      ),
    );
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const rate = Number(rateText);
    if (
      !input.name.trim() ||
      !input.address.trim() ||
      !Number.isFinite(rate) ||
      rate <= 0
    ) {
      setError("Enter a dog name, address, and hourly rate greater than €0.");
      return;
    }
    if (planned.some((item) => !item.date || !item.durationMinutes)) {
      setError("Complete every planned service date and duration.");
      return;
    }
    const keys = planned.map((item) => `${item.date}|${item.group}`);
    if (
      new Set(keys).size !== keys.length ||
      (dog &&
        planned.some((item) =>
          data.services.some(
            (service) =>
              service.dogId === dog.id &&
              service.date === item.date &&
              service.group === item.group &&
              service.status !== "cancelled",
          ),
        ))
    ) {
      setError("A dog can only have one active service per group on a date.");
      return;
    }
    const clean = {
      ...input,
      name: input.name.trim(),
      address: input.address.trim(),
      hourlyRate: rate,
      ownerName: input.ownerName.trim(),
      ownerPhone: input.ownerPhone.trim(),
      ownerEmail: input.ownerEmail.trim(),
    };
    if (dog) {
      updateDog(dog.id, clean, planned);
      navigate(`/dogs/${dog.id}`);
    } else {
      const created = addDog(clean, planned);
      navigate(`/dogs/${created.id}`);
    }
  };
  if (id && !dog)
    return (
      <Page>
        <Title>Dog not found</Title>
        <Button as={Link} to="/dogs">
          Back to Dogs
        </Button>
      </Page>
    );
  return (
    <Page>
      <TopRow>
        <div>
          <Eyebrow>{dog ? "DOG PROFILE" : "NEW COMPANION"}</Eyebrow>
          <Title>{dog ? "Edit dog" : "Create dog"}</Title>
          <Subtitle>Keep the essentials together for every visit.</Subtitle>
        </div>
        <Button as={Link} to={dog ? `/dogs/${dog.id}` : "/dogs"}>
          <ArrowLeft size={16} /> Back
        </Button>
      </TopRow>
      <form onSubmit={submit}>
        <Stack $gap={20}>
          <FormCard>
            <Stack>
              <SectionTitle>Dog details</SectionTitle>
              <Grid>
                <Field>
                  Dog name *
                  <Input
                    required
                    value={input.name}
                    onChange={(event) => setField("name", event.target.value)}
                    placeholder="e.g. Bailey"
                  />
                </Field>
                <Field>
                  Hourly rate (€) *
                  <Input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    value={rateText}
                    onChange={(event) => setRateText(event.target.value)}
                    placeholder="20.00"
                  />
                </Field>
              </Grid>
              <Field>
                Address *
                <Input
                  required
                  value={input.address}
                  onChange={(event) => setField("address", event.target.value)}
                  placeholder="Street, city, postcode"
                />
              </Field>
            </Stack>
          </FormCard>
          <FormCard>
            <Stack>
              <SectionTitle>Client contact</SectionTitle>
              <Grid>
                <Field>
                  Owner / client name
                  <Input
                    value={input.ownerName}
                    onChange={(event) =>
                      setField("ownerName", event.target.value)
                    }
                  />
                </Field>
                <Field>
                  Phone
                  <Input
                    type="tel"
                    value={input.ownerPhone}
                    onChange={(event) =>
                      setField("ownerPhone", event.target.value)
                    }
                  />
                </Field>
                <Field>
                  Email
                  <Input
                    type="email"
                    value={input.ownerEmail}
                    onChange={(event) =>
                      setField("ownerEmail", event.target.value)
                    }
                  />
                </Field>
              </Grid>
            </Stack>
          </FormCard>
          <FormCard>
            <Stack>
              <SectionTitle>Visit notes</SectionTitle>
              <Field>
                Miscellaneous notes
                <Textarea
                  value={input.notes}
                  onChange={(event) => setField("notes", event.target.value)}
                  placeholder="Personality, preferences, reminders…"
                />
              </Field>
              <Field>
                Entry / access instructions
                <Textarea
                  value={input.accessInstructions}
                  onChange={(event) =>
                    setField("accessInstructions", event.target.value)
                  }
                  placeholder="Keys, gate code, entry details…"
                />
              </Field>
              <Muted>
                Access instructions stay on this device and are excluded from
                reports.
              </Muted>
            </Stack>
          </FormCard>
          <FormCard>
            <Stack>
              <Row style={{ justifyContent: "space-between" }}>
                <div>
                  <SectionTitle>Plan services</SectionTitle>
                  <Muted>
                    Add individual dates now, or use Add Service later.
                  </Muted>
                </div>
                <Button
                  type="button"
                  onClick={() =>
                    setPlanned((current) => [...current, newPlan()])
                  }
                >
                  <Plus size={15} /> Add date
                </Button>
              </Row>
              {planned.map((item) => (
                <PlannerRow key={item.key}>
                  <Field>
                    Date
                    <Input
                      type="date"
                      value={item.date}
                      onChange={(event) =>
                        setPlan(item.key, { date: event.target.value })
                      }
                      required
                    />
                  </Field>
                  <Field>
                    Group
                    <Select
                      value={item.group}
                      onChange={(event) =>
                        setPlan(item.key, {
                          group: event.target.value as Group,
                        })
                      }
                    >
                      {(["Group 1", "Group 2", "Group 3"] as Group[]).map(
                        (group) => (
                          <option key={group}>{group}</option>
                        ),
                      )}
                    </Select>
                  </Field>
                  <Field>
                    Duration
                    <Select
                      value={item.durationMinutes}
                      onChange={(event) =>
                        setPlan(item.key, {
                          durationMinutes: Number(event.target.value),
                        })
                      }
                    >
                      {Array.from(
                        { length: 48 },
                        (_, index) => (index + 1) * 15,
                      ).map((minutes) => (
                        <option key={minutes} value={minutes}>
                          {minutes / 60} {minutes === 60 ? "hour" : "hours"}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Button
                    type="button"
                    $variant="danger"
                    onClick={() =>
                      setPlanned((current) =>
                        current.filter((row) => row.key !== item.key),
                      )
                    }
                    aria-label="Remove planned service"
                  >
                    <Trash2 size={16} /> Remove
                  </Button>
                </PlannerRow>
              ))}
            </Stack>
          </FormCard>
          {error && <Error role="alert">{error}</Error>}
          <Row style={{ justifyContent: "flex-end" }}>
            <Button
              type="button"
              onClick={() => navigate(dog ? `/dogs/${dog.id}` : "/dogs")}
            >
              Cancel
            </Button>
            <Button type="submit" $variant="primary">
              {dog ? "Save changes" : "Create dog"}
            </Button>
          </Row>
        </Stack>
      </form>
    </Page>
  );
};
