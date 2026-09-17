import { createGlobalStyle, styled } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root { font-family: 'DM Sans', sans-serif; color: #22352d; background: #f7f6f1; font-synthesis: none; }
  * { box-sizing: border-box; }
  body { margin: 0; min-width: 320px; }
  button, input, select, textarea { font: inherit; }
  button { cursor: pointer; }
  a { color: inherit; text-decoration: none; }
  :focus-visible { outline: 3px solid #e4a551; outline-offset: 3px; }
  ::selection { background: #f8db9e; }
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
  color: #718176;
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
  color: #6e7c72;
  font-size: 14px;
  line-height: 1.6;
`;
export const Card = styled.div`
  background: #fff;
  border: 1px solid #e9ece5;
  border-radius: 21px;
  box-shadow: 0 8px 24px rgba(33, 61, 45, 0.035);
`;
export const Button = styled.button<{
  $variant?: "primary" | "secondary" | "ghost" | "danger";
  $small?: boolean;
}>`
  border: 1px solid
    ${({ $variant }) =>
      $variant === "primary"
        ? "#254b38"
        : $variant === "danger"
          ? "#eacbc4"
          : "#e1e7df"};
  background: ${({ $variant }) =>
    $variant === "primary"
      ? "#254b38"
      : $variant === "danger"
        ? "#fff5f2"
        : $variant === "ghost"
          ? "transparent"
          : "#fff"};
  color: ${({ $variant }) =>
    $variant === "primary"
      ? "#fff"
      : $variant === "danger"
        ? "#a34232"
        : "#254b38"};
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
  color: #42594a;
`;
export const Input = styled.input`
  width: 100%;
  min-height: 45px;
  border: 1px solid #dce4da;
  background: #fff;
  border-radius: 12px;
  padding: 10px 13px;
  color: #22352d;
  outline: none;
  &:focus {
    border-color: #6b9a79;
    box-shadow: 0 0 0 3px #e0eee2;
  }
`;
export const Select = styled.select`
  width: 100%;
  min-height: 45px;
  border: 1px solid #dce4da;
  background: #fff;
  border-radius: 12px;
  padding: 10px 13px;
  color: #22352d;
  outline: none;
  &:focus {
    border-color: #6b9a79;
    box-shadow: 0 0 0 3px #e0eee2;
  }
`;
export const Textarea = styled.textarea`
  width: 100%;
  min-height: 90px;
  border: 1px solid #dce4da;
  background: #fff;
  border-radius: 12px;
  padding: 10px 13px;
  color: #22352d;
  resize: vertical;
  outline: none;
  &:focus {
    border-color: #6b9a79;
    box-shadow: 0 0 0 3px #e0eee2;
  }
`;
export const Muted = styled.span`
  color: #758277;
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
    $tone === "green" ? "#e8f3e8" : $tone === "gray" ? "#eef0ec" : "#fff1d9"};
  color: ${({ $tone }) =>
    $tone === "green" ? "#327047" : $tone === "gray" ? "#68746c" : "#9b6a20"};
`;
