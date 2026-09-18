import { useState } from "react";
import { Copy, Download, Share2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useLanguage } from "../i18n/LanguageContext";
import type { Period } from "../types";
import { todayKey } from "../utils/dates";
import {
  reportAnchor,
  reportFileName,
  reportPeriodLabel,
  reportText,
} from "../utils/report";
import { Button, Field, Input, Muted, Row, Select, Stack } from "../styles";
import { Modal } from "./Modal";

export const ReportExportModal = ({ onClose }: { onClose: () => void }) => {
  const { data, notify } = useApp();
  const { language, t } = useLanguage();
  const [period, setPeriod] = useState<Period>("month");
  const [date, setDate] = useState(todayKey());
  const [busy, setBusy] = useState(false);
  const report = {
    period,
    anchor: reportAnchor(date || todayKey()),
    dogs: data.dogs,
    services: data.services,
    language,
  };
  const file = async () => {
    const { reportDocx } = await import("../utils/reportDocx");
    return new File(
      [await reportDocx(report)],
      reportFileName(period, report.anchor, language),
      {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
    );
  };
  const download = async () => {
    setBusy(true);
    try {
      const result = await file();
      const url = URL.createObjectURL(result);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.name;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
      notify("Report downloaded");
    } catch {
      notify("Could not generate the report. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reportText(report));
      notify("Report copied");
    } catch {
      notify("Could not copy the report. Please try again.");
    }
  };
  const share = async () => {
    setBusy(true);
    try {
      const result = await file();
      if (navigator.canShare?.({ files: [result] })) {
        await navigator.share({
          title: t("Pawtinerary report"),
          files: [result],
        });
        notify("Report shared");
      } else
        notify(
          "File sharing is unavailable. Download or copy the report instead.",
        );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      notify("Could not share the report. Download or copy it instead.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title={t("Send Data")} onClose={onClose}>
      <Stack>
        <Muted>
          {t("Create a report locally, then download, copy, or share it.")}
        </Muted>
        <Field>
          {t("Report period")}
          <Select
            value={period}
            onChange={(event) => setPeriod(event.target.value as Period)}
          >
            <option value="day">{t("Day")}</option>
            <option value="week">{t("Week")}</option>
            <option value="month">{t("Month")}</option>
            <option value="lifetime">{t("Lifetime")}</option>
          </Select>
        </Field>
        {period !== "lifetime" && (
          <Field>
            {t(
              period === "day"
                ? "Select day"
                : period === "week"
                  ? "Select a day in the week"
                  : "Select a day in the month",
            )}
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </Field>
        )}
        <div
          style={{
            padding: 16,
            borderRadius: 14,
            background: "var(--surface-soft)",
          }}
        >
          <strong>{reportPeriodLabel(period, report.anchor, language)}</strong>
          <div>
            <Muted>{t("Entry and access instructions are excluded.")}</Muted>
          </div>
        </div>
        <Row>
          <Button $variant="primary" disabled={busy} onClick={download}>
            <Download size={16} /> {t("Download DOCX")}
          </Button>
          <Button disabled={busy} onClick={copy}>
            <Copy size={16} /> {t("Copy Report Text")}
          </Button>
          {typeof navigator.share === "function" && (
            <Button disabled={busy} onClick={share}>
              <Share2 size={16} /> {t("Share Report")}
            </Button>
          )}
        </Row>
      </Stack>
    </Modal>
  );
};
