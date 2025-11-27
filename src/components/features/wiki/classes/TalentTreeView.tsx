"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import screenfull from "screenfull";
import Image from "next/image";
import { TalentTreeItem, TalentItem } from "@/types/talents";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import LongButton from "@/components/ui/LongButton";
import { debounce } from "@/lib/utils";
import TalentTreeGrid from "./TalentTreeGrid";
import { useTalentTreeInteractiveStore } from "./talent-tree-store";
import TalentInfoModal from "./TalentInfoModal";
import TotalTalentCostDisplay from "./TotalTalentCostDisplay";

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
  const [isMobile, setIsMobile] = useState(false);
  const transformWrapperRef = useRef<ReactZoomPanPinchRef>(null);
  const talentTreeContainerRef = useRef<HTMLDivElement>(null);

  const setTalentTreeData = useTalentTreeInteractiveStore((state) => state.setTalentTreeData);
  const reset = useTalentTreeInteractiveStore((state) => state.reset);
  const nodes = useTalentTreeInteractiveStore((state) => state.nodes);
  const edges = useTalentTreeInteractiveStore((state) => state.edges);
  const nodeMap = useTalentTreeInteractiveStore((state) => state.nodeMap);

  useEffect(() => {
    if (talentTree.talents_data) {
      setTalentTreeData(talentTree.talents_data, talents);
    }
  }, [talentTree, talents, setTalentTreeData]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleFullscreen = () => {
    if (screenfull.isEnabled && talentTreeContainerRef.current) {
      screenfull.toggle(talentTreeContainerRef.current);
      setIsFullscreen(!isFullscreen);
    }
  };

  const talentCellSize = "48px";
  const arrowCellSize = "34px";

  // --- COMPOSITE FRAME SETTINGS ---
  const compositeFrameSettings = useMemo(() => ({
    scale: 1.0,           // Scale factor for composite frame size (1.0 = original size)
    offset: { x: -101, y: -51 }, // Position offset from talent center
    rowHeightMultiplier: 1.2,    // How much larger to make rows containing composite talents
  }), []);
  // --------------------------------

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
      const currentRow = i + minY;
      let height = (currentRow) % 2 === 0 ? talentWidth : arrowWidth;

      // Check if this row contains composite talents and make it larger
      if (currentRow % 2 === 0) { // Only talent rows, not arrow rows
        const hasCompositeInRow = nodes.some(node =>
          node.y === currentRow && node.is_group_main
        );
        if (hasCompositeInRow) {
          height = talentWidth * compositeFrameSettings.rowHeightMultiplier;
        }
      }

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
  }, [nodes, talentCellSize, arrowCellSize, compositeFrameSettings.rowHeightMultiplier]);

  const initialScale = isMobile ? 0.7 : 1;

  const initialPositionX = useMemo(() => {
    if (typeof window !== "undefined") {
      const containerWidth = Math.min(window.innerWidth, 1200);
      const scale = isMobile ? 0.7 : 1;
      return (containerWidth - treeWidth * scale) / 2;
    }
    return 0;
  }, [treeWidth, isMobile]);

  if (
    !talentTree.talents_data ||
    !Array.isArray(talentTree.talents_data.nodes)
  ) {
    return <p>Đang tải...</p>;
  }

  return (
    <div
      ref={talentTreeContainerRef}
      className="absolute inset-0 flex flex-col"
    >
      <div className="absolute top-2 left-2 z-50 flex flex-col space-y-2">
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
            if (transformWrapperRef.current) {
              const { setTransform } = transformWrapperRef.current;
              setTransform(initialPositionX, 0, initialScale);
            }
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
            onReset={reset}
          />
        </div>
      )}
      <div className="flex-1 min-h-0 bg-gray-900/30">
        <TransformWrapper
          key={`${isMobile ? "mobile" : "desktop"}-${treeWidth}`}
          ref={transformWrapperRef}
          initialScale={initialScale}
          initialPositionX={initialPositionX}
          initialPositionY={0}
          minScale={0.5}
          maxScale={2}
          limitToBounds={false}
          panning={{ velocityDisabled: true }}
          doubleClick={{ disabled: true }}
          onTransformed={debounce((ref, state) => {
            console.log(state);
          }, 100)}
        >
          <TransformComponent
            wrapperStyle={{
              width: "100%",
              height: "100%",
              transform: "translateZ(0)",
            }}
            contentStyle={{
              width: `${treeWidth}px`,
              height: `${treeHeight}px`,
              paddingTop: "20px",
            }}
            contentClass="flex items-center justify-center"
          >
            <TalentTreeGrid
              nodes={nodes}
              edges={edges}
              columnOffsets={columnOffsets}
              rowOffsets={rowOffsets}
              minX={minX}
              minY={minY}
              talentCellSize={talentCellSize}
              arrowCellSize={arrowCellSize}
              compositeFrameSettings={compositeFrameSettings}
              treeWidth={treeWidth}
              treeHeight={treeHeight}
              nodeMap={nodeMap}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>
      <TalentInfoModal />
    </div>
  );
};

export default TalentTreeView;
