import { Check, Globe2 } from "lucide-react";
import { styled } from "styled-components";
import { useLanguage, type Language } from "../i18n/LanguageContext";
import { Muted, Stack } from "../styles";
import { Modal } from "./Modal";

const Choice = styled.button<{ $selected: boolean }>`
  min-height: 56px;
  border: 1px solid
    ${({ $selected }) => ($selected ? "var(--accent-border)" : "var(--border)")};
  background: ${({ $selected }) =>
    $selected ? "var(--accent-soft)" : "var(--surface)"};
  color: var(--text);
  border-radius: 13px;
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 11px;
  text-align: left;
  font-weight: 700;
  span {
    flex: 1;
  }
`;

export const LanguageModal = ({ onClose }: { onClose: () => void }) => {
  const { language, setLanguage, t } = useLanguage();
  const options: { value: Language; label: string }[] = [
    { value: "en", label: t("English (default)") },
    { value: "es", label: t("Spanish") },
    { value: "ca", label: t("Catalan") },
  ];
  return (
    <Modal title={t("Language")} onClose={onClose}>
      <Stack>
        <Muted>{t("Choose the language used throughout Pawtinerary.")}</Muted>
        <div
          role="group"
          aria-label={t("Language")}
          style={{ display: "grid", gap: 9 }}
        >
          {options.map((option) => (
            <Choice
              key={option.value}
              type="button"
              $selected={language === option.value}
              aria-pressed={language === option.value}
              onClick={() => {
                setLanguage(option.value);
                onClose();
              }}
            >
              <Globe2 size={18} />
              <span>{option.label}</span>
              {language === option.value && (
                <Check size={18} aria-label={t("Selected")} />
              )}
            </Choice>
          ))}
        </div>
      </Stack>
    </Modal>
  );
};
