'use client';

import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTalentTreeStore } from './store';
import { useTalentTreeData } from './useTalentTreeData';
import { useTreeInteraction } from './useTreeInteraction';
import PropertiesPanel from './PropertiesPanel';
import Toolbar from './Toolbar';
import TalentGrid from './TalentGrid';
import ContextMenu from './ContextMenu';
import TalentSelectModal from './TalentSelectModal';
import { TalentNode, TalentEdge } from '@/types/talents';

const TalentTreeEditorV2: React.FC = () => {
  useTalentTreeData();
  const { handleSaveTree, handleDeleteTree, handleEditTree, handleClearGrid } = useTreeInteraction();
  const {
    setSelectedNodeId,
  } = useTalentTreeStore();

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: TalentNode } | null>(null);
  const [showTalentSelectModal, setShowTalentSelectModal] = useState(false);
  const [currentTalentNode, setCurrentTalentNode] = useState<TalentNode | null>(null);

  const handleDropItem = useCallback((item: TalentNode & { isToolbarItem?: boolean }, newX: number, newY: number) => {
    const { addNode, setTreeData, treeData } = useTalentTreeStore.getState();
    const { nodes, edges } = treeData;
    const cols = 10;
    const totalCols = cols * 2 - 1;

    if (item.isToolbarItem) {
      const newNode: TalentNode = {
        ...item,
        id: `node-${Date.now()}`,
        x: newX,
        y: newY,
        isToolbarItem: false,
      };
      if (newNode.node_type === 'composite') {
        // Apply boundary check for composite nodes
        if (newX === 0) { // If at the first column
          newNode.x = 2; // Move 1 column inside (column 2)
        } else if (newX === totalCols - 1) { // If at the last column
          newNode.x = totalCols - 3; // Move 1 column inside (totalCols - 3)
        }

        const groupId = `group-${newNode.id}`;
        newNode.group_id = groupId;
        newNode.is_group_main = true;

        const subNode1: TalentNode = { id: `node-${Date.now() + 1}`, talent_id: -1, x: newNode.x - 2, y: newNode.y, node_type: 'composite_sub', group_id: groupId };
        const subNode2: TalentNode = { id: `node-${Date.now() + 2}`, talent_id: -1, x: newNode.x + 2, y: newNode.y, node_type: 'composite_sub', group_id: groupId };
        addNode(subNode1);
        addNode(newNode);
        addNode(subNode2);
      } else if (newNode.node_type === 'free_composite') {
        const groupId = `group-${newNode.id}`;
        newNode.group_id = groupId;
        newNode.isToolbarItem = false;

        const subNode1: TalentNode = { ...newNode, id: `node-${Date.now() + 1}`, x: newNode.x + 2, group_id: groupId, isToolbarItem: false };
        const subNode2: TalentNode = { ...newNode, id: `node-${Date.now() + 2}`, x: newNode.x + 4, group_id: groupId, isToolbarItem: false };
        
        addNode(newNode);
        addNode(subNode1);
        addNode(subNode2);
      } else {
        addNode(newNode);
      }
    } else {
      let newNodes = [...nodes];
      if (item.group_id && item.is_group_main) {
        let dx = newX - item.x;
        const dy = newY - item.y;

        // Apply boundary check for composite nodes when dragging
        const newMainX = newX;
        const newLeftSubX = newMainX - 2;
        const newRightSubX = newMainX + 2;

        if (newLeftSubX < 0) {
          dx += (0 - newLeftSubX);
        } else if (newRightSubX > totalCols - 1) {
          dx -= (newRightSubX - (totalCols - 1));
        }

        newNodes = newNodes.map(node => {
          if (node.group_id === item.group_id) {
            return { ...node, x: node.x + dx, y: node.y + dy };
          }
          return node;
        });
      } else if (item.node_type === 'free_composite') {
        newNodes = newNodes.map(n => {
          if (n.id === item.id) {
            return { ...n, x: newX, y: newY };
          }
          return n;
        });
      } else if (!item.group_id) {
        newNodes = newNodes.map(n => {
          if (n.id === item.id) {
            return { ...n, x: newX, y: newY };
          }
          return n;
        });
      }

      const newEdges = edges.filter((edge: TalentEdge) => {
        const sourceNode = newNodes.find(n => n.id === edge.source);
        const targetNode = newNodes.find(n => n.id === edge.target);
        if (!sourceNode || !targetNode) return false;
        const dx = Math.abs(sourceNode.x - targetNode.x);
        const dy = Math.abs(sourceNode.y - targetNode.y);
        return (dx === 2 && dy === 0) || (dx === 0 && dy === 2);
      });

      setTreeData({ nodes: newNodes, edges: newEdges });
    }
  }, []);

  const handleContextMenu = useCallback((event: React.MouseEvent, x: number, y: number) => {
    const { treeData } = useTalentTreeStore.getState();
    event.preventDefault();
    const item = treeData.nodes.find(n => n.x === x && n.y === y);
    if (item) {
      setContextMenu({ x: event.clientX, y: event.clientY, item });
    }
  }, []);

  const handleItemClick = useCallback((node: TalentNode) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const handleLink = useCallback((sourceNodeId: string, direction: 'up' | 'down' | 'left' | 'right') => {
    const { treeData, addEdge } = useTalentTreeStore.getState();
    const sourceNode = treeData.nodes.find(n => n.id === sourceNodeId);
    if (!sourceNode) return;

    let targetX = sourceNode.x;
    let targetY = sourceNode.y;

    switch (direction) {
      case 'up': targetY -= 2; break;
      case 'down': targetY += 2; break;
      case 'left': targetX -= 2; break;
      case 'right': targetX += 2; break;
    }

    const targetNode = treeData.nodes.find(n => n.x === targetX && n.y === targetY);
    if (targetNode) {
      addEdge({ id: `edge-${sourceNode.id}-${targetNode.id}`, source: sourceNode.id, target: targetNode.id });
    }
  }, []);

  const handleDeleteItem = useCallback(() => {
    const { removeNode } = useTalentTreeStore.getState();
    if (contextMenu) {
      removeNode(contextMenu.item.id);
      setContextMenu(null);
    }
  }, [contextMenu]);

  const handleChangeItem = useCallback(() => {
    if (contextMenu) {
      setCurrentTalentNode(contextMenu.item);
      setShowTalentSelectModal(true);
      setContextMenu(null);
    }
  }, [contextMenu]);

  const handleSelectTalent = useCallback((talentId: number) => {
    const { updateNode } = useTalentTreeStore.getState();
    if (currentTalentNode) {
      updateNode(currentTalentNode.id, {
        talent_id: talentId,
      });
      setCurrentTalentNode(null);
      setShowTalentSelectModal(false);
    }
  }, [currentTalentNode]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-full">
        <PropertiesPanel
          onSave={handleSaveTree}
          onDelete={handleDeleteTree}
          onEdit={handleEditTree}
          onClear={handleClearGrid}
        />
        <div className="flex flex-col flex-1" style={{ overflow: 'visible' }}>
          <Toolbar />
          <TalentGrid
            onDropItem={handleDropItem}
            onContextMenu={handleContextMenu}
            onItemClick={handleItemClick}
            onLink={handleLink}
            onDeleteEdge={(edgeId) => useTalentTreeStore.getState().removeEdge(edgeId)}
          />
          <div className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Raw Tree Data</h3>
            <pre className="text-xs text-gray-300 bg-gray-800 p-2 rounded overflow-auto max-h-60">
              {JSON.stringify(useTalentTreeStore.getState().treeData, null, 2)}
            </pre>
          </div>
        </div>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            item={contextMenu.item} // Pass the item
            onClose={() => setContextMenu(null)}
            onChange={handleChangeItem}
            onDelete={handleDeleteItem}
            onSetNodeType={(type) => {
              const { updateNode } = useTalentTreeStore.getState();
              updateNode(contextMenu.item.id, { node_type: type });
              setContextMenu(null);
            }}
            onSetGroupId={(groupId) => {
              const { updateNode } = useTalentTreeStore.getState();
              updateNode(contextMenu.item.id, { group_id: groupId });
              setContextMenu(null);
            }}
          />
        )}
        {showTalentSelectModal && (
          <TalentSelectModal
            onSelect={handleSelectTalent}
            onClose={() => setShowTalentSelectModal(false)}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default TalentTreeEditorV2;
