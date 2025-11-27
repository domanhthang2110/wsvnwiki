'use client';

import { useState } from 'react';
import AdminCard from '@/components/features/admin/shared/AdminCard';
import { SkillItem } from '@/types/skills';
import MediaFileExplorer from '@/components/features/admin/media/MediaFileExplorer';
import JsonDisplayModal from '@/components/shared/JsonDisplayModal';
import IconFrame from '@/components/shared/IconFrame';
import { formatFullSkillDescription } from '@/utils/skillUtils';
import Image from 'next/image';

const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>;

interface SkillCardProps {
  skill: SkillItem;
  isSelected: boolean;
  isBulkMode: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onIconChange?: (newIconUrl: string) => void;
}

export default function SkillCardNew({
  skill,
  isSelected,
  isBulkMode,
  onSelect,
  onEdit,
  onDelete,
  onIconChange
}: SkillCardProps) {
  const [showIconPickerModal, setShowIconPickerModal] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

  const handleIconChangeClick = (iconUrl: string) => {
    // If empty string, show the picker modal
    if (iconUrl === '' && onIconChange) {
      setShowIconPickerModal(true);
    }
  };

  const handleIconSelectedFromPicker = (publicUrl: string) => {
    if (onIconChange) {
      onIconChange(publicUrl);
    }
    setShowIconPickerModal(false);
  };

  const formattedDescription = formatFullSkillDescription(skill);

  return (
    <>
      <AdminCard
        item={skill}
        isSelected={isSelected}
        isBulkMode={isBulkMode}
        onSelect={onSelect}
        onEdit={onEdit}
        onDelete={onDelete}
        onIconChange={onIconChange ? handleIconChangeClick : undefined}
      >
        <div className="space-y-3">
          {/* Header with icon and title */}
          <div className="flex items-start gap-3">
            {skill.icon_url && (
              <IconFrame
                size={48}
                contentImageUrl={skill.icon_url}
                altText={`${skill.name} icon`}
                frameType="regular"
                styleType="yellow"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">
                {skill.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{skill.className || 'No Class'}</span>
                <span>•</span>
                <span>{skill.skill_type || 'Unknown Type'}</span>
                {skill.max_level && (
                  <>
                    <span>•</span>
                    <span>Max Level: {skill.max_level}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Formatted Description */}
          <div className="space-y-1">
            <div 
              className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4"
              dangerouslySetInnerHTML={{ __html: formattedDescription }}
            />
          </div>

          {/* Linked Items */}
          {skill.items && skill.items.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Linked Items ({skill.items.length}):
              </h4>
              <div className="flex flex-wrap gap-1">
                {skill.items.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                    {item.icon_url && (
                      <div className="relative w-3 h-3">
                        <Image src={item.icon_url} fill alt={item.name || ''} className="object-cover rounded" draggable={false} />
                      </div>
                    )}
                    {item.name}
                  </div>
                ))}
                {skill.items.length > 3 && (
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    +{skill.items.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Custom Action Buttons */}
          {!isBulkMode && (
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsJsonModalOpen(true);
                }}
                className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded-md"
              >
                View Raw
              </button>
            </div>
          )}
        </div>
      </AdminCard>

      {/* JSON Modal */}
      {isJsonModalOpen && (
        <JsonDisplayModal
          data={skill}
          onClose={() => setIsJsonModalOpen(false)}
        />
      )}

      {/* Icon Picker Modal */}
      {showIconPickerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-gray-100">Select Skill Icon</h3>
              <button 
                onClick={() => setShowIconPickerModal(false)} 
                className="p-1 text-gray-400 hover:text-red-400"
                title="Close"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto min-h-[300px]">
              <MediaFileExplorer
                bucketName="media"
                initialPath="classes"
                onFileSelect={handleIconSelectedFromPicker}
                mode="select" 
                accept="image/*"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}