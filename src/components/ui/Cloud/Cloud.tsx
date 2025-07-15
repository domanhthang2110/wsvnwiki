'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Cloud.module.css';

interface CloudProps {
  direction: 'left' | 'right';
}

const cloudImages = [
  '/image/ui/cloud/cloud_1.png',
  '/image/ui/cloud/cloud_2.png',
  '/image/ui/cloud/cloud_3.png',
  '/image/ui/cloud/cloud_4.png',
  '/image/ui/cloud/cloud_5.png',
  '/image/ui/cloud/cloud.png',
];

const Cloud: React.FC<CloudProps> = ({ direction }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [cloudSrc, setCloudSrc] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const duration = Math.random() * 40 + 60;
    const top = Math.random() * 100;
    const scale = Math.random() * 0.5 + 0.5;
    const delay = Math.random() * -80;

    setStyle({
      top: `${top}%`,
      transform: `scale(${scale})`,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
    });

    setCloudSrc(cloudImages[Math.floor(Math.random() * cloudImages.length)]);
  }, []);

  if (!isMounted || !cloudSrc) {
    return null;
  }

  const animationClass = direction === 'left' ? styles['right-to-left'] : styles['left-to-right'];

  return (
    <Image
      src={cloudSrc}
      alt="Floating cloud"
      width={200}
      height={100}
      className={`${styles.cloud} ${animationClass}`}
      style={style}
      unoptimized
    />
  );
};

export default Cloud;
