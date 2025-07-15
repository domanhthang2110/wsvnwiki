'use client';

import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useTalentTreeStore } from './store';
import IconFrame from '@/components/shared/IconFrame';
import FreeCompositeFrame from '@/components/ui/FreeCompositeFrame';
import { TalentNode, TalentEdge } from '@/types/talents';
import Image from 'next/image';

const ItemTypes = {
  TALENT: 'talent',
};

interface GridCellProps {
  x: number;
  y: number;
  isTalentCell: boolean;
  onDropItem: (item: TalentNode & { isToolbarItem?: boolean }, newX: number, newY: number) => void;
  onContextMenu?: (event: React.MouseEvent, x: number, y: number) => void;
  children?: React.ReactNode;
}

const GridCell: React.FC<GridCellProps> = ({ x, y, isTalentCell, onDropItem, onContextMenu, children }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: [ItemTypes.TALENT],
    drop: (item: TalentNode & { isToolbarItem?: boolean }) => onDropItem(item, x, y),
    canDrop: () => isTalentCell && !useTalentTreeStore.getState().treeData.nodes.some(n => n.x === x && n.y === y),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  drop(ref);

  const isActive = isOver && canDrop;
  let backgroundColor = 'bg-gray-900/10';
  if (isTalentCell) {
    if (x === 4 || x === 8 || x === 12) {
      backgroundColor = 'bg-purple-900/30';
    } else {
      backgroundColor = 'bg-blue-900/30';
    }
    if (isActive) {
      backgroundColor = 'bg-blue-700/50';
    } else if (canDrop) {
      backgroundColor = 'bg-blue-900/40';
    }
  } else {
    backgroundColor = 'bg-gray-900/10';
  }

  const nodeOnCell = useTalentTreeStore(state => state.treeData.nodes.find(n => n.x === x && n.y === y));
  const style: React.CSSProperties = {};
  if (nodeOnCell?.node_type === 'free_composite') {
    style.overflow = 'visible';
  }

  return (
    <div
      ref={ref}
      className={`relative flex items-center justify-center border border-gray-800 ${backgroundColor}`}
      onContextMenu={onContextMenu ? (e) => onContextMenu(e, x, y) : undefined}
      style={{ ...style, overflow: nodeOnCell?.node_type === 'free_composite' ? 'visible' : undefined }}
    >
      {children}
    </div>
  );
};

interface DraggableTalentProps {
  node: TalentNode;
  itemSize: string;
  onClick: (node: TalentNode) => void;
}

const DraggableTalent: React.FC<DraggableTalentProps> = ({ node, itemSize, onClick }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { availableTalents } = useTalentTreeStore();
  const talent = availableTalents.find(t => t.id === node.talent_id);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TALENT,
    item: { ...node },
    canDrag: node.is_group_main || !node.group_id || node.node_type === 'free_composite',
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  drag(ref);

  const baseSize = parseInt(itemSize, 10);
  return (
    <div
      ref={ref}
      className="cursor-grab flex items-center justify-center group"
      style={{
        opacity: isDragging ? 0.5 : 1,
        width: node.node_type === 'free_composite' ? 'auto' : baseSize,
        height: node.node_type === 'free_composite' ? 'auto' : baseSize,
        position: 'relative', // Needed for 'left' property
        left: (node.node_type === 'key' || node.node_type === 'lesser') ? '-4px' : '0px', // Offset 4px to the left
        zIndex: node.node_type === 'free_composite' ? 10 : 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: node.node_type === 'free_composite' ? 'visible' : undefined,
        flexShrink: node.node_type === 'free_composite' ? 0 : 1,
      }}
      onClick={() => onClick(node)}
    >
      {node.node_type === 'free_composite' ? (
        <FreeCompositeFrame isUnlocked={true} imageUrl={talent?.icon_url || undefined} />
      ) : (
        <IconFrame
          size={baseSize} // Pass baseSize, IconFrame will adjust based on frameType
          styleType="yellow" // Keep yellow as default style for editor
          altText=""
          contentImageUrl={talent?.icon_url || null}
          frameType={
            node.node_type === 'key'
              ? 'key'
              : node.node_type === 'lesser'
              ? 'lesser'
              : 'regular' // Default for 'normal', 'composite', 'composite_sub'
          }
        />
      )}
      {node.group_id && (
        <div className="absolute top-0 right-0 bg-gray-900 text-white text-xs px-1 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ transform: 'translate(100%, 0)' }}
        >
          {node.group_id}
        </div>
      )}
    </div>
  );
};

