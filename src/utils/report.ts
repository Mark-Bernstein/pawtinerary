import { format } from "date-fns";
import type { Dog, Period, Service } from "../types";
import {
  dateKey,
  fromKey,
  inPeriod,
  monthEnd,
  monthStart,
  weekEnd,
  weekStart,
} from "./dates";
import { getTotals, serviceAmount } from "./earnings";
import {
  formatCurrency,
  formatGroup,
  formatLocalizedDate,
  formatLocalizedShortDay,
  formatStatus,
  translate,
  type Language,
} from "../i18n/LanguageContext";

export interface ReportData {
  period: Period;
  anchor: Date;
  dogs: Dog[];
  services: Service[];
  language: Language;
}
export const reportServices = ({
  period,
  anchor,
  dogs,
  services,
}: ReportData) => {
  const dogIds = new Set(dogs.map((dog) => dog.id));
  return services
    .filter(
      (service) =>
        dogIds.has(service.dogId) &&
        (period === "lifetime" || inPeriod(service.date, period, anchor)),
    )
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.group.localeCompare(b.group),
    );
};
export const reportPeriodLabel = (
  period: Period,
  anchor: Date,
  language: Language = "en",
) => {
  if (period === "lifetime")
    return translate(language, "Lifetime · all stored history");
  if (period === "day")
    return formatLocalizedDate(anchor, "d MMMM yyyy", language);
  if (period === "week")
    return `${formatLocalizedDate(weekStart(anchor), "d MMM yyyy", language)} – ${formatLocalizedDate(weekEnd(anchor), "d MMM yyyy", language)}`;
  return `${formatLocalizedDate(monthStart(anchor), "d MMM yyyy", language)} – ${formatLocalizedDate(monthEnd(anchor), "d MMM yyyy", language)}`;
};
export const reportFileName = (
  period: Period,
  anchor: Date,
  language: Language = "en",
) => {
  const names = {
    en: {
      day: "Day",
      week: "Week",
      month: "Month",
      lifetime: "Lifetime-Report",
    },
    es: {
      day: "Dia",
      week: "Semana",
      month: "Mes",
      lifetime: "Informe-Historico",
    },
    ca: {
      day: "Dia",
      week: "Setmana",
      month: "Mes",
      lifetime: "Informe-Historic",
    },
  }[language];
  if (period === "lifetime") return `Pawtinerary-${names.lifetime}.docx`;
  if (period === "day")
    return `Pawtinerary-${names.day}-${dateKey(anchor)}.docx`;
  if (period === "week")
    return `Pawtinerary-${names.week}-${dateKey(weekStart(anchor))}.docx`;
  return `Pawtinerary-${names.month}-${format(anchor, "yyyy-MM")}.docx`;
};
export const reportText = (report: ReportData) => {
  const t = (
    key: Parameters<typeof translate>[1],
    params?: Record<string, string | number>,
  ) => translate(report.language, key, params);
  const items = reportServices(report);
  const dogMap = new Map(report.dogs.map((dog) => [dog.id, dog]));
  const totals = getTotals(items, report.dogs);
  const money = (amount: number) => formatCurrency(amount, report.language);
  const lines = [
    "PAWTINERARY",
    t("Report: {period}", {
      period: reportPeriodLabel(report.period, report.anchor, report.language),
    }),
    t("Generated: {date}", {
      date: formatLocalizedDate(new Date(), "d MMM yyyy", report.language),
    }),
    "",
    t("SERVICES"),
  ];
  if (!items.length) lines.push(t("No services in this period."));
  items.forEach((item) => {
    const dog = dogMap.get(item.dogId)!;
    const rate =
      item.status === "completed"
        ? (item.completedRate ?? dog.rate)
        : dog.rate;
    lines.push(
      `${formatLocalizedShortDay(item.date, report.language)} | ${formatGroup(item.group, report.language)} | ${dog.name}${dog.ownerName ? ` (${dog.ownerName})` : ""} | ${formatStatus(item.status, report.language)} | ${money(rate)} | ${item.status === "cancelled" ? money(0) : money(serviceAmount(item, dog))}`,
    );
  });
  lines.push(
    "",
    t("Earned: {amount}", { amount: money(totals.earned) }),
    t("Potential: {amount}", { amount: money(totals.potential) }),
    t("Combined total: {amount}", {
      amount: money(totals.earned + totals.potential),
    }),
  );
  return lines.join("\n");
};
export const reportAnchor = (date: string) => fromKey(date);
