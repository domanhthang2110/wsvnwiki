import React from 'react';
import UIBox from '@/components/ui/Box/UIBox';
import ClassContent from '@/components/features/wiki/classes/ClassContent';
import { getClassesWithSkills } from '@/lib/data/classes'; // Import data fetching
export default async function ClassesPage() { // Make it an async Server Component
  const classes = await getClassesWithSkills(); // Fetch data here

  return (
    <div className="flex flex-col h-full w-full">
      <UIBox className="w-full h-full flex-grow bg-gray-900" headerEnabled={true} headerHeight={50} headerContent="Classes Overview">
        <ClassContent classes={classes} /> {/* Pass classes as prop */}
      </UIBox>
    </div>
  );
}
