import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { styled } from "styled-components";
import { useApp } from "../context/AppContext";
import type { DogInput, Group } from "../types";
import { todayKey } from "../utils/dates";
import { useLanguage } from "../i18n/LanguageContext";
import {
  validateDogForm,
  type PlannedService,
} from "../utils/dogFormValidation";
import { MultiDateCalendar } from "../components/MultiDateCalendar";
import {
  Button,
  Card,
  Eyebrow,
  ErrorSummary,
  Field,
  FieldError,
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
  border: 1px solid var(--border-soft);
  border-radius: 15px;
  > button {
    grid-column: 1 / -1;
    justify-self: end;
  }
  @media (min-width: 650px) {
    grid-template-columns: 1.4fr 1fr auto;
    align-items: end;
    > button {
      grid-column: auto;
    }
  }
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
export const DogFormPage = () => {
  const { id } = useParams();
  const { data, addDog, updateDog } = useApp();
  const { t, language, shortDay, group: groupLabel } = useLanguage();
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
  const [rateText, setRateText] = useState(dog ? (language === "en" ? String(dog.hourlyRate) : String(dog.hourlyRate).replace(".", ",")) : "");
  const [planned, setPlanned] = useState<PlannedService[]>([]);
  const [calendarGroup, setCalendarGroup] = useState<Group>("Group 1");
  const [attempted, setAttempted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const validation = validateDogForm(
    input,
    rateText,
    planned,
    data.services,
    dog?.id,
    language,
  );
  const errors: Record<string, string> = attempted ? validation.errors : {};
  const setField = <K extends keyof DogInput>(key: K, value: DogInput[K]) =>
    setInput((current) => ({ ...current, [key]: value }));
  const setPlan = (key: string, changes: Partial<PlannedService>) =>
    setPlanned((current) =>
      current.map((item) =>
        item.key === key ? { ...item, ...changes } : item,
      ),
    );
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    const firstError = Object.keys(validation.errors)[0];
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
    const clean = {
      ...input,
      name: input.name.trim(),
      address: input.address.trim(),
      hourlyRate: validation.hourlyRate,
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
        <Title>{t("Dog not found")}</Title>
        <Button as={Link} to="/dogs">
          {t("Back to Dogs")}
        </Button>
      </Page>
    );
  return (
    <Page>
      <TopRow>
        <div>
          <Eyebrow>{t(dog ? "DOG PROFILE" : "NEW COMPANION")}</Eyebrow>
          <Title>{t(dog ? "Edit dog" : "Create dog")}</Title>
          <Subtitle>
            {t("Keep the essentials together for every visit.")}
          </Subtitle>
        </div>
        <Button as={Link} to={dog ? `/dogs/${dog.id}` : "/dogs"}>
          <ArrowLeft size={16} /> {t("Back")}
        </Button>
      </TopRow>
      <form ref={formRef} onSubmit={submit} noValidate>
        <Stack $gap={20}>
          {Object.keys(errors).length > 0 && (
            <ErrorSummary role="alert">
              {t(
                dog
                  ? Object.keys(errors).length === 1
                    ? "Please fix the highlighted field before saving changes."
                    : "Please fix the highlighted fields before saving changes."
                  : Object.keys(errors).length === 1
                    ? "Please fix the highlighted field before creating this dog."
                    : "Please fix the highlighted fields before creating this dog.",
              )}
            </ErrorSummary>
          )}
          <FormCard>
            <Stack>
              <SectionTitle>{t("Dog details")}</SectionTitle>
              <Grid>
                <Field>
                  {t("Dog name *")}
                  <Input
                    required
                    value={input.name}
                    onChange={(event) => setField("name", event.target.value)}
                    placeholder={t("e.g. Bailey")}
                    aria-label={t("Dog name *")}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={
                      errors.name ? "dog-name-error" : undefined
                    }
                    data-validation-key="name"
                  />
                  {errors.name && (
                    <FieldError id="dog-name-error">{errors.name}</FieldError>
                  )}
                </Field>
                <Field>
                  {t("Hourly rate (€) *")}
                  <Input
                    required
                    type="text"
                    inputMode="decimal"
                    value={rateText}
                    onChange={(event) => setRateText(event.target.value)}
                    placeholder={language === "en" ? "20.00" : "20,00"}
                    aria-label={t("Hourly rate (€) *")}
                    aria-invalid={Boolean(errors.hourlyRate)}
                    aria-describedby={
                      errors.hourlyRate ? "dog-rate-error" : undefined
                    }
                    data-validation-key="hourlyRate"
                  />
                  {errors.hourlyRate && (
                    <FieldError id="dog-rate-error">
                      {errors.hourlyRate}
                    </FieldError>
                  )}
                </Field>
              </Grid>
              <Field>
                {t("Address *")}
                <Input
                  required
                  value={input.address}
                  onChange={(event) => setField("address", event.target.value)}
                  placeholder={t("Street, city, postcode")}
                  aria-label={t("Address *")}
                  aria-invalid={Boolean(errors.address)}
                  aria-describedby={
                    errors.address ? "dog-address-error" : undefined
                  }
                  data-validation-key="address"
                />
                {errors.address && (
                  <FieldError id="dog-address-error">
                    {errors.address}
                  </FieldError>
                )}
              </Field>
            </Stack>
          </FormCard>
          <FormCard>
            <Stack>
              <SectionTitle>{t("Client contact")}</SectionTitle>
              <Grid>
                <Field>
                  {t("Owner / client name")}
                  <Input
                    value={input.ownerName}
                    onChange={(event) =>
                      setField("ownerName", event.target.value)
                    }
                  />
                </Field>
                <Field>
                  {t("Phone")}
                  <Input
                    type="tel"
                    value={input.ownerPhone}
                    onChange={(event) =>
                      setField("ownerPhone", event.target.value)
                    }
                  />
                </Field>
                <Field>
                  {t("Email")}
                  <Input
                    type="email"
                    value={input.ownerEmail}
                    aria-label={t("Email")}
                    onChange={(event) =>
                      setField("ownerEmail", event.target.value)
                    }
                    aria-invalid={Boolean(errors.ownerEmail)}
                    aria-describedby={
                      errors.ownerEmail ? "dog-email-error" : undefined
                    }
                    data-validation-key="ownerEmail"
                  />
                  {errors.ownerEmail && (
                    <FieldError id="dog-email-error">
                      {errors.ownerEmail}
                    </FieldError>
                  )}
                </Field>
              </Grid>
            </Stack>
          </FormCard>
          <FormCard>
            <Stack>
              <SectionTitle>{t("Visit information")}</SectionTitle>
              <Field>
                {t("Miscellaneous notes")}
                <Textarea
                  value={input.notes}
                  onChange={(event) => setField("notes", event.target.value)}
                  placeholder={t("Personality, preferences, reminders…")}
                />
              </Field>
              <Field>
                {t("Entry / access instructions")}
                <Textarea
                  value={input.accessInstructions}
                  onChange={(event) =>
                    setField("accessInstructions", event.target.value)
                  }
                  placeholder={t("Keys, gate code, entry details…")}
                />
              </Field>
              <Muted>
                {t(
                  "Access instructions stay on this device and are excluded from reports.",
                )}
              </Muted>
            </Stack>
          </FormCard>
          <FormCard>
            <Stack>
              <Row style={{ justifyContent: "space-between" }}>
                <div>
                  <SectionTitle>{t("Plan services")}</SectionTitle>
                  <Muted>
                    {t("Choose a group, then tap dates to add or remove services.")}
                  </Muted>
                </div>
              </Row>
              <Field>
                {t("Group")}
                <Select
                  value={calendarGroup}
                  onChange={(event) => setCalendarGroup(event.target.value as Group)}
                  aria-label={t("Group for selected dates")}
                >
                  {(["Group 1", "Group 2", "Group 3"] as Group[]).map((group) => (
                    <option key={group} value={group}>
                      {groupLabel(group)}
                    </option>
                  ))}
                </Select>
              </Field>
              <MultiDateCalendar
                selectedDates={planned
                  .filter((item) => item.group === calendarGroup)
                  .map((item) => item.date)}
                onToggle={(date) =>
                  setPlanned((current) => {
                    const existing = current.find(
                      (item) => item.date === date && item.group === calendarGroup,
                    );
                    return existing
                      ? current.filter((item) => item.key !== existing.key)
                      : [...current, { key: crypto.randomUUID(), date, group: calendarGroup }];
                  })
                }
                initialDate={todayKey()}
              />
              {planned.map((item) => (
                <PlannerRow key={item.key}>
                  <div data-validation-key={`date:${item.key}`} tabIndex={-1}>
                    <Muted>{t("Date")}</Muted>
                    <div style={{ color: "var(--text)", fontWeight: 700 }}>
                      {shortDay(item.date)}
                    </div>
                    {errors[`date:${item.key}`] && (
                      <FieldError id={`plan-date-error-${item.key}`}>
                        {errors[`date:${item.key}`]}
                      </FieldError>
                    )}
                  </div>
                  <Field>
                    {t("Group")}
                    <Select
                      value={item.group}
                      aria-label={t("Group")}
                      onChange={(event) =>
                        setPlan(item.key, {
                          group: event.target.value as Group,
                        })
                      }
                      aria-invalid={Boolean(errors[`group:${item.key}`])}
                      aria-describedby={
                        errors[`group:${item.key}`]
                          ? `plan-group-error-${item.key}`
                          : undefined
                      }
                      data-validation-key={`group:${item.key}`}
                    >
                      {(["Group 1", "Group 2", "Group 3"] as Group[]).map(
                        (group) => (
                          <option key={group} value={group}>
                            {groupLabel(group)}
                          </option>
                        ),
                      )}
                    </Select>
                    {errors[`group:${item.key}`] && (
                      <FieldError id={`plan-group-error-${item.key}`}>
                        {errors[`group:${item.key}`]}
                      </FieldError>
                    )}
                  </Field>
                  <Button
                    type="button"
                    $variant="danger"
                    onClick={() =>
                      setPlanned((current) =>
                        current.filter((row) => row.key !== item.key),
                      )
                    }
                    aria-label={t("Remove planned service")}
                  >
                    <Trash2 size={16} /> {t("Remove")}
                  </Button>
                </PlannerRow>
              ))}
            </Stack>
          </FormCard>
          <Row style={{ justifyContent: "flex-end" }}>
            <Button
              type="button"
              onClick={() => navigate(dog ? `/dogs/${dog.id}` : "/dogs")}
            >
              {t("Cancel")}
            </Button>
            <Button type="submit" $variant="primary">
              {t(dog ? "Save changes" : "Create dog")}
            </Button>
          </Row>
        </Stack>
      </form>
    </Page>
  );
};
