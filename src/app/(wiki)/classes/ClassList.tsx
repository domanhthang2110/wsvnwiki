// app/classes/ClassList.tsx
'use client'; // This directive is crucial!

import { useState } from 'react';
import { ClassItem } from '@/types/classes';
import ClassCard from '@/components/features/wiki/classes/ClassCard';
import ClassDetailModal from '@/components/features/wiki/classes/ClassDetailModal';

// This component receives the pre-fetched data as a prop.
interface ClassListProps {
  classes: ClassItem[];
}

export default function ClassList({ classes }: ClassListProps) {
  // All state and event handlers live here, on the client.
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  const handleOpenDetail = (classItem: ClassItem) => {
    setSelectedClass(classItem);
  };

  const handleCloseModal = () => {
    setSelectedClass(null);
  };

  return (
    <>
      <div className="flex flex-wrap justify-center gap-8">
        {classes.length > 0 ? (
          classes.map(classItem => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              onOpenDetail={() => handleOpenDetail(classItem)}
            />
          ))
        ) : (
          <p className="text-gray-400 text-center">No classes were found.</p>
        )}
      </div>

      {/* The modal is only rendered on the client when a class is selected */}
      {selectedClass && (
        <ClassDetailModal
          classItem={selectedClass}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
