"use client";

import { SystemElement } from "@/db/entities/system-element/schema";
import ReactFlow, {
  useNodesState,
  type Node,
  type NodeTypes,
  useEdgesState,
  MarkerType,
  Edge,
  Background,
} from "reactflow";

import { useEffect, useMemo, useTransition } from "react";
import { SystemElementNode } from "../system-element-node";
import { SystemElementRelation } from "@/db/entities/system-element-relation/schema";

import "reactflow/dist/style.css";
import "../../../styles/app.reactflow.css";

import { SystemElementParentNode } from "./system-element-parent-node";

type Props = {
  systemElements: readonly SystemElement[];
  systemElementRelations: readonly SystemElementRelation[];

  onConnect?(options: { source: string; target: string }): void;
} & Pick<
  React.ComponentProps<typeof ReactFlow>,
  "onEdgeClick" | "onNodeClick" | "onNodeDoubleClick"
>;

const nodeTypes = {
  SystemElementNode,
  SystemElementParentNode,
} satisfies NodeTypes;

function makeReactFlowNodeFromSystemElement(
  systemElement: SystemElement,
  isParentNode: boolean,
): Node {
  return {
    id: systemElement.id,
    width: 200,
    height: 200,
    type: !isParentNode ? SystemElementNode.name : SystemElementParentNode.name,
    selectable: true,
    data: {},
    position: { x: 0, y: 0 },
    extent: systemElement.parentID != null ? "parent" : undefined,
    parentNode: systemElement.parentID ?? undefined,
  };
}

function makeReactFlowEdgeFromSystemElementRelation(
  systemElementRelation: SystemElementRelation,
) {
  return {
    id: systemElementRelation.id,
    source: systemElementRelation.sourceID,
    target: systemElementRelation.targetID,
    label: systemElementRelation.label,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 10,
      height: 10,
      color: "#A9B0BF",
    },
    style: {
      strokeWidth: 2,
      stroke: "#A9B0BF",
    },
  } satisfies Edge<unknown>;
}

export function GraphEditor(props: Props) {
  const parentSystemElements = useMemo(
    () =>
      new Set(
        props.systemElements
          .map((systemElement) => systemElement.parentID)
          .filter(Boolean),
      ),
    [props.systemElements],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(
    props.systemElements.map((systemElement, index) => {
      return {
        ...makeReactFlowNodeFromSystemElement(
          systemElement,
          parentSystemElements.has(systemElement.id),
        ),
        position: { x: index * 210, y: 0 },
      } satisfies Node;
    }),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    props.systemElementRelations.map(
      makeReactFlowEdgeFromSystemElementRelation,
    ),
  );

  useEffect(() => {
    setNodes((previousNodes) => {
      const previousNodesByID = Object.fromEntries(
        previousNodes.map((node) => [node.id, node]),
      );

      return props.systemElements
        .map((systemElement) =>
          makeReactFlowNodeFromSystemElement(
            systemElement,
            parentSystemElements.has(systemElement.id),
          ),
        )
        .map((systemElement) => {
          if (systemElement.id in previousNodesByID) {
            return previousNodesByID[systemElement.id];
          }

          return systemElement;
        });
    });
  }, [props.systemElements]);

  useEffect(() => {
    setEdges((previousEdges) => {
      const previousEdgesByID = Object.fromEntries(
        previousEdges.map((edge) => [edge.id, edge]),
      );

      return props.systemElementRelations
        .map(makeReactFlowEdgeFromSystemElementRelation)
        .map((systemElementRelation) => {
          if (systemElementRelation.id in previousEdgesByID) {
            return {
              ...previousEdgesByID[systemElementRelation.id],
              label: systemElementRelation.label,
            };
          }

          return systemElementRelation;
        });
    });
  }, [props.systemElementRelations]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      snapToGrid
      onConnect={(connection) => {
        props.onConnect?.({
          source: connection.source ?? "",
          target: connection.target ?? "",
        });
      }}
      nodeTypes={nodeTypes}
      onEdgeClick={props.onEdgeClick}
      onNodeClick={props.onNodeClick}
      onNodeDoubleClick={props.onNodeDoubleClick}
    >
      <Background />
    </ReactFlow>
  );
}
