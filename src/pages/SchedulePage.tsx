import { useState } from "react";
import { isSameMonth, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { styled } from "styled-components";
import { useApp } from "../context/AppContext";
import { useLanguage } from "../i18n/LanguageContext";
import type { Group, Service } from "../types";
import {
  dateKey,
  fromKey,
  monthGrid,
  moveDate,
  todayKey,
  weekDays,
  weekEnd,
  weekStart,
} from "../utils/dates";
import { getTotals } from "../utils/earnings";
import {
  Badge,
  Button,
  Card,
  Eyebrow,
  Grid,
  IconButton,
  Muted,
  Page,
  Row,
  SectionTitle,
  Subtitle,
  Title,
  TopRow,
} from "../styles";
import { EmptyState } from "../components/EmptyState";
import { ServiceCard } from "../components/ServiceCard";

type View = "today" | "week" | "month";
const readView = (): View => {
  try {
    const value = sessionStorage.getItem("pawtinerary.schedule.view");
    return value === "week" || value === "month" ? value : "today";
  } catch {
    return "today";
  }
};
const groups: Group[] = ["Group 1", "Group 2", "Group 3"];
const Switcher = styled.div`
  display: inline-flex;
  padding: 4px;
  background: var(--surface-tint);
  border-radius: 13px;
  gap: 3px;
  button {
    border: 0;
    border-radius: 10px;
    padding: 9px 18px;
    background: transparent;
    color: var(--muted);
    font-weight: 700;
    font-size: 13px;
  }
  button[aria-selected="true"] {
    background: var(--surface);
    color: var(--accent-text);
    box-shadow: var(--card-shadow);
  }
`;
const NavBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin: 23px 0;
  h2 {
    font:
      700 21px Outfit,
      sans-serif;
    margin: 0;
    letter-spacing: -0.02em;
  }
`;
const GroupHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 12px;
`;
const GroupWrap = styled.section`
  display: grid;
  gap: 10px;
`;
const DayCard = styled(Card)`
  padding: 16px;
  min-height: 145px;
  cursor: pointer;
  transition: transform 0.16s;
  &:hover {
    transform: translateY(-2px);
  }
`;
const Calendar = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
  @media (min-width: 700px) {
    gap: 9px;
  }
`;
const CalendarDay = styled.button<{ $outside: boolean; $today: boolean }>`
  background: ${({ $today }) => ($today ? "var(--accent-soft)" : "var(--surface)")};
  border: 1px solid ${({ $today }) => ($today ? "var(--accent-border)" : "var(--border-soft)")};
  border-radius: 10px;
  min-height: 72px;
  padding: 7px 3px;
  text-align: left;
  color: ${({ $outside }) => ($outside ? "var(--muted-faint)" : "var(--text)")};
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow: hidden;
  @media (min-width: 700px) {
    min-height: 108px;
    padding: 10px;
    border-radius: 14px;
  }
  strong {
    font-size: 13px;
  }
  span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 10px;
  }
  &:hover {
    border-color: var(--accent-border);
  }
`;
const Summary = styled(Card)`
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  background: var(--summary);
  color: var(--summary-text);
  span {
    color: var(--summary-muted);
    display: block;
    font-size: 12px;
    margin-bottom: 4px;
  }
  strong {
    font:
      700 22px Outfit,
      sans-serif;
  }
