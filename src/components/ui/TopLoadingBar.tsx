'use client';

import React from 'react';
import styles from './TopLoadingBar.module.css';

interface TopLoadingBarProps {
  isLoading: boolean;
}

export function TopLoadingBar({ isLoading }: TopLoadingBarProps) {
  if (!isLoading) return null;

  return (
    <div className={styles.container}>
      <div className={styles.bar}></div>
    </div>
  );
}