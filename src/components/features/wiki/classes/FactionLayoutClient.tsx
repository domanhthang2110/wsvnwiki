'use client';

import React, { useState, useEffect } from 'react';
import { ClassItem } from '@/types/classes';
import { Faction, Side } from '@/lib/data/factionMap';
import IconFrame from '@/components/shared/IconFrame';
import ClassDetailView from './ClassDetailView';
import NameTooltip from './NameTooltip';

interface FactionLayoutClientProps {
  classes: ClassItem[];
}

export default function FactionLayoutClient({ classes }: FactionLayoutClientProps) {
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [hoveredClass, setHoveredClass] = useState<ClassItem | null>(null);
  const [tooltipAnchorEl, setTooltipAnchorEl] = useState<HTMLElement | null>(null);

  // Group classes by side and then by faction
  const groupedClasses = classes.reduce((acc, classItem) => {
    if (!acc[classItem.side]) {
      acc[classItem.side] = {
        Chosen: [], Firstborn: [],
        'Mountain Clan': [], Forsaken: []
      };
    }
    // Ensure the specific faction array exists before pushing
    if (classItem.faction && !acc[classItem.side][classItem.faction]) {
      acc[classItem.side][classItem.faction] = [];
    }
    if (classItem.faction) { // This check is now redundant but harmless
      acc[classItem.side][classItem.faction].push(classItem);
    }
    return acc;
  }, {} as Record<Side, Record<Faction, ClassItem[]>>);

  // Set the first class as selected by default when component mounts or classes change
  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0]);
    }
  }, [classes, selectedClass]);

  const handleMouseEnter = (classItem: ClassItem, event: React.MouseEvent<HTMLDivElement>) => {
    setHoveredClass(classItem);
    setTooltipAnchorEl(event.currentTarget);
  };

  const handleMouseLeave = () => {
    setHoveredClass(null);
    setTooltipAnchorEl(null);
  };

  const renderFactionRow = (factionName: Faction, factionClasses: ClassItem[]) => (
    <div key={factionName} className="mb-6">
      <h3 className="text-xl font-semibold text-blue-400 mb-4 text-center">{factionName}</h3>
      <div className="flex flex-wrap justify-center gap-4">
        {factionClasses.map(classItem => (
          <div
            key={classItem.id}
            className={`relative p-1 rounded-lg transition-all duration-200
              ${selectedClass?.id === classItem.id ? 'bg-blue-600 shadow-lg' : 'hover:bg-gray-700'}`}
            onClick={() => setSelectedClass(classItem)}
            onMouseEnter={(e) => handleMouseEnter(classItem, e)}
            onMouseLeave={handleMouseLeave}
          >
            <IconFrame
              size={72} // Larger icons for main display
              contentImageUrl={classItem.avatar_url || null}
              styleType="yellow" // Or choose a style that fits class icons
              altText={`${classItem.name} icon`}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Top Section: Faction Columns and Split Image */}
      <div className="flex flex-col lg:flex-row justify-center items-start gap-8">
        {/* Sentinel Side */}
        <div className="flex-1 flex flex-col items-center lg:items-end text-right p-4 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-white mb-6">Sentinel</h2>
          {groupedClasses.Sentinel?.Chosen && renderFactionRow('Chosen', groupedClasses.Sentinel.Chosen)}
          {groupedClasses.Sentinel?.Firstborn && renderFactionRow('Firstborn', groupedClasses.Sentinel.Firstborn)}
        </div>

        {/* Central Split Image */}
        <div className="flex-shrink-0 flex items-center justify-center p-4">
          <img
            src="/faction_split.png"
            alt="Faction Split"
            className="max-w-[150px] h-auto object-contain" // Adjust size as needed
          />
        </div>

        {/* Legion Side */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-left p-4 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-white mb-6">Legion</h2>
          {groupedClasses.Legion?.['Mountain Clan'] && renderFactionRow('Mountain Clan', groupedClasses.Legion['Mountain Clan'])}
          {groupedClasses.Legion?.Forsaken && renderFactionRow('Forsaken', groupedClasses.Legion.Forsaken)}
        </div>
      </div>

      {/* Bottom Section: Class Detail Display */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg min-h-[400px]">
        {selectedClass ? (
          <ClassDetailView classItem={selectedClass} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-xl">
            Select a class icon above to view its details.
          </div>
        )}
      </div>

      {/* Tooltip for Class Name on Hover */}
      <NameTooltip
        name={hoveredClass?.name || ''}
        isOpen={!!hoveredClass}
        referenceElement={tooltipAnchorEl}
      />
    </div>
  );
}
