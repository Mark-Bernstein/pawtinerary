import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { styled } from "styled-components";
import { IconButton } from "../styles";
import { useLanguage } from "../i18n/LanguageContext";

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--overlay);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  @media (min-width: 650px) {
    align-items: center;
    padding: 20px;
  }
`;
const Panel = styled.div`
  background: var(--surface);
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 580px;
  max-height: min(90dvh, 850px);
  overflow: auto;
  box-shadow: var(--modal-shadow);
  padding: 24px 20px calc(26px + env(safe-area-inset-bottom));
  @media (min-width: 650px) {
    border-radius: 24px;
    padding: 25px;
  }
`;
const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 21px;
  h2 {
    margin: 0;
    font:
      700 24px Outfit,
      sans-serif;
    letter-spacing: -0.04em;
  }
`;

export const Modal = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) => {
  const { t } = useLanguage();
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panel.current
      ?.querySelector<HTMLElement>("button, input, select, textarea")
      ?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab" && panel.current) {
        const items = Array.from(
          panel.current.querySelectorAll<HTMLElement>(
            "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]",
          ),
        );
        if (!items.length) return;
        if (event.shiftKey && document.activeElement === items[0]) {
          event.preventDefault();
          items[items.length - 1].focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === items[items.length - 1]
        ) {
          event.preventDefault();
          items[0].focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [onClose]);
  return createPortal(
    <Backdrop
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <Panel ref={panel} role="dialog" aria-modal="true" aria-label={title}>
        <Head>
          <h2>{title}</h2>
          <IconButton
            type="button"
            $variant="ghost"
            aria-label={t("Close")}
            onClick={onClose}
          >
            <X size={19} />
          </IconButton>
        </Head>
        {children}
      </Panel>
    </Backdrop>,
    document.body,
  );
};
