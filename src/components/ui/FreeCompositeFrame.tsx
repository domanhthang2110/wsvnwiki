import React from 'react';
import styles from './FreeCompositeFrame.module.css';

interface FreeCompositeFrameProps {
  isUnlocked: boolean;
  imageUrl?: string;
}

const FreeCompositeFrame: React.FC<FreeCompositeFrameProps> = ({ isUnlocked, imageUrl }) => {
  return (
    <div className={`${styles.frame} ${isUnlocked ? styles.unlocked : styles.locked}`}>
      {imageUrl && <img src={imageUrl} alt="Talent Icon" className={styles.icon} />}
    </div>
  );
};

export default FreeCompositeFrame;
