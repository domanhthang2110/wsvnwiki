"use client";

import React from "react";
import { TalentNode } from "@/types/talents";
import IconFrame from "@/components/shared/IconFrame";
import FreeCompositeFrame from "@/components/ui/FreeCompositeFrame";
import { useTalentTreeInteractiveStore } from "./talent-tree-store";
import Image from "next/image";
interface GridCellProps {
  node: TalentNode | undefined;
  arrow: { direction: string; targetNodeId: string } | undefined;
  talentCellSize: string;
  arrowCellSize: string;
  isArrowActive: boolean;
  compositeFrameSettings?: {
    scale: number;
    offset: { x: number; y: number };
    rowHeightMultiplier: number;
  };
}

const GridCell: React.FC<GridCellProps> = ({
  node,
  arrow,
  talentCellSize,
  arrowCellSize,
  isArrowActive,
  compositeFrameSettings,
}) => {
  const { talentInfoMap, selectedNodeLevels, setSelectedTalent, edges, nodeMap } =
    useTalentTreeInteractiveStore();

  const talent = node?.talent_id ? talentInfoMap.get(node.talent_id) : undefined;
  const level = node ? selectedNodeLevels.get(node.id) || 0 : 0;

  // Check if this talent is next to be unlocked (all parents unlocked and this is not unlocked itself)
  const isNextToUnlock = node && level === 0 && node.node_type !== 'free_composite' ? (() => {
    // Find parent edges (edges pointing to this node)
    const parentEdges = edges.filter(edge => edge.target === node.id);
    
    // If no parents, it's a root talent and can be unlocked
    if (parentEdges.length === 0) {
      return true;
    }
    
    // Check if ALL parents are unlocked
    return parentEdges.every(edge => {
      const parentNode = nodeMap.get(edge.source);
      if (!parentNode) return false;
      
      const parentLevel = selectedNodeLevels.get(parentNode.id) || 0;
      return parentLevel > 0;
    });
  })() : false;

  const onSelect = () => {
    if (talent && node) {
      setSelectedTalent(talent, node);
    }
  };
  // --- KEY/LESSER TALENT POSITIONING ---
  const keyTalentOffset = { x: -6, y: -6 };
  const lesserTalentOffset = { x: -5, y: -6 }; // Add separate offset for lesser talents
  // ------------------------------------

  // --- COMPOSITE FRAME POSITIONING ---
  const defaultCompositeSettings = {
    scale: 1.0,
    offset: { x: -101, y: -51 },
    rowHeightMultiplier: 2.5,
  };
  const frameSettings = compositeFrameSettings || defaultCompositeSettings;
  // ---------------------------------

  const frameType = node?.node_type === "key"
    ? "key"
    : node?.node_type === "lesser"
    ? "lesser"
    : "regular";

  if (node?.node_type === 'free_composite') {
    return (
      <div
        onClick={onSelect}
        style={{
          position: 'relative',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          left: `-22%`,
          width: '100%', // Ensure it takes full width of the cell
          height: '100%', // Ensure it takes full height of the cell
        }}
      >
        <FreeCompositeFrame
          isUnlocked={level > 0}
          imageUrl={node.icon_url || talent?.icon_url || undefined}
        />
      </div>
    );
  }

  const talentStyle: React.CSSProperties = {
    zIndex: 1,
    cursor: "pointer",
    position: 'relative',
  };

  if (frameType === 'key') {
    talentStyle.transform = `translate(${keyTalentOffset.x}px, ${keyTalentOffset.y}px)`;
  } else if (frameType === 'lesser') {
    talentStyle.transform = `translate(${lesserTalentOffset.x}px, ${lesserTalentOffset.y}px)`;
  }

  return (
    <div className={`relative flex items-center justify-center`}>
      {node && node.is_group_main && (
        <div
          className="absolute"
          style={{
            width: "250px",
            height: "150px",
            zIndex: 0,
            pointerEvents: "none",
            left: `${frameSettings.offset.x}px`,
            top: `${frameSettings.offset.y}px`,
            overflow: "visible",
            transform: `scale(${frameSettings.scale})`,
            transformOrigin: "center center",
          }}
        >
          <Image
            src="/image/talents/composite_talent.webp"
            alt="Composite Talent Frame"
            fill
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      )}
      {node && talent && (
        <div
          style={talentStyle}
          onClick={onSelect}
          title={talent.name || "Talent"}
        >
          <IconFrame
            size={parseInt(talentCellSize, 10)}
            styleType={level === 0 ? (isNextToUnlock ? "green" : "red") : "yellow"}
            altText={talent.name || "Talent"}
            contentImageUrl={node.icon_url || talent.icon_url || null}
            frameType={frameType}
          />
          {(talent.max_level > 1 || (talent.max_level === 1 && level === 0)) && (
            <div
              className="absolute bottom-0 right-0 text-white overflow-visible text-base px-1 py-0.5"
              style={{
                textShadow:
                  "2px 0 #000, -2px 0 #000, 0 2px #000, 0 -2px #000, 1px 1px #000, -1px -1px #000, 1px -1px #000, -1px 1px #000",
                zIndex: 2,
              }}
            >
              {level}/{talent.max_level}
            </div>
          )}
        </div>
      )}
      {arrow && (
        <div
          style={{
            width: parseInt(arrowCellSize),
            height: parseInt(arrowCellSize),
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            src="/image/talent_arrow.webp"
            alt={`Arrow pointing ${arrow.direction}`}
            className="object-contain"
            width={parseInt(arrowCellSize) * 0.65} // Adjust this multiplier
            height={parseInt(arrowCellSize) * 0.65} // Adjust this multiplier
            style={{
              transform:
                arrow.direction === "down"
                  ? "rotate(90deg)"
                  : arrow.direction === "left"
                  ? "rotate(180deg)"
                  : arrow.direction === "up"
                  ? "rotate(270deg)"
                  : "none",
              filter: isArrowActive ? "saturate(1)" : "saturate(0)",
              transition: "filter 0.3s ease-in-out",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(GridCell);
