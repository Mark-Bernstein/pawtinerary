import { styled } from "styled-components";
import type { Totals } from "../utils/earnings";
import { Card, Muted } from "../styles";
import { useLanguage } from "../i18n/LanguageContext";

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
}) => {
  const { t, money } = useLanguage();
  return (
    <Wrap>
      <Name>{title}</Name>
      <Pair>
        <div>
          <Muted>{t("Earned")}</Muted>
          <strong>{money(totals.earned)}</strong>
        </div>
        <div>
          <Muted>{t("Potential")}</Muted>
          <strong>{money(totals.potential)}</strong>
        </div>
      </Pair>
    </Wrap>
  );
};
