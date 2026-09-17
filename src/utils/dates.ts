import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export const dateKey = (date: Date) => format(date, "yyyy-MM-dd");
export const fromKey = (key: string) => parseISO(`${key}T12:00:00`);
export const todayKey = () => dateKey(new Date());
export const weekStart = (date: Date) => startOfWeek(date, { weekStartsOn: 1 });
export const weekEnd = (date: Date) => endOfWeek(date, { weekStartsOn: 1 });
export const monthStart = (date: Date) => startOfMonth(date);
export const monthEnd = (date: Date) => endOfMonth(date);
export const weekDays = (date: Date) =>
  Array.from({ length: 7 }, (_, index) => addDays(weekStart(date), index));
export const monthGrid = (date: Date) => {
  const first = weekStart(monthStart(date));
  const last = weekEnd(monthEnd(date));
  const days = [];
  for (let day = first; day <= last; day = addDays(day, 1)) days.push(day);
  return days;
};
export const moveDate = (
  date: Date,
  amount: number,
  view: "today" | "week" | "month",
) =>
  view === "month"
    ? addMonths(date, amount)
    : addDays(date, amount * (view === "week" ? 7 : 1));
export const formatDay = (key: string) =>
  format(fromKey(key), "EEE, d MMM yyyy");
export const formatShortDay = (key: string) =>
  format(fromKey(key), "d MMM yyyy");
export const inPeriod = (
  key: string,
  period: "day" | "week" | "month",
  anchor: Date,
) => {
  const date = fromKey(key);
  if (period === "day") return isSameDay(date, anchor);
  if (period === "week")
    return date >= weekStart(anchor) && date <= weekEnd(anchor);
  return isSameMonth(date, anchor);
};
