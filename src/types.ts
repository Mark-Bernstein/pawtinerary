export type Group = "Group 1" | "Group 2" | "Group 3";
export type ServiceStatus = "scheduled" | "completed" | "cancelled";

export interface Dog {
  id: string;
  name: string;
  address: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  notes: string;
  accessInstructions: string;
  rate: number;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  dogId: string;
  date: string;
  group: Group;
  status: ServiceStatus;
  completedRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PawtineraryData {
  version: 3;
  dogs: Dog[];
  services: Service[];
}

export type DogInput = Pick<
  Dog,
  | "name"
  | "address"
  | "ownerName"
  | "ownerPhone"
  | "ownerEmail"
  | "notes"
  | "accessInstructions"
  | "rate"
>;
export type ServiceInput = Pick<Service, "dogId" | "date" | "group">;
export type Period = "day" | "week" | "month" | "lifetime";
