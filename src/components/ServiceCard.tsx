import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, MoreHorizontal, Pencil, RotateCcw, X } from "lucide-react";
import { styled } from "styled-components";
import { useApp } from "../context/AppContext";
import type { Dog, Service } from "../types";
import { useLanguage } from "../i18n/LanguageContext";
import { Badge, Button, Card, Muted, Row } from "../styles";
import { ServiceFormModal } from "./ServiceFormModal";

const Wrap = styled(Card)`
  padding: 15px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;
const Avatar = styled.div`
  height: 43px;
  width: 43px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: var(--accent-soft);
  color: var(--accent-text);
  font:
    700 18px Outfit,
    sans-serif;
  flex: none;
`;
const Body = styled.div`
  min-width: 0;
  flex: 1;
`;
const Name = styled(Link)`
  font:
    700 16px Outfit,
    sans-serif;
  &:hover {
    text-decoration: underline;
  }
`;
const Menu = styled.div`
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  margin-top: 12px;
`;
export const ServiceCard = ({
  service,
  dog,
  showGroup = false,
}: {
  service: Service;
  dog: Dog;
  showGroup?: boolean;
}) => {
  const { setServiceStatus } = useApp();
  const { t, group, status } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <Wrap>
        <Avatar aria-hidden="true">{dog.name.charAt(0).toUpperCase()}</Avatar>
        <Body>
          <Row style={{ gap: 5 }}>
            <Name to={`/dogs/${dog.id}`}>{dog.name}</Name>
          </Row>
          <Row style={{ marginTop: 6, gap: 8 }}>
            {showGroup && <Muted>{group(service.group)}</Muted>}
            <Badge
              $tone={
                service.status === "completed"
                  ? "green"
                  : service.status === "cancelled"
                    ? "gray"
                    : "amber"
              }
            >
              {status(service.status)}
            </Badge>
          </Row>
          {service.status === "scheduled" && (
            <Menu>
              <Button
                type="button"
                $small
                $variant="primary"
                onClick={() => setServiceStatus(service.id, "completed")}
              >
                <Check size={15} /> {t("Complete")}
              </Button>
              <Button
                type="button"
                $small
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
              >
                <MoreHorizontal size={15} /> {t("More")}
              </Button>
            </Menu>
          )}
          {service.status !== "scheduled" && (
            <Menu>
              <Button
                type="button"
                $small
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
              >
                <MoreHorizontal size={15} /> {t("More")}
              </Button>
            </Menu>
          )}
          {expanded && (
            <Menu>
              <Button type="button" $small onClick={() => setEditing(true)}>
                <Pencil size={14} /> {t("Edit")}
              </Button>
              {service.status === "scheduled" ? (
                <Button
                  type="button"
                  $small
                  $variant="danger"
                  onClick={() => setServiceStatus(service.id, "cancelled")}
                >
                  <X size={14} /> {t("Cancel service")}
                </Button>
              ) : (
                <Button
                  type="button"
                  $small
                  onClick={() => setServiceStatus(service.id, "scheduled")}
                >
                  <RotateCcw size={14} /> {t("Restore to schedule")}
                </Button>
              )}
            </Menu>
          )}
        </Body>
      </Wrap>
      {editing && (
        <ServiceFormModal service={service} onClose={() => setEditing(false)} />
      )}
    </>
  );
};
