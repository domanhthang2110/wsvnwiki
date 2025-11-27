'use client';

import { useState } from 'react';

interface AdminCardProps<T> {
  item: T;
  
  // Selection state (managed by DataTable)
  isSelected: boolean;
  isBulkMode: boolean;
  onSelect: () => void;
  
  // Standard actions (managed by DataTable)
  onEdit: () => void;
  onDelete: () => void;
  onIconChange?: (newIconUrl: string) => void;
  
  // Flexible content
  children: React.ReactNode;
}

export default function AdminCard<T>({ 
  item, 
  isSelected, 
  isBulkMode, 
  onSelect, 
  onEdit, 
  onDelete, 
  onIconChange,
  children 
}: AdminCardProps<T>) {
  const handleCardClick = () => {
    if (isBulkMode) {
      onSelect();
    }
  };

  return (
    <div 
      className={`
        relative bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 transition-all duration-200 group
        ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}
        ${isBulkMode ? 'cursor-pointer hover:border-blue-300' : 'hover:shadow-lg'}
      `}
      onClick={handleCardClick}
    >
      {/* Selection indicator for bulk mode */}
      {isBulkMode && (
        <div className="absolute top-2 right-2 z-10">
          <div className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold
            ${isSelected 
              ? 'bg-blue-500 border-blue-500 text-white' 
              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
            }
          `}>
            {isSelected ? '✓' : ''}
          </div>
        </div>
      )}
      
      {/* Action Buttons (hidden in bulk mode) - Absolutely positioned */}
      {!isBulkMode && (
        <div className="absolute top-4 right-4 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 text-blue-400 hover:text-blue-300"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-red-400 hover:text-red-300"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          {onIconChange && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onIconChange(''); // This will trigger the icon picker in the specific card
              }}
              className="p-1 text-gray-400 hover:text-gray-300"
              title="Change Icon"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Custom content - Full width */}
      <div className={`p-4 ${isBulkMode ? 'pr-10' : ''}`}>
        {children}
      </div>
    </div>
  );
}