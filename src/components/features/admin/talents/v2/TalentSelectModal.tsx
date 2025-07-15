'use client';

import React from 'react';
import { useTalentTreeStore } from './store';
import IconFrame from '@/components/shared/IconFrame';
import LongButton from '@/components/ui/LongButton';
import { TalentItem } from '@/types/talents';

interface TalentSelectModalProps {
  onSelect: (talentId: number) => void;
  onClose: () => void;
}

const TalentSelectModal: React.FC<TalentSelectModalProps> = ({ onSelect, onClose }) => {
  const { availableTalents } = useTalentTreeStore();

  return (
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
                  onClick={() => onSelect(talent.id)}
                >
                  <IconFrame
                    size={48}
                    styleType="yellow"
                    altText={talent.name}
                    contentImageUrl={talent.icon_url}
                  />
                  <span className="text-gray-200 text-xs mt-1 text-center">{talent.name}</span>
                  {talent.knowledge_levels && (
                    <span className="text-gray-400 text-xs">
                      Cost: {Object.values(talent.knowledge_levels).reduce((sum, cost) => sum + cost, 0)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <LongButton onClick={onClose} className="w-full" text="Cancel" width={100} />
      </div>
    </div>
  );
};

export default TalentSelectModal;
