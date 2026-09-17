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

const Header = styled.header`
  background: #fff;
  border-bottom: 1px solid #e7ece5;
  position: sticky;
  top: 0;
  z-index: 30;
  box-shadow: 0 3px 18px #1a38280a;
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
  @media (min-width: 850px) {
    padding: 14px 32px;
    flex-wrap: nowrap;
  }
`;
const Brand = styled(NavLink)`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: #254b38;
  font:
    800 23px Outfit,
    sans-serif;
  letter-spacing: -0.06em;
  white-space: nowrap;
  svg {
    fill: #e6ad57;
    stroke: #254b38;
  }
`;
const Nav = styled.nav`
  display: none;
  gap: 4px;
  @media (min-width: 850px) {
    display: flex;
  }
  a {
    padding: 11px 15px;
    border-radius: 11px;
    color: #748277;
    font-size: 13px;
    font-weight: 800;
  }
  a.active {
    background: #eaf2e8;
    color: #2c6041;
  }
`;
const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
  @media (min-width: 850px) {
    width: auto;
  }
  button {
    flex: none;
    min-height: 42px;
    padding-inline: 9px;
    font-size: 12px;
  }
`;
const CalcButton = styled.button`
  height: 42px;
  width: 42px;
  border-radius: 12px;
  border: 1px solid #dfe7de;
  color: #2a5139;
  background: #fff;
  display: grid;
  place-items: center;
  flex: none;
  margin-left: auto;
  @media (min-width: 850px) {
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
  background: #fff;
  border-top: 1px solid #e2e9e1;
  padding: 7px 10px calc(7px + env(safe-area-inset-bottom));
  box-shadow: 0 -8px 22px #16362410;
  @media (min-width: 850px) {
    display: none;
  }
  a {
    min-height: 53px;
    display: grid;
    justify-items: center;
    align-content: center;
    gap: 3px;
    color: #7d8a80;
    font-size: 10px;
    font-weight: 800;
    border-radius: 12px;
  }
  a.active {
    color: #26583b;
    background: #ecf4eb;
  }
`;
const Toast = styled.div`
  position: fixed;
  z-index: 200;
  bottom: calc(86px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  background: #254b38;
  color: #fff;
  border-radius: 13px;
  padding: 12px 17px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 8px 28px #16362440;
  min-width: max-content;
  max-width: calc(100vw - 25px);
  text-align: center;
  @media (min-width: 850px) {
    bottom: 25px;
  }
`;
const navItems = [
  { to: "/", title: "Schedule", Icon: CalendarDays },
  { to: "/dogs", title: "Dogs", Icon: Dog },
  { to: "/earnings", title: "Earnings", Icon: ChartNoAxesCombined },
];

const Shell = () => {
  const navigate = useNavigate();
  const { toast } = useApp();
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
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
          <Nav aria-label="Primary navigation">
            {navItems.map(({ to, title }) => (
              <NavLink key={to} to={to} end={to === "/"}>
                {title}
              </NavLink>
            ))}
          </Nav>
          <CalcButton
            aria-label="Open calculator"
            title="Calculator"
            onClick={() => setCalculatorOpen(true)}
          >
            <CalculatorIcon size={21} />
          </CalcButton>
          <HeaderActions>
            <Button $small onClick={() => navigate("/dogs/new")}>
              <Plus size={15} /> Create Dog
            </Button>
            <Button
              $small
              $variant="primary"
              onClick={() => setServiceOptions({})}
            >
              <Plus size={15} /> Add Service
            </Button>
            <Button $small onClick={() => setReportOpen(true)}>
              <FileUp size={15} /> Send Data
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
      <MobileNav aria-label="Mobile navigation">
        {navItems.map(({ to, title, Icon }) => (
          <NavLink key={to} to={to} end={to === "/"}>
            <Icon size={21} />
            {title}
          </NavLink>
        ))}
      </MobileNav>
      {calculatorOpen && (
        <Calculator onClose={() => setCalculatorOpen(false)} />
      )}
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
    <AppProvider>
      <GlobalStyle />
      <Shell />
    </AppProvider>
  </BrowserRouter>
);
