'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import { useTalentTreeStore } from '../v2/store';
import IconFrame from '@/components/shared/IconFrame';

const ItemTypes = {
    TALENT: 'talent',
};

const DraggablePaletteItem = ({ type, label, icon, width }: { type: string, label: string, icon?: string, width?: number }) => {
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
            className={`flex items-center gap-2 p-2 rounded bg-gray-800 border border-gray-700 hover:bg-gray-700 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}
        >
            <div className="w-8 h-8 flex items-center justify-center bg-gray-900 rounded shrink-0">
                {type === 'key' ? <div className="w-5 h-5 border-2 border-yellow-500 rounded-lg transform rotate-45" /> :
                    type === 'lesser' ? <div className="w-5 h-5 border border-gray-400 rounded-full" /> :
                        type === 'normal' ? <div className="w-6 h-6 border border-gray-500 rounded" /> :
                            <div className="w-6 h-6 border-2 border-purple-500 rounded" />
                }
            </div>
            <span className="text-sm text-gray-200">{label}</span>
        </div>
    );
};

const NodePalette: React.FC = () => {
    return (
        <div className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col z-10 shadow-xl">
            <div className="p-4 border-b border-gray-800 bg-gray-900">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Palette</h3>
            </div>
            <div className="p-3 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                <div className="text-xs font-semibold text-gray-600 mb-2 mt-2 px-1">Standard Nodes</div>
                <DraggablePaletteItem type="normal" label="Normal Node" />
                <DraggablePaletteItem type="key" label="Key Class" />
                <DraggablePaletteItem type="lesser" label="Lesser Class" />

                <div className="text-xs font-semibold text-gray-600 mb-2 mt-6 px-1">Grouping</div>
                <DraggablePaletteItem type="composite" label="Composite Group" width={3} />
                <DraggablePaletteItem type="free_composite" label="Free Group" />
            </div>
        </div>
    );
};

export default NodePalette;
