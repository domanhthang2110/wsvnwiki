'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import IconFrame from '@/components/shared/IconFrame';
import { Switch } from '@/components/ui/Switch/switch';
import { Input } from '@/components/ui/Input';
import LongButton from '@/components/ui/LongButton';
import { TalentItem, TalentTreeData, TalentTreeItem, TalentNode, TalentEdge } from '@/types/talents';
import { ClassItem } from '@/types/classes';
import { Database } from '@/types/database.types';
import { supabase } from '@/lib/supabase/client';

const ItemTypes = {
  TALENT: 'talent',
};

interface DraggableTalentProps {
  node: TalentNode;
  isToolbarItem?: boolean;
  onClick?: (node: TalentNode) => void;
  itemSize: string;
  treeData: TalentTreeData;
}

const DraggableTalent = React.memo<DraggableTalentProps>(({ node, isToolbarItem = false, onClick, itemSize, treeData }) => {
  const [{ isDragging }, drag] = useDrag(() => {
    // A talent is draggable if it's a toolbar item, a normal node, or the main node of a group.
    const canDrag = isToolbarItem || node.node_type === 'normal' || node.is_group_main;

    return {
      type: ItemTypes.TALENT,
      // When dragging a group's main node, we pass the entire node so we can access its group_id.
      item: { ...node, isToolbarItem },
      canDrag,
      collect: (monitor: any) => ({
        isDragging: monitor.isDragging(),
      }),
    };
  }, [node, isToolbarItem, treeData]);

  const divRef = useRef<HTMLDivElement>(null);
  drag(divRef);

  return (
    <div
      ref={divRef}
      className="cursor-grab flex items-center justify-center"
      style={{ opacity: isDragging ? 0.5 : 1, transform: 'translateY(1px)', width: itemSize, height: itemSize }}
      onClick={onClick ? () => onClick(node) : undefined}
    >
      <IconFrame
        size={parseInt(itemSize, 10)}
        styleType="yellow"
        altText=""
        contentImageUrl={node.icon_url || null}
      />
    </div>
  );
});

interface GridCellProps {
  x: number;
  y: number;
  isTalentCell: boolean;
  onDropItem: (item: TalentNode & { isToolbarItem?: boolean }, newX: number, newY: number) => void;
  onContextMenu?: (event: React.MouseEvent, x: number, y: number) => void;
  children?: React.ReactNode;
}

const GridCell = React.memo<GridCellProps>(({ x, y, isTalentCell, onDropItem, onContextMenu, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: [ItemTypes.TALENT],
    drop: (item: TalentNode & { isToolbarItem?: boolean }) => onDropItem(item, x, y),
    canDrop: () => isTalentCell,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [x, y, isTalentCell, onDropItem]); // Added dependency array

  drop(ref);

  const isActive = isOver && canDrop;
  let backgroundColor = 'bg-gray-900/10';
  if (isTalentCell) {
    // Check for 3rd, 5th, 7th talent columns (grid column indices 4, 8, 12)
    if (x === 4 || x === 8 || x === 12) {
      backgroundColor = 'bg-purple-900/30'; // Distinct color for marked columns
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

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    if (onContextMenu) {
      event.preventDefault();
      onContextMenu(event, x, y);
    }
  }, [onContextMenu, x, y]);

  return (
    <div
      ref={ref}
      className={`relative flex items-center justify-center border border-gray-800 ${backgroundColor}`}
      onContextMenu={handleContextMenu}
    >
      {children}
    </div>
  );
}); // Wrapped in React.memo


interface TalentTreeEditorProps {}

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

