import {
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
import {
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
  const items = reportServices(report);
  const dogMap = new Map(report.dogs.map((dog) => [dog.id, dog]));
  const rows = [
    new TableRow({
      children: [
        t("Date"),
        t("Group"),
        t("Dog / Client"),
        t("Status"),
      ].map((value) => cell(value, true)),
    }),
  ];
  items.forEach((item) => {
    const dog = dogMap.get(item.dogId)!;
    rows.push(
      new TableRow({
        children: [
          formatLocalizedShortDay(item.date, report.language),
          formatGroup(item.group, report.language),
          `${dog.name}${dog.ownerName ? ` / ${dog.ownerName}` : ""}`,
          formatStatus(item.status, report.language),
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
        ],
      },
    ],
  });
  return Packer.toBlob(document);
};
