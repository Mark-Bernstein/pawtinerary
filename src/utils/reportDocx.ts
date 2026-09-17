import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { ReportData } from "./report";
import { reportPeriodLabel, reportServices } from "./report";
import { getTotals, serviceAmount } from "./earnings";
import {
  formatCurrency,
  formatDuration,
  formatGroup,
  formatLocalizedDate,
  formatLocalizedShortDay,
  formatStatus,
  translate,
} from "../i18n/LanguageContext";

const cell = (value: string, bold = false) =>
  new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text: value, bold, size: 19 })],
      }),
    ],
  });
export const reportDocx = async (report: ReportData) => {
  const t = (
    key: Parameters<typeof translate>[1],
    params?: Record<string, string | number>,
  ) => translate(report.language, key, params);
  const money = (amount: number) => formatCurrency(amount, report.language);
  const items = reportServices(report);
  const dogMap = new Map(report.dogs.map((dog) => [dog.id, dog]));
  const totals = getTotals(items, report.dogs);
  const rows = [
    new TableRow({
      children: [
        t("Date"),
        t("Group"),
        t("Dog / Client"),
        t("Duration"),
        t("Status"),
        t("Rate"),
        t("Amount"),
      ].map((value) => cell(value, true)),
    }),
  ];
  items.forEach((item) => {
    const dog = dogMap.get(item.dogId)!;
    const rate =
      item.status === "completed"
        ? (item.completedHourlyRate ?? dog.hourlyRate)
        : dog.hourlyRate;
    rows.push(
      new TableRow({
        children: [
          formatLocalizedShortDay(item.date, report.language),
          formatGroup(item.group, report.language),
          `${dog.name}${dog.ownerName ? ` / ${dog.ownerName}` : ""}`,
          formatDuration(item.durationMinutes, report.language),
          formatStatus(item.status, report.language),
          money(rate),
          item.status === "cancelled"
            ? money(0)
            : money(serviceAmount(item, dog)),
        ].map((value) => cell(value)),
      }),
    );
  });
  const document = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: "Pawtinerary", heading: HeadingLevel.TITLE }),
          new Paragraph({
            text: t("Service report · {period}", {
              period: reportPeriodLabel(
                report.period,
                report.anchor,
                report.language,
              ),
            }),
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: t("Generated {date}", {
              date: formatLocalizedDate(
                new Date(),
                "d MMMM yyyy",
                report.language,
              ),
            }),
            spacing: { after: 300 },
          }),
          ...(items.length
            ? [
                new Table({
                  rows,
                  width: { size: 100, type: WidthType.PERCENTAGE },
                }),
              ]
            : [new Paragraph({ text: t("No services in this period.") })]),
          new Paragraph({
            text: t("Earned: {amount}", { amount: money(totals.earned) }),
            alignment: AlignmentType.RIGHT,
            spacing: { before: 300 },
          }),
          new Paragraph({
            text: t("Potential: {amount}", { amount: money(totals.potential) }),
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            text: t("Combined total: {amount}", {
              amount: money(totals.earned + totals.potential),
            }),
            alignment: AlignmentType.RIGHT,
          }),
        ],
      },
    ],
  });
  return Packer.toBlob(document);
};
