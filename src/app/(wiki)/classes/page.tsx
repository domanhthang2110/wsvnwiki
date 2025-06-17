'use client';

import React, { useState } from 'react';
import LongButton from '@/components/ui/LongButton'; // New import
import Box from '@/components/ui/Box/Box';

export default function ClassesPage() {
  const [buttonWidth, setButtonWidth] = useState(200);
  const [isHoverHighlightingOn, setIsHoverHighlightingOn] = useState(true);
  const [buttonScale, setButtonScale] = useState(1); // State for external scaling
  const [headerEnabled, setHeaderEnabled] = useState(true); // State for header toggle
  const [headerHeight, setHeaderHeight] = useState(30); // State for header height

  // The original server-side data fetching logic is commented out or removed
  // as this page is now a client component for the purpose of the button test.
  // If the original functionality is still needed, it would require a different approach
  // (e.g., fetching data in a separate server component and passing it down,
  // or using client-side fetching if appropriate).
  // For this task, we are focusing on the button component.

  // const dbClasses = await getClassesWithSkills();
  // const enrichedClasses: ClassItem[] = dbClasses.map(cls => {
  //   const factionInfo = CLASS_FACTION_INFO_MAP[cls.name] || { faction: 'Unknown', side: 'Unknown' };
  //   return {
  //     ...cls,
  //     faction: factionInfo.faction as Faction,
  //     side: factionInfo.side as Side,
  //   };
  // });

  return (
    <main className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-white mb-12">
        Game Classes
      </h1>
      {/* <FactionLayoutClient classes={enrichedClasses} /> */}
      {/* Temporarily commenting out FactionLayoutClient to focus on button test */}

      <Box headerEnabled={headerEnabled} headerHeight={headerHeight} headerContent="Box Header">
        <h2 className="text-center text-xl font-semibold mb-5 text-gray-100">Test Custom LongButton</h2>
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-100 cursor-pointer inline-flex items-center">
            <input
              type="checkbox"
              checked={headerEnabled}
              onChange={(e) => setHeaderEnabled(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            Enable Header
          </label>
        </div>
        <div className="mb-4">
          <label htmlFor="headerHeightSlider" className="block mb-1 text-sm font-medium text-gray-100">
            Header Height: {headerHeight}px
          </label>
          <input
            type="range"
            id="headerHeightSlider"
            min="0"
            max="100"
            value={headerHeight}
            onChange={(e) => setHeaderHeight(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="widthSlider" className="block mb-1 text-sm font-medium text-gray-100">
            Button Width: {buttonWidth}px
          </label>
          <input
            type="range"
            id="widthSlider"
            min="32"
            max="500"
            value={buttonWidth}
            onChange={(e) => setButtonWidth(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="scaleSlider" className="block mb-1 text-sm font-medium text-gray-100">
            Button Scale: {buttonScale.toFixed(2)}x
          </label>
          <input
            type="range"
            id="scaleSlider"
            min="0.5"
            max="2"
            step="0.05"
            value={buttonScale}
            onChange={(e) => setButtonScale(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>
        <div className="mb-5">
          <label className="text-sm font-medium text-gray-100 cursor-pointer inline-flex items-center">
            <input
              type="checkbox"
              checked={isHoverHighlightingOn}
              onChange={(e) => setIsHoverHighlightingOn(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            Enable Hover Highlighting
          </label>
        </div>
        <div className="flex justify-center">
          <LongButton
            width={buttonWidth}
            text="Hover Test"
            hoverHighlightingEnabled={isHoverHighlightingOn}
            style={{ transform: `scale(${buttonScale})`, transformOrigin: 'center' }} // Apply scale via style prop
            onClick={() => alert(`Button clicked! Width: ${buttonWidth}px, Scale: ${buttonScale.toFixed(2)}x, Hover Highlighting: ${isHoverHighlightingOn ? 'Enabled' : 'Disabled'}`)}
          />
        </div>
      </Box>
    </main>
  );
}
