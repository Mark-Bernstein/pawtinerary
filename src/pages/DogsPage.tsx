import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { styled } from "styled-components";
import { useApp } from "../context/AppContext";
import { formatShortDay, todayKey } from "../utils/dates";
import { currency } from "../utils/earnings";
import {
  Button,
  Card,
  Eyebrow,
  Grid,
  Input,
  Muted,
  Page,
  Row,
  Subtitle,
  Title,
  TopRow,
} from "../styles";
import { EmptyState } from "../components/EmptyState";

const DogLink = styled(Link)`
  display: block;
  &:hover > div {
    border-color: #aacbb1;
    transform: translateY(-2px);
  }
`;
const DogCard = styled(Card)`
  padding: 20px;
  transition:
    transform 0.15s,
    border-color 0.15s;
`;
const Avatar = styled.div`
  height: 52px;
  width: 52px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: #e4efe3;
  color: #336b49;
  font:
    700 23px Outfit,
    sans-serif;
`;
const SearchWrap = styled.div`
  max-width: 370px;
  position: relative;
  margin-bottom: 20px;
  svg {
    position: absolute;
    left: 13px;
    top: 13px;
    color: #859488;
  }
  input {
    padding-left: 41px;
  }
`;
export const DogsPage = () => {
  const { data } = useApp();
  const [query, setQuery] = useState("");
  const dogs = data.dogs
    .filter((dog) =>
      `${dog.name} ${dog.ownerName}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <Page>
      <TopRow>
        <div>
          <Eyebrow>YOUR COMPANIONS</Eyebrow>
          <Title>Dogs</Title>
          <Subtitle>
            Every profile, detail, and upcoming visit in one place.
          </Subtitle>
        </div>
        <Button $variant="primary" as={Link} to="/dogs/new">
          <Plus size={17} /> Create Dog
        </Button>
      </TopRow>
      {data.dogs.length > 0 && (
        <SearchWrap>
          <Search size={18} />
          <Input
            aria-label="Search dogs"
            placeholder="Search dogs or clients"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </SearchWrap>
      )}
      {dogs.length ? (
        <Grid>
          {dogs.map((dog) => {
            const upcoming = data.services
              .filter(
                (service) =>
                  service.dogId === dog.id &&
                  service.status === "scheduled" &&
                  service.date >= todayKey(),
              )
              .sort((a, b) => a.date.localeCompare(b.date));
            return (
              <DogLink to={`/dogs/${dog.id}`} key={dog.id}>
                <DogCard>
                  <Row style={{ gap: 13 }}>
                    <Avatar>{dog.name.charAt(0).toUpperCase()}</Avatar>
                    <div>
                      <strong style={{ font: "700 21px Outfit, sans-serif" }}>
                        {dog.name}
                      </strong>
                      <div>
                        <Muted>{dog.ownerName || "No client name yet"}</Muted>
                      </div>
                    </div>
                  </Row>
                  <div
                    style={{
                      borderTop: "1px solid #edf0eb",
                      marginTop: 20,
                      paddingTop: 15,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div>
                      <Muted>Hourly rate</Muted>
                      <div style={{ fontWeight: 800 }}>
                        {currency(dog.hourlyRate)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Muted>{upcoming.length} upcoming</Muted>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>
                        {upcoming[0]
                          ? formatShortDay(upcoming[0].date)
                          : "No visits planned"}
                      </div>
                    </div>
                  </div>
                </DogCard>
              </DogLink>
            );
          })}
        </Grid>
      ) : (
        <EmptyState
          title={
            data.dogs.length
              ? "No dogs match your search."
              : "No dogs yet. Create your first dog to get started."
          }
          action={
            data.dogs.length ? undefined : (
              <Button as={Link} to="/dogs/new" $variant="primary">
                <Plus size={16} /> Create Dog
              </Button>
            )
          }
        />
      )}
    </Page>
  );
};
