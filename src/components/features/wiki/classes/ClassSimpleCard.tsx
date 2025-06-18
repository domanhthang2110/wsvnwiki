'use client';

import Image from 'next/image';
import { ClassItem } from '@/types/classes';

interface ClassSimpleCardProps {
  classItem: ClassItem;
  onOpenDetail: () => void;
}

export default function ClassSimpleCard({ classItem, onOpenDetail }: ClassSimpleCardProps) {
  const defaultAvatar = '/test_avatar.webp';

  return (
    <div
      onClick={onOpenDetail}
      className="w-28 border border-[var(--box-border-color)] bg-gray-800 p-2
                 flex flex-col items-center gap-2 cursor-pointer
                 hover:shadow-blue-500/30 hover:border-blue-600 transition-all group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenDetail(); }}
      aria-label={`View details for ${classItem.name}`}
    >
      {/* Avatar Placeholder */}
      <Image
        src={defaultAvatar}
        alt={classItem.name}
        width={80} // w-20
        height={80} // h-20
        className="object-cover"
      />
      {/* Class Name */}
      <h3 className="text-sm font-semibold text-gray-100 group-hover:text-blue-400 transition-colors text-center">
        {classItem.name}
      </h3>
    </div>
  );
}
