'use client';

import { Item } from '@/types/items';
import { useState } from 'react';
import MediaFileExplorer from '@/components/features/admin/media/MediaFileExplorer';
import Image from 'next/image';

const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>;

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onIconChange: (itemId: number, newIconUrl: string) => void;
  isSelected: boolean;
}

export default function ItemCard({ item, onEdit, onDelete, onIconChange, isSelected }: ItemCardProps) {
  const [showIconPickerModal, setShowIconPickerModal] = useState(false);

  const handleIconSelectedFromPicker = (publicUrl: string) => {
    onIconChange(item.id, publicUrl);
    setShowIconPickerModal(false);
  };

  return (
    <div className={`p-4 border rounded-lg shadow-sm transition-all duration-200 ${isSelected ? 'bg-blue-900 border-blue-600' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}>
      <div className="flex items-start gap-4">
        {item.icon_url && (
          <div className="relative w-16 h-16">
            <Image src={item.icon_url} alt={item.name ?? ""} fill className="object-contain rounded-md border border-gray-600" draggable={false} />
          </div>
        )}
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-gray-100">{item.name}</h3>
          <p className="text-sm text-gray-400 capitalize">Type: {item.type}</p>
          {item.description && <p className="text-sm text-gray-300 mt-2 line-clamp-2">{item.description}</p>}
        </div>
      </div>
      <div className="mt-4 flex justify-end items-center gap-2">
        <button
          onClick={() => setShowIconPickerModal(true)}
          className="py-1 px-3 text-xs font-medium rounded-md border border-gray-600 hover:bg-gray-700 text-gray-300"
        >
          Change Icon
        </button>
        <button
          onClick={() => onEdit(item)}
          className="py-1 px-3 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(item)}
          className="py-1 px-3 text-xs font-medium rounded-md bg-red-600 hover:bg-red-700 text-white"
        >
          Delete
        </button>
      </div>
      {showIconPickerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4 transition-opacity duration-300">
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
    </div>
  );
}
