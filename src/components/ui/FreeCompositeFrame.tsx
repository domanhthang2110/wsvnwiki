import React from 'react';
import styles from './FreeCompositeFrame.module.css';
import Image from 'next/image';

interface FreeCompositeFrameProps {
  isUnlocked: boolean;
  imageUrl?: string;
}

const FreeCompositeFrame: React.FC<FreeCompositeFrameProps> = ({ isUnlocked, imageUrl }) => {
  return (
    <div className={`${styles.frame} ${isUnlocked ? styles.unlocked : styles.locked}`}>
      {imageUrl && <Image src={imageUrl} fill alt="Talent Icon" className={styles.icon} draggable={false} />}
    </div>
  );
};

export default FreeCompositeFrame;
