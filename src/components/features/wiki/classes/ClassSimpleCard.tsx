'use client';

import { useState, useRef, useEffect } from 'react';
import { ClassItem } from '@/types/classes';
import FancyFrame from '@/components/ui/FancyFrame/FancyFrame';
import styles from './ClassSimpleCard.module.css';
import { useMediaQuery } from 'react-responsive';
import { useMounted } from '@/hooks/use-mounted';

interface ClassSimpleCardProps {
  classItem: ClassItem;
  onOpenDetail: () => void;
}

export default function ClassSimpleCard({ classItem, onOpenDetail }: ClassSimpleCardProps) {
  const defaultAvatarPath = '/test_avatar.webp';
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });
  const mounted = useMounted();

  const videoRef = useRef<HTMLVideoElement>(null);
  const isWebm = classItem.image_assets?.avatar?.endsWith('.gif');

  let avatarSrc = defaultAvatarPath;
  if (isWebm) {
    avatarSrc = classItem.image_assets?.avatar?.replace('.gif', '.webm') || defaultAvatarPath;
  } else {
    avatarSrc = classItem.image_assets?.avatar || defaultAvatarPath;
  }

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (isHovered) {
        video.play();
      } else {
        video.pause();
        video.currentTime = 0;
      }
    }
  }, [isHovered]);

  const cardWidth = isMobile ? 66 : 77;
  const cardHeight = isMobile ? 99 : 116;

  if (!mounted) {
    return (
      <div
        style={{ width: `${cardWidth}px`, height: `${cardHeight}px` }}
        className="bg-gray-800 flex flex-col items-center cursor-pointer"
      />
    );
  }

  return (
    <div
      onClick={onOpenDetail}
      style={{ width: `${cardWidth}px` }}
      className="bg-gray-800 flex flex-col items-center cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenDetail(); }}
      aria-label={`View details for ${classItem.name}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <FancyFrame 
        width={cardWidth} 
        height={cardHeight} 
        scale={1} 
        overflowVisible={isWebm && isHovered}
      >
        {isWebm ? (
          <video
            ref={videoRef}
            src={avatarSrc}
            width={cardWidth}
            height={cardHeight}
            className={`absolute top-1/2 left-1/2 h-full w-full object-cover transform -translate-x-1/2 -translate-y-1/2 scale-[1.5] origin-center ${
              isHovered ? 'z-10' : ''
            }`}
            muted
            playsInline
          />
        ) : (
          <img
            src={classItem.image_assets?.avatar || defaultAvatarPath}
            alt={classItem.name}
            width={cardWidth}
            height={cardHeight}
            className={`absolute top-1/2 left-1/2 h-full w-full object-cover transform -translate-x-1/2 -translate-y-1/2 scale-[1.5] origin-center`}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = defaultAvatarPath;
            }}
          />
        )}
      </FancyFrame>

      {/* Class Name Footer */}
      <div
        className={`w-full bg-gray-700 text-center ${styles['embossed-plaque']} ${styles.namePlate}`}
      >
        <h3
          className={`text-sm font-semibold text-gray-100 transition-colors text-center ${styles.nameText}`}
        >
          {classItem.name}
        </h3>
      </div>
    </div>
  );
}