const TalentTreeEditor: React.FC<TalentTreeEditorProps> = () => {
  // Supabase client is now imported directly from '@/lib/supabase/client'
  const [treeData, setTreeData] = useState<TalentTreeData>({ nodes: [], edges: [] });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const nodeCounter = useRef(0);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: TalentNode; gridX: number; gridY: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const [showTalentSelectModal, setShowTalentSelectModal] = useState(false);
  const [currentTalentNode, setCurrentTalentNode] = useState<TalentNode | null>(null);
  const [availableTalents, setAvailableTalents] = useState<TalentItem[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassItem[]>([]);
  const [talentTrees, setTalentTrees] = useState<TalentTreeItem[]>([]);

  const [currentTree, setCurrentTree] = useState<Partial<TalentTreeItem>>({
    name: '',
    class_id: null,
    is_template: false,
    talents_data: { nodes: [], edges: [] },
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [selectedPathCost, setSelectedPathCost] = useState(0);
  const [selectedCellCost, setSelectedCellCost] = useState(0);

  // Define grid dimensions for testing
  const rows = 30; // 30 talent rows
  const cols = 10; // 10 talent columns

  // Determine cell sizes for talents and arrows
  const talentCellSize = '48px'; // 75% of 64px
  const arrowCellSize = '34px'; // Rounded up from 33.6px (70% of talentCellSize)

  // Create dynamic grid template columns/rows
  const gridTemplateColumns = Array.from({ length: cols * 2 - 1 }, (_, i) =>
    i % 2 === 0 ? talentCellSize : arrowCellSize
  ).join(' ');

  const gridTemplateRows = Array.from({ length: rows * 2 - 1 }, (_, i) =>
    i % 2 === 0 ? talentCellSize : arrowCellSize
  ).join(' ');

  const totalRows = rows * 2 - 1;
  const totalCols = cols * 2 - 1;

  const handleDropItem = useCallback((draggedItem: TalentNode & { isToolbarItem?: boolean }, newX: number, newY: number) => {
    setTreeData(prevData => {
      let newNodes = [...prevData.nodes];

      if (draggedItem.isToolbarItem) {
        nodeCounter.current += 1;
        const newNode: TalentNode = {
          ...draggedItem,
          id: `node-${nodeCounter.current}`,
          x: newX,
          y: newY,
          isToolbarItem: false,
        };

        if (newNode.node_type === 'composite') {
          // Boundary check for composite node
          if (newX < 2) newNode.x = 2;
          if (newX > totalCols - 3) newX = totalCols - 3;

          const groupId = `group-${newNode.id}`;
          newNode.group_id = groupId;
          newNode.is_group_main = true;

          // Create sub-nodes
          const subNode1: TalentNode = { id: `node-${++nodeCounter.current}`, talent_id: -1, x: newX - 2, y: newY, node_type: 'composite_sub', group_id: groupId };
          const subNode2: TalentNode = { id: `node-${++nodeCounter.current}`, talent_id: -1, x: newX + 2, y: newY, node_type: 'composite_sub', group_id: groupId };
          newNodes.push(subNode1, newNode, subNode2);
        } else {
          newNodes.push(newNode);
        }
      } else {
        // Moving an existing item on the grid
        const dx = newX - draggedItem.x;
        const dy = newY - draggedItem.y;

        if (draggedItem.group_id) {
          // It's a composite group, move all nodes with the same group_id
          newNodes = newNodes.map(node => {
            if (node.group_id === draggedItem.group_id) {
              return { ...node, x: node.x + dx, y: node.y + dy };
            }
            return node;
          });
        } else {
          // It's a single node
          newNodes = newNodes.map(node => {
            if (node.id === draggedItem.id) {
              return { ...node, x: newX, y: newY };
            }
            return node;
          });
        }
      }
      // Validate edges after moving nodes
      const newEdges = prevData.edges.filter(edge => {
        const sourceNode = newNodes.find(n => n.id === edge.source);
        const targetNode = newNodes.find(n => n.id === edge.target);
        if (!sourceNode || !targetNode) return false;
        const dx = Math.abs(sourceNode.x - targetNode.x);
        const dy = Math.abs(sourceNode.y - targetNode.y);
        return (dx === 2 && dy === 0) || (dx === 0 && dy === 2);
      });

      return { ...prevData, nodes: newNodes, edges: newEdges };
    });
    setContextMenu(null);
  }, [totalCols]);

  const handleContextMenu = useCallback((event: React.MouseEvent, gridX: number, gridY: number) => {
    event.preventDefault();
    const item = treeData.nodes.find(n => n.x === gridX && n.y === gridY);
    if (item) {
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        item: item,
        gridX,
        gridY,
      });
    } else {
      setContextMenu(null);
    }
  }, [treeData.nodes]);

  const handleDeleteEdge = (edgeId: string) => {
    setTreeData(prevData => ({
      ...prevData,
      edges: prevData.edges.filter(e => e.id !== edgeId),
    }));
  };

  const handleItemClick = useCallback((clickedNode: TalentNode) => {
    setSelectedNodeId(clickedNode.id);
  }, []);

  useEffect(() => {
    const calculateCosts = () => {
      if (!availableTalents.length) return;

      // Calculate total cost
      const uniqueTalentIds = new Set<number>();
      treeData.nodes.forEach(node => {
        if (node.talent_id !== -1) {
          uniqueTalentIds.add(node.talent_id);
        }
      });

      let currentTotalCost = 0;
      uniqueTalentIds.forEach(talentId => {
        const talent = availableTalents.find(t => t.id === talentId);
        if (talent) {
          currentTotalCost += talent.cost_levels || 0;
        }
      });
      setTotalCost(currentTotalCost);

      // Calculate selected path cost
      if (selectedNodeId) {
        const selectedNode = treeData.nodes.find(n => n.id === selectedNodeId);
        
        // Calculate and set the cost for the single selected cell
        if (selectedNode) {
          const talent = availableTalents.find(t => t.id === selectedNode.talent_id);
          setSelectedCellCost(talent?.cost_levels || 0);
        } else {
          setSelectedCellCost(0);
        }

        // --- Calculate path cost ---
        const allPredecessors = new Set<string>();
        const queue: string[] = [];
        const visited = new Set<string>();

        // Determine the starting nodes for traversal. If a node in a group is selected, start from all nodes in that group.
        if (selectedNode) {
            if (selectedNode.group_id) {
                treeData.nodes.forEach(node => {
                    if (node.group_id === selectedNode.group_id) {
                        queue.push(node.id);
                    }
                });
            } else {
                queue.push(selectedNode.id);
            }
        }

        // Traverse backwards from all starting nodes
        while (queue.length > 0) {
          const currentNodeId = queue.shift()!;
          if (visited.has(currentNodeId)) continue;
          
          visited.add(currentNodeId);
          allPredecessors.add(currentNodeId);

          const currentNode = treeData.nodes.find(n => n.id === currentNodeId);
          if (currentNode && currentNode.group_id) {
            treeData.nodes.forEach(node => {
              if (node.group_id === currentNode.group_id && !visited.has(node.id)) {
                queue.push(node.id);
              }
            });
          }

          treeData.edges.forEach(edge => {
            if (edge.target === currentNodeId && !visited.has(edge.source)) {
                queue.push(edge.source);
            }
          });
        }

        // Sum up the costs of the unique talents in the path
        let currentSelectedPathCost = 0;
        const uniquePathTalentIds = new Set<number>();
        allPredecessors.forEach(nodeId => {
          const node = treeData.nodes.find(n => n.id === nodeId);
          if (node && node.talent_id !== -1) {
            uniquePathTalentIds.add(node.talent_id);
          }
        });

        uniquePathTalentIds.forEach(talentId => {
          const talent = availableTalents.find(t => t.id === talentId);
          if (talent) {
            currentSelectedPathCost += talent.cost_levels || 0;
          }
        });
        setSelectedPathCost(currentSelectedPathCost);

      } else {
        setSelectedPathCost(0);
        setSelectedCellCost(0);
      }
    };

    calculateCosts();
  }, [treeData, selectedNodeId, availableTalents]);

  const handleLink = useCallback((sourceNodeId: string, direction: 'up' | 'down' | 'left' | 'right') => {
    const sourceNode = treeData.nodes.find(n => n.id === sourceNodeId);
    if (!sourceNode) return;

    let targetX = sourceNode.x;
    let targetY = sourceNode.y;

    switch (direction) {
      case 'up':
        targetY -= 2;
        break;
      case 'down':
        targetY += 2;
        break;
      case 'left':
        targetX -= 2;
        break;
      case 'right':
        targetX += 2;
        break;
    }

    const targetNode = treeData.nodes.find(n => n.x === targetX && n.y === targetY);

    if (targetNode) {
      const newEdge: TalentEdge = {
        id: `edge-${sourceNode.id}-${targetNode.id}`,
        source: sourceNode.id,
        target: targetNode.id,
      };

      if (!treeData.edges.some(e => e.source === newEdge.source && e.target === newEdge.target)) {
        setTreeData(prevData => ({
          ...prevData,
          edges: [...prevData.edges, newEdge],
        }));
      }
    }
  }, [treeData]);

  const handleDeleteItem = useCallback(() => {
    if (contextMenu) {
      const itemToDelete = contextMenu.item;

      setTreeData(prevData => {
        let nodesToKeep = prevData.nodes;
        let edgesToKeep = prevData.edges;

        if (itemToDelete.group_id) {
          // It's part of a composite group, delete all nodes with the same group_id
          const groupIdsToDelete = new Set(prevData.nodes
            .filter(n => n.group_id === itemToDelete.group_id)
            .map(n => n.id)
          );
          nodesToKeep = prevData.nodes.filter(n => !groupIdsToDelete.has(n.id));
          edgesToKeep = prevData.edges.filter(e => !groupIdsToDelete.has(e.source) && !groupIdsToDelete.has(e.target));
        } else {
          // It's a single talent
          const nodeIdToDelete = itemToDelete.id;
          nodesToKeep = prevData.nodes.filter(n => n.id !== nodeIdToDelete);
          edgesToKeep = prevData.edges.filter(e => e.source !== nodeIdToDelete && e.target !== nodeIdToDelete);
        }

        return {
          ...prevData,
          nodes: nodesToKeep,
          edges: edgesToKeep,
        };
      });
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

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as HTMLElement)) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleMouseDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [contextMenu]);

  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch talents
      const { data: talentsData, error: talentsError } = await supabase
        .from('talents')
        .select('*');
      if (talentsError) {
        console.error('Error fetching talents:', talentsError);
      } else {
        setAvailableTalents(talentsData);
      }

      // Fetch classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*');
      if (classesError) {
        console.error('Error fetching classes:', classesError);
      } else {
        setAvailableClasses(classesData);
      }

      // Fetch talent trees
      const { data: treesData, error: treesError } = await supabase
        .from('talent_trees')
        .select('*');
      if (treesError) {
        console.error('Error fetching talent trees:', treesError);
      } else {
        setTalentTrees(treesData);
      }
    };

    fetchInitialData();
  }, [supabase]);

  const handleSelectTalent = useCallback((talentId: number) => {
    if (currentTalentNode) {
      const selectedTalent = availableTalents.find(t => t.id === talentId);
      setTreeData(prevData => ({
        ...prevData,
        nodes: prevData.nodes.map(node =>
          node.id === currentTalentNode.id
            ? {
                ...node,
                talent_id: talentId,
                icon_url: selectedTalent?.icon_url || null,
              }
            : node
        ),
      }));
      setCurrentTalentNode(null);
      setShowTalentSelectModal(false);
    }
  }, [currentTalentNode, availableTalents]);

  const handleCloseTalentSelectModal = useCallback(() => {
    setShowTalentSelectModal(false);
    setCurrentTalentNode(null);
  }, []);

  const handleSaveTree = useCallback(async (saveAsNew: boolean) => {
    if (!currentTree.name) {
      alert('Please enter a tree name.');
      return;
    }

    const treeToSave = {
      ...currentTree,
      talents_data: treeData,
    };

    let data, error;

    if (saveAsNew || !currentTree.id) {
      // Save as new tree (always insert)
      ({ data, error } = await supabase
        .from('talent_trees')
        .insert({ ...treeToSave, id: undefined, created_at: undefined }) // Ensure new ID
        .select()
        .single());
    } else {
      // Update existing tree
      ({ data, error } = await supabase
        .from('talent_trees')
        .update(treeToSave)
        .eq('id', currentTree.id)
        .select()
        .single());
    }

    if (error) {
      console.error('Error saving talent tree:', error);
      alert(`Failed to save talent tree: ${error.message}`);
    } else {
      alert('Talent tree saved successfully!');
      setCurrentTree(data); // Update currentTree with the saved data (including new ID if saved as new)
      // Refresh the list of talent trees
      const { data: treesData, error: treesError } = await supabase
        .from('talent_trees')
        .select('*');
      if (treesError) {
        console.error('Error fetching talent trees:', treesError);
      } else {
        setTalentTrees(treesData);
      }
    }
  }, [currentTree, treeData]);

  const handleEditTree = useCallback((tree: TalentTreeItem) => {
    setCurrentTree(tree);
    if (tree.talents_data && typeof tree.talents_data === 'object' && 'nodes' in tree.talents_data && 'edges' in tree.talents_data) {
      const data = tree.talents_data as TalentTreeData;
      setTreeData(data);
      const maxId = data.nodes.reduce((max, node) => {
        const idNum = parseInt(node.id.replace('node-', ''), 10);
        return idNum > max ? idNum : max;
      }, 0);
      nodeCounter.current = maxId;
    } else {
      setTreeData({ nodes: [], edges: [] });
      nodeCounter.current = 0;
    }
    setSelectedTemplateId(null);
  }, []);

  const handleDeleteTree = useCallback(async (treeId: number) => {
    if (!window.confirm('Are you sure you want to delete this talent tree?')) {
      return;
    }
    const { error } = await supabase.from('talent_trees').delete().eq('id', treeId);
    if (error) {
      console.error('Error deleting talent tree:', error);
      alert(`Failed to delete tree: ${error.message}`);
    } else {
      alert('Talent tree deleted successfully!');
      // Refresh the list of talent trees
      const { data: treesData, error: treesError } = await supabase
        .from('talent_trees')
        .select('*');
      if (treesError) {
        console.error('Error fetching talent trees:', treesError);
      } else {
        setTalentTrees(treesData);
      }
      // Clear current tree if the deleted one was loaded
      if (currentTree.id === treeId) {
        setCurrentTree({ name: '', class_id: null, is_template: false, talents_data: { nodes: [], edges: [] } });
        setTreeData({ nodes: [], edges: [] });
        setSelectedTemplateId(null);
      }
    }
  }, [currentTree]);

  const handleTemplateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    if (templateId) {
      const selectedTemplate = talentTrees.find(tree => tree.id === parseInt(templateId, 10));
      if (selectedTemplate && selectedTemplate.talents_data && typeof selectedTemplate.talents_data === 'object' && 'nodes' in selectedTemplate.talents_data) {
        const data = selectedTemplate.talents_data as TalentTreeData;
        setTreeData(data);
        const maxId = data.nodes.reduce((max, node) => {
          const idNum = parseInt(node.id.replace('node-', ''), 10);
          return idNum > max ? idNum : max;
        }, 0);
        nodeCounter.current = maxId;
      }
    } else {
      setTreeData({ nodes: [], edges: [] }); // Clear grid if no template selected
      nodeCounter.current = 0;
    }
  }, [talentTrees]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-full"> {/* Main flex container for properties panel and the rest */}
        {/* Properties Panel (left) */}
        <div className="w-64 flex-shrink-0 bg-gray-800 p-4 border-r border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Tree Properties</h3>
          <div className="mb-4">
            <label htmlFor="treeName" className="block text-gray-300 text-sm mb-1">Tree Name</label>
            <Input
              id="treeName"
              value={currentTree.name || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentTree(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter tree name"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="associatedClass" className="block text-gray-300 text-sm mb-1">Associated Class</label>
            <select
              id="associatedClass"
              className="w-full p-2 rounded bg-gray-700 text-gray-200 border border-gray-600"
              value={currentTree.class_id || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrentTree(prev => ({ ...prev, class_id: e.target.value ? parseInt(e.target.value, 10) : null }))}
            >
              <option value="">None</option>
              {availableClasses.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4 flex items-center justify-between">
            <label htmlFor="isTemplate" className="text-gray-300 text-sm">Is Template?</label>
            <Switch
              id="isTemplate"
              checked={currentTree.is_template || false}
              onCheckedChange={(checked: boolean) => setCurrentTree(prev => ({ ...prev, is_template: checked }))}
            />
          </div>
            {currentTree.id ? (
              // If editing an existing tree
              <div className="flex flex-col space-y-2 mb-4">
                <LongButton onClick={() => handleSaveTree(true)} className="w-full" text="Save as New Tree" width={200} />
                <LongButton onClick={() => handleSaveTree(false)} className="w-full" text="Update Current Tree" width={200} />
              </div>
            ) : (
              // If creating a new tree
              <LongButton onClick={() => handleSaveTree(true)} className="w-full mb-4" text="Save Tree" width={150} />
            )}
          <LongButton onClick={() => setTreeData({ nodes: [], edges: [] })} className="w-full mb-4" text="Clear Grid" width={150} />

          <h3 className="text-lg font-semibold mb-4 text-gray-200">Saved Trees</h3>
          <div className="max-h-64 overflow-y-auto border border-gray-700 rounded p-2">
            {talentTrees.length === 0 ? (
              <p className="text-gray-400 text-sm">No trees saved yet.</p>
            ) : (
              <ul>
                {talentTrees.map(tree => (
                  <li key={tree.id} className="flex justify-between items-center py-1 text-gray-300 text-sm">
                    <span>{tree.name} {tree.is_template && '(Template)'}</span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditTree(tree)}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-xs"
                        title="Load and edit this tree (saving will overwrite)"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTree(tree.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs"
                        title="Delete this tree permanently"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-200">Cost Calculator</h3>
            <div className="text-gray-300 text-sm">
              <p>Selected Cell Cost: {selectedCellCost}</p>
              <p>Selected Path Cost: {selectedPathCost}</p>
              <p>Total Tree Cost: {totalCost}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1"> {/* New flex-col container for toolbar and editor grid */}
          {/* Toolbar (top, only above grid) */}
          <div className="bg-gray-800 p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Items</h3>
            <div className="flex space-x-4">
              {/* Draggable Talent */}
              <div className="mb-4">
                <h4 className="text-sm text-gray-300 mb-2">Talents</h4>
                <DraggableTalent node={{ id: 'new-talent-prototype', talent_id: -1, x: -1, y: -1, node_type: 'normal' }} isToolbarItem={true} itemSize={talentCellSize} treeData={treeData} />
              </div>
              <div className="mb-4">
                <h4 className="text-sm text-gray-300 mb-2">Composite Talent</h4>
                <div style={{ width: '160px' }}>
                  <DraggableTalent
                    node={{ id: 'new-composite-prototype', talent_id: -1, x: -1, y: -1, node_type: 'composite', width: 3 }}
                    isToolbarItem={true}
                    itemSize={talentCellSize}
                    treeData={treeData}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Editor Grid (below toolbar) */}
          <div className="flex-1 overflow-auto p-4 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Editor Grid</h2>
            <div
              className="grid border border-gray-700"
              style={{
                gridTemplateColumns: gridTemplateColumns,
                gridTemplateRows: gridTemplateRows,
                gap: '0px',
              }}
            >
              {Array.from({ length: totalRows }).map((_, rowIndex) => (
                Array.from({ length: totalCols }).map((__, colIndex) => {
                  const isTalentCell = (rowIndex % 2 === 0) && (colIndex % 2 === 0);
                  const isArrowCell = (rowIndex % 2 !== 0 && colIndex % 2 === 0) || (rowIndex % 2 === 0 && colIndex % 2 !== 0);
                  const isEmptyIntersectionCell = (rowIndex % 2 !== 0) && (colIndex % 2 !== 0);

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
                      onDropItem={handleDropItem}
                      onContextMenu={nodeOnCell ? handleContextMenu : undefined}
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
                            <div className="relative" style={{ zIndex: 1 }}>
                              <DraggableTalent
                                key={`${nodeOnCell.id}-${nodeOnCell.icon_url || 'no-icon'}`}
                                node={nodeOnCell}
                                itemSize={talentCellSize}
                                onClick={() => handleItemClick(nodeOnCell)}
                                treeData={treeData}
                              />
                              {selectedNodeId === nodeOnCell.id && (
                                <>
                                  {/* Top anchor */}
                                  {!treeData.edges.some(e => (e.source === nodeOnCell.id && treeData.nodes.find(n => n.id === e.target)?.y === nodeOnCell.y - 2) || (e.target === nodeOnCell.id && treeData.nodes.find(n => n.id === e.source)?.y === nodeOnCell.y - 2)) &&
                                    <button onClick={() => handleLink(nodeOnCell.id, 'up')} className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 bg-red-500" />
                                  }
                                  {/* Bottom anchor */}
                                  {!treeData.edges.some(e => (e.source === nodeOnCell.id && treeData.nodes.find(n => n.id === e.target)?.y === nodeOnCell.y + 2) || (e.target === nodeOnCell.id && treeData.nodes.find(n => n.id === e.source)?.y === nodeOnCell.y + 2)) &&
                                    <button onClick={() => handleLink(nodeOnCell.id, 'down')} className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-2 bg-red-500" />
                                  }
                                  {/* Left anchor */}
                                  {nodeOnCell.node_type === 'normal' && !treeData.edges.some(e => (e.source === nodeOnCell.id && treeData.nodes.find(n => n.id === e.target)?.x === nodeOnCell.x - 2) || (e.target === nodeOnCell.id && treeData.nodes.find(n => n.id === e.source)?.x === nodeOnCell.x - 2)) &&
                                    <button onClick={() => handleLink(nodeOnCell.id, 'left')} className="absolute top-1/2 -left-2 -translate-y-1/2 w-2 h-4 bg-red-500" />
                                  }
                                  {/* Right anchor */}
                                  {nodeOnCell.node_type === 'normal' && !treeData.edges.some(e => (e.source === nodeOnCell.id && treeData.nodes.find(n => n.id === e.target)?.x === nodeOnCell.x + 2) || (e.target === nodeOnCell.id && treeData.nodes.find(n => n.id === e.source)?.x === nodeOnCell.x + 2)) &&
                                    <button onClick={() => handleLink(nodeOnCell.id, 'right')} className="absolute top-1/2 -right-2 -translate-y-1/2 w-2 h-4 bg-red-500" />
                                  }
                                </>
                              )}
                            </div>
                          )}
                          {arrowDirection && edge ? (
                            <img
                              src="/image/talent_arrow.svg"
                              alt={`Arrow pointing ${arrowDirection}`}
                              className="object-contain cursor-pointer"
                              onContextMenu={(e) => {
                                e.preventDefault();
                                handleDeleteEdge(edge.id);
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
              ))}
            </div>
            {/* Raw Data Output */}
            <div className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded">
              <h3 className="text-lg font-semibold text-gray-200 mb-2">Raw Tree Data</h3>
              <pre className="text-xs text-gray-300 bg-gray-800 p-2 rounded overflow-auto max-h-60">
                {JSON.stringify(treeData, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <div
            ref={contextMenuRef}
            className="fixed bg-gray-700 border border-gray-600 rounded shadow-lg z-50"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="py-1">
              <li
                className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-gray-200 text-sm"
                onClick={handleChangeItem}
              >
                Change Talent
              </li>
              <li
                className="px-4 py-2 hover:bg-red-700 cursor-pointer text-red-200 text-sm"
                onClick={handleDeleteItem}
              >
                Delete
              </li>
            </ul>
          </div>
        )}

        {/* Talent Selection Modal */}
        {showTalentSelectModal && currentTalentNode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 w-11/12 max-w-md">
              <h3 className="text-xl font-semibold mb-4 text-gray-200">Select Talent</h3>
              <div className="max-h-80 overflow-y-auto mb-4">
                {availableTalents.length === 0 ? (
                  <p className="text-gray-400">No talents available. Please add talents first.</p>
                ) : (
                  <ul className="grid grid-cols-3 gap-4">
                    {availableTalents.map(talent => (
                      <li
                        key={talent.id}
                        className="flex flex-col items-center p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                        onClick={() => handleSelectTalent(talent.id)}
                      >
                        <IconFrame
                          size={48}
                          styleType="yellow"
                          altText={talent.name}
                          contentImageUrl={talent.icon_url}
                        />
                        <span className="text-gray-200 text-xs mt-1 text-center">{talent.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <LongButton onClick={handleCloseTalentSelectModal} className="w-full" text="Cancel" width={100} />
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};


export default TalentTreeEditor;
