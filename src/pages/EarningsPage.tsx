import { useApp } from "../context/AppContext";
import { currency, getTotals } from "../utils/earnings";
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
  return (
    <Page>
      <TopRow>
        <div>
          <Eyebrow>THE BIG PICTURE</Eyebrow>
          <Title>Earnings</Title>
          <Subtitle>
            Completed work and upcoming possibilities, clearly separated.
          </Subtitle>
        </div>
      </TopRow>
      <Grid style={{ marginBottom: 28 }}>
        <EarningsCard
          title="Today"
          totals={getTotals(data.services, data.dogs, "day")}
        />
        <EarningsCard
          title="This Week"
          totals={getTotals(data.services, data.dogs, "week")}
        />
        <EarningsCard
          title="This Month"
          totals={getTotals(data.services, data.dogs, "month")}
        />
        <EarningsCard
          title="Lifetime"
          totals={getTotals(data.services, data.dogs)}
        />
      </Grid>
      <Stack>
        <SectionTitle>By dog</SectionTitle>
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
                    <Muted>{currency(dog.hourlyRate)} / hr</Muted>
                  </Row>
                  <Row style={{ justifyContent: "space-between" }}>
                    <div>
                      <Muted>Earned</Muted>
                      <div style={{ fontWeight: 800 }}>
                        {currency(totals.earned)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Muted>Potential</Muted>
                      <div style={{ fontWeight: 800 }}>
                        {currency(totals.potential)}
                      </div>
                    </div>
                  </Row>
                </Card>
              );
            })}
          </Grid>
        ) : (
          <EmptyState
            title="No earnings to show yet."
            description="Create a dog and add a service to start tracking income."
          />
        )}
      </Stack>
    </Page>
  );
};
