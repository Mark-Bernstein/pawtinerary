import { useState } from "react";
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import {
  CalendarDays,
  Calculator as CalculatorIcon,
  ChartNoAxesCombined,
  Dog,
  FileUp,
  Languages,
  Palette,
  PawPrint,
  Plus,
} from "lucide-react";
import { styled } from "styled-components";
import { AppProvider, useApp } from "./context/AppContext";
import { GlobalStyle, Button } from "./styles";
import { Calculator } from "./components/Calculator";
import { ReportExportModal } from "./components/ReportExportModal";
import { ServiceFormModal } from "./components/ServiceFormModal";
import { SchedulePage } from "./pages/SchedulePage";
import { DogsPage } from "./pages/DogsPage";
import { DogDetailPage } from "./pages/DogDetailPage";
import { DogFormPage } from "./pages/DogFormPage";
import { EarningsPage } from "./pages/EarningsPage";
import { LanguageProvider, useLanguage } from "./i18n/LanguageContext";
import { LanguageModal } from "./components/LanguageModal";
import { ThemeModal } from "./components/ThemeModal";
import { ThemeProvider } from "./theme/ThemeContext";

const Header = styled.header`
  background: var(--surface);
  border-bottom: 1px solid var(--border-soft);
  position: sticky;
  top: 0;
  z-index: 30;
  box-shadow: var(--header-shadow);
  :root[data-theme="dog"] & {
    border-top: 4px solid var(--gold);
  }
`;
const HeaderInner = styled.div`
  max-width: 1180px;
  margin: auto;
  padding: 10px 17px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  @media (min-width: 1120px) {
    padding: 14px 32px;
    flex-wrap: nowrap;
  }
`;
const Brand = styled(NavLink)`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--accent-text);
  font:
    800 23px Outfit,
    sans-serif;
  letter-spacing: -0.06em;
  white-space: nowrap;
  svg {
    fill: var(--gold);
    stroke: var(--accent-text);
  }
  @media (max-width: 360px) {
    font-size: 20px;
    svg {
      display: none;
    }
  }
`;
const Nav = styled.nav`
  display: none;
  gap: 4px;
  @media (min-width: 1120px) {
    display: flex;
  }
  a {
    padding: 11px 15px;
    border-radius: 11px;
    color: var(--muted);
    font-size: 13px;
    font-weight: 800;
  }
  a.active {
    background: var(--accent-soft);
    color: var(--accent-text);
  }
`;
const HeaderActions = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: center;
  gap: 5px;
  width: 100%;
  @media (min-width: 1120px) {
    display: flex;
    width: auto;
  }
  button {
    min-width: 0;
    min-height: 42px;
    padding-inline: 5px;
    font-size: 11px;
    gap: 4px;
    @media (min-width: 1120px) {
      padding-inline: 9px;
      font-size: 12px;
    }
  }
`;
const CalcButton = styled.button`
  height: 42px;
  width: 42px;
  border-radius: 12px;
  border: 1px solid var(--border);
  color: var(--accent-text);
  background: var(--surface);
  display: grid;
  place-items: center;
  flex: none;
  margin-left: auto;
  @media (min-width: 1120px) {
    margin-left: 0;
  }
`;
const MobileNav = styled.nav`
  position: fixed;
  z-index: 25;
  bottom: 0;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: var(--surface);
  border-top: 1px solid var(--border-soft);
  padding: 7px 10px calc(7px + env(safe-area-inset-bottom));
  box-shadow: var(--nav-shadow);
  @media (min-width: 1120px) {
    display: none;
  }
  a {
    min-height: 53px;
    display: grid;
    justify-items: center;
    align-content: center;
    gap: 3px;
    color: var(--muted);
    font-size: 10px;
    font-weight: 800;
    border-radius: 12px;
  }
  a.active {
    color: var(--accent-text);
    background: var(--accent-soft);
  }
