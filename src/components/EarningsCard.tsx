import { styled } from "styled-components";
import type { Totals } from "../utils/earnings";
import { currency } from "../utils/earnings";
import { Card, Muted } from "../styles";

const Wrap = styled(Card)`
  padding: 19px;
`;
const Name = styled.h3`
  font:
    700 17px Outfit,
    sans-serif;
  margin: 0 0 15px;
`;
const Pair = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  strong {
    display: block;
    font:
      700 23px Outfit,
      sans-serif;
    margin-top: 3px;
  }
`;
export const EarningsCard = ({
  title,
  totals,
}: {
  title: string;
  totals: Totals;
}) => (
  <Wrap>
    <Name>{title}</Name>
    <Pair>
      <div>
        <Muted>Earned</Muted>
        <strong>{currency(totals.earned)}</strong>
      </div>
      <div>
        <Muted>Potential</Muted>
        <strong>{currency(totals.potential)}</strong>
      </div>
    </Pair>
  </Wrap>
);
