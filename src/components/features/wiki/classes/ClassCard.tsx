'use client';

import Image from 'next/image';
import { ClassItem } from '@/types/classes';

interface ClassCardProps {
  classItem: ClassItem;
  onOpenDetail: () => void;
}

export default function ClassCard({ classItem, onOpenDetail }: ClassCardProps) {
  const defaultAvatar = '/test_avatar.webp';
  const defaultLogo = '/icon_frame.png'; // Generic icon if classItem.logo_url is not available

  return (
    <div
      onClick={onOpenDetail}
      className="w-28 border border-[var(--box-border-color)] bg-gray-800 p-0
                 flex flex-col cursor-pointer
                 hover:shadow-blue-500/30 hover:border-blue-600 transition-all group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenDetail(); }}
      aria-label={`View details for ${classItem.name}`}
    >
      {/* Header Part */}
      <div className="w-full flex items-stretch h-8">
        {/* Class Icon (actual class logo - using avatar_url as per clarification) */}
        <Image
          src={classItem.avatar_url || defaultLogo} // Use avatar_url for the class icon
          alt={`${classItem.name} logo`}
          width={32}
          height={32}
          className="w-8 h-8 object-contain border border-[var(--box-border-color)]"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = defaultLogo; }}
        />
        {/* Class Name with double border effect */}
        <div
          className="flex-grow h-full bg-amber-700 text-xs text-white font-semibold
                     flex items-center justify-center
                     shadow-[inset_0_0_0_1px_rgba(180,83,9,1),inset_0_0_0_2px_rgba(217,119,6,1)]" // Darker amber shades for double border
        >
          {classItem.name}
        </div>
      </div>

      {/* Avatar Section (below header) */}
      <div className="w-full p-2 flex justify-center">
        <Image
          src={defaultAvatar} // Always use the test_avatar placeholder
          alt={classItem.name}
          width={80} // w-20
          height={80} // h-20
          className="object-cover"
        />
      </div>
    </div>
  );
}
