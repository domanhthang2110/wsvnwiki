// components/admin/classes/ClassCard.tsx
'use client';

import { useState } from 'react';
import { ClassItem } from '@/types/classes';
import { useFloating, offset, shift, flip, useHover, useInteractions } from '@floating-ui/react';
import IconFrame from '@/components/wiki/IconFrame';
import { Tab } from '@headlessui/react';
import { createPortal } from 'react-dom';

interface ClassCardProps {
  classItem: ClassItem;
  onEdit?: (classItem: ClassItem) => void;
  onDelete?: (classItem: ClassItem) => void;
}

export default function ClassCard({ classItem, onEdit, onDelete }: ClassCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  const { refs, floatingStyles, context } = useFloating({
    open: selectedSkill !== null,
    onOpenChange: (open) => !open && setSelectedSkill(null),
    middleware: [
      offset(10),
      shift({ padding: 5 }),
      flip({ padding: 5 }),
    ],
  });

  const hover = useHover(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  const selectedSkillData = classItem.skills?.find(s => s.id === selectedSkill);

  // Compact card view
  if (!isExpanded) {
    return (
      <div 
        onClick={() => setIsExpanded(true)}
        className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-all cursor-pointer"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 flex-shrink-0 rounded bg-gray-700">
            {classItem.avatar_url ? (
              <img 
                src={classItem.avatar_url} 
                alt={classItem.name} 
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500 text-xs">No icon</span>
              </div>
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-100">{classItem.name}</h3>
        </div>
      </div>
    );
  }

  // Expanded view
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsExpanded(false)} />
      <div className="fixed inset-4 bg-gray-800 rounded-lg z-50 overflow-auto">
        <div className="p-6 flex h-full">
          {/* Left Panel */}
          <div className="w-1/3 border-r border-gray-700 pr-6">
            <div className="flex justify-between items-start mb-6">
              <div className="w-32 h-32 rounded bg-gray-700">
                {classItem.avatar_url ? (
                  <img 
                    src={classItem.avatar_url} 
                    alt={classItem.name} 
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-500">No icon</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(classItem);
                    }}
                    className="p-2 text-blue-400 hover:text-blue-300"
                    title="Edit class"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(classItem);
                    }}
                    className="p-2 text-red-400 hover:text-red-300"
                    title="Delete class"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-100 mb-4">{classItem.name}</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{classItem.description}</p>
          </div>

          {/* Right Panel */}
          <div className="flex-1 pl-6">
            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
              <Tab.List className="flex space-x-4 border-b border-gray-700 mb-6">
                <Tab className={({ selected }) =>
                  `px-4 py-2 text-sm font-medium ${
                    selected 
                      ? 'text-blue-500 border-b-2 border-blue-500' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`
                }>
                  Skills
                </Tab>
                <Tab className={({ selected }) =>
                  `px-4 py-2 text-sm font-medium ${
                    selected 
                      ? 'text-blue-500 border-b-2 border-blue-500' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`
                }>
                  Builds
                </Tab>
              </Tab.List>

              <Tab.Panels>
                <Tab.Panel>
                  <div className="grid grid-cols-6 gap-4">
                    {classItem.skills?.map((skill) => (
                      <div
                        key={skill.id}
                        ref={selectedSkill === skill.id ? refs.setReference : undefined}
                        {...(selectedSkill === skill.id ? getReferenceProps() : {})}
                        onClick={() => setSelectedSkill(skill.id)}
                      >
                        <IconFrame
                          contentImageUrl={skill.icon_url || ''}
                          styleType="yellow"
                          altText={skill.name}
                          size={44}
                        />
                      </div>
                    ))}
                  </div>
                </Tab.Panel>
                <Tab.Panel>
                  <div className="text-gray-400 text-center py-8">
                    Builds coming soon...
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>

      {/* Skill tooltip */}
      {selectedSkill !== null && selectedSkillData && createPortal(
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg max-w-sm z-[60]"
        >
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 flex-shrink-0 rounded bg-gray-700">
              {selectedSkillData.icon_url ? (
                <img 
                  src={selectedSkillData.icon_url} 
                  alt={selectedSkillData.name} 
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-500 text-xs">No icon</span>
                </div>
              )}
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-100">{selectedSkillData.name}</h4>
              <p className="text-sm text-gray-400 mt-1">{selectedSkillData.description}</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
