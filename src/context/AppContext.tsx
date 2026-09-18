import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Dog,
  DogInput,
  PawtineraryData,
  Service,
  ServiceInput,
  ServiceStatus,
} from "../types";
import { readData, removeDog, writeData } from "../storage/data";
import { useLanguage } from "../i18n/LanguageContext";
import type { TranslationKey } from "../i18n/translations";

interface AppActions {
  data: PawtineraryData;
  addDog: (input: DogInput, services?: Omit<ServiceInput, "dogId">[]) => Dog;
  updateDog: (
    id: string,
    input: DogInput,
    services?: Omit<ServiceInput, "dogId">[],
  ) => void;
  deleteDog: (id: string) => void;
  addServices: (inputs: ServiceInput[]) => boolean;
  updateService: (id: string, input: ServiceInput) => boolean;
  setServiceStatus: (id: string, status: ServiceStatus) => void;
  notify: (message: TranslationKey) => void;
  toast: string;
}

const Context = createContext<AppActions | null>(null);
const stamp = () => new Date().toISOString();
const duplicate = (
  services: Service[],
  input: ServiceInput,
  excludeId?: string,
) =>
  services.some(
    (item) =>
      item.id !== excludeId &&
      item.status !== "cancelled" &&
      item.dogId === input.dogId &&
      item.date === input.date &&
      item.group === input.group,
  );
const makeService = (input: ServiceInput): Service => ({
  ...input,
  id: crypto.randomUUID(),
  status: "scheduled",
  createdAt: stamp(),
  updatedAt: stamp(),
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useLanguage();
  const [data, setData] = useState<PawtineraryData>(readData);
  const [toastKey, setToastKey] = useState<TranslationKey | null>(null);
  const toast = toastKey ? t(toastKey) : "";
  useEffect(() => {
    if (!writeData(data))
      setToastKey(
        "Browser storage is unavailable. Changes may not survive a refresh.",
      );
  }, [data]);
  useEffect(() => {
    if (!toastKey) return;
    const id = window.setTimeout(() => setToastKey(null), 3500);
    return () => window.clearTimeout(id);
  }, [toastKey]);
  const notify = (message: TranslationKey) => setToastKey(message);

  const actions = useMemo<AppActions>(
    () => ({
      data,
      toast,
      notify,
      addDog: (input, services = []) => {
        const now = stamp();
        const dog: Dog = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        const unique = services.filter(
          (item, index, all) =>
            all.findIndex(
              (other) => other.date === item.date && other.group === item.group,
            ) === index,
        );
        setData((current) => ({
          ...current,
          dogs: [...current.dogs, dog],
          services: [
            ...current.services,
            ...unique.map((item) => makeService({ ...item, dogId: dog.id })),
          ],
        }));
        notify("Dog created");
        return dog;
      },
      updateDog: (id, input, services = []) => {
        setData((current) => {
          const additions = services.filter(
            (item) => !duplicate(current.services, { ...item, dogId: id }),
          );
          return {
            ...current,
            dogs: current.dogs.map((dog) =>
              dog.id === id ? { ...dog, ...input, updatedAt: stamp() } : dog,
            ),
            services: [
              ...current.services,
              ...additions.map((item) => makeService({ ...item, dogId: id })),
            ],
          };
        });
        notify("Dog updated");
      },
      deleteDog: (id) => {
        setData((current) => removeDog(current, id));
        notify("Dog deleted");
      },
      addServices: (inputs) => {
        if (inputs.length === 0) {
          notify("Choose a service date.");
          return false;
        }
        const unique = new Set(
          inputs.map((input) => `${input.dogId}|${input.date}|${input.group}`),
        );
        if (
          unique.size !== inputs.length ||
          inputs.some((input) => duplicate(data.services, input))
        ) {
          notify("That dog is already scheduled in this group on this date");
          return false;
        }
        setData((current) => ({
          ...current,
          services: [
            ...current.services,
            ...inputs.map((input) => makeService(input)),
          ],
        }));
        notify(inputs.length === 1 ? "Service added" : "Services added");
        return true;
      },
      updateService: (id, input) => {
        if (duplicate(data.services, input, id)) {
          notify("That dog is already scheduled in this group on this date");
          return false;
        }
        setData((current) => ({
          ...current,
          services: current.services.map((service) =>
            service.id === id
              ? { ...service, ...input, updatedAt: stamp() }
              : service,
          ),
        }));
        notify("Service updated");
        return true;
      },
      setServiceStatus: (id, status) => {
        const existing = data.services.find((service) => service.id === id);
        if (
          status === "scheduled" &&
          existing &&
          duplicate(data.services, existing, id)
        ) {
          notify("That dog is already scheduled in this group on this date");
          return;
        }
        setData((current) => ({
          ...current,
          services: current.services.map((service) => {
            if (service.id !== id) return service;
            return {
              ...service,
              status,
              updatedAt: stamp(),
            };
          }),
        }));
        notify(
          status === "completed"
            ? "Service completed"
            : status === "cancelled"
              ? "Service cancelled"
              : "Service restored",
        );
      },
    }),
    [data, toast, t],
  );
  return <Context.Provider value={actions}>{children}</Context.Provider>;
};

export const useApp = () => {
  const value = useContext(Context);
  if (!value) throw new Error("useApp must be inside AppProvider");
  return value;
};
