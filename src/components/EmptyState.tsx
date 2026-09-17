import { PawPrint } from "lucide-react";
import { styled } from "styled-components";
import type { ReactNode } from "react";
import { Card } from "../styles";

const Wrap = styled(Card)`
  padding: 28px 20px;
  text-align: center;
  display: grid;
  justify-items: center;
  gap: 10px;
  color: #708174;
  svg {
    color: #6a9677;
  }
  strong {
    color: #284935;
    font:
      600 17px Outfit,
      sans-serif;
  }
  p {
    margin: 0;
    max-width: 350px;
    font-size: 13px;
    line-height: 1.5;
  }
`;
export const EmptyState = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) => (
  <Wrap>
    <PawPrint size={26} />
    <strong>{title}</strong>
    {description && <p>{description}</p>}
    {action}
  </Wrap>
);
