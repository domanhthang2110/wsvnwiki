import React from 'react';
import styles from './ClassDetailHeader.module.css';
import MedievalBurgerMenu from '@/components/features/wiki/layout/MedievalBurgerMenu';
import Image from 'next/image';
interface ClassDetailHeaderProps {
  className: string;
  classIconUrl: string | null;
  children?: React.ReactNode;
}

export default function ClassDetailHeader({ 
  className, 
  classIconUrl, 
  children 
}: ClassDetailHeaderProps) {
  return (
    <div className={`${styles.header} relative`}>
      {/* Burger Menu - positioned absolutely in top-left */}
      <div className="absolute top-2 left-2 z-10">
        <MedievalBurgerMenu />
      </div>
      
      {/* Existing header content */}
      <div className="flex relative items-center space-x-4 w-full">
        {classIconUrl && (
          <Image 
            src={classIconUrl} 
            fill
            alt={className}
            className="w-12 h-12 object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        )}
        <h1 
          className="text-2xl font-bold text-yellow-300"
          style={{
            textShadow: '-1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black, 1px 1px 1px black'
          }}
        >
          {className}
        </h1>
        {children}
      </div>
    </div>
  );
}