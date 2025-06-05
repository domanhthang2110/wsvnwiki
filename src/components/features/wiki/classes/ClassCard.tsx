// components/classes/ClassCard.tsx
'use client';

import { ClassItem } from '@/types/classes';

interface ClassCardProps {
  classItem: ClassItem;
  onOpenDetail: () => void;
}

export default function ClassCard({ classItem, onOpenDetail }: ClassCardProps) {
  const defaultAvatar = 'https://placehold.co/96x96/374151/9CA3AF?text=No+Avatar';

  return (
    <div
      onClick={onOpenDetail}
      className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 w-56 cursor-pointer hover:shadow-blue-500/30 hover:border-blue-600 transition-all group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenDetail(); }}
      aria-label={`View details for ${classItem.name}`}
    >
      <div className="flex flex-col items-center">
        <img
          src={classItem.avatar_url || defaultAvatar}
          alt={classItem.name}
          className="w-24 h-24 rounded-full object-cover mb-3 border-2 border-gray-600 group-hover:border-blue-500 transition-colors"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = defaultAvatar; }}
        />
        <h3 className="text-lg font-semibold text-gray-100 group-hover:text-blue-400 transition-colors text-center">
          {classItem.name}
        </h3>
      </div>
    </div>
  );
}
