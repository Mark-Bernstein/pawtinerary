import { useState } from "react";
import { styled } from "styled-components";
import { Modal } from "./Modal";
import { useLanguage } from "../i18n/LanguageContext";

type Operator = "+" | "−" | "×" | "÷";
const Display = styled.div`
  background: var(--surface-soft);
  border-radius: 16px;
  padding: 18px;
  text-align: right;
  min-height: 85px;
  overflow: hidden;
  strong {
    font:
      700 39px Outfit,
      sans-serif;
    word-break: break-all;
  }
`;
const Keys = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 9px;
  margin-top: 16px;
`;
const Key = styled.button<{
  $accent?: boolean;
  $symbol?: boolean;
  $wide?: boolean;
}>`
  min-height: 62px;
  border: 0;
  border-radius: 14px;
  background: ${({ $accent }) =>
    $accent ? "var(--accent)" : "var(--surface-tint)"};
  color: ${({ $accent }) =>
    $accent ? "var(--on-accent)" : "var(--accent-text)"};
  font-family: Outfit, sans-serif;
  font-size: ${({ $symbol }) => ($symbol ? "32px" : "26px")};
  font-weight: 700;
  line-height: 1;
  grid-column: ${({ $wide }) => ($wide ? "span 2" : "auto")};
  &:hover {
    filter: brightness(0.96);
  }
`;
const calculate = (left: number, right: number, operator: Operator) =>
  operator === "+"
    ? left + right
    : operator === "−"
      ? left - right
      : operator === "×"
        ? left * right
        : right === 0
          ? NaN
          : left / right;
export const Calculator = ({ onClose }: { onClose: () => void }) => {
  const { t } = useLanguage();
  const [display, setDisplay] = useState("0");
  const [held, setHeld] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [fresh, setFresh] = useState(false);
  const press = (value: string) => {
    if (value === "C") {
      setDisplay("0");
      setHeld(null);
      setOperator(null);
      setFresh(false);
      return;
    }
    if (value === "⌫") {
      setDisplay((current) =>
        current.length <= 1 || current === "Error" ? "0" : current.slice(0, -1),
      );
      return;
    }
    if (/^[0-9.]$/.test(value)) {
      setDisplay((current) => {
        if (fresh || current === "Error") return value === "." ? "0." : value;
        if (value === "." && current.includes(".")) return current;
        return current === "0" && value !== "." ? value : current + value;
      });
      setFresh(false);
      return;
    }
    if (["+", "−", "×", "÷"].includes(value)) {
      const next = value as Operator;
      if (held !== null && operator && !fresh) {
        const result = calculate(held, Number(display), operator);
        setDisplay(
          Number.isFinite(result) ? String(Number(result.toFixed(8))) : "Error",
        );
        setHeld(result);
      } else setHeld(Number(display));
      setOperator(next);
      setFresh(true);
      return;
    }
    if (value === "=" && held !== null && operator) {
      const result = calculate(held, Number(display), operator);
      setDisplay(
        Number.isFinite(result) ? String(Number(result.toFixed(8))) : "Error",
      );
      setHeld(null);
      setOperator(null);
      setFresh(true);
    }
  };
  return (
    <Modal title={t("Calculator")} onClose={onClose}>
      <Display aria-live="polite">
        <strong>{display === "Error" ? t("Error") : display}</strong>
      </Display>
      <Keys>
        {[
          "C",
          "⌫",
          "÷",
          "×",
          "7",
          "8",
          "9",
          "−",
          "4",
          "5",
          "6",
          "+",
          "1",
          "2",
          "3",
          "=",
          "0",
          ".",
        ].map((value) => (
          <Key
            key={value}
            $accent={value === "=" || ["+", "−", "×", "÷"].includes(value)}
            $symbol={["⌫", "÷", "×", "−", "+", "="].includes(value)}
            $wide={value === "0"}
            onClick={() => press(value)}
            aria-label={
              value === "⌫"
                ? t("Backspace")
                : value === "C"
                  ? t("Clear")
                  : value
            }
          >
            {value}
          </Key>
        ))}
      </Keys>
    </Modal>
  );
};
