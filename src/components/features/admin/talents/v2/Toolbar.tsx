'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import IconFrame from '@/components/shared/IconFrame';
import { TalentNode } from '@/types/talents';

const ItemTypes = {
  TALENT: 'talent',
};

interface DraggableTalentProps {
  node: TalentNode;
  itemSize: string;
}

const DraggableTalent: React.FC<DraggableTalentProps> = ({ node, itemSize }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TALENT,
    item: { ...node, isToolbarItem: true },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  drag(ref);

  return (
    <div
      ref={ref}
      className="cursor-grab flex items-center justify-center"
      style={{ opacity: isDragging ? 0.5 : 1, transform: 'translateY(1px)', width: itemSize, height: itemSize }}
    >
      <IconFrame
        size={parseInt(itemSize, 10)}
        styleType="yellow"
        altText=""
        contentImageUrl={node.icon_url || null}
      />
    </div>
  );
};

const Toolbar: React.FC = () => {
  const talentCellSize = '48px';

  return (
    <div className="bg-gray-800 p-4 border-b border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-200">Items</h3>
      <div className="flex space-x-4">
        <div className="mb-4">
          <h4 className="text-sm text-gray-300 mb-2">Talents</h4>
          <DraggableTalent node={{ id: 'new-talent-prototype', talent_id: -1, x: -1, y: -1, node_type: 'normal' }} itemSize={talentCellSize} />
        </div>
        <div className="mb-4">
          <h4 className="text-sm text-gray-300 mb-2">Composite Talent</h4>
          <div style={{ width: '160px' }}>
            <DraggableTalent
              node={{ id: 'new-composite-prototype', talent_id: -1, x: -1, y: -1, node_type: 'composite', width: 3 }}
              itemSize={talentCellSize}
            />
          </div>
        </div>
        <div className="mb-4">
          <h4 className="text-sm text-gray-300 mb-2">Free Composite</h4>
          <DraggableTalent
            node={{ id: 'new-free-composite-prototype', talent_id: -1, x: -1, y: -1, node_type: 'free_composite' }}
            itemSize={talentCellSize}
          />
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
