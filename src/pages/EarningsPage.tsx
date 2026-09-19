import { useApp } from "../context/AppContext";
import { useLanguage } from "../i18n/LanguageContext";
import { getTotals } from "../utils/earnings";
import {
  Card,
  Eyebrow,
  Grid,
  Muted,
  Page,
  Row,
  SectionTitle,
  Stack,
  Subtitle,
  Title,
  TopRow,
} from "../styles";
import { EarningsCard } from "../components/EarningsCard";
import { EmptyState } from "../components/EmptyState";

export const EarningsPage = () => {
  const { data } = useApp();
  const { t, money } = useLanguage();
  return (
    <Page>
      <TopRow>
        <div>
          <Eyebrow>{t("THE BIG PICTURE")}</Eyebrow>
          <Title>{t("Earnings")}</Title>
          <Subtitle>
            {t("Completed sessions and scheduled income, clearly separated.")}
          </Subtitle>
        </div>
      </TopRow>
      <Grid style={{ marginBottom: 28 }}>
        <EarningsCard
          title={t("Today")}
          totals={getTotals(data.services, data.dogs, "day")}
        />
        <EarningsCard
          title={t("This Week")}
          totals={getTotals(data.services, data.dogs, "week")}
        />
        <EarningsCard
          title={t("This Month")}
          totals={getTotals(data.services, data.dogs, "month")}
        />
        <EarningsCard
          title={t("Lifetime")}
          totals={getTotals(data.services, data.dogs)}
        />
      </Grid>
      <Stack>
        <SectionTitle>{t("By dog")}</SectionTitle>
        {data.dogs.length ? (
          <Grid>
            {data.dogs.map((dog) => {
              const totals = getTotals(
                data.services,
                data.dogs,
                "lifetime",
                new Date(),
                dog.id,
              );
              return (
                <Card key={dog.id} style={{ padding: 20 }}>
                  <Row
                    style={{
                      justifyContent: "space-between",
                      marginBottom: 15,
                    }}
                  >
                    <strong style={{ font: "700 19px Outfit, sans-serif" }}>
                      {dog.name}
                    </strong>
                    <Muted>
                      {money(dog.rate)} / {t("session")}
                    </Muted>
                  </Row>
                  <Row style={{ justifyContent: "space-between" }}>
                    <div>
                      <Muted>{t("Earned")}</Muted>
                      <div style={{ fontWeight: 800 }}>
                        {money(totals.earned)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Muted>{t("Potential")}</Muted>
                      <div style={{ fontWeight: 800 }}>
                        {money(totals.potential)}
                      </div>
                    </div>
                  </Row>
                </Card>
              );
            })}
          </Grid>
        ) : (
          <EmptyState
            title={t("No earnings to show yet.")}
            description={t(
              "Create a dog and add a service to start tracking income.",
            )}
          />
        )}
      </Stack>
    </Page>
  );
};
