import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { styled } from "styled-components";
import { useApp } from "../context/AppContext";
import { useLanguage } from "../i18n/LanguageContext";
import type { Service } from "../types";
import { todayKey } from "../utils/dates";
import { getTotals } from "../utils/earnings";
import {
  Badge,
  Button,
  Card,
  Eyebrow,
  Grid,
  Muted,
  Page,
  Row,
  SectionTitle,
  Stack,
  Subtitle,
  Title,
  TopRow,
} from "../styles";
import { EarningsCard } from "../components/EarningsCard";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { ServiceCard } from "../components/ServiceCard";

const InfoCard = styled(Card)`
  padding: 20px;
  display: grid;
  gap: 15px;
`;
const Label = styled.div`
  color: var(--muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  font-weight: 800;
  margin-bottom: 5px;
`;
const AddressButton = styled.button`
  border: 0;
  background: transparent;
  color: var(--accent-text);
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  text-align: left;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
`;
const Divider = styled.div`
  border-top: 1px solid var(--border-soft);
`;
const ServiceSection = styled.section`
  display: grid;
  gap: 10px;
`;

export const DogDetailPage = ({
  onAdd,
}: {
  onAdd: (dogId: string) => void;
}) => {
  const { id } = useParams();
  const { data, deleteDog, notify } = useApp();
  const { t, money, shortDay } = useLanguage();
  const navigate = useNavigate();
  const [confirmStep, setConfirmStep] = useState(0);
  const dog = data.dogs.find((item) => item.id === id);
  if (!dog)
    return (
      <Page>
        <Title>{t("Dog not found")}</Title>
        <Button as={Link} to="/dogs">
          {t("Back to Dogs")}
        </Button>
      </Page>
    );
  const services = data.services.filter((item) => item.dogId === dog.id);
  const scheduled = services
    .filter((item) => item.status === "scheduled")
    .sort((a, b) => a.date.localeCompare(b.date));
  const completed = services
    .filter((item) => item.status === "completed")
    .sort((a, b) => b.date.localeCompare(a.date));
  const cancelled = services
    .filter((item) => item.status === "cancelled")
    .sort((a, b) => b.date.localeCompare(a.date));
  const render = (items: Service[]) =>
    items.map((item) => (
      <div key={item.id}>
        <Muted
          style={{ display: "block", fontWeight: 700, margin: "0 0 6px 2px" }}
        >
          {shortDay(item.date)}{" "}
          {item.date < todayKey() && item.status === "scheduled" && (
            <Badge $tone="amber">{t("Past due")}</Badge>
          )}
        </Muted>
        <ServiceCard service={item} dog={dog} showGroup />
      </div>
    ));
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(dog.address);
      notify("Address copied!");
    } catch {
      notify("Could not copy address. Please copy it manually.");
    }
  };
  const doDelete = () => {
    deleteDog(dog.id);
    setConfirmStep(0);
    navigate("/dogs");
  };
  return (
    <Page>
      <TopRow>
        <div>
          <Eyebrow>{t("DOG PROFILE")}</Eyebrow>
          <Title>{dog.name}</Title>
          <Subtitle>{t("Everything you need for the next visit.")}</Subtitle>
        </div>
        <Row>
          <Button as={Link} to="/dogs">
            <ArrowLeft size={16} /> {t("Dogs")}
          </Button>
          <Button as={Link} to={`/dogs/${dog.id}/edit`}>
            <Pencil size={16} /> {t("Edit Info")}
          </Button>
          <Button $variant="primary" onClick={() => onAdd(dog.id)}>
            <Plus size={16} /> {t("Add Service")}
          </Button>
        </Row>
      </TopRow>
      <Grid $min={320} style={{ marginBottom: 25 }}>
        <InfoCard>
          <SectionTitle>{t("Profile")}</SectionTitle>
          <Divider />
          <div>
            <Label>{t("Address · tap to copy")}</Label>
            <AddressButton onClick={copyAddress}>
              <MapPin size={16} /> {dog.address} <Copy size={14} />
            </AddressButton>
          </div>
          <div>
            <Label>{t("Hourly rate")}</Label>
            <strong>
              {money(dog.hourlyRate)} / {t("hour")}
            </strong>
          </div>
          <div>
            <Label>{t("Owner / client")}</Label>
            <strong>{dog.ownerName || t("Not provided")}</strong>
          </div>
          <div>
            <Label>{t("Phone")}</Label>
            {dog.ownerPhone ? (
              <a href={`tel:${dog.ownerPhone}`}>
                <Phone size={14} /> {dog.ownerPhone}
              </a>
            ) : (
              <Muted>{t("Not provided")}</Muted>
            )}
          </div>
          <div>
            <Label>{t("Email")}</Label>
            {dog.ownerEmail ? (
              <a href={`mailto:${dog.ownerEmail}`}>
                <Mail size={14} /> {dog.ownerEmail}
              </a>
            ) : (
              <Muted>{t("Not provided")}</Muted>
            )}
          </div>
        </InfoCard>
        <InfoCard>
          <SectionTitle>{t("Visit information")}</SectionTitle>
          <Divider />
          <div>
            <Label>{t("Notes")}</Label>
            <div style={{ whiteSpace: "pre-wrap" }}>
              {dog.notes || <Muted>{t("No notes yet")}</Muted>}
            </div>
          </div>
          <div>
            <Label>{t("Entry / access instructions")}</Label>
            <div style={{ whiteSpace: "pre-wrap" }}>
              {dog.accessInstructions || (
                <Muted>{t("No access instructions yet")}</Muted>
              )}
            </div>
          </div>
        </InfoCard>
      </Grid>
      <Stack $gap={15} style={{ marginBottom: 30 }}>
        <SectionTitle>
          {t("Earnings for {dog}", { dog: dog.name })}
        </SectionTitle>
        <Grid>
          <EarningsCard
            title={t("Today")}
            totals={getTotals(services, [dog], "day", new Date())}
          />
          <EarningsCard
            title={t("This Week")}
            totals={getTotals(services, [dog], "week", new Date())}
          />
          <EarningsCard
            title={t("This Month")}
            totals={getTotals(services, [dog], "month", new Date())}
          />
          <EarningsCard
            title={t("Lifetime")}
            totals={getTotals(services, [dog])}
          />
        </Grid>
      </Stack>
      <Stack $gap={25}>
        <ServiceSection>
          <Row style={{ justifyContent: "space-between" }}>
            <SectionTitle>{t("Scheduled services")}</SectionTitle>
            <Badge $tone="amber">{scheduled.length}</Badge>
          </Row>
          {scheduled.length ? (
            <Grid $min={280}>{render(scheduled)}</Grid>
          ) : (
            <EmptyState
              title={t("No upcoming services scheduled.")}
              action={
                <Button $small onClick={() => onAdd(dog.id)}>
                  {t("Add service")}
                </Button>
              }
            />
          )}
        </ServiceSection>
        <ServiceSection>
          <Row style={{ justifyContent: "space-between" }}>
            <SectionTitle>{t("Completed history")}</SectionTitle>
            <Badge $tone="green">{completed.length}</Badge>
          </Row>
          {completed.length ? (
            <Grid $min={280}>{render(completed)}</Grid>
          ) : (
            <EmptyState title={t("No completed services yet.")} />
          )}
        </ServiceSection>
        {cancelled.length > 0 && (
          <ServiceSection>
            <Row style={{ justifyContent: "space-between" }}>
              <SectionTitle>{t("Cancelled services")}</SectionTitle>
              <Badge $tone="gray">{cancelled.length}</Badge>
            </Row>
            <Grid $min={280}>{render(cancelled)}</Grid>
          </ServiceSection>
        )}
      </Stack>
      <div style={{ marginTop: 36 }}>
        <Button $variant="danger" onClick={() => setConfirmStep(1)}>
          <Trash2 size={16} /> {t("Delete Dog")}
        </Button>
      </div>
      {confirmStep === 1 && (
        <Modal title={t("Delete this dog?")} onClose={() => setConfirmStep(0)}>
          <Stack>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              {t("You are about to delete {dog} and all associated services.", {
                dog: dog.name,
              })}
            </p>
            <Row style={{ justifyContent: "flex-end" }}>
              <Button onClick={() => setConfirmStep(0)}>{t("Cancel")}</Button>
              <Button $variant="danger" onClick={() => setConfirmStep(2)}>
                {t("Delete")}
              </Button>
            </Row>
          </Stack>
        </Modal>
      )}
      {confirmStep === 2 && (
        <Modal
          title={t("Final confirmation")}
          onClose={() => setConfirmStep(0)}
        >
          <Stack>
            <p
              style={{
                margin: 0,
                fontWeight: 800,
                color: "var(--danger)",
                lineHeight: 1.6,
              }}
            >
              {t(
                "Are you sure? Deleting this dog will remove all earnings from your data.",
              )}
            </p>
            <Row style={{ justifyContent: "flex-end" }}>
              <Button onClick={() => setConfirmStep(0)}>{t("Cancel")}</Button>
              <Button $variant="danger" onClick={doDelete}>
                {t("Delete Dog")}
              </Button>
            </Row>
          </Stack>
        </Modal>
      )}
    </Page>
  );
};
