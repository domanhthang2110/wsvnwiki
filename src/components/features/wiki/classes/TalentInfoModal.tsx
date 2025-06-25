'use client';

import React from 'react';
import { TalentItem } from '@/types/talents';
import LongButton from '@/components/ui/LongButton';
import IconFrame from '@/components/shared/IconFrame';

interface TalentInfoModalProps {
  talent: TalentItem;
  onClose: () => void;
}

const TalentInfoModal: React.FC<TalentInfoModalProps> = ({ talent, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 w-11/12 max-w-md">
        <div className="flex items-center space-x-4 mb-4">
          <IconFrame
            size={64}
            styleType="yellow"
            altText={talent.name}
            contentImageUrl={talent.icon_url}
          />
          <h3 className="text-xl font-semibold text-gray-200">{talent.name}</h3>
        </div>
        <p className="text-gray-300 mb-4">{talent.description}</p>
        <LongButton onClick={onClose} className="w-full" text="Close" width={100} />
      </div>
    </div>
  );
};

export default TalentInfoModal;
