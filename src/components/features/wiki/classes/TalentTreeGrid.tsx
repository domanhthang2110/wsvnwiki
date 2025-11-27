"use client";

import React, { useMemo } from "react";
import { TalentNode } from "@/types/talents";
import GridCell from "./GridCell";

interface TalentTreeGridProps {
    nodes: TalentNode[];
    edges: { source: string; target: string }[];
    columnOffsets: number[];
    rowOffsets: number[];
    minX: number;
    minY: number;
    talentCellSize: string;
    arrowCellSize: string;
    compositeFrameSettings: {
        scale: number;
        offset: { x: number; y: number };
        rowHeightMultiplier: number;
    };
    treeWidth: number;
    treeHeight: number;
    nodeMap: Map<string, TalentNode>;
}

const TalentTreeGrid: React.FC<TalentTreeGridProps> = ({
    nodes,
    edges,
    columnOffsets,
    rowOffsets,
    minX,
    minY,
    talentCellSize,
    arrowCellSize,
    compositeFrameSettings,
    treeWidth,
    treeHeight,
    nodeMap,
}) => {
    // --- ARROW POSITIONING ---
    const arrowOffsets = {
        up: { x: 7, y: -5 },
        down: { x: 7, y: 1 },
        left: { x: 2, y: 8 },
        right: { x: 1, y: 8 },
    };

    return (
        <div
            className="relative"
            style={{
                width: `${treeWidth}px`,
                height: `${treeHeight}px`,
                contentVisibility: "auto",
                containIntrinsicSize: `${treeWidth}px ${treeHeight}px`,
            }}
        >
            {nodes.map((node) => {
                const left = columnOffsets[node.x - minX];
                let top = rowOffsets[node.y - minY];

                // Check if this node is in a composite row and center it vertically
                const isCompositeRow = nodes.some(
                    (n) => n.y === node.y && n.is_group_main
                );
                if (isCompositeRow) {
                    const normalTalentHeight = parseInt(talentCellSize, 10);
                    const compositeRowHeight =
                        normalTalentHeight * compositeFrameSettings.rowHeightMultiplier;
                    const verticalOffset = (compositeRowHeight - normalTalentHeight) / 2;
                    top += verticalOffset;
                }

                return (
                    <div
                        key={`node-${node.id}`}
                        className="absolute"
                        style={{ top: `${top}px`, left: `${left}px` }}
                    >
                        <GridCell
                            node={node}
                            arrow={undefined}
                            talentCellSize={talentCellSize}
                            arrowCellSize={arrowCellSize}
                            compositeFrameSettings={compositeFrameSettings}
                        />
                    </div>
                );
            })}
            {edges.map((edge) => {
                const sourceNode = nodeMap.get(edge.source);
                const targetNode = nodeMap.get(edge.target);
                if (!sourceNode || !targetNode) return null;

                const arrowX = (sourceNode.x + targetNode.x) / 2;
                const arrowY = (sourceNode.y + targetNode.y) / 2;

                let direction: "up" | "down" | "left" | "right" | "" = "";
                if (sourceNode.x < targetNode.x) direction = "right";
                else if (sourceNode.x > targetNode.x) direction = "left";
                else if (sourceNode.y < targetNode.y) direction = "down";
                else if (sourceNode.y > targetNode.y) direction = "up";

                const baseOffset = direction ? arrowOffsets[direction] : { x: 0, y: 0 };

                const left = columnOffsets[arrowX - minX] + baseOffset.x;
                const top = rowOffsets[arrowY - minY] + baseOffset.y;

                return (
                    <div
                        key={`arrow-${edge.source}-${edge.target}`}
                        className="absolute"
                        style={{ top: `${top}px`, left: `${left}px` }}
                    >
                        <GridCell
                            node={undefined}
                            arrow={{ direction, targetNodeId: targetNode.id }}
                            talentCellSize={talentCellSize}
                            arrowCellSize={arrowCellSize}
                            compositeFrameSettings={compositeFrameSettings}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default React.memo(TalentTreeGrid);
