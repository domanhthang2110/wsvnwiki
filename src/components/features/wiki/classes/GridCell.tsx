"use client";

import React from "react";
import { TalentNode } from "@/types/talents";
import IconFrame from "@/components/shared/IconFrame";
import FreeCompositeFrame from "@/components/ui/FreeCompositeFrame";
import { useTalentTreeInteractiveStore } from "./talent-tree-store";

interface GridCellProps {
  node: TalentNode | undefined;
  arrow: { direction: string; targetNodeId: string } | undefined;
  talentCellSize: string;
  arrowCellSize: string;
  isArrowActive: boolean;
}

const GridCell: React.FC<GridCellProps> = ({
  node,
  arrow,
  talentCellSize,
  arrowCellSize,
  isArrowActive,
}) => {
  const { talentInfoMap, selectedTalentLevels, setSelectedTalent } =
    useTalentTreeInteractiveStore();

  const talent = node?.talent_id ? talentInfoMap.get(node.talent_id) : undefined;
  const level = talent ? selectedTalentLevels.get(talent.id) || 0 : 0;

  const onSelect = () => {
    if (talent) {
      setSelectedTalent(talent);
    }
  };
  // --- KEY TALENT POSITIONING ---
  const keyTalentOffset = { x: -3, y: -4 };
  // ----------------------------

  // --- COMPOSITE FRAME POSITIONING ---
  const compositeFrameOffset = { x: -101, y: -51 };
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
            left: `${compositeFrameOffset.x}px`,
            top: `${compositeFrameOffset.y}px`,
            overflow: "visible",
          }}
        >
          <img
            src="/image/talents/composite_talent.png"
            alt="Composite Talent Frame"
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
        >
          <IconFrame
            size={parseInt(talentCellSize, 10)}
            styleType={level === 0 ? "red" : "yellow"}
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
        <img
          src="/image/talent_arrow.svg"
          alt={`Arrow pointing ${arrow.direction}`}
          className="object-contain"
          style={{
            width: `calc(${arrowCellSize} * 0.7)`,
            height: `calc(${arrowCellSize} * 0.7)`,
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
      )}
    </div>
  );
};

export default React.memo(GridCell);
