'use client';

import React from 'react';
import { SkillItem } from '@/types/skills';
import IconFrame from '@/components/shared/IconFrame';

interface SkillCardProps {
  skill: SkillItem;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill }) => {
  return (
    <div className="flex items-center space-x-4 p-2 border border-gray-700 rounded-md bg-gray-800/50">
      <IconFrame
        size={64}
        styleType="yellow"
        altText={skill.name || ''}
        contentImageUrl={skill.icon_url}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <h4 className="text-lg font-semibold break-words whitespace-normal" style={{ wordBreak: 'break-word' }}>{skill.name || ''}</h4>
      </div>
    </div>
  );
};

export default SkillCard;
