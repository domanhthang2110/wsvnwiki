"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import screenfull from "screenfull";
import { TalentTreeItem, TalentItem, TalentLevelValue } from "@/types/talents";
import InfoModal from "@/components/ui/InfoModal";
import Dropdown from "@/components/ui/Dropdown/Dropdown";
import GridCell from "./GridCell";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import TotalTalentCostDisplay from "./TotalTalentCostDisplay";
import LongButton from "@/components/ui/LongButton";
import { useTalentTreeInteractiveStore } from "./talent-tree-store";
import Image from "next/image";
interface TalentTreeViewProps {
  talentTree: TalentTreeItem;
  talents: TalentItem[];
}

const TalentTreeView: React.FC<TalentTreeViewProps> = ({
  talentTree,
  talents,
}) => {
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const transformWrapperRef = useRef<ReactZoomPanPinchRef>(null);
  const talentTreeContainerRef = useRef<HTMLDivElement>(null);

  const {
    selectedTalent,
    modalLevel,
    selectedTalentLevels,
    setTalentTreeData,
    setTalentLevel,
    setSelectedTalent,
    setModalLevel,
    reset,
    nodes,
    edges,
    talentInfoMap,
    nodeMap,
  } = useTalentTreeInteractiveStore();

  useEffect(() => {
    if (talentTree.talents_data) {
      setTalentTreeData(talentTree.talents_data, talents);
    }
  }, [talentTree, talents, setTalentTreeData]);

  const handleConfirmTalentLevel = (talentId: number, level: number) => {
    setTalentLevel(talentId, level);
    setSelectedTalent(null);
  };

  const handleFullscreen = () => {
    if (screenfull.isEnabled && talentTreeContainerRef.current) {
      screenfull.toggle(talentTreeContainerRef.current);
      setIsFullscreen(!isFullscreen);
    }
  };

  const { totalCost, costBreakdown } = useMemo(() => {
    const breakdown: { name: string; level: number; cost: number }[] = [];
    let total = 0;
    const processedGroupIds = new Set<string>();

    for (const [talentId, level] of selectedTalentLevels.entries()) {
      if (level > 0) {
        const talent = talentInfoMap.get(talentId);
        const node = nodes.find((n) => n.talent_id === talentId);

        if (talent?.knowledge_levels) {
          if (node?.group_id) {
            if (!processedGroupIds.has(node.group_id)) {
              const groupNodes = nodes.filter(
                (n) => n.group_id === node.group_id
              );
              const mainNode =
                groupNodes.find((n) => n.is_group_main) || groupNodes[0];
              const mainTalent = talentInfoMap.get(mainNode.talent_id);

              if (mainTalent?.knowledge_levels) {
                let talentCost = 0;
                for (
                  let i = 1;
                  i <= (selectedTalentLevels.get(mainTalent.id) || 0);
                  i++
                ) {
                  talentCost += mainTalent.knowledge_levels[i] || 0;
                }
                if (talentCost > 0) {
                  breakdown.push({
                    name: "Talent cluster",
                    level: selectedTalentLevels.get(mainTalent.id) || 0,
                    cost: talentCost,
                  });
                  total += talentCost;
                }
              }
              processedGroupIds.add(node.group_id);
            }
          } else {
            let talentCost = 0;
            for (let i = 1; i <= level; i++) {
              talentCost += talent.knowledge_levels[i] || 0;
            }
            if (talentCost > 0) {
              breakdown.push({
                name: talent.name,
                level: level,
                cost: talentCost,
              });
              total += talentCost;
            }
          }
        }
      }
    }
    return { totalCost: total, costBreakdown: breakdown };
  }, [selectedTalentLevels, talentInfoMap, nodes]);

  const talentCellSize = "48px";
  const arrowCellSize = "34px";

  // --- ARROW POSITIONING ---
  // You can adjust these values to fine-tune the arrow positions for each direction.
  const arrowOffsets = {
    up: { x: 12, y: -5 },
    down: { x: 12, y: 6 },
    left: { x: 5, y: 12 },
    right: { x: 5, y: 12 },
    composite_target_offset: { x: 0, y: -6 },
  };
  // -------------------------

  const { treeWidth, treeHeight, columnOffsets, rowOffsets, minX, minY } = useMemo(() => {
  const talentWidth = parseInt(talentCellSize, 10);
  const arrowWidth = parseInt(arrowCellSize, 10);

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x);
    maxY = Math.max(maxY, node.y);
  }

  const normalizedWidth = maxX - minX + 1;
  const normalizedHeight = maxY - minY + 1;

  const colOffsets = [0];
  for (let i = 0; i < normalizedWidth; i++) {
    const prevOffset = colOffsets[i];
    const width = (i + minX) % 2 === 0 ? talentWidth : arrowWidth;
    colOffsets.push(prevOffset + width);
  }

  const rowOffsets = [0];
  for (let i = 0; i < normalizedHeight; i++) {
    const prevOffset = rowOffsets[i];
    const height = (i + minY) % 2 === 0 ? talentWidth : arrowWidth;
    rowOffsets.push(prevOffset + height);
  }

  return {
    treeWidth: colOffsets[normalizedWidth - 1] + talentWidth,
    treeHeight: rowOffsets[normalizedHeight - 1] + talentWidth,
    columnOffsets: colOffsets,
    rowOffsets: rowOffsets,
    minX,
    minY
  };
}, [nodes, talentCellSize, arrowCellSize]);


  React.useEffect(() => {
    if (transformWrapperRef.current && treeWidth > 0 && treeHeight > 0) {
      setTimeout(() => {
        transformWrapperRef.current?.centerView();
      }, 100);
    }
  }, [treeWidth, treeHeight, talentTree]);

  if (
    !talentTree.talents_data ||
    !Array.isArray(talentTree.talents_data.nodes)
  ) {
    return <p>Đang tải...</p>;
  }

  return (
    <div
      ref={talentTreeContainerRef}
      className="flex flex-1 flex-row relative min-h-[320px]"
    >
      <TransformWrapper
        ref={transformWrapperRef}
        initialScale={1}
        minScale={0.5}
        maxScale={2}
        limitToBounds={false}
        centerOnInit={true}
        panning={{ velocityDisabled: true }}
        wheel={{ disabled: true }}
        doubleClick={{ disabled: true }}
      >
        <div className="relative w-full h-full overflow-hidden bg-gray-900/30">
          <div className="absolute top-2 left-2 z-10 flex flex-col space-y-2">
            <LongButton
              width={40}
              onClick={() => setIsCalculatorVisible(!isCalculatorVisible)}
            >
              <Image
                src="/image/talents/calculator.svg"
                fill
                alt="Toggle Calculator"
                className="w-full h-full p-1.5"
              />
            </LongButton>
            <LongButton
              width={40}
              onClick={() => {
                transformWrapperRef.current?.centerView();
              }}
            >
              <Image
                src="/image/reset_view_icon.svg"
                fill
                alt="Reset View"
                className="w-full h-full p-1.5"
              />
            </LongButton>
            <LongButton width={40} onClick={handleFullscreen}>
              <Image
                src={
                  isFullscreen
                    ? "/image/talents/fullscreen_exit.svg"
                    : "/image/talents/fullscreen.svg"
                }
                fill
                alt="Fullscreen"
                className="w-full h-full p-1.5"
              />
            </LongButton>
          </div>
          {isCalculatorVisible && (
            <div className="absolute top-0 right-0 z-10 h-full">
              <TotalTalentCostDisplay
                totalCost={totalCost}
                costBreakdown={costBreakdown}
                onReset={reset}
              />
            </div>
          )}
          <TransformComponent
            wrapperStyle={{
              width: "100%",
              height: "100%",
              display: "flex",
              overflow: "hidden",
              paddingTop: "20px",
            }}
            contentStyle={{
              width: "100%",
              height: "100%",
            }}
            contentClass="w-full h-full flex items-center justify-center"
          >
            <div
              className="relative"
              style={{
                width: `${treeWidth}px`,
                height: `${treeHeight}px`,
              }}
            >
              {nodes.map((node) => {
                const left = columnOffsets[node.x - minX];
                const top = rowOffsets[node.y - minY];

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
                      isArrowActive={false}
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
                const compositeOffset =
                  direction === "down" && targetNode?.node_type === "composite"
                    ? arrowOffsets.composite_target_offset
                    : { x: 0, y: 0 };

                const left = columnOffsets[arrowX - minX] + baseOffset.x + compositeOffset.x;
                const top = rowOffsets[arrowY - minY] + baseOffset.y + compositeOffset.y;

                const isArrowActive =
                  (selectedTalentLevels.get(targetNode.talent_id) || 0) > 0;

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
                      isArrowActive={isArrowActive}
                    />
                  </div>
                );
              })}
            </div>
          </TransformComponent>
        </div>
      </TransformWrapper>
      {selectedTalent && (
        <InfoModal
          data={selectedTalent}
          isOpen={!!selectedTalent}
          onClose={() => setSelectedTalent(null)}
          title={selectedTalent.name}
          iconUrl={selectedTalent.icon_url ?? undefined}
          width="334px"
          footer={() => (
            <div className="flex justify-between w-full">
              <LongButton
                onClick={() => setSelectedTalent(null)}
                text="Hủy"
                width={100}
              />
              <LongButton
                onClick={() => {
                  handleConfirmTalentLevel(selectedTalent.id, modalLevel);
                }}
                text="Lưu"
                width={100}
              />
            </div>
          )}
        >
          <div className="mt-4">
            <div className="flex items-center justify-center mb-4">
              <Dropdown
                title={`${modalLevel} / ${selectedTalent.max_level}`}
                width="188px"
                showArrows
                dropdownDisabled={true}
                onPrevious={() => setModalLevel(Math.max(0, modalLevel - 1))}
                onNext={() =>
                  setModalLevel(
                    Math.min(selectedTalent.max_level || 0, modalLevel + 1)
                  )
                }
              >
                {/* This content will not be shown, but it's required by the component */}
                <div></div>
              </Dropdown>
            </div>
            <div className="min-h-[6em]">
              <p className="text-gray-300 mb-4">
                {(() => {
                  if (
                    !selectedTalent.description ||
                    !selectedTalent.level_values
                  ) {
                    return selectedTalent.description;
                  }

                  const placeholder = /{\w+}/g;
                  const match =
                    selectedTalent.description.match(placeholder);
                  if (!match) {
                    return selectedTalent.description;
                  }

                  const key = match[0].slice(1, -1);

                  if (modalLevel === 0) {
                    const allValues = selectedTalent.level_values
                      .map((lv: TalentLevelValue) => lv[key])
                      .join(" / ");
                    return selectedTalent.description.replace(
                      placeholder,
                      allValues
                    );
                  }

                  const levelValue = selectedTalent.level_values.find(
                    (lv: TalentLevelValue) => lv.level === modalLevel
                  );
                  if (levelValue) {
                    return selectedTalent.description.replace(
                      placeholder,
                      String(levelValue[key] ?? '')
                    );
                  }
                  return selectedTalent.description;
                })()}
              </p>
            </div>
          </div>
        </InfoModal>
      )}
    </div>
  );
};

export default TalentTreeView;
