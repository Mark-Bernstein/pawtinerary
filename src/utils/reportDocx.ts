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
import { format } from "date-fns";
import type { ReportData } from "./report";
import { reportPeriodLabel, reportServices } from "./report";
import { formatShortDay } from "./dates";
import { currency, durationLabel, getTotals, serviceAmount } from "./earnings";

const cell = (value: string, bold = false) =>
  new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text: value, bold, size: 19 })],
      }),
    ],
  });
export const reportDocx = async (report: ReportData) => {
  const items = reportServices(report);
  const dogMap = new Map(report.dogs.map((dog) => [dog.id, dog]));
  const totals = getTotals(items, report.dogs);
  const rows = [
    new TableRow({
      children: [
        "Date",
        "Group",
        "Dog / Client",
        "Duration",
        "Status",
        "Rate",
        "Amount",
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
          formatShortDay(item.date),
          item.group,
          `${dog.name}${dog.ownerName ? ` / ${dog.ownerName}` : ""}`,
          durationLabel(item.durationMinutes),
          item.status,
          currency(rate),
          item.status === "cancelled"
            ? currency(0)
            : currency(serviceAmount(item, dog)),
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
            text: `Service report · ${reportPeriodLabel(report.period, report.anchor)}`,
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: `Generated ${format(new Date(), "d MMMM yyyy")}`,
            spacing: { after: 300 },
          }),
          ...(items.length
            ? [
                new Table({
                  rows,
                  width: { size: 100, type: WidthType.PERCENTAGE },
                }),
              ]
            : [new Paragraph({ text: "No services in this period." })]),
          new Paragraph({
            text: `Earned: ${currency(totals.earned)}`,
            alignment: AlignmentType.RIGHT,
            spacing: { before: 300 },
          }),
          new Paragraph({
            text: `Potential: ${currency(totals.potential)}`,
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph({
            text: `Combined total: ${currency(totals.earned + totals.potential)}`,
            alignment: AlignmentType.RIGHT,
          }),
        ],
      },
    ],
  });
  return Packer.toBlob(document);
};
