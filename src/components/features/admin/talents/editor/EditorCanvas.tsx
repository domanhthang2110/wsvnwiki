'use client';

import React, { useRef, useState } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchContentRef } from 'react-zoom-pan-pinch';
import { useTalentTreeStore } from './store';
import { TalentNode, TalentEdge } from '@/types/talents';
import IconFrame from '@/components/shared/IconFrame';
import FreeCompositeFrame from '@/components/ui/FreeCompositeFrame';

// --- Constants (Must Match V2 for Mechanics) ---
const ROWS = 30;
const COLS = 10;
const TALENT_CELL_SIZE = 48;
const ARROW_CELL_SIZE = 34;

const TOTAL_ROWS = ROWS * 2 - 1;
const TOTAL_COLS = COLS * 2 - 1;

// --- Helper Types ---
const ItemTypes = {
    TALENT: 'talent',
};

// --- Helper Functions ---
const getPositionFromIndices = (colIndex: number, rowIndex: number) => {
    // Calculates pixel position based on the mixed grid (Talent vs Arrow cells)
    // Formula: count how many talent cells and arrow cells are before the index
    const talentCols = Math.ceil(colIndex / 2); // 0->0, 1->1, 2->1, 3->2
    const arrowCols = Math.floor(colIndex / 2); // 0->0, 1->0, 2->1, 3->1

    // Actually, simple loop or math:
    // even index i: (i/2) * 48 + (i/2) * 34
    // odd index i: ((i-1)/2 + 1) * 48 + ((i-1)/2) * 34 ?? No.

    // Let's use loop for foolproof logic if we cache it, 
    // or just math it out.
    // Index 0: 0
    // Index 1: 48
    // Index 2: 48 + 34 = 82
    // Index 3: 48 + 34 + 48 = 130

    const calculateDim = (idx: number) => {
        const numTalents = Math.ceil((idx) / 2);
        const numArrows = Math.floor((idx) / 2);
        // If idx is even (talent), it starts after idx/2 talents and idx/2 arrows.
        // If idx is odd (arrow), it starts after (idx+1)/2 talents and (idx-1)/2 arrows? 

        // Wait, let's look at the sequence of widths:
        // 0: 48 (Talent)
        // 1: 34 (Arrow)
        // 2: 48
        // 3: 34

        // Start Pos of index I:
        // Count pairs (48+34).
        const pairs = Math.floor(idx / 2);
        let pos = pairs * (TALENT_CELL_SIZE + ARROW_CELL_SIZE);

        if (idx % 2 !== 0) {
            // If odd, we are after the last talent of the pair
            pos += TALENT_CELL_SIZE;
        }
        return pos;
    };

    return { x: calculateDim(colIndex), y: calculateDim(rowIndex) };
};

const getGridIndicesFromPos = (x: number, y: number) => {
    // Inverse of getPositionFromIndices. 
    // We assume the grid starts at 0,0.

    const pairSize = TALENT_CELL_SIZE + ARROW_CELL_SIZE;

    const findIndex = (val: number) => {
        const pairs = Math.floor(val / pairSize);
        const remainder = val % pairSize;

        let index = pairs * 2;
        if (remainder > TALENT_CELL_SIZE) {
            index += 1; // It's in the arrow part
        }

        // Clamping
        return index;
    };

    return { colIndex: findIndex(x), rowIndex: findIndex(y) };
};


