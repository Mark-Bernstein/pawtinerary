import { Bone, Check, MoonStar, Sun } from "lucide-react";
import { styled } from "styled-components";
import { useLanguage } from "../i18n/LanguageContext";
import { useTheme, type Theme } from "../theme/ThemeContext";
import { Muted, Stack } from "../styles";
import { Modal } from "./Modal";

const Choice = styled.button<{ $selected: boolean }>`
  width: 100%;
  min-height: 72px;
  border: 1px solid
    ${({ $selected }) =>
      $selected ? "var(--accent-border)" : "var(--border)"};
  background: ${({ $selected }) =>
    $selected ? "var(--accent-soft)" : "var(--surface)"};
  color: var(--text);
  border-radius: 15px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 13px;
  text-align: left;
  &:hover {
    border-color: var(--accent-border);
  }
`;
const Preview = styled.span<{ $theme: Theme }>`
  width: 42px;
  height: 42px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: ${({ $theme }) =>
    $theme === "dark" ? "#1c2b25" : $theme === "dog" ? "#fff3d8" : "#f7f6f1"};
  color: ${({ $theme }) =>
    $theme === "dark" ? "#91d6a3" : $theme === "dog" ? "#a94725" : "#254b38"};
  border: 1px solid currentColor;
`;
const ChoiceText = styled.span`
  flex: 1;
  display: grid;
  gap: 3px;
  strong {
    font-size: 13px;
  }
  small {
    color: var(--muted);
    font-size: 11px;
    line-height: 1.35;
  }
`;

export const ThemeModal = ({ onClose }: { onClose: () => void }) => {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const options = [
    {
      value: "dog",
      label: t("Dog Mode (default)"),
      description: t("Sunshine, paw prints, and biscuit-colored cards."),
      Icon: Bone,
    },
    {
      value: "dark",
      label: t("Dark Mode"),
      description: t("A calm, focused workspace for low light."),
      Icon: MoonStar,
    },
    {
      value: "light",
      label: t("Light Mode"),
      description: t("The original bright Pawtinerary look."),
      Icon: Sun,
    },
  ] as const;

  return (
    <Modal title={t("Theme")} onClose={onClose}>
      <Stack>
        <Muted>{t("Choose how Pawtinerary looks on this device.")}</Muted>
        <div
          role="group"
          aria-label={t("Theme")}
          style={{ display: "grid", gap: 9 }}
        >
          {options.map(({ value, label, description, Icon }) => (
            <Choice
              key={value}
              type="button"
              $selected={theme === value}
              aria-pressed={theme === value}
              onClick={() => {
                setTheme(value);
                onClose();
              }}
            >
              <Preview $theme={value} aria-hidden="true">
                <Icon size={21} />
              </Preview>
              <ChoiceText>
                <strong>{label}</strong>
                <small>{description}</small>
              </ChoiceText>
              {theme === value && <Check size={18} aria-label={t("Selected")} />}
            </Choice>
          ))}
        </div>
      </Stack>
    </Modal>
  );
};
