'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import { useTalentTreeStore } from '../v2/store';
import { TalentTreeItem } from '@/types/talents';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch/switch';
import IconFrame from '@/components/shared/IconFrame';
import FreeCompositeFrame from '@/components/ui/FreeCompositeFrame';

const ItemTypes = {
    TALENT: 'talent',
};

const DraggablePaletteItem = ({ type, label, width }: { type: string, label: string, width?: number }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.TALENT,
        item: {
            node_type: type,
            isToolbarItem: true,
            talent_id: -1,
            width: width
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={(node) => { drag(node); }}
            className={`flex items-center gap-2 p-1.5 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700 cursor-grab active:cursor-grabbing transition-colors ${isDragging ? 'opacity-50' : ''}`}
            title={label}
        >
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
                {type === 'free_composite' ? (
                    <div className="scale-[0.5] origin-center">
                        <FreeCompositeFrame isUnlocked={true} />
                    </div>
                ) : (
                    <IconFrame
                        size={28}
                        styleType="yellow"
                        contentImageUrl={null}
                        frameType={
                            type === 'key' ? 'key' :
                                type === 'lesser' ? 'lesser' : 'regular'
                        }
                    />
                )}
            </div>
            <span className="text-[11px] font-medium text-gray-300 truncate">{label}</span>
        </div>
    );
};

interface EditorSidebarProps {
    onSave: (isNew: boolean) => void;
    onDelete: (treeId: number) => void;
    onEdit: (tree: TalentTreeItem) => void;
    onClear: () => void;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({ onSave, onDelete, onEdit, onClear }) => {
    const {
        currentTree,
        updateCurrentTree,
        availableClasses,
        talentTrees,
        selectedNodeId,
        treeData,
        setSelectedNodeId,
        setTreeData,
        availableTalents,
        updateNode
    } = useTalentTreeStore();

    const selectedNode = treeData.nodes.find(n => n.id === selectedNodeId);
    const selectedTalent = availableTalents.find(t => t.id === selectedNode?.talent_id);

    const handleDeleteSelectedNode = () => {
        if (!selectedNode) return;

        let newNodes = treeData.nodes;
        let nodeIdsToRemove = [selectedNode.id];

        if (selectedNode.group_id) {
            const groupNodes = treeData.nodes.filter(n => n.group_id === selectedNode.group_id);
            nodeIdsToRemove = groupNodes.map(n => n.id);
            newNodes = treeData.nodes.filter(n => n.group_id !== selectedNode.group_id);
        } else {
            newNodes = treeData.nodes.filter(n => n.id !== selectedNode.id);
        }

        const newEdges = treeData.edges.filter(e =>
            !nodeIdsToRemove.includes(e.source) && !nodeIdsToRemove.includes(e.target)
        );

        setTreeData({ nodes: newNodes, edges: newEdges });
        setSelectedNodeId(null);
    };

    const handleClearTalent = () => {
        if (!selectedNodeId) return;
        updateNode(selectedNodeId, { talent_id: -1 });
    };

    return (
        <div className="w-full md:w-72 bg-gray-900 border-b md:border-b-0 md:border-r border-gray-800 flex flex-col z-10 shadow-2xl overflow-hidden shrink-0">
            <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">

                {/* Palette Section */}
                <div className="p-4 border-b border-gray-800">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Node Palette</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <DraggablePaletteItem type="normal" label="Normal" />
                        <DraggablePaletteItem type="key" label="Key" />
                        <DraggablePaletteItem type="lesser" label="Lesser" />
                        <DraggablePaletteItem type="composite" label="Group" width={3} />
                        <DraggablePaletteItem type="free_composite" label="Free" />
                    </div>
                </div>

                {/* Selected Node Properties */}
                {selectedNode && (
                    <div className="p-4 border-b border-gray-800 bg-blue-900/10 space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Node Properties</h3>
                            <button onClick={() => setSelectedNodeId(null)} className="text-gray-500 hover:text-gray-300">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-950 rounded flex items-center justify-center border border-gray-700 overflow-hidden">
                                {selectedTalent ? (
                                    <img src={selectedTalent.icon_url || undefined} className="w-full h-full object-contain" />
                                ) : (
                                    <div className="w-10 h-10 bg-gray-800 flex items-center justify-center">
                                        <span className="text-[10px] text-gray-600">None</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-200 truncate">{selectedTalent?.name || 'Unassigned Node'}</p>
                                <p className="text-[10px] text-gray-500 uppercase">{selectedNode.node_type.replace('_', ' ')}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                                onClick={handleClearTalent}
                                className="py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-[10px] font-bold border border-gray-700 transition-colors shadow-sm"
                            >
                                Clear Talent
                            </button>
                            <button
                                onClick={handleDeleteSelectedNode}
                                className="py-1.5 bg-red-900/40 hover:bg-red-800/60 text-red-200 rounded text-[10px] font-bold border border-red-900/50 transition-colors shadow-sm"
                            >
                                Delete Node
                            </button>
                        </div>
                    </div>
                )}

                {/* Properties Section */}
                <div className="p-4 border-b border-gray-800 space-y-4">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Configuration</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Name</label>
                            <Input
                                value={currentTree.name || ''}
                                onChange={(e) => updateCurrentTree({ name: e.target.value })}
                                className="bg-gray-810 border-gray-700 focus:border-blue-500 h-8 text-xs px-2"
                                placeholder="Tree name..."
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase">Class</label>
                            <select
                                className="w-full bg-gray-810 border border-gray-700 rounded p-1.5 text-xs text-gray-200 focus:outline-none focus:border-blue-500 hover:bg-gray-800 transition-colors"
                                value={currentTree.class_id || ''}
                                onChange={(e) => updateCurrentTree({ class_id: e.target.value ? parseInt(e.target.value) : null })}
                            >
                                <option value="">No Class</option>
                                {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center justify-between bg-gray-810 p-2 rounded border border-gray-700 hover:bg-gray-800 transition-colors">
                            <span className="text-xs text-gray-400">Template Mode</span>
                            <Switch
                                checked={currentTree.is_template}
                                onCheckedChange={(checked) => updateCurrentTree({ is_template: checked })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 pt-2">
                        <button onClick={() => onSave(false)} className="py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-all shadow-lg active:scale-95">Update Tree</button>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => onSave(true)} className="py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-[10px] font-bold transition-colors">Clone</button>
                            <button onClick={onClear} className="py-1.5 bg-red-900/30 hover:bg-red-800/50 text-red-400 border border-red-900/50 rounded text-[10px] font-bold transition-colors">Clear</button>
                        </div>
                    </div>
                </div>

                {/* Library Section */}
                <div className="p-4 flex-1">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Saved Trees</h3>
                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        {talentTrees.map(tree => (
                            <div key={tree.id} className="group relative flex items-center justify-between p-2 rounded bg-gray-810 hover:bg-gray-800 border border-transparent hover:border-gray-700 transition-all">
                                <span className="text-xs text-gray-400 truncate max-w-[160px] group-hover:text-gray-200">{tree.name}</span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    <button onClick={() => onEdit(tree)} className="p-1 px-2 bg-blue-600/80 rounded text-[9px] text-white hover:bg-blue-500">Edit</button>
                                    <button onClick={() => onDelete(tree.id)} className="p-1 px-2 bg-red-600/80 rounded text-[9px] text-white hover:bg-red-500">Del</button>
                                </div>
                            </div>
                        ))}
                        {talentTrees.length === 0 && <p className="text-[10px] text-center text-gray-600 italic py-4">No libraries found</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorSidebar;