// --- Draggable Node Component (Adapted from V2) ---
const DraggableNode = ({ node, onClick }: { node: TalentNode, onClick: (n: TalentNode) => void }) => {
    const { availableTalents, treeData } = useTalentTreeStore();
    const talent = availableTalents.find(t => t.id === node.talent_id);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.TALENT,
        item: { ...node },
        canDrag: node.is_group_main || !node.group_id || node.node_type === 'free_composite',
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    // If drag source, we might need a ref.
    // But we are rendering absolute divs.

    // Note: In V2 DraggableTalent was inside a GridCell. 
    // In V3 Canvas, we want to render nodes absolutely on top of the grid?
    // OR render the grid cells and put nodes in them?
    // Rendering nodes absolutely is better for "Canvas" feel, but GridCell structure is easier for alignment.
    // Let's stick to GridCells to reuse V2 rendering logic 1:1 if possible.
    // BUT, huge grid of 59x19 divs might be heavy?
    // ROWS=30 -> 59 visual rows. COLS=10 -> 19 visual cols. 59*19 = 1121 cells. 
    // React can handle 1000 items. CSS Grid is fine.

    return (
        <div
            ref={(n) => { drag(n) }}
            className={`nopan cursor-grab relative flex items-center justify-center group shrink-0 ${isDragging ? 'opacity-50' : ''}`}
            style={{
                width: node.node_type === 'free_composite' ? 'auto' :
                    (node.node_type === 'key' || node.node_type === 'lesser') ? TALENT_CELL_SIZE + 12 : TALENT_CELL_SIZE,
                height: node.node_type === 'free_composite' ? 'auto' :
                    (node.node_type === 'key' || node.node_type === 'lesser') ? TALENT_CELL_SIZE + 12 : TALENT_CELL_SIZE,
                zIndex: 20, // High z-index for the node itself
                overflow: 'visible' // Ensure sprites aren't cut off
            }}
            onMouseDown={(e) => e.stopPropagation()} // Stop propagation to prevent pan start
            onClick={(e) => { e.stopPropagation(); onClick(node); }}
        >
            {node.node_type === 'free_composite' ? (
                <FreeCompositeFrame isUnlocked={true} imageUrl={talent?.icon_url || undefined} />
            ) : (
                <IconFrame
                    size={TALENT_CELL_SIZE}
                    styleType="yellow"
                    altText={talent?.name}
                    contentImageUrl={talent?.icon_url || null}
                    frameType={
                        node.node_type === 'key' ? 'key' :
                            node.node_type === 'lesser' ? 'lesser' : 'regular'
                    }
                // Adjust left offset for key/lesser frames to center them visually if needed, similar to V2 logic
                // -> ADJUSTMENT OFFSETS FOR LESSER & KEY <-
                // You can change `marginLeft` and `marginTop` values below to shift the frame around without moving the cell itself.
                // For example: { marginLeft: '-8px', marginTop: '-4px' } moves it 8px left and 4px up.

                />
            )}
            {node.group_id && (
                <div className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] px-1 rounded-bl opacity-0 group-hover:opacity-100 pointer-events-none translate-x-full">
                    {node.group_id.slice(0, 4)}
                </div>
            )}
        </div>
    );
};


