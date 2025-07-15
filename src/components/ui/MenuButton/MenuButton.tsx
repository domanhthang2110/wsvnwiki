import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './MenuButton.module.css';

interface MenuButtonProps {
  href: string;
  text: string;
  icon: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function MenuButton({ href, text, icon, onClick }: MenuButtonProps) {
  return (
    <Link
      href={href}
      className={styles.menuButton}
      onClick={onClick}
    >
      {/* Menu Button Background */}
      <div className={`${styles.buttonBackground}`}>
        {/* Icon - Centered */}
        <div className={styles.iconContainer}>
          <Image
            src={icon}
            alt={text}
            width={48}
            height={48}
            className={styles.icon}
            draggable={false}
          />
        </div>
        
        {/* Text - Bottom inside */}
        <div className={`${styles.text}`}>
          {text}
        </div>
      </div>
    </Link>
  );
}
