import React from 'react';
import styles from './UIBox.module.css'; // Import the CSS Module

interface UIBoxProps {
  children?: React.ReactNode;
  className?: string;
  headerEnabled?: boolean;
  headerHeight?: number;
  headerContent?: React.ReactNode;
}

const UIBox: React.FC<UIBoxProps> = ({
  children,
  className,
  headerEnabled = false,
  headerHeight = 30, // Default height for the header
  headerContent,
}) => {
  return (
    <div className={`${styles['box-component']} ${className || ''}`}>
      <img src="/corner_decor.png" alt="corner" className={`${styles['corner-sprite']} ${styles['top-left']}`} />
      <img src="/corner_decor.png" alt="corner" className={`${styles['corner-sprite']} ${styles['top-right']}`} />
      <img src="/corner_decor.png" alt="corner" className={`${styles['corner-sprite']} ${styles['bottom-left']}`} />
      <img src="/corner_decor.png" alt="corner" className={`${styles['corner-sprite']} ${styles['bottom-right']}`} />
      <div className={styles['box-content']} style={{ '--header-height': headerEnabled ? `${headerHeight}px` : '0px' } as React.CSSProperties}>
        {headerEnabled && (
          <div className={styles['box-header']} style={{ height: `${headerHeight}px` }}>
            {headerContent}
            <div className={styles['box-header-border-top']}></div>
            <div className={styles['box-header-border-bottom']}></div>
          </div>
        )}
        <div className={styles['box-children-wrapper']}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default UIBox;