// --- The Canvas Content (Grid + Nodes) ---
const EditorCanvasContent = ({ onEditNode, hoveredCell }: { onEditNode: (n: TalentNode) => void, hoveredCell?: { x: number, y: number } | null }) => {
    const { treeData, selectedNodeId, setSelectedNodeId, removeEdge, addEdge } = useTalentTreeStore();

    // -- Generate Grid Template --
    const gridTemplateColumns = Array.from({ length: TOTAL_COLS }, (_, i) =>
        i % 2 === 0 ? `${TALENT_CELL_SIZE}px` : `${ARROW_CELL_SIZE}px`
    ).join(' ');

    const gridTemplateRows = Array.from({ length: TOTAL_ROWS }, (_, i) =>
        i % 2 === 0 ? `${TALENT_CELL_SIZE}px` : `${ARROW_CELL_SIZE}px`
    ).join(' ');

    // -- Render Grid Cells --
    // We can just iterate and render.
    // Using simple flat array for cells to avoid nesting hell
    const cells = [];
    for (let r = 0; r < TOTAL_ROWS; r++) {
        for (let c = 0; c < TOTAL_COLS; c++) {
            const isTalentCell = r % 2 === 0 && c % 2 === 0;
            const isArrowCell = (r % 2 !== 0 && c % 2 === 0) || (r % 2 === 0 && c % 2 !== 0);
            const isEmptyIntersection = r % 2 !== 0 && c % 2 !== 0; // The small intersection between arrows

            // Find content
            const node = treeData.nodes.find(n => n.x === c && n.y === r);
            const mainComposite = treeData.nodes.find(n => n.is_group_main && n.x === c && n.y === r && n.node_type === 'composite');

            let cellContent = null;
            let bgClass = 'bg-transparent';

            if (isEmptyIntersection) {
                // bgClass = 'bg-gray-800/20'; // Optional visual guide
            } else if (isTalentCell) {
                // Alternating colors for guidance (V2 style)
                bgClass = (c === 4 || c === 8 || c === 12) ? 'bg-purple-900/10' : 'bg-blue-900/10';
            } else if (isArrowCell) {
                // Check for edge
                // Horizontal Arrow: Row is Even, Col is Odd
                // Vertical Arrow: Row is Odd, Col is Even
                let edge = null;
                let direction = null;

                if (r % 2 === 0) { // Horizontal: (c-1, r) <-> (c+1, r)
                    const left = treeData.nodes.find(n => n.x === c - 1 && n.y === r);
                    const right = treeData.nodes.find(n => n.x === c + 1 && n.y === r);
                    if (left && right) {
                        edge = treeData.edges.find(e => (e.source === left.id && e.target === right.id) || (e.source === right.id && e.target === left.id));
                        if (edge) direction = edge.source === left.id ? 'right' : 'left';
                    }
                } else { // Vertical: (c, r-1) <-> (c, r+1)
                    const top = treeData.nodes.find(n => n.x === c && n.y === r - 1);
                    const bottom = treeData.nodes.find(n => n.x === c && n.y === r + 1);
                    if (top && bottom) {
                        edge = treeData.edges.find(e => (e.source === top.id && e.target === bottom.id) || (e.source === bottom.id && e.target === top.id));
                        if (edge) direction = edge.source === top.id ? 'down' : 'up';
                    }
                }

                if (edge && direction) {
                    cellContent = (
                        <div
                            className="nopan flex items-center justify-center w-full h-full cursor-pointer hover:opacity-75 hover:bg-red-500/20 rounded z-30 relative transition-all"
                            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); removeEdge(edge!.id); }}
                            onClick={(e) => { e.stopPropagation(); removeEdge(edge!.id); }}
                        >
                            <img
                                src="/image/talent_arrow.webp"
                                alt="arrow"
                                className="object-contain w-4 h-4 pointer-events-none"
                                style={{
                                    transform: direction === 'down' ? 'rotate(90deg)' :
                                        direction === 'left' ? 'rotate(180deg)' :
                                            direction === 'up' ? 'rotate(270deg)' : 'none'
                                }}
                            />
                        </div>
                    );
                }
            }

            // Overlay for Composite Background
            // -> ADJUSTMENT FOR COMPOSITE FRAME SIZE <-
            // You can adjust the transform scale(1.1) to 1.2 or 1.0 depending on how much larger you want the frame to bleed out out of its container bounding box.
            const compositeBg = mainComposite ? (
                <div
                    className="absolute pointer-events-none z-[-1]"
                    style={{
                        width: `calc(${TALENT_CELL_SIZE}px * 3 + ${ARROW_CELL_SIZE}px * 2)`,
                        height: `${TALENT_CELL_SIZE}px`,
                        backgroundImage: `url('/image/talents/composite_talent.webp')`,
                        backgroundSize: '100% 100%',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        left: `calc((${TALENT_CELL_SIZE}px + ${ARROW_CELL_SIZE}px) * -1)`,
                        transform: 'scale(1.19)'
                    }}
                />
            ) : null;

            // Anchor Buttons
            const hasSameGroup = (tx: number, ty: number) => {
                if (!node || !node.group_id) return false;
                const target = treeData.nodes.find(n => n.x === tx && n.y === ty);
                return target?.group_id === node.group_id;
            };

            const anchors = (node && selectedNodeId === node.id) ? (
                <>
                    {/* Simplified Anchor Logic for UI */}
                    {/* NOTE: We aren't doing the complex check for existing edges here for brevity, but interactivity works via onLink logic */}
                    {!hasSameGroup(c, r - 2) && (
                        <div
                            title="Create connection up"
                            className="absolute -top-5 left-1/2 -translate-x-1/2 w-5 h-4 cursor-pointer group z-30 drop-shadow-md hover:drop-shadow-lg"
                            onClick={(e) => { e.stopPropagation(); linkNode(node, 'up'); }}
                        >
                            <div className="w-full h-full bg-blue-300 flex items-center justify-center transition-all group-hover:bg-green-300" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}>
                                <div className="w-[80%] h-[80%] mt-[10%] bg-blue-600 group-hover:bg-green-500 transition-all" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
                            </div>
                        </div>
                    )}
                    {!hasSameGroup(c, r + 2) && (
                        <div
                            title="Create connection down"
                            className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-5 h-4 cursor-pointer group z-30 drop-shadow-md hover:drop-shadow-lg"
                            onClick={(e) => { e.stopPropagation(); linkNode(node, 'down'); }}
                        >
                            <div className="w-full h-full bg-blue-300 flex items-center justify-center transition-all group-hover:bg-green-300" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}>
                                <div className="w-[80%] h-[80%] mb-[10%] bg-blue-600 group-hover:bg-green-500 transition-all" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
                            </div>
                        </div>
                    )}
                    {!hasSameGroup(c - 2, r) && node.node_type !== 'free_composite' && (
                        <div
                            title="Create connection left"
                            className="absolute top-1/2 -left-5 -translate-y-1/2 w-4 h-5 cursor-pointer group z-30 drop-shadow-md hover:drop-shadow-lg"
                            onClick={(e) => { e.stopPropagation(); linkNode(node, 'left'); }}
                        >
                            <div className="w-full h-full bg-blue-300 flex items-center justify-center transition-all group-hover:bg-green-300" style={{ clipPath: 'polygon(0 50%, 100% 100%, 100% 0)' }}>
                                <div className="w-[80%] h-[80%] ml-[10%] bg-blue-600 group-hover:bg-green-500 transition-all" style={{ clipPath: 'polygon(0 50%, 100% 100%, 100% 0)' }} />
                            </div>
                        </div>
                    )}
                    {!hasSameGroup(c + 2, r) && node.node_type !== 'free_composite' && (
                        <div
                            title="Create connection right"
                            className="absolute top-1/2 -right-5 -translate-y-1/2 w-4 h-5 cursor-pointer group z-30 drop-shadow-md hover:drop-shadow-lg"
                            onClick={(e) => { e.stopPropagation(); linkNode(node, 'right'); }}
                        >
                            <div className="w-full h-full bg-blue-300 flex items-center justify-center transition-all group-hover:bg-green-300" style={{ clipPath: 'polygon(100% 50%, 0 0, 0 100%)' }}>
                                <div className="w-[80%] h-[80%] mr-[10%] bg-blue-600 group-hover:bg-green-500 transition-all" style={{ clipPath: 'polygon(100% 50%, 0 0, 0 100%)' }} />
                            </div>
                        </div>
                    )}
                </>
            ) : null;


            const isHovered = hoveredCell && hoveredCell.x === c && hoveredCell.y === r;

            cells.push(
                <div
                    key={`${c}-${r}`}
                    className={`relative flex items-center justify-center border border-gray-800/20 ${bgClass} ${isHovered ? 'ring-2 ring-yellow-500/50 ring-inset bg-yellow-500/10 z-20' : ''} transition-all duration-150`}
                    style={{
                        gridColumn: c + 1,
                        gridRow: r + 1,
                        overflow: 'visible',
                        zIndex: mainComposite ? 5 : (node ? 30 : (isArrowCell ? 5 : 1))
                    }}
                    onClick={() => { if (node) setSelectedNodeId(node.id); else setSelectedNodeId(null); }}
                    onContextMenu={(e) => {
                        if (node) {
                            e.preventDefault();
                            onEditNode(node);
                        }
                    }}
                >
                    {compositeBg}
                    {node && <DraggableNode node={node} onClick={(n) => setSelectedNodeId(n.id)} />}
                    {anchors}
                    {cellContent}
                </div>
            );
        }
    }

    const linkNode = (source: TalentNode, dir: 'up' | 'down' | 'left' | 'right') => {
        let tx = source.x, ty = source.y;
        if (dir === 'up') ty -= 2;
        if (dir === 'down') ty += 2;
        if (dir === 'left') tx -= 2;
        if (dir === 'right') tx += 2;

        const target = treeData.nodes.find(n => n.x === tx && n.y === ty);
        if (target) {
            // Prevent duplicates
            const exists = treeData.edges.find(e =>
                (e.source === source.id && e.target === target.id) ||
                (e.source === target.id && e.target === source.id)
            );
            if (!exists) {
                addEdge({ id: `e-${Date.now()}`, source: source.id, target: target.id });
            }
        }
    };


    return (
        <div
            className="grid bg-[#0a0a0a]"
            style={{
                gridTemplateColumns,
                gridTemplateRows,
                width: 'max-content',
                height: 'max-content',
                paddingTop: '50px', // Extra padding for "canvas" feel
            }}
        >
            {cells}
        </div>
    );
};