interface TalentGridProps {
  onDropItem: (item: TalentNode & { isToolbarItem?: boolean }, newX: number, newY: number) => void;
  onContextMenu: (event: React.MouseEvent, x: number, y: number) => void;
  onItemClick: (node: TalentNode) => void;
  onLink: (sourceNodeId: string, direction: 'up' | 'down' | 'left' | 'right') => void;
  onDeleteEdge: (edgeId: string) => void;
}

const TalentGrid: React.FC<TalentGridProps> = ({ onDropItem, onContextMenu, onItemClick, onLink, onDeleteEdge }) => {
  const { treeData, selectedNodeId} = useTalentTreeStore();

  const rows = 30;
  const cols = 10;
  const talentCellSize = '48px';
  const arrowCellSize = '34px';

  const gridTemplateColumns = Array.from({ length: cols * 2 - 1 }, (_, i) =>
    i % 2 === 0 ? talentCellSize : arrowCellSize
  ).join(' ');

  const gridTemplateRows = Array.from({ length: rows * 2 - 1 }, (_, i) =>
    i % 2 === 0 ? talentCellSize : arrowCellSize
  ).join(' ');

  const totalRows = rows * 2 - 1;
  const totalCols = cols * 2 - 1;

  const getArrowTransform = (direction: 'right' | 'down' | 'left' | 'up' | null) => {
    switch (direction) {
      case 'down':
        return 'rotate(90deg)';
      case 'left':
        return 'rotate(180deg)';
      case 'up':
        return 'rotate(270deg)';
      default:
        return 'none';
    }
  };

  return (
    <div className="flex-1 p-4 flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">Editor Grid</h2>
      <div
        className="grid border border-gray-700"
        style={{
          gridTemplateColumns,
          gridTemplateRows,
          gap: '0px',
          overflow: 'visible',
        }}
      >
        {Array.from({ length: totalRows }).map((_, rowIndex) =>
          Array.from({ length: totalCols }).map((__, colIndex) => {
            const isTalentCell = rowIndex % 2 === 0 && colIndex % 2 === 0;
            const isArrowCell = (rowIndex % 2 !== 0 && colIndex % 2 === 0) || (rowIndex % 2 === 0 && colIndex % 2 !== 0);
            const isEmptyIntersectionCell = rowIndex % 2 !== 0 && colIndex % 2 !== 0;

            const nodeOnCell = treeData.nodes.find(n => n.x === colIndex && n.y === rowIndex);
            const mainGroupNodeOnCell = treeData.nodes.find(n => n.is_group_main && n.x === colIndex && n.y === rowIndex);

            let edge: TalentEdge | undefined;
            let arrowDirection: 'right' | 'down' | 'left' | 'up' | null = null;

            if (isArrowCell) {
              const horizSource = treeData.nodes.find(n => n.x === colIndex - 1 && n.y === rowIndex);
              const horizTarget = treeData.nodes.find(n => n.x === colIndex + 1 && n.y === rowIndex);
              const vertSource = treeData.nodes.find(n => n.x === colIndex && n.y === rowIndex - 1);
              const vertTarget = treeData.nodes.find(n => n.x === colIndex && n.y === rowIndex + 1);

              if (horizSource && horizTarget) {
                edge = treeData.edges.find(e => (e.source === horizSource.id && e.target === horizTarget.id) || (e.source === horizTarget.id && e.target === horizSource.id));
                if (edge) {
                  arrowDirection = edge.source === horizSource.id ? 'right' : 'left';
                }
              }
              if (vertSource && vertTarget) {
                edge = treeData.edges.find(e => (e.source === vertSource.id && e.target === vertTarget.id) || (e.source === vertTarget.id && e.target === vertSource.id));
                if (edge) {
                  arrowDirection = edge.source === vertSource.id ? 'down' : 'up';
                }
              }
            }

            return (
              <GridCell
                key={`${rowIndex}-${colIndex}`}
                x={colIndex}
                y={rowIndex}
                isTalentCell={isTalentCell}
                onDropItem={onDropItem}
                onContextMenu={nodeOnCell ? onContextMenu : undefined}
              >
                {isEmptyIntersectionCell ? (
                  <div className="bg-gray-900/10 w-full h-full" />
                ) : (
                  <>
                    {mainGroupNodeOnCell && mainGroupNodeOnCell.node_type === 'composite' && (
                      <div
                        className="absolute"
                        style={{
                          width: `calc(${talentCellSize} * 3 + ${arrowCellSize} * 2)`,
                          height: `calc(${talentCellSize})`,
                          backgroundImage: `url('/image/talents/composite_talent.png')`,
                          backgroundSize: 'contain',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                          zIndex: 0,
                          pointerEvents: 'none',
                          left: `calc((${talentCellSize} + ${arrowCellSize}) * -1)`,
                        }}
                      />
                    )}
                    {nodeOnCell && (
                      <div className="relative" style={{ zIndex: 1, overflow: nodeOnCell.node_type === 'free_composite' ? 'visible' : undefined }}>
                        <DraggableTalent
                          node={nodeOnCell}
                          itemSize={talentCellSize}
                          onClick={() => onItemClick(nodeOnCell)}
                        />
                        {selectedNodeId === nodeOnCell.id && (
                          <>
                            {/* Top anchor */}
                            {!treeData.edges.some(e => (e.source === nodeOnCell.id && treeData.nodes.find(n => n.id === e.target)?.y === nodeOnCell.y - 2) || (e.target === nodeOnCell.id && treeData.nodes.find(n => n.id === e.source)?.y === nodeOnCell.y - 2)) &&
                              <button onClick={() => onLink(nodeOnCell.id, 'up')} className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 bg-red-500" />
                            }
                            {/* Bottom anchor */}
                            {!treeData.edges.some(e => (e.source === nodeOnCell.id && treeData.nodes.find(n => n.id === e.target)?.y === nodeOnCell.y + 2) || (e.target === nodeOnCell.id && treeData.nodes.find(n => n.id === e.source)?.y === nodeOnCell.y + 2)) &&
                              <button onClick={() => onLink(nodeOnCell.id, 'down')} className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-2 bg-red-500" />
                            }
                            {/* Left anchor */}
                            {(nodeOnCell.node_type === 'normal' || nodeOnCell.node_type === 'key' || nodeOnCell.node_type === 'lesser') && !treeData.edges.some(e => (e.source === nodeOnCell.id && treeData.nodes.find(n => n.id === e.target)?.x === nodeOnCell.x - 2) || (e.target === nodeOnCell.id && treeData.nodes.find(n => n.id === e.source)?.x === nodeOnCell.x - 2)) &&
                              <button onClick={() => onLink(nodeOnCell.id, 'left')} className="absolute top-1/2 -left-2 -translate-y-1/2 w-2 h-4 bg-red-500" />
                            }
                            {/* Right anchor */}
                            {(nodeOnCell.node_type === 'normal' || nodeOnCell.node_type === 'key' || nodeOnCell.node_type === 'lesser') && !treeData.edges.some(e => (e.source === nodeOnCell.id && treeData.nodes.find(n => n.id === e.target)?.x === nodeOnCell.x + 2) || (e.target === nodeOnCell.id && treeData.nodes.find(n => n.id === e.source)?.x === nodeOnCell.x + 2)) &&
                              <button onClick={() => onLink(nodeOnCell.id, 'right')} className="absolute top-1/2 -right-2 -translate-y-1/2 w-2 h-4 bg-red-500" />
                            }
                          </>
                        )}
                      </div>
                    )}
                    {arrowDirection && edge ? (
                      <Image
                        src="/image/talent_arrow.svg"
                        fill
                        alt={`Arrow pointing ${arrowDirection}`}
                        className="object-contain cursor-pointer"
                        onContextMenu={(e) => {
                          e.preventDefault();
                          onDeleteEdge(edge.id);
                        }}
                        style={{
                          width: `calc(${arrowCellSize} * 0.5)`,
                          height: `calc(${arrowCellSize} * 0.5)`,
                          transform: getArrowTransform(arrowDirection)
                        }}
                      />
                    ) : null}
                  </>
                )}
              </GridCell>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TalentGrid;
