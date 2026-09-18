import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { format } from "date-fns";
import { ca, enUS, es } from "date-fns/locale";
import type { Group, ServiceStatus } from "../types";
import { fromKey } from "../utils/dates";
import { dictionaries, type TranslationKey } from "./translations";

export type Language = "en" | "es" | "ca";
type Params = Record<string, string | number>;
const STORAGE_KEY = "pawtinerary.language.v1";
const locales = { en: enUS, es, ca };
const numberLocales = { en: "en", es: "es-ES", ca: "ca-ES" };

export const translate = (
  language: Language,
  key: TranslationKey,
  params?: Params,
) =>
  dictionaries[language][key].replace(/\{(\w+)\}/g, (match, name: string) =>
    params?.[name] === undefined ? match : String(params[name]),
  );
export const formatCurrency = (amount: number, language: Language) =>
  new Intl.NumberFormat(numberLocales[language], {
    style: "currency",
    currency: "EUR",
  }).format(amount);
export const formatNumber = (amount: number, language: Language) =>
  new Intl.NumberFormat(numberLocales[language], {
    maximumFractionDigits: 2,
  }).format(amount);
export const formatLocalizedDate = (
  date: Date,
  pattern: string,
  language: Language,
) => format(date, pattern, { locale: locales[language] });
export const formatLocalizedDay = (key: string, language: Language) =>
  formatLocalizedDate(fromKey(key), "EEE, d MMM yyyy", language);
export const formatLocalizedShortDay = (key: string, language: Language) =>
  formatLocalizedDate(fromKey(key), "d MMM yyyy", language);
export const formatGroup = (group: Group, language: Language) =>
  translate(language, group);
export const formatStatus = (status: ServiceStatus, language: Language) =>
  translate(language, status);

interface LanguageValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: Params) => string;
  money: (amount: number) => string;
  number: (amount: number) => string;
  date: (date: Date, pattern: string) => string;
  day: (key: string) => string;
  shortDay: (key: string) => string;
  group: (group: Group) => string;
  status: (status: ServiceStatus) => string;
}
const Context = createContext<LanguageValue | null>(null);
const readLanguage = (): Language => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "es" || saved === "ca" ? saved : "en";
  } catch {
    return "en";
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(readLanguage);
  useEffect(() => {
    document.documentElement.lang = language;
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* The selection still works for this session. */
    }
  }, [language]);
  const value = useMemo<LanguageValue>(
    () => ({
      language,
      setLanguage,
      t: (key, params) => translate(language, key, params),
      money: (amount) => formatCurrency(amount, language),
      number: (amount) => formatNumber(amount, language),
      date: (date, pattern) => formatLocalizedDate(date, pattern, language),
      day: (key) => formatLocalizedDay(key, language),
      shortDay: (key) => formatLocalizedShortDay(key, language),
      group: (group) => formatGroup(group, language),
      status: (status) => formatStatus(status, language),
    }),
    [language],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useLanguage = () => {
  const value = useContext(Context);
  if (!value) throw new Error("useLanguage must be inside LanguageProvider");
  return value;
};