`;
const Toast = styled.div`
  position: fixed;
  z-index: 200;
  bottom: calc(86px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent);
  color: var(--on-accent);
  border-radius: 13px;
  padding: 12px 17px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: var(--toast-shadow);
  min-width: max-content;
  max-width: calc(100vw - 25px);
  text-align: center;
  @media (min-width: 1120px) {
    bottom: 25px;
  }
`;
const navItems = [
  { to: "/", title: "Schedule", Icon: CalendarDays },
  { to: "/dogs", title: "Dogs", Icon: Dog },
  { to: "/earnings", title: "Earnings", Icon: ChartNoAxesCombined },
] as const;

const Shell = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useApp();
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [serviceOptions, setServiceOptions] = useState<{
    dogId?: string;
    date?: string;
  } | null>(null);
  return (
    <>
      <Header>
        <HeaderInner>
          <Brand to="/">
            <PawPrint size={27} /> Pawtinerary
          </Brand>
          <Nav aria-label={t("Primary navigation")}>
            {navItems.map(({ to, title }) => (
              <NavLink key={to} to={to} end={to === "/"}>
                {t(title)}
              </NavLink>
            ))}
          </Nav>
          <Button $small onClick={() => setLanguageOpen(true)}>
            <Languages size={16} /> {t("Language")}
          </Button>
          <CalcButton
            aria-label={t("Open calculator")}
            title={t("Calculator")}
            onClick={() => setCalculatorOpen(true)}
          >
            <CalculatorIcon size={21} />
          </CalcButton>
          <HeaderActions>
            <Button $small onClick={() => navigate("/dogs/new")}>
              <Plus size={15} /> {t("Create Dog")}
            </Button>
            <Button
              $small
              $variant="primary"
              onClick={() => setServiceOptions({})}
            >
              <Plus size={15} /> {t("Add Service")}
            </Button>
            <Button $small onClick={() => setReportOpen(true)}>
              <FileUp size={15} /> {t("Send Data")}
            </Button>
            <Button $small onClick={() => setThemeOpen(true)}>
              <Palette size={15} /> {t("Theme")}
            </Button>
          </HeaderActions>
        </HeaderInner>
      </Header>
      <Routes>
        <Route
          path="/"
          element={
            <SchedulePage
              onAdd={(date) => setServiceOptions({ date })}
              onCreate={() => navigate("/dogs/new")}
            />
          }
        />
        <Route path="/dogs" element={<DogsPage />} />
        <Route path="/dogs/new" element={<DogFormPage />} />
        <Route
          path="/dogs/:id"
          element={
            <DogDetailPage onAdd={(dogId) => setServiceOptions({ dogId })} />
          }
        />
        <Route path="/dogs/:id/edit" element={<DogFormPage />} />
        <Route path="/earnings" element={<EarningsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <MobileNav aria-label={t("Mobile navigation")}>
        {navItems.map(({ to, title, Icon }) => (
          <NavLink key={to} to={to} end={to === "/"}>
            <Icon size={21} />
            {t(title)}
          </NavLink>
        ))}
      </MobileNav>
      {calculatorOpen && (
        <Calculator onClose={() => setCalculatorOpen(false)} />
      )}
      {languageOpen && <LanguageModal onClose={() => setLanguageOpen(false)} />}
      {themeOpen && <ThemeModal onClose={() => setThemeOpen(false)} />}
      {reportOpen && <ReportExportModal onClose={() => setReportOpen(false)} />}
      {serviceOptions && (
        <ServiceFormModal
          initialDogId={serviceOptions.dogId}
          initialDate={serviceOptions.date}
          onClose={() => setServiceOptions(null)}
        />
      )}
      {toast && <Toast role="status">{toast}</Toast>}
    </>
  );
};
export const App = () => (
  <BrowserRouter>
    <LanguageProvider>
      <ThemeProvider>
        <AppProvider>
          <GlobalStyle />
          <Shell />
        </AppProvider>
      </ThemeProvider>
    </LanguageProvider>
  </BrowserRouter>
);
