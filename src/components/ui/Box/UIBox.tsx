import React from 'react';
import Image from 'next/image';
import styles from './UIBox.module.css'; // Import the CSS Module
import Cloud from '../Cloud/Cloud';
import { useUIStore } from '@/stores/ui-store';
import MedievalBurgerMenu from '@/components/features/wiki/layout/MedievalBurgerMenu'; // Import MedievalBurgerMenu

interface UIBoxProps {
  children?: React.ReactNode;
  className?: string;
  headerEnabled?: boolean;
  headerHeight?: number;
  headerContent?: React.ReactNode;
  contentCenteredAndMaxWidth?: boolean; // New prop for centering and max-width
  showClouds?: boolean;
  showAltBurgerMenu?: boolean;
}

const UIBox: React.FC<UIBoxProps> = ({
  children,
  className,
  headerEnabled = false,
  headerHeight = 30, // Default height for the header
  headerContent,
  contentCenteredAndMaxWidth = false, // Default to false
  showClouds = false,
  showAltBurgerMenu = false,
}) => {
  const { toggleMenu } = useUIStore();
  const contentWrapperClasses = contentCenteredAndMaxWidth
    ? 'max-w-[1200px] mx-auto px-4 py-8' // Apply max-width, auto margins for centering, and padding
    : '';

  return (
    <div className={`${styles['box-component']} ${className || ''} flex flex-col`}>
      <div className={`${styles['box-content']} flex-grow flex flex-col`} style={{ '--header-height': headerEnabled ? `${headerHeight}px` : '0px' } as React.CSSProperties}>
        {showClouds && Array.from({ length: 7 }).map((_, i) => <Cloud key={i} direction={i % 2 === 0 ? 'left' : 'right'} />)}
        {headerEnabled && (
          <div className={styles['box-header']} style={{ height: `${headerHeight}px` }}>
            <div className={styles['header-center-content']}>
              <div className={styles['header-content-wrapper']}>{headerContent}</div>
              {showAltBurgerMenu && (
                <div className={styles['alt-burger-button-wrapper']}>
                  <button onClick={toggleMenu} className={styles['alt-burger-button']}>
                    <Image src="/image/burger_button_alt.webp" alt="Menu" width={24} height={24} draggable={false} priority={true} />
                  </button>
                </div>
              )}
            </div>
            <div className={styles['box-header-border-top']}></div>
            <div className={styles['box-header-border-bottom']}></div>
          </div>
        )}
        <div className={`${styles['box-children-wrapper']} flex-grow flex flex-col ${contentWrapperClasses} relative`}>
          {children}
          <MedievalBurgerMenu /> {/* Render MedievalBurgerMenu here */}
        </div>
      </div>
    </div>
  );
};

export default UIBox;