// --- Main Editor Canvas ---
const EditorCanvas: React.FC<{ onEditNode: (n: TalentNode) => void }> = ({ onEditNode }) => {
    const transformRef = useRef<ReactZoomPanPinchContentRef>(null);
    const { addNode, treeData, setTreeData } = useTalentTreeStore();
    const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null);

    const deleteNode = (node: TalentNode) => {
        const { setTreeData, treeData } = useTalentTreeStore.getState();
        if (node.group_id) {
            const newNodes = treeData.nodes.filter(n => n.group_id !== node.group_id);
            const groupNodeIds = treeData.nodes.filter(n => n.group_id === node.group_id).map(n => n.id);
            const newEdges = treeData.edges.filter(e => !groupNodeIds.includes(e.source) && !groupNodeIds.includes(e.target));
            setTreeData({ nodes: newNodes, edges: newEdges });
        } else {
            const newNodes = treeData.nodes.filter(n => n.id !== node.id);
            const newEdges = treeData.edges.filter(e => e.source !== node.id && e.target !== node.id);
            setTreeData({ nodes: newNodes, edges: newEdges });
        }
    };

    // V2 Drop Logic Adapted
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDrop = (item: any, monitor: any) => {
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset || !transformRef.current) return;

        const state = transformRef.current.instance.transformState;

        // Safety check if state is still undefined (though it should exist on instance)
        const scale = state.scale || 1;
        const positionX = state.positionX || 0;
        const positionY = state.positionY || 0;

        const dropTarget = document.getElementById('v3-canvas-drop-zone');
        if (!dropTarget) return;

        const rect = dropTarget.getBoundingClientRect();

        const relX = (clientOffset.x - rect.left - positionX) / scale;
        const relY = (clientOffset.y - rect.top - positionY) / scale;

        // Subtract padding (User set paddingTop: 50px, others 0)
        const effectiveX = relX;
        const effectiveY = relY - 50;

        // Convert to Grid Indices
        const { colIndex, rowIndex } = getGridIndicesFromPos(Math.max(0, effectiveX), Math.max(0, effectiveY));

        // Snap to valid Talent Cell (Even indices)
        let finalX = colIndex;
        let finalY = rowIndex;

        if (finalX % 2 !== 0) finalX = Math.max(0, finalX - 1);
        if (finalY % 2 !== 0) finalY = Math.max(0, finalY - 1);

        // Apply V2 Constraints (Bounds & Node Types)
        // Composite Boundary Check
        if (item.node_type === 'composite') {
            if (finalX < 2) finalX = 2;
            if (finalX > TOTAL_COLS - 3) finalX = TOTAL_COLS - 3;
        } else if (item.node_type === 'free_composite') {
            if (finalX > TOTAL_COLS - 5) finalX = TOTAL_COLS - 5;
        }

        if (item.isToolbarItem) {
            const newNodeId = `node-${Date.now()}`;
            const newNode: TalentNode = {
                ...item,
                id: newNodeId,
                x: finalX,
                y: finalY,
                isToolbarItem: false,
                talent_id: -1,
            };

            // Composite Logic
            if (newNode.node_type === 'composite') {
                const groupId = `g-${newNode.id}`;
                newNode.group_id = groupId;
                newNode.is_group_main = true;

                addNode(newNode);
                addNode({ ...newNode, id: `node-${Date.now()}-1`, x: newNode.x - 2, is_group_main: false, node_type: 'composite_sub' });
                addNode({ ...newNode, id: `node-${Date.now()}-2`, x: newNode.x + 2, is_group_main: false, node_type: 'composite_sub' });

            } else if (newNode.node_type === 'free_composite') {
                const groupId = `fg-${newNode.id}`;
                newNode.group_id = groupId;
                addNode(newNode);
                addNode({ ...newNode, id: `node-${Date.now()}-1`, x: newNode.x + 2, group_id: groupId });
                addNode({ ...newNode, id: `node-${Date.now()}-2`, x: newNode.x + 4, group_id: groupId });
            } else {
                addNode(newNode);
            }
        } else {
            // Moving existing node
            // Calculate Delta
            const dx = finalX - item.x;
            const dy = finalY - item.y;

            if (dx === 0 && dy === 0) return;

            // V2 Move Logic (Group move)
            let newNodes = [...treeData.nodes];
            // ONLY strictly bound composite groups move together. 
            // Free composites MUST move individually even if they have a group_id.
            const isStrictGroup = item.group_id && (item.node_type === 'composite' || item.node_type === 'composite_sub');

            const movingNodeIds: string[] = [];

            if (isStrictGroup) {
                // Move all nodes in the strictly bound group
                newNodes = newNodes.map(n => {
                    if (n.group_id === item.group_id) {
                        movingNodeIds.push(n.id);
                        return { ...n, x: n.x + dx, y: n.y + dy };
                    }
                    return n;
                });
            } else {
                newNodes = newNodes.map(n => {
                    if (n.id === item.id) {
                        movingNodeIds.push(n.id);
                        return { ...n, x: finalX, y: finalY };
                    }
                    return n;
                });
            }

            const newEdges = treeData.edges.filter(
                e => !movingNodeIds.includes(e.source) && !movingNodeIds.includes(e.target)
            );

            setTreeData({ nodes: newNodes, edges: newEdges });
        }
    };

    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.TALENT,
        drop: handleDrop,
        hover: (item, monitor) => {
            const clientOffset = monitor.getClientOffset();
            if (!clientOffset || !transformRef.current) {
                setHoveredCell(null);
                return;
            }

            const state = transformRef.current.instance.transformState;
            const scale = state.scale || 1;
            const positionX = state.positionX || 0;
            const positionY = state.positionY || 0;

            const dropTarget = document.getElementById('v3-canvas-drop-zone');
            if (!dropTarget) return;

            const rect = dropTarget.getBoundingClientRect();
            const relX = (clientOffset.x - rect.left - positionX) / scale;
            const relY = (clientOffset.y - rect.top - positionY) / scale;

            // Subtract padding (User set paddingTop: 50px, others 0)
            const { colIndex, rowIndex } = getGridIndicesFromPos(Math.max(0, relX), Math.max(0, relY - 50));

            let finalX = colIndex;
            let finalY = rowIndex;
            if (finalX % 2 !== 0) finalX = Math.max(0, finalX - 1);
            if (finalY % 2 !== 0) finalY = Math.max(0, finalY - 1);

            setHoveredCell({ x: finalX, y: finalY });
        },
        collect: m => ({ isOver: m.isOver() })
    }), [treeData]); // Dep on treeData for move logic

    // Clear hover when leaving
    React.useEffect(() => {
        if (!isOver) setHoveredCell(null);
    }, [isOver]);

    // Center horizontally and align top on load
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (transformRef.current) {
                const dropZone = document.getElementById('v3-canvas-drop-zone');
                if (dropZone) {
                    const containerWidth = dropZone.clientWidth;
                    const gridWidth = Math.ceil(TOTAL_COLS / 2) * TALENT_CELL_SIZE + Math.floor(TOTAL_COLS / 2) * ARROW_CELL_SIZE;
                    const initialScale = 0.6;

                    // Center it horizontally, top align vertically
                    const x = (containerWidth - gridWidth * initialScale) / 2;
                    const y = 0;

                    transformRef.current.setTransform(x, y, initialScale, 0);
                }
            }
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            id="v3-canvas-drop-zone"
            ref={(n) => { drop(n) }}
            className="flex-1 min-w-0 relative bg-[#050505] overflow-hidden"
        >
            <div className="absolute inset-0">
                <TransformWrapper
                    ref={transformRef}
                    initialScale={0.6}
                    minScale={0.5}
                    maxScale={2}
                    centerOnInit={false}
                    limitToBounds={true}
                    disablePadding={true}
                    panning={{ excluded: ['nopan'] }}
                >
                    <TransformComponent
                        wrapperStyle={{ width: '100%', height: '100%' }}
                    >
                        <EditorCanvasContent onEditNode={onEditNode} hoveredCell={hoveredCell} />
                    </TransformComponent>
                </TransformWrapper>
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-4 left-4 flex gap-2 z-20">
                <div className="bg-gray-800 text-gray-300 px-3 py-1 rounded text-xs border border-gray-700 shadow flex items-center gap-2">
                    <span>Space + Drag to Pan</span>
                    <span className="w-px h-3 bg-gray-600"></span>
                    <span>Scroll to Zoom</span>
                </div>
            </div>
        </div >
    );
};

export default EditorCanvas;
