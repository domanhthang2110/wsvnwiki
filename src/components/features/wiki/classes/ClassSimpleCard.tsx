'use client';

import { useState, useRef, useEffect } from 'react';
import { ClassItem } from '@/types/classes';
import FancyFrame from '@/components/ui/FancyFrame/FancyFrame';
import styles from './ClassSimpleCard.module.css';
import { useMounted } from '@/hooks/use-mounted';
import Image from 'next/image';

interface ClassSimpleCardProps {
  classItem: ClassItem | null;
  onOpenDetail: () => void;
}

export default function ClassSimpleCard({ classItem, onOpenDetail }: ClassSimpleCardProps) {
  const defaultAvatarPath = '/test_avatar.webp';
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const mounted = useMounted();

  // CSS media query hook replacement
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    setIsMobile(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  const nameRef = useRef<HTMLHeadingElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const avatarUrl = (typeof classItem?.image_assets?.avatar === 'string' ? classItem.image_assets.avatar : null) || defaultAvatarPath;
  const isVideoAvatar = avatarUrl.endsWith('.webm') || avatarUrl.endsWith('.mp4');
  const slug = classItem?.name?.toLowerCase().replace(/\s+/g, '-') || '';
  const localImageUrl = `/image/classes/${slug}/attack.webp`;
  const displayImageUrl = isVideoAvatar ? localImageUrl : avatarUrl;

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

  useEffect(() => {
    const adjustFontSize = () => {
      const nameElement = nameRef.current;
      if (nameElement) {
        const parent = nameElement.parentElement;
        if (parent) {
          let fontSize = 12; // Starting font size (14px - 2px)
          nameElement.style.fontSize = `${fontSize}px`;
          
          requestAnimationFrame(() => {
            while (nameElement.scrollWidth > parent.clientWidth && fontSize > 8) {
              fontSize -= 1;
              nameElement.style.fontSize = `${fontSize}px`;
            }
          });
        }
      }
    };

    adjustFontSize();
  }, [classItem?.name, mounted]);

  const cardWidth = isMobile ? 66 : 77;
  const cardHeight = isMobile ? 99 : 116;

  // If no classItem, render empty slot
  if (!classItem) {
    return (
      <div
        style={{ width: `${cardWidth}px`, height: `${cardHeight}px` }}
        className="bg-transparent"
      />
    );
  }

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
      aria-label={`View details for ${classItem?.name || 'Unknown'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <FancyFrame 
        width={cardWidth} 
        height={cardHeight} 
        scale={1} 
        overflowVisible={isVideoAvatar && isHovered}
      >
        {isVideoAvatar ? (
          <>
            <video
              draggable={false}
              ref={videoRef}
              src={avatarUrl}
              width={cardWidth}
              height={cardHeight}
              className={`absolute top-1/2 left-1/2 h-full w-full object-cover transform -translate-x-1/2 -translate-y-1/2 scale-[1.5] origin-center ${isHovered ? 'block z-10' : 'hidden'}`}
              muted
              loop
              playsInline
              preload="auto"
            />
            <Image
              draggable={false}
              fill
              src={displayImageUrl}
              alt={classItem?.name || 'Class'}
              className={`absolute top-1/2 left-1/2 h-full w-full object-cover transform scale-[1.5] origin-center ${isHovered ? 'hidden' : 'block'}`}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = defaultAvatarPath; }}
            />
          </>
        ) : (
          <Image
            draggable={false}
            fill
            src={displayImageUrl}
            alt={classItem?.name || 'Class'}
            className={`absolute top-1/2 left-1/2 h-full w-full object-cover transform -translate-x-1/2 -translate-y-1/2 scale-[1.5] origin-center`}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = defaultAvatarPath; }}
          />
        )}
      </FancyFrame>

      {/* Class Name Footer */}
      <div
        className={`w-full bg-gray-700 text-center ${styles['embossed-plaque']} ${styles.namePlate}`}
      >
        <h3
          ref={nameRef}
          className={`font-semibold text-gray-100 text-center ${styles.nameText}`}
        >
          {classItem?.name === 'Necromancer' ? 'Necro\nmancer' : (classItem?.name || '')}
        </h3>
      </div>
    </div>
  );
}
