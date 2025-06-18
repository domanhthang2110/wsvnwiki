'use client'; // Ensure it remains a client component

import React, { useState } from 'react'; // Import useState
import ClassCard from './ClassCard'; // Import the ClassCard component
import ClassSimpleCard from './ClassSimpleCard'; // Import the new ClassSimpleCard component
import { ClassItem } from '@/types/classes'; // Import ClassItem type
import LongButton from '@/components/ui/LongButton'; // Import LongButton

interface ClassContentProps {
  classes: ClassItem[]; // Define the classes prop
}

const ClassContent: React.FC<ClassContentProps> = ({ classes }) => { // Accept classes as prop
  const [showSimpleCard, setShowSimpleCard] = useState(false); // State to toggle card type

  const handleOpenDetail = (className: string) => {
    console.log(`Opening detail for class: ${className}`);
    // In a real application, this would update state or navigate to a detail page
  };

  return (
    <div className="flex flex-col h-full w-full space-y-2"> {/* Change to flex-col and space-y */}
      {/* Top Box - Class List (formerly Left Box) */}
      <div className="w-full h-auto p-2 border border-[#e6ce63] shadow-lg bg-gray-900/20 text-white overflow-x-auto flex-shrink-0"> {/* h-auto, overflow-x-auto */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-center flex-grow">Classes</h3>
          <LongButton
            onClick={() => setShowSimpleCard(!showSimpleCard)}
            width={120} // Specify a width for the LongButton
            text={showSimpleCard ? 'Show Complex' : 'Show Simple'} // Pass text via the 'text' prop
            className="px-3 py-1 text-sm" // Apply minimal styling, LongButton handles most
          />
        </div>
        <div className="flex flex-row items-start gap-4 pb-2"> {/* Change to flex-row for horizontal cards, add pb-2 for scrollbar */}
          {classes.length > 0 ? (
            classes.map((classItem) => (
              showSimpleCard ? (
                <ClassSimpleCard
                  key={classItem.id}
                  classItem={classItem}
                  onOpenDetail={() => handleOpenDetail(classItem.name)}
                />
              ) : (
                <ClassCard
                  key={classItem.id}
                  classItem={classItem}
                  onOpenDetail={() => handleOpenDetail(classItem.name)}
                />
              )
            ))
          ) : (
            <p>No classes found.</p>
          )}
        </div>
      </div>

      {/* Bottom Box - Class Detail View (formerly Right Box) */}
      <div className="w-full flex-grow p-4 border border-[#e6ce63] shadow-lg bg-gray-900/20 text-white overflow-y-auto"> {/* w-full, flex-grow */}
        <h3 className="text-xl font-bold mb-2">Class Details</h3> {/* Renamed header */}
        <h2 className="text-2xl font-bold mb-4">Welcome to the Classes Page Content!</h2>
        <p>This is where the specific content for game classes will be displayed.</p>
        <p>You can add class details, lists, and other relevant information here.</p>
      </div>
    </div>
  );
};

export default ClassContent;
