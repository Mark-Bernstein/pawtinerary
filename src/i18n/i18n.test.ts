import { describe, expect, it } from "vitest";
import type { Dog, Service } from "../types";
import { reportFileName, reportText } from "../utils/report";
import {
  formatCurrency,
  formatLocalizedDate,
  translate,
} from "./LanguageContext";

describe("language support", () => {
  it("translates labels and interpolated messages", () => {
    expect(translate("es", "Dogs")).toBe("Perros");
    expect(
      translate("ca", "Nothing scheduled for {group}.", {
        group: "Grup 2",
      }),
    ).toContain("Grup 2");
  });

  it("uses local dates and Euro formatting", () => {
    const date = new Date(2026, 8, 17, 12);
    expect(formatLocalizedDate(date, "MMMM yyyy", "es")).toBe(
      "septiembre 2026",
    );
    expect(formatLocalizedDate(date, "MMMM yyyy", "ca")).toBe("setembre 2026");
    expect(formatCurrency(20.5, "es")).toMatch(/20,50.*€/);
  });

  it("generates report wording in the selected language without access instructions", () => {
    const dog: Dog = {
      id: "dog",
      name: "Bailey",
      address: "Street",
      ownerName: "Pat",
      ownerPhone: "",
      ownerEmail: "",
      notes: "",
      accessInstructions: "PRIVATE-CODE",
      rate: 20,
      createdAt: "",
      updatedAt: "",
    };
    const service: Service = {
      id: "service",
      dogId: dog.id,
      date: "2026-09-17",
      group: "Group 1",
      status: "completed",
      createdAt: "",
      updatedAt: "",
    };
    const base = {
      period: "day" as const,
      anchor: new Date(2026, 8, 17, 12),
      dogs: [dog],
      services: [service],
    };
    const spanish = reportText({ ...base, language: "es" });
    const catalan = reportText({ ...base, language: "ca" });
    expect(spanish).toContain("Grupo 1");
    expect(spanish).toContain("completado");
    expect(catalan).toContain("Grup 1");
    expect(catalan).toContain("completat");
    expect(spanish).toContain("Ganado: 20,00");
    expect(catalan).toContain("Guanyat: 20,00");
    expect(spanish + catalan).not.toContain("PRIVATE-CODE");
    expect(reportFileName("month", base.anchor, "ca")).toBe(
      "Pawtinerary-Mes-2026-09.docx",
    );
  });
});