`;

export const SchedulePage = ({
  onAdd,
  onCreate,
}: {
  onAdd: (date?: string) => void;
  onCreate: () => void;
}) => {
  const { data } = useApp();
  const {
    t,
    money,
    date,
    day: localizedDay,
    group: groupLabel,
    status,
  } = useLanguage();
  const [view, setView] = useState<View>(readView);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const anchor = fromKey(selectedDate);
  const setViewAndRemember = (next: View) => {
    setView(next);
    try {
      sessionStorage.setItem("pawtinerary.schedule.view", next);
    } catch {
      /* Schedule still works without session storage. */
    }
  };
  const visibleServices = (date: string) =>
    data.services.filter((service) => service.date === date);
  const renderServices = (items: Service[], showGroup = false) =>
    items.map((service) => {
      const dog = data.dogs.find((item) => item.id === service.dogId);
      return dog ? (
        <ServiceCard
          key={service.id}
          service={service}
          dog={dog}
          showGroup={showGroup}
        />
      ) : null;
    });
  const period = view === "today" ? "day" : view;
  const totals = getTotals(data.services, data.dogs, period, anchor);
  const periodLabel =
    view === "today"
      ? localizedDay(selectedDate)
      : view === "week"
        ? `${date(weekStart(anchor), "d MMM")} – ${date(weekEnd(anchor), "d MMM yyyy")}`
        : date(anchor, "MMMM yyyy");
  const openDay = (key: string) => {
    setSelectedDate(key);
    setViewAndRemember("today");
  };
  return (
    <Page>
      <TopRow>
        <div>
          <Eyebrow>{t("YOUR WORKSPACE")}</Eyebrow>
          <Title>{t("Schedule")}</Title>
          <Subtitle>{t("Good walks start with a good plan.")}</Subtitle>
        </div>
        <Row>
          <Button $variant="secondary" onClick={onCreate}>
            <Plus size={17} /> {t("Create Dog")}
          </Button>
          <Button $variant="primary" onClick={() => onAdd(selectedDate)}>
            <Plus size={17} /> {t("Add Service")}
          </Button>
        </Row>
      </TopRow>
      <Switcher role="tablist" aria-label={t("Schedule view")}>
        {(["today", "week", "month"] as View[]).map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={view === item}
            onClick={() => setViewAndRemember(item)}
          >
            {t(item === "today" ? "Today" : item === "week" ? "Week" : "Month")}
          </button>
        ))}
      </Switcher>
      <NavBar>
        <Row>
          <IconButton
            aria-label={t(
              view === "today"
                ? "Previous day"
                : view === "week"
                  ? "Previous week"
                  : "Previous month",
            )}
            onClick={() => setSelectedDate(dateKey(moveDate(anchor, -1, view)))}
          >
            <ChevronLeft size={19} />
          </IconButton>
          <IconButton
            aria-label={t(
              view === "today"
                ? "Next day"
                : view === "week"
                  ? "Next week"
                  : "Next month",
            )}
            onClick={() => setSelectedDate(dateKey(moveDate(anchor, 1, view)))}
          >
            <ChevronRight size={19} />
          </IconButton>
          <h2>{periodLabel}</h2>
        </Row>
        <Button $small onClick={() => setSelectedDate(todayKey())}>
          {t("Today")}
        </Button>
      </NavBar>
      {view !== "today" && (
        <Summary style={{ marginBottom: 22 }}>
          <div>
            <span>
              {t(view === "week" ? "THIS WEEK" : "THIS MONTH")} ·{" "}
              {t("Earned").toUpperCase()}
            </span>
            <strong>{money(totals.earned)}</strong>
          </div>
          <div>
            <span>{t("Potential").toUpperCase()}</span>
            <strong>{money(totals.potential)}</strong>
          </div>
        </Summary>
      )}
      {view === "today" && (
        <>
          <Summary style={{ marginBottom: 24 }}>
            <div>
              <span>{t("DAY EARNED")}</span>
              <strong>{money(totals.earned)}</strong>
            </div>
            <div>
              <span>{t("DAY POTENTIAL")}</span>
              <strong>{money(totals.potential)}</strong>
            </div>
          </Summary>
          <Grid $min={300}>
            {groups.map((group) => {
              const items = visibleServices(selectedDate).filter(
                (item) => item.group === group,
              );
              return (
                <GroupWrap key={group}>
                  <GroupHead>
                    <SectionTitle>{groupLabel(group)}</SectionTitle>
                    <Badge $tone="green">
                      {items.length}{" "}
                      {t(items.length === 1 ? "service" : "services")}
                    </Badge>
                  </GroupHead>
                  {items.length ? (
                    renderServices(items)
                  ) : (
                    <EmptyState
                      title={t("Nothing scheduled for {group}.", {
                        group: groupLabel(group),
                      })}
                      action={
                        <Button $small onClick={() => onAdd(selectedDate)}>
                          {t("Add service")}
                        </Button>
                      }
                    />
                  )}
                </GroupWrap>
              );
            })}
          </Grid>
        </>
      )}
      {view === "week" && (
        <Grid $min={230}>
          {weekDays(anchor).map((day) => {
            const key = dateKey(day);
            const items = visibleServices(key);
            return (
              <DayCard key={key} onClick={() => openDay(key)}>
                <Row style={{ justifyContent: "space-between" }}>
                  <SectionTitle style={{ fontSize: 17 }}>
                    {date(day, "EEE d")}
                  </SectionTitle>
                  {isToday(day) && <Badge $tone="green">{t("Today")}</Badge>}
                </Row>
                {items.length ? (
                  <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
                    {groups.map((group) => {
                      const groupItems = items.filter(
                        (item) => item.group === group,
                      );
                      return groupItems.length ? (
                        <div key={group}>
                          <Muted style={{ fontSize: 11, fontWeight: 700 }}>
                            {groupLabel(group)}
                          </Muted>
                          {groupItems.map((item) => (
                            <div
                              key={item.id}
                              style={{ fontSize: 13, marginTop: 2 }}
                            >
                              {data.dogs.find((dog) => dog.id === item.dogId)
                                ?.name ?? t("Unknown dog")}{" "}
                              <Muted>· {status(item.status)}</Muted>
                            </div>
                          ))}
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <Muted style={{ display: "block", marginTop: 15 }}>
                    {t("No services")}
                  </Muted>
                )}
              </DayCard>
            );
          })}
        </Grid>
      )}
      {view === "month" && (
        <>
          <Calendar style={{ marginBottom: 6 }}>
            {weekDays(anchor).map((weekday) => (
              <Muted
                key={dateKey(weekday)}
                style={{ textAlign: "center", fontWeight: 700, fontSize: 11 }}
              >
                {date(weekday, "EEE")}
              </Muted>
            ))}
          </Calendar>
          <Calendar>
            {monthGrid(anchor).map((day) => {
              const key = dateKey(day);
              const items = visibleServices(key);
              return (
                <CalendarDay
                  key={key}
                  $outside={!isSameMonth(day, anchor)}
                  $today={isToday(day)}
                  onClick={() => openDay(key)}
                  aria-label={`${date(day, "d MMMM yyyy")}, ${items.length} ${t(items.length === 1 ? "service" : "services")}`}
                >
                  <strong>{date(day, "d")}</strong>
                  {items.slice(0, 2).map((item) => (
                    <span key={item.id}>
                      {data.dogs.find((dog) => dog.id === item.dogId)?.name ??
                        t("Dog")}
                    </span>
                  ))}
                  {items.length > 2 && (
                    <span>
                      {t("+{count} more", { count: items.length - 2 })}
                    </span>
                  )}
                </CalendarDay>
              );
            })}
          </Calendar>
        </>
      )}
      {data.dogs.length === 0 && (
        <div style={{ marginTop: 25 }}>
          <EmptyState
            title={t("No dogs yet. Create your first dog to get started.")}
            description={t(
              "Add a profile, then plan individual walks and see your earnings here.",
            )}
            action={
              <Button $variant="primary" onClick={onCreate}>
                <Plus size={16} /> {t("Create Dog")}
              </Button>
            }
          />
        </div>
      )}
    </Page>
  );
};
