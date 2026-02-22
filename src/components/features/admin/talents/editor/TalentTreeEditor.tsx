'use client';

import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTalentTreeData } from './useTalentTreeData';
import { useTreeInteraction } from './useTreeInteraction';
import EditorCanvas from './EditorCanvas';
import EditorSidebar from './EditorSidebar';
import TalentSelectModal from './TalentSelectModal';
import { useTalentTreeStore } from './store';
import { TalentNode } from '@/types/talents';

const TalentTreeEditor: React.FC = () => {
    // Reuse data fetching and interactions from V2
    useTalentTreeData();
    const { handleSaveTree, handleDeleteTree, handleEditTree, handleClearGrid } = useTreeInteraction();
    const { updateNode } = useTalentTreeStore();

    const [showTalentSelectModal, setShowTalentSelectModal] = useState(false);
    const [currentTalentNode, setCurrentTalentNode] = useState<TalentNode | null>(null);

    const handleSelectTalent = (talentId: number) => {
        if (currentTalentNode) {
            updateNode(currentTalentNode.id, { talent_id: talentId });
            setCurrentTalentNode(null);
            setShowTalentSelectModal(false);
        }
    };

    const openTalentSelect = (node: TalentNode) => {
        setCurrentTalentNode(node);
        setShowTalentSelectModal(true);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex flex-col md:flex-row h-[800px] md:h-[calc(100vh-140px)] w-full max-w-full border border-gray-800 rounded-xl overflow-hidden bg-gray-950 shadow-2xl transition-all duration-300">
                <EditorSidebar
                    onSave={handleSaveTree}
                    onDelete={handleDeleteTree}
                    onEdit={handleEditTree}
                    onClear={handleClearGrid}
                />
                <EditorCanvas onEditNode={openTalentSelect} />

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

export default TalentTreeEditor;
