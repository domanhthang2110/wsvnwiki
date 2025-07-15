'use client';

import { useState, useEffect } from 'react';
import styles from './Clock.module.css';

interface ClockProps {
  timeZone: string;
  label: string;
}

const Clock: React.FC<ClockProps> = ({ timeZone, label }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const timeString = time.toLocaleTimeString('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const dateString = time.toLocaleDateString('en-US', {
    timeZone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const tzString = time
    .toLocaleTimeString('en-US', {
      timeZone,
      timeZoneName: 'short',
    })
    .split(' ')[2];

  return (
    <div className={styles.clockWrapper}>
      <h2 className={styles.title}>{label}</h2>
      <div className={styles.time}>{timeString}</div>
      <div className={styles.date}>{dateString}</div>
      <div className={styles.timezone}>{tzString}</div>
    </div>
  );
};

export default Clock;
