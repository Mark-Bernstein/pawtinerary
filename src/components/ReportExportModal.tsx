import { useState, type ChangeEvent } from "react";
import { ArchiveRestore, Copy, Download, Save, Share2 } from "lucide-react";
import { styled } from "styled-components";
import { useApp } from "../context/AppContext";
import { useLanguage } from "../i18n/LanguageContext";
import type { TranslationKey } from "../i18n/translations";
import type { Period } from "../types";
import { todayKey } from "../utils/dates";
import {
  reportAnchor,
  reportFileName,
  reportPeriodLabel,
  reportText,
} from "../utils/report";
import {
  createSnapshot,
  parseSnapshot,
  snapshotFileName,
  type SnapshotDocument,
} from "../utils/snapshot";
import {
  Button,
  Field,
  FieldError,
  Input,
  Muted,
  Row,
  SectionTitle,
  Select,
  Stack,
} from "../styles";
import { Modal } from "./Modal";

const Divider = styled.hr`
  width: 100%;
  border: 0;
  border-top: 1px solid var(--border-soft);
  margin: 4px 0;
`;
const Notice = styled.div<{ $danger?: boolean }>`
  padding: 13px 15px;
  border: 1px solid
    ${({ $danger }) =>
      $danger ? "var(--danger-border)" : "var(--border-soft)"};
  border-radius: 13px;
  background: ${({ $danger }) =>
    $danger ? "var(--danger-bg)" : "var(--surface-soft)"};
  color: ${({ $danger }) => ($danger ? "var(--danger)" : "var(--text)")};
  font-size: 13px;
  line-height: 1.5;
`;
const MAX_SNAPSHOT_BYTES = 10 * 1024 * 1024;

export const ReportExportModal = ({ onClose }: { onClose: () => void }) => {
  const { data, notify, restoreData } = useApp();
  const { language, t } = useLanguage();
  const [period, setPeriod] = useState<Period>("month");
  const [date, setDate] = useState(todayKey());
  const [busy, setBusy] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] =
    useState<SnapshotDocument | null>(null);
  const [snapshotError, setSnapshotError] = useState<TranslationKey | null>(
    null,
  );
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
  const saveSnapshot = () => {
    try {
      const snapshot = new Blob([createSnapshot(data)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(snapshot);
      const link = document.createElement("a");
      link.href = url;
      link.download = snapshotFileName();
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
      notify("Snapshot downloaded");
    } catch {
      notify("Could not save the snapshot. Please try again.");
    }
  };
  const chooseSnapshot = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const selectedFile = input.files?.[0];
    setSelectedSnapshot(null);
    setSnapshotError(null);
    if (!selectedFile) return;
    if (selectedFile.size > MAX_SNAPSHOT_BYTES) {
      setSnapshotError("Snapshot files must be 10 MB or smaller.");
      input.value = "";
      return;
    }
    try {
      const result = parseSnapshot(await selectedFile.text());
      if (!result.ok) {
        setSnapshotError(
          result.reason === "unsupported"
            ? "This snapshot was created by an unsupported version of Pawtinerary."
            : "That snapshot file is invalid or damaged.",
        );
        input.value = "";
        return;
      }
      setSelectedSnapshot(result.snapshot);
    } catch {
      setSnapshotError("That snapshot file is invalid or damaged.");
      input.value = "";
    }
  };
  const uploadSnapshot = () => {
    if (selectedSnapshot && restoreData(selectedSnapshot.data)) onClose();
  };
  return (
    <Modal title={t("Send Data")} onClose={onClose}>
      <Stack>
        <SectionTitle>{t("Service report")}</SectionTitle>
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
        <Divider />
        <SectionTitle>{t("Save snapshot")}</SectionTitle>
        <Muted>
          {t(
            "Download a complete backup of all dogs, services, earnings, notes, and access instructions.",
          )}
        </Muted>
        <Notice>
          {t(
            "The snapshot includes private notes and access instructions. Store it somewhere secure.",
          )}
        </Notice>
        <Row>
          <Button disabled={busy} onClick={saveSnapshot}>
            <Save size={16} /> {t("Save snapshot of data")}
          </Button>
        </Row>
        <Divider />
        <SectionTitle>{t("Upload Data")}</SectionTitle>
        <Muted>{t("Restore a previously saved Pawtinerary snapshot.")}</Muted>
        <Notice $danger id="snapshot-replace-warning">
          {t(
            "Uploading a snapshot will replace all current dogs, services, and earnings. This cannot be undone.",
          )}
        </Notice>
        <Field>
          {t("Choose snapshot file")}
          <Input
            type="file"
            accept="application/json,.json"
            onChange={chooseSnapshot}
            aria-invalid={Boolean(snapshotError)}
            aria-describedby={
              snapshotError
                ? "snapshot-upload-error"
                : "snapshot-replace-warning"
            }
          />
          {snapshotError && (
            <FieldError id="snapshot-upload-error" role="alert">
              {t(snapshotError)}
            </FieldError>
          )}
        </Field>
        {selectedSnapshot && (
          <Muted role="status">
            {t("{dogs} dogs and {services} services ready to restore.", {
              dogs: selectedSnapshot.data.dogs.length,
              services: selectedSnapshot.data.services.length,
            })}
          </Muted>
        )}
        <Row>
          <Button
            $variant="danger"
            disabled={!selectedSnapshot || busy}
            aria-describedby="snapshot-replace-warning"
            onClick={uploadSnapshot}
          >
            <ArchiveRestore size={16} /> {t("Replace current data")}
          </Button>
        </Row>
      </Stack>
    </Modal>
  );
};
