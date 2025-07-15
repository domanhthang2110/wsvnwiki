'use client';

import React from 'react';
import { useTalentTreeStore } from './store';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch/switch';
import LongButton from '@/components/ui/LongButton';

interface PropertiesPanelProps {
  onSave: (isNew: boolean) => void;
  onDelete: (treeId: number) => void;
  onEdit: (tree: any) => void;
  onClear: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ onSave, onDelete, onEdit, onClear }) => {
  const {
    currentTree,
    updateCurrentTree,
    availableClasses,
    talentTrees,
    treeData,
    selectedNodeId,
    availableTalents,
  } = useTalentTreeStore();

  const [totalCost, setTotalCost] = React.useState(0);
  const [selectedPathCost, setSelectedPathCost] = React.useState(0);
  const [selectedCellCost, setSelectedCellCost] = React.useState(0);
  const [selectedPathFormula, setSelectedPathFormula] = React.useState('');

  React.useEffect(() => {
    const calculateCosts = () => {
      if (!availableTalents.length) return;

      // Calculate total cost
      let currentTotalCost = 0;
      const processedTotalTalentIds = new Set<number>();
      const processedTotalGroupIds = new Set<string>();

      treeData.nodes.forEach(node => {
        if (node.talent_id !== -1) {
          if (node.group_id) {
            if (!processedTotalGroupIds.has(node.group_id)) {
              const talent = availableTalents.find(t => t.id === node.talent_id);
              if (talent && talent.knowledge_levels) {
                // Sum all knowledge costs for the talent
                currentTotalCost += Object.values(talent.knowledge_levels).reduce((sum, cost) => sum + cost, 0);
                processedTotalGroupIds.add(node.group_id);
                processedTotalTalentIds.add(node.talent_id);
              }
            }
          } else if (!processedTotalTalentIds.has(node.talent_id)) {
            const talent = availableTalents.find(t => t.id === node.talent_id);
            if (talent && talent.knowledge_levels) {
              // Sum all knowledge costs for the talent
              currentTotalCost += Object.values(talent.knowledge_levels).reduce((sum, cost) => sum + cost, 0);
              processedTotalTalentIds.add(node.talent_id);
            }
          }
        }
      });
      setTotalCost(currentTotalCost);

      // Calculate selected path cost
      if (selectedNodeId) {
        const selectedNode = treeData.nodes.find(n => n.id === selectedNodeId);
        
        if (selectedNode) {
          const talent = availableTalents.find(t => t.id === selectedNode.talent_id);
          // Sum knowledge costs for the selected cell
          setSelectedCellCost(talent?.knowledge_levels ? Object.values(talent.knowledge_levels).reduce((sum, cost) => sum + cost, 0) : 0);
        } else {
          setSelectedCellCost(0);
        }

        const allPredecessors = new Set<string>();
        const queue: string[] = [];
        const visited = new Set<string>();

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

        let currentSelectedPathCost = 0;
        const processedTalentIds = new Set<number>();
        const processedGroupIds = new Set<string>();
        const formulaParts: string[] = [];

        allPredecessors.forEach(nodeId => {
          const node = treeData.nodes.find(n => n.id === nodeId);
          if (node && node.talent_id !== -1) {
            if (node.group_id) {
              if (!processedGroupIds.has(node.group_id)) {
                const talent = availableTalents.find(t => t.id === node.talent_id);
                if (talent && talent.knowledge_levels) {
                  const talentKnowledgeCost = Object.values(talent.knowledge_levels).reduce((sum, cost) => sum + cost, 0);
                  currentSelectedPathCost += talentKnowledgeCost;
                  formulaParts.push(`${talent.name} (${talentKnowledgeCost})`);
                  processedGroupIds.add(node.group_id);
                  processedTalentIds.add(node.talent_id);
                }
              }
            } else if (!processedTalentIds.has(node.talent_id)) {
              const talent = availableTalents.find(t => t.id === node.talent_id);
              if (talent && talent.knowledge_levels) {
                const talentKnowledgeCost = Object.values(talent.knowledge_levels).reduce((sum, cost) => sum + cost, 0);
                currentSelectedPathCost += talentKnowledgeCost;
                formulaParts.push(`${talent.name} (${talentKnowledgeCost})`);
                processedTalentIds.add(node.talent_id);
              }
            }
          }
        });

        setSelectedPathCost(currentSelectedPathCost);
        setSelectedPathFormula(formulaParts.join(' + '));

      } else {
        setSelectedPathCost(0);
        setSelectedCellCost(0);
        setSelectedPathFormula('');
      }
    };

    calculateCosts();
  }, [treeData, selectedNodeId, availableTalents]);

  return (
    <div className="w-64 flex-shrink-0 bg-gray-800 p-4 border-r border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-200">Tree Properties</h3>
      <div className="mb-4">
        <label htmlFor="treeName" className="block text-gray-300 text-sm mb-1">Tree Name</label>
        <Input
          id="treeName"
          value={currentTree.name || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCurrentTree({ name: e.target.value })}
          placeholder="Enter tree name"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="associatedClass" className="block text-gray-300 text-sm mb-1">Associated Class</label>
        <select
          id="associatedClass"
          className="w-full p-2 rounded bg-gray-700 text-gray-200 border border-gray-600"
          value={currentTree.class_id || ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateCurrentTree({ class_id: e.target.value ? parseInt(e.target.value, 10) : null })}
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
          onCheckedChange={(checked: boolean) => updateCurrentTree({ is_template: checked })}
        />
      </div>
      {currentTree.id ? (
        <div className="flex flex-col space-y-2 mb-4">
          <LongButton onClick={() => onSave(true)} className="w-full" text="Save as New Tree" width={200} />
          <LongButton onClick={() => onSave(false)} className="w-full" text="Update Current Tree" width={200} />
        </div>
      ) : (
        <LongButton onClick={() => onSave(true)} className="w-full mb-4" text="Save Tree" width={150} />
      )}
      <LongButton onClick={onClear} className="w-full mb-4" text="Clear Grid" width={150} />

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
                    onClick={() => onEdit(tree)}
                    className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-xs"
                    title="Load and edit this tree (saving will overwrite)"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(tree.id)}
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
          {selectedPathFormula && <p className="text-xs text-gray-400">({selectedPathFormula})</p>}
          <p>Total Tree Cost: {totalCost}</p>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
