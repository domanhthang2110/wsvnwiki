import React from 'react';
import styles from './LoadingOverlay.module.css';

interface LoadingOverlayProps {
  darkened?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ darkened = false }) => {
  return (
    <div className={`${styles.overlay} ${darkened ? styles.darkened : ''}`}>
      <video className={styles['loading-video']} autoPlay loop muted>
        <source src="/image/ui/loading.webm" type="video/webm" />
      </video>
      <div className={styles['loading-text']}>Đang tải...</div>
    </div>
  );
};

export default LoadingOverlay;
