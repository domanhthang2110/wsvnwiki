'use client';

import React, { useRef, useEffect } from 'react';
import { TalentNode, TalentItem } from '@/types/talents'; // Import TalentNode and TalentItem

interface ContextMenuProps {
  x: number;
  y: number;
  item: TalentNode; // Add the item prop
  onClose: () => void;
  onChange: () => void; // For changing the associated talent (opening modal)
  onDelete: () => void;
  onSetNodeType: (type: TalentNode['node_type']) => void; // New prop for changing node type, using TalentNode's node_type
  onSetGroupId: (groupId: string) => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, item, onClose, onChange, onDelete, onSetNodeType, onSetGroupId }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as HTMLElement)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed bg-gray-700 border border-gray-600 rounded shadow-lg z-50"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      <ul className="py-1">
        <li
          className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-gray-200 text-sm"
          onClick={() => {
            onChange();
            onClose();
          }}
        >
          Change Talent
        </li>
        <li className="px-4 py-2 text-gray-400 text-xs font-bold uppercase mt-2">
          Change Type
        </li>
        <li
          className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-gray-200 text-sm"
          onClick={() => {
            onSetNodeType('normal');
            onClose();
          }}
        >
          Normal
        </li>
        <li
          className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-gray-200 text-sm"
          onClick={() => {
            onSetNodeType('key');
            onClose();
          }}
        >
          Key
        </li>
        <li
          className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-gray-200 text-sm"
          onClick={() => {
            onSetNodeType('lesser');
            onClose();
          }}
        >
          Lesser
        </li>
        <li
          className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-gray-200 text-sm"
          onClick={() => {
            const groupId = prompt('Enter Group ID:', item.group_id || '');
            if (groupId !== null) {
              onSetGroupId(groupId);
            }
            onClose();
          }}
        >
          Set Group ID
        </li>
        <li
          className="px-4 py-2 hover:bg-red-700 cursor-pointer text-red-200 text-sm mt-2"
          onClick={() => {
            onDelete();
            onClose();
          }}
        >
          Delete
        </li>
      </ul>
    </div>
  );
};

export default ContextMenu;
