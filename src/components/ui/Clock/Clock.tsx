'use client';

import { useState, useEffect } from 'react';
import styles from './Clock.module.css';

interface DualClockProps {
  primaryTimeZone: string;
  primaryLabel: string;
  secondaryTimeZone: string;
  secondaryLabel: string;
}

const Clock: React.FC<DualClockProps> = ({ 
  primaryTimeZone, 
  primaryLabel, 
  secondaryTimeZone, 
  secondaryLabel 
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const primaryTimeString = time.toLocaleTimeString('en-US', {
    timeZone: primaryTimeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const primaryDateString = time.toLocaleDateString('en-GB', {
    timeZone: primaryTimeZone,
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });

  const secondaryTimeString = time.toLocaleTimeString('en-US', {
    timeZone: secondaryTimeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const secondaryDateString = time.toLocaleDateString('en-GB', {
    timeZone: secondaryTimeZone,
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <div className={styles.dualClock}>
      <div className={styles.clockDisplay}>
        <div className={styles.timeZoneSection}>
          <h3 className={styles.title}>{primaryLabel}</h3>
          <div className={styles.time}>{primaryTimeString}</div>
          <div className={styles.date}>{primaryDateString}</div>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.timeZoneSection}>
          <h3 className={styles.title}>{secondaryLabel}</h3>
          <div className={styles.time}>{secondaryTimeString}</div>
          <div className={styles.date}>{secondaryDateString}</div>
        </div>
      </div>
      <div className={styles.resetSection}>
        <h4 className={styles.resetTitle}>Lịch reset hàng ngày</h4>
        <ul className={styles.resetList}>
          <li className={styles.resetItem}>EU-Emerald - 7 giờ sáng</li>
          <li className={styles.resetItem}>SEA-Pearl - 5 giờ sáng</li>
        </ul>
      </div>
    </div>
  );
};

export default Clock;
