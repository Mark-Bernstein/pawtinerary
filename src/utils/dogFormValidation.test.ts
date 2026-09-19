import { describe, expect, it } from "vitest";
import type { DogInput, Service } from "../types";
import { validateDogForm, type PlannedService } from "./dogFormValidation";

const dog: DogInput = {
  name: "Bailey",
  address: "1 Main Street",
  ownerName: "Pat",
  ownerPhone: "",
  ownerEmail: "",
  notes: "",
  accessInstructions: "",
  rate: 20,
};
const planned = (
  key: string,
  group: PlannedService["group"] = "Group 1",
): PlannedService => ({
  key,
  date: "2026-09-17",
  group,
});

describe("dog form validation", () => {
  it("identifies each missing required field separately", () => {
    const result = validateDogForm({ ...dog, name: " ", address: " " }, "", []);
    expect(result.errors).toMatchObject({
      name: "Enter the dog's name.",
      rate: "Enter a rate in euros.",
      address: "Enter the dog's address.",
    });
  });

  it("explains invalid rates and accepts a decimal comma", () => {
    expect(validateDogForm(dog, "twenty", []).errors.rate).toContain("numeric");
    expect(validateDogForm(dog, "0", []).errors.rate).toContain(
      "greater than €0",
    );
    expect(validateDogForm(dog, "20.999", []).errors.rate).toContain(
      "two decimal places",
    );
    const result = validateDogForm(dog, "20,50", []);
    expect(result.errors).toEqual({});
    expect(result.rate).toBe(20.5);
  });

  it("points to an invalid optional email", () => {
    expect(
      validateDogForm({ ...dog, ownerEmail: "not-an-email" }, "20", []).errors
        .ownerEmail,
    ).toContain("valid email");
  });

  it("points to the duplicate planned group and invalid date", () => {
    const result = validateDogForm(dog, "20", [
      planned("first"),
      planned("second"),
      { ...planned("third"), date: "" },
    ]);
    expect(result.errors["group:second"]).toContain("already planned");
    expect(result.errors["date:third"]).toBe("Choose a service date.");
  });

  it("points to a group already scheduled for the edited dog", () => {
    const existing: Service = {
      id: "visit",
      dogId: "bailey",
      date: "2026-09-17",
      group: "Group 1",
      status: "scheduled",
      createdAt: "",
      updatedAt: "",
    };
    const result = validateDogForm(
      dog,
      "20",
      [planned("again")],
      [existing],
      "bailey",
    );
    expect(result.errors["group:again"]).toContain("already has a service");
  });
});
