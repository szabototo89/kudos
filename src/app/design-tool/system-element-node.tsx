import { SystemElementIDSchema } from "@/db/entities/system-element/schema";
import { Badge, Button, Card, Group, Text } from "@mantine/core";
import { Handle, Position, useNodeId } from "reactflow";
import { SystemTechnologyInfoHoverCard } from "./(components)/system-technology-info-hover-card";
import { useQuerySystemElementByID } from "./(components)/system-element-hooks";
import { useExpandedGraphElements } from "./app-state";

export function SystemElementNode() {
  const id = SystemElementIDSchema.parse(useNodeId());
  const systemElement = useQuerySystemElementByID(id);
  const setExpanded = useExpandedGraphElements();

  if (systemElement.isLoading) {
    return null;
  }

  const childrenCount = systemElement.data?.children.length ?? 0;
  const hasChildren = childrenCount > 0;

  return (
    <>
      <Card shadow="sm" padding="md" radius="md" withBorder maw={300}>
        <Card.Section inheritPadding>
          <Group justify="space-between" mt="md" mb="md">
            <Group gap={4} align="baseline">
              <Text size="xs" fw={500} inline>
                {systemElement.data?.name}
              </Text>
              {hasChildren && (
                <Text size="xs" c="dimmed" inline>
                  ({childrenCount})
                </Text>
              )}
            </Group>

            <Badge size="xs" variant="light">
              {systemElement.data?.type}
            </Badge>
          </Group>
        </Card.Section>

        <Text size="xs" c="dimmed" lineClamp={4}>
          {systemElement.data?.description}
        </Text>

        <Group mt="md" gap={2}>
          {systemElement.data?.technologies.map((technology) => (
            <SystemTechnologyInfoHoverCard
              key={technology.id}
              systemTechnology={technology}
            >
              <Badge size="xs" variant="white">
                {technology.name}
              </Badge>
            </SystemTechnologyInfoHoverCard>
          ))}
        </Group>
        {hasChildren && (
          <Card.Section>
            <Group justify="end">
              <Button
                size="compact-xs"
                variant="transparent"
                onClick={() => setExpanded(id, true)}
              >
                Expand
              </Button>
            </Group>
          </Card.Section>
        )}
      </Card>
      <>
        <Handle position={Position.Top} type="target" />
        <Handle position={Position.Bottom} type="source" />
      </>
    </>
  );
}
