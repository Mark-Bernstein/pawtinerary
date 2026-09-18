import { useState } from "react";
import { addMonths, isSameMonth, isToday, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { styled } from "styled-components";
import { useLanguage } from "../i18n/LanguageContext";
import {
  dateKey,
  fromKey,
  isValidDateKey,
  monthGrid,
  weekDays,
} from "../utils/dates";

const CalendarWrap = styled.div`
  display: grid;
  gap: 12px;
  min-width: 0;
`;
const CalendarPanel = styled.div`
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: var(--surface-soft);
  &[aria-invalid="true"] {
    border-color: var(--danger);
  }
`;
const CalendarHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
  strong {
    color: var(--text);
    font: 700 16px Outfit, sans-serif;
    text-align: center;
  }
  button {
    flex: none;
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--accent-text);
  }
`;
const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 3px;
  > abbr {
    color: var(--muted);
    text-decoration: none;
    text-align: center;
    font-size: 11px;
    font-weight: 800;
    padding-bottom: 5px;
  }
`;
const DayButton = styled.button<{ $outside: boolean; $selected: boolean }>`
  min-width: 0;
  min-height: 38px;
  border: 1px solid ${({ $selected }) => ($selected ? "var(--accent)" : "transparent")};
  border-radius: 9px;
  background: ${({ $selected }) => ($selected ? "var(--accent)" : "transparent")};
  color: ${({ $selected, $outside }) =>
    $selected ? "var(--on-accent)" : $outside ? "var(--muted-faint)" : "var(--text)"};
  font-size: 13px;
  font-weight: ${({ $selected }) => ($selected ? 800 : 600)};
  &[data-today="true"]:not([aria-pressed="true"]) {
    border-color: var(--accent-border);
  }
  &:hover:not([aria-pressed="true"]) {
    background: var(--accent-soft);
    color: var(--accent-text);
  }
`;
const Selection = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  color: var(--muted-strong);
  font-size: 12px;
  font-weight: 700;
  button {
    border: 1px solid var(--accent-border);
    border-radius: 999px;
    background: var(--accent-soft);
    color: var(--accent-text);
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 31px;
    padding: 4px 9px;
    font-size: 12px;
    font-weight: 700;
  }
`;

export const MultiDateCalendar = ({
  selectedDates,
  onToggle,
  initialDate,
  invalid = false,
  errorId,
  validationKey,
}: {
  selectedDates: string[];
  onToggle: (date: string) => void;
  initialDate?: string;
  invalid?: boolean;
  errorId?: string;
  validationKey?: string;
}) => {
  const { t, date } = useLanguage();
  const [displayedMonth, setDisplayedMonth] = useState(() =>
    startOfMonth(initialDate && isValidDateKey(initialDate) ? fromKey(initialDate) : new Date()),
  );
  const validDates = [...new Set(selectedDates.filter(isValidDateKey))].sort();
  const selected = new Set(validDates);
  return (
    <CalendarWrap>
      <CalendarPanel
        role="group"
        aria-label={t("Service dates")}
        aria-invalid={invalid}
        aria-describedby={errorId}
        data-validation-key={validationKey}
        tabIndex={-1}
      >
        <CalendarHead>
          <button
            type="button"
            aria-label={t("Previous month")}
            onClick={() => setDisplayedMonth((month) => addMonths(month, -1))}
          >
            <ChevronLeft size={18} />
          </button>
          <strong>{date(displayedMonth, "MMMM yyyy")}</strong>
          <button
            type="button"
            aria-label={t("Next month")}
            onClick={() => setDisplayedMonth((month) => addMonths(month, 1))}
          >
            <ChevronRight size={18} />
          </button>
        </CalendarHead>
        <DayGrid>
          {weekDays(displayedMonth).map((day) => (
            <abbr key={dateKey(day)} title={date(day, "EEEE")}>
              {date(day, "EEEEE")}
            </abbr>
          ))}
          {monthGrid(displayedMonth).map((day) => {
            const key = dateKey(day);
            return (
              <DayButton
                key={key}
                type="button"
                data-date={key}
                data-today={isToday(day)}
                $outside={!isSameMonth(day, displayedMonth)}
                $selected={selected.has(key)}
                aria-label={date(day, "d MMMM yyyy")}
                aria-pressed={selected.has(key)}
                onClick={() => {
                  onToggle(key);
                  if (!isSameMonth(day, displayedMonth))
                    setDisplayedMonth(startOfMonth(day));
                }}
              >
                {date(day, "d")}
              </DayButton>
            );
          })}
        </DayGrid>
      </CalendarPanel>
      <Selection aria-live="polite">
        <span>
          {t(validDates.length === 1 ? "{count} date selected" : "{count} dates selected", {
            count: validDates.length,
          })}
        </span>
        {validDates.map((key) => {
          const label = date(fromKey(key), "d MMM yyyy");
          return (
            <button
              key={key}
              type="button"
              aria-label={t("Remove {date}", { date: label })}
              onClick={() => onToggle(key)}
            >
              {label} <X size={13} />
            </button>
          );
        })}
      </Selection>
    </CalendarWrap>
  );
};
