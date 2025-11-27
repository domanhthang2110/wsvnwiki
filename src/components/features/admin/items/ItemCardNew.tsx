'use client';

import { useState } from 'react';
import AdminCard from '@/components/features/admin/shared/AdminCard';
import { Item } from '@/types/items';
import MediaFileExplorer from '@/components/features/admin/media/MediaFileExplorer';
import Image from 'next/image';
import { formatFullItemDescription } from '@/utils/itemUtils';

const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>;

interface ItemCardProps {
  item: Item;
  isSelected: boolean;
  isBulkMode: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onIconChange?: (newIconUrl: string) => void;
}

export default function ItemCardNew({
  item,
  isSelected,
  isBulkMode,
  onSelect,
  onEdit,
  onDelete,
  onIconChange
}: ItemCardProps) {
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

  const formattedDescription = formatFullItemDescription(item);

  return (
    <>
      <AdminCard
        item={item}
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
            {item.icon_url && (
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={item.icon_url}
                  alt={item.name ?? ""}
                  fill
                  className="object-contain rounded-md border border-gray-300 dark:border-gray-600"
                  draggable={false}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">
                {item.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="capitalize">Type: {item.type}</span>
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

          {/* Created Date */}
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Created: {new Date(item.created_at).toLocaleDateString()}
          </div>
        </div>
      </AdminCard>

      {/* Icon Picker Modal */}
      {showIconPickerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-gray-100">Select Item Icon</h3>
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
                initialPath="items"
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