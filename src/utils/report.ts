import { format } from "date-fns";
import type { Dog, Period, Service } from "../types";
import {
  dateKey,
  formatShortDay,
  fromKey,
  inPeriod,
  monthEnd,
  monthStart,
  weekEnd,
  weekStart,
} from "./dates";
import { currency, durationLabel, getTotals, serviceAmount } from "./earnings";

export interface ReportData {
  period: Period;
  anchor: Date;
  dogs: Dog[];
  services: Service[];
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
export const reportPeriodLabel = (period: Period, anchor: Date) => {
  if (period === "lifetime") return "Lifetime · all stored history";
  if (period === "day") return format(anchor, "d MMMM yyyy");
  if (period === "week")
    return `${format(weekStart(anchor), "d MMM yyyy")} – ${format(weekEnd(anchor), "d MMM yyyy")}`;
  return `${format(monthStart(anchor), "d MMM yyyy")} – ${format(monthEnd(anchor), "d MMM yyyy")}`;
};
export const reportFileName = (period: Period, anchor: Date) => {
  if (period === "lifetime") return "Pawtinerary-Lifetime-Report.docx";
  if (period === "day") return `Pawtinerary-Day-${dateKey(anchor)}.docx`;
  if (period === "week")
    return `Pawtinerary-Week-${dateKey(weekStart(anchor))}.docx`;
  return `Pawtinerary-Month-${format(anchor, "yyyy-MM")}.docx`;
};
export const reportText = (report: ReportData) => {
  const items = reportServices(report);
  const dogMap = new Map(report.dogs.map((dog) => [dog.id, dog]));
  const totals = getTotals(items, report.dogs);
  const lines = [
    "PAWTINERARY",
    `Report: ${reportPeriodLabel(report.period, report.anchor)}`,
    `Generated: ${format(new Date(), "d MMM yyyy")}`,
    "",
    "SERVICES",
  ];
  if (!items.length) lines.push("No services in this period.");
  items.forEach((item) => {
    const dog = dogMap.get(item.dogId)!;
    const rate =
      item.status === "completed"
        ? (item.completedHourlyRate ?? dog.hourlyRate)
        : dog.hourlyRate;
    lines.push(
      `${formatShortDay(item.date)} | ${item.group} | ${dog.name}${dog.ownerName ? ` (${dog.ownerName})` : ""} | ${durationLabel(item.durationMinutes)} | ${item.status} | ${currency(rate)}/hr | ${item.status === "cancelled" ? currency(0) : currency(serviceAmount(item, dog))}`,
    );
  });
  lines.push(
    "",
    `Earned: ${currency(totals.earned)}`,
    `Potential: ${currency(totals.potential)}`,
    `Combined total: ${currency(totals.earned + totals.potential)}`,
  );
  return lines.join("\n");
};
export const reportAnchor = (date: string) => fromKey(date);
