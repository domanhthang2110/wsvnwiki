'use client';

import { useState } from 'react';
import AdminCard from '@/components/features/admin/shared/AdminCard';
import { TalentItem } from '@/types/talents';
import MediaFileExplorer from '@/components/features/admin/media/MediaFileExplorer';
import { formatFullTalentDescription } from '@/utils/talentUtils';

const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>;

interface TalentCardProps {
  talent: TalentItem;
  isSelected: boolean;
  isBulkMode: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onIconChange?: (newIconUrl: string) => void;
}

export default function TalentCardNew({
  talent,
  isSelected,
  isBulkMode,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onIconChange
}: TalentCardProps) {
  const [showIconPickerModal, setShowIconPickerModal] = useState(false);

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

  const formattedDescription = formatFullTalentDescription(talent);

  return (
    <>
      <AdminCard
        item={talent}
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
            {talent.icon_url && (
              <img
                src={talent.icon_url}
                alt={talent.name}
                className="w-12 h-12 rounded-md object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {talent.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Max Level: {talent.max_level}</span>
                <span>•</span>
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

          {/* Knowledge Costs Summary */}
          {talent.knowledge_levels && Object.keys(talent.knowledge_levels).length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Knowledge Costs:
              </h4>
              <div className="flex flex-wrap gap-1">
                {Object.entries(talent.knowledge_levels).slice(0, 3).map(([level, cost]) => (
                  <span
                    key={level}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-md"
                  >
                    L{level}: {cost.toLocaleString()}
                  </span>
                ))}
                {Object.keys(talent.knowledge_levels).length > 3 && (
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    +{Object.keys(talent.knowledge_levels).length - 3} more levels
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </AdminCard>

      {/* Icon Picker Modal */}
      {showIconPickerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-gray-100">Select Talent Icon</h3>
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
                initialPath="talents"
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