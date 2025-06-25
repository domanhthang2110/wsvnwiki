'use client';

import React from 'react';
import { TalentTreeItem, TalentItem } from '@/types/talents';
import IconFrame from '@/components/shared/IconFrame';
import TalentInfoModal from './TalentInfoModal';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface TalentTreeViewProps {
  talentTree: TalentTreeItem;
  talents: TalentItem[];
}

const TalentTreeView: React.FC<TalentTreeViewProps> = ({ talentTree, talents }) => {
  const [selectedTalent, setSelectedTalent] = React.useState<TalentItem | null>(null);
  const [isDebugMode, setIsDebugMode] = React.useState(false);

  if (!talentTree.talents_data) {
    return <p>No talent tree data available.</p>;
  }

  const talentDataMap = new Map(talentTree.talents_data.map(t => [`${t.x},${t.y}`, t]));
  const talentInfoMap = new Map(talents.map(t => [t.id, t]));

  const talentCellSize = '48px';
  const arrowCellSize = '34px';

  const fixedMaxX = 16; // 9 talent columns + 8 arrow columns = 17 total columns (0-16)
  const fixedMaxY = 52; // 27 talent rows + 26 arrow rows = 53 total rows (0-52)

  const gridTemplateColumns = Array.from({ length: fixedMaxX + 1 }, (_, i) =>
    i % 2 === 0 ? talentCellSize : arrowCellSize
  ).join(' ');

  const gridTemplateRows = Array.from({ length: fixedMaxY + 1 }, (_, i) =>
    i % 2 === 0 ? talentCellSize : arrowCellSize
  ).join(' ');

  return (
    <>
      <div className="flex justify-end p-2">
        <button
          onClick={() => setIsDebugMode(!isDebugMode)}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          Toggle Debug Grid ({isDebugMode ? 'ON' : 'OFF'})
        </button>
      </div>
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={2}
        limitToBounds={false} // Allow panning past limits
        centerOnInit={true} // Center the content initially
        panning={{
          velocityDisabled: true, // Disable inertia for simpler panning
        }}
        wheel={{
          disabled: true, // Disable wheel zoom
        }}
        doubleClick={{ disabled: true }} // Disable double click zoom
      >
        <TransformComponent
          wrapperStyle={{
            width: '100%',
            height: '500px', // Ensure a fixed height for the wrapper
            overflow: 'hidden', // Hide native scrollbars
            border: '1px solid #e6ce63', // Re-add border from original div
            backgroundColor: 'rgba(26, 32, 44, 0.3)', // Re-add background from original div
          }}
          contentStyle={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            width: '100%',
            height: '100%',
          }}
        >
          <div
            className="grid p-8" /* Added p-8 for padding to allow panning past limits */
            style={{
              gridTemplateColumns,
              gridTemplateRows,
              gap: '0px',
            }}
          >
            {Array.from({ length: (fixedMaxY + 1) * (fixedMaxX + 1) }).map((_, index) => {
              const x = index % (fixedMaxX + 1);
              const y = Math.floor(index / (fixedMaxX + 1));
              const talentData = talentDataMap.get(`${x},${y}`);

              const debugBgColor = isDebugMode
                ? (x % 2 === 0 && y % 2 === 0 && (x === 4 || x === 8 || x === 12)) // Check if it's a talent cell at 3rd, 5th, or 7th talent column
                  ? 'bg-purple-500/20' // Color for marked talent columns
                  : talentData?.type === 'talent'
                  ? 'bg-green-500/20' // Color for other talent cells
                  : talentData?.type === 'arrow'
                  ? 'bg-blue-500/20' // Color for arrow cells
                  : 'bg-red-500/20' // Color for empty cells
                : '';

              if (!talentData) {
                return <div key={index} className={`${debugBgColor}`} />;
              }

              if (talentData.type === 'talent') {
                const talentInfo = talentData.talent_id ? talentInfoMap.get(talentData.talent_id) : null;
                return (
                  <div key={index} className={`flex items-center justify-center ${debugBgColor}`} onClick={() => {
                    if (talentInfo) {
                      setSelectedTalent(talentInfo);
                    } else {
                      console.log('Talent info not found for click:', talentData);
                    }
                  }}>
                    <IconFrame
                      size={parseInt(talentCellSize, 10)}
                      styleType="yellow"
                      altText={talentInfo?.name || "Talent"}
                      contentImageUrl={talentInfo?.icon_url}
                    />
                  </div>
                );
              }

              if (talentData.type === 'arrow') {
                return (
                  <div key={index} className={`flex items-center justify-center ${debugBgColor}`}>
                    <img
                      src="/image/talent_arrow.svg"
                      alt={`Arrow pointing ${talentData.direction}`}
                      className="object-contain"
                      style={{
                        width: `calc(${arrowCellSize} * 0.7)`,
                        height: `calc(${arrowCellSize} * 0.7)`,
                        transform: talentData.direction === 'down' ? 'rotate(90deg)' :
                                   talentData.direction === 'left' ? 'rotate(180deg)' :
                                   talentData.direction === 'up' ? 'rotate(270deg)' : 'none'
                      }}
                    />
                  </div>
                );
              }

              return <div key={index} className={`${debugBgColor}`} />;
            })}
          </div>
        </TransformComponent>
      </TransformWrapper>
      {selectedTalent && (
        <TalentInfoModal talent={selectedTalent} onClose={() => setSelectedTalent(null)} />
      )}
    </>
  );
};

export default TalentTreeView;
