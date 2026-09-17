import { createGlobalStyle, styled } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    font-family: 'DM Sans', sans-serif;
    font-synthesis: none;
    color-scheme: dark;
    --page-bg: #111b18;
    --text: #e8f1e9;
    --surface: #1c2b25;
    --surface-soft: #25372f;
    --surface-tint: #2a4336;
    --border: #3b5144;
    --border-soft: #304539;
    --muted: #acbfae;
    --muted-strong: #bfd0c1;
    --muted-faint: #91a897;
    --accent: #91d6a3;
    --on-accent: #14271a;
    --accent-text: #a4e7b5;
    --accent-soft: #2b4936;
    --accent-border: #638d6e;
    --gold: #f4c775;
    --on-gold: #231f15;
    --focus: #f2c36b;
    --focus-ring: #3d6450;
    --danger: #ffa391;
    --danger-bg: #3e2929;
    --danger-border: #965c56;
    --danger-ring: #67413a;
    --summary: #254632;
    --summary-text: #f4fff4;
    --summary-muted: #c1dcc6;
    --badge-gray-bg: #314039;
    --badge-gray-text: #c0d2c3;
    --badge-amber-bg: #4e3c25;
    --badge-amber-text: #ffdc90;
    --overlay: rgba(4, 13, 9, 0.72);
    --card-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
    --header-shadow: 0 3px 18px rgba(0, 0, 0, 0.16);
    --nav-shadow: 0 -8px 22px rgba(0, 0, 0, 0.18);
    --modal-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
    --toast-shadow: 0 8px 28px rgba(0, 0, 0, 0.3);
    --card-radius: 21px;
    --card-border-style: solid;
    color: var(--text);
    background: var(--page-bg);
  }
  :root[data-theme="light"] {
    color-scheme: light;
    --page-bg: #f7f6f1;
    --text: #22352d;
    --surface: #fff;
    --surface-soft: #f3f6f1;
    --surface-tint: #eaf2e8;
    --border: #dce4da;
    --border-soft: #e9ece5;
    --muted: #6e7c72;
    --muted-strong: #42594a;
    --muted-faint: #a9b4aa;
    --accent: #254b38;
    --on-accent: #fff;
    --accent-text: #2c6041;
    --accent-soft: #e8f3e8;
    --accent-border: #a8c9a7;
    --gold: #e6ad57;
    --focus: #e4a551;
    --focus-ring: #e0eee2;
    --danger: #a34232;
    --danger-bg: #fff4f0;
    --danger-border: #edb9ad;
    --danger-ring: #f7d9d2;
    --summary: #264e39;
    --summary-text: #fff;
    --summary-muted: #c2d7c7;
    --badge-gray-bg: #eef0ec;
    --badge-gray-text: #68746c;
    --badge-amber-bg: #fff1d9;
    --badge-amber-text: #9b6a20;
    --overlay: rgba(18, 40, 27, 0.48);
    --card-shadow: 0 8px 24px rgba(33, 61, 45, 0.035);
    --header-shadow: 0 3px 18px #1a38280a;
    --nav-shadow: 0 -8px 22px #16362410;
    --modal-shadow: 0 24px 80px rgba(16, 37, 24, 0.2);
    --toast-shadow: 0 8px 28px #16362440;
  }
  :root[data-theme="dog"] {
    color-scheme: light;
    --page-bg: #fff3d8;
    --text: #3f2b20;
    --surface: #fffdf4;
    --surface-soft: #fff4df;
    --surface-tint: #ffe8bf;
    --border: #dfbd91;
    --border-soft: #ecd5b5;
    --muted: #755e45;
    --muted-strong: #6c5038;
    --muted-faint: #a48c6f;
    --accent: #a94725;
    --on-accent: #fff8eb;
    --accent-text: #8d391b;
    --accent-soft: #ffe3bd;
    --accent-border: #d3945d;
    --gold: #f5b342;
    --focus: #e88a32;
    --focus-ring: #ffdb9b;
    --danger: #a33c2e;
    --danger-bg: #fff0e9;
    --danger-border: #d99586;
    --danger-ring: #ffd1c3;
    --summary: #2a5666;
    --summary-text: #fffdf1;
    --summary-muted: #d7eff0;
    --badge-gray-bg: #f4e9d7;
    --badge-gray-text: #715c48;
    --badge-amber-bg: #ffe3a5;
    --badge-amber-text: #81470c;
    --overlay: rgba(59, 35, 20, 0.56);
    --card-shadow: 0 10px 0 #e8c58c, 0 18px 30px rgba(115, 65, 30, 0.1);
    --header-shadow: 0 5px 0 #e9bd71;
    --nav-shadow: 0 -5px 0 #e9bd71;
    --modal-shadow: 0 18px 0 #d8aa6c, 0 26px 75px rgba(67, 40, 20, 0.25);
    --toast-shadow: 0 8px 25px rgba(67, 40, 20, 0.3);
    --card-radius: 25px;
    --card-border-style: dashed;
  }
  * { box-sizing: border-box; }
  body { margin: 0; min-width: 320px; background: var(--page-bg); }
  :root[data-theme="dog"] body {
    background-image: url('/dog-pattern.svg'), radial-gradient(circle at 95% 4%, #ffe4a3 0, transparent 42%);
    background-size: 180px 180px, auto;
  }
  :root[data-theme="dog"] h1 { text-shadow: 2px 3px 0 #ffdfa2; }
  button, input, select, textarea { font: inherit; }
  button { cursor: pointer; }
  a { color: inherit; text-decoration: none; }
  :focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
  ::selection { background: var(--gold); color: var(--on-gold); }
`;
export const Page = styled.main`
  max-width: 1130px;
  margin: 0 auto;
  padding: 28px 18px 120px;
  @media (min-width: 700px) {
    padding: 38px 32px 70px;
  }
`;
export const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 27px;
`;
export const Eyebrow = styled.div`
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.13em;
  font-size: 11px;
  font-weight: 800;
  margin-bottom: 7px;
`;
export const Title = styled.h1`
  font-family: Outfit, sans-serif;
  font-size: clamp(32px, 6vw, 46px);
  line-height: 1.05;
  letter-spacing: -0.045em;
  margin: 0 0 8px;
  font-weight: 700;
`;
export const Subtitle = styled.p`
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
`;
export const Card = styled.div`
  background: var(--surface);
  border: 1px var(--card-border-style) var(--border-soft);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
`;
export const Button = styled.button<{
  $variant?: "primary" | "secondary" | "ghost" | "danger";
  $small?: boolean;
}>`
  border: 1px solid
    ${({ $variant }) =>
      $variant === "primary"
        ? "var(--accent)"
        : $variant === "danger"
          ? "var(--danger-border)"
          : "var(--border)"};
  background: ${({ $variant }) =>
    $variant === "primary"
      ? "var(--accent)"
      : $variant === "danger"
        ? "var(--danger-bg)"
        : $variant === "ghost"
          ? "transparent"
          : "var(--surface)"};
  color: ${({ $variant }) =>
    $variant === "primary"
      ? "var(--on-accent)"
      : $variant === "danger"
        ? "var(--danger)"
        : "var(--accent-text)"};
  border-radius: 13px;
  min-height: ${({ $small }) => ($small ? "36px" : "44px")};
  padding: ${({ $small }) => ($small ? "7px 12px" : "10px 16px")};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 700;
  font-size: 13px;
  line-height: 1.2;
  transition:
    transform 0.16s ease,
    background 0.16s ease;
  &:hover {
    transform: translateY(-1px);
  }
  :root[data-theme="dog"] &:hover:not(:disabled) {
    transform: translateY(-2px) rotate(-1deg);
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    :root[data-theme="dog"] &:hover:not(:disabled) {
      transform: none;
    }
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }
`;
export const IconButton = styled(Button)`
  padding: 0;
  width: 44px;
  flex: none;
`;
export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;
export const Stack = styled.div<{ $gap?: number }>`
  display: grid;
  gap: ${({ $gap }) => $gap ?? 16}px;
`;
export const Grid = styled.div<{ $min?: number }>`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, ${({ $min }) => $min ?? 260}px), 1fr)
  );
`;
export const SectionTitle = styled.h2`
  font-family: Outfit, sans-serif;
  font-size: 21px;
  letter-spacing: -0.03em;
  margin: 0;
`;
export const Field = styled.label`
  display: grid;
  gap: 7px;
  font-weight: 700;
  font-size: 12px;
  color: var(--muted-strong);
`;
export const FieldError = styled.span`
  color: var(--danger);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
`;
export const ErrorSummary = styled.div`
  border: 1px solid var(--danger-border);
  background: var(--danger-bg);
  color: var(--danger);
  border-radius: 14px;
  padding: 13px 16px;
  font-size: 13px;
  font-weight: 700;
`;
export const Input = styled.input`
  width: 100%;
  min-height: 45px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 12px;
  padding: 10px 13px;
  color: var(--text);
  &::placeholder { color: var(--muted); opacity: 0.9; }
  outline: none;
  &:focus {
    border-color: var(--accent-border);
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
  &[aria-invalid="true"] {
    border-color: var(--danger);
    background: var(--danger-bg);
  }
  &[aria-invalid="true"]:focus {
    box-shadow: 0 0 0 3px var(--danger-ring);
  }
`;
export const Select = styled.select`
  width: 100%;
  min-height: 45px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 12px;
  padding: 10px 13px;
  color: var(--text);
  outline: none;
  &:focus {
    border-color: var(--accent-border);
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
  &[aria-invalid="true"] {
    border-color: var(--danger);
    background: var(--danger-bg);
  }
  &[aria-invalid="true"]:focus {
    box-shadow: 0 0 0 3px var(--danger-ring);
  }
`;
export const Textarea = styled.textarea`
  width: 100%;
  min-height: 90px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 12px;
  padding: 10px 13px;
  color: var(--text);
  &::placeholder { color: var(--muted); opacity: 0.9; }
  resize: vertical;
  outline: none;
  &:focus {
    border-color: var(--accent-border);
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
`;
export const Muted = styled.span`
  color: var(--muted);
  font-size: 13px;
`;
export const Badge = styled.span<{ $tone?: "green" | "amber" | "gray" }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border-radius: 99px;
  padding: 5px 9px;
  font-size: 11px;
  font-weight: 800;
  background: ${({ $tone }) =>
    $tone === "green" ? "var(--accent-soft)" : $tone === "gray" ? "var(--badge-gray-bg)" : "var(--badge-amber-bg)"};
  color: ${({ $tone }) =>
    $tone === "green" ? "var(--accent-text)" : $tone === "gray" ? "var(--badge-gray-text)" : "var(--badge-amber-text)"};
`;
