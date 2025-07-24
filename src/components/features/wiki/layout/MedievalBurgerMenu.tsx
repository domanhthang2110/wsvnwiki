'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import MenuButton from '@/components/ui/MenuButton/MenuButton';
import styles from './MedievalBurgerMenu.module.css';
import { useUIStore } from '@/stores/ui-store';

interface MenuItem {
  href: string;
  label: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { href: '/', label: 'Trang chủ', icon: '/image/menu/home.webp' },
  { href: '/classes', label: 'Lớp nhân vật', icon: '/image/menu/classes.webp' },
  { href: '/guides', label: 'Hướng dẫn', icon: '/image/menu/guides.webp' },
  { href: '/events', label: 'Tin tức & Sự kiện', icon: '/image/menu/events.webp' },
  { href: '/lore', label: 'Biên niên sử', icon: '/image/menu/lore.webp' },
  { href: '/calculator', label: 'Máy tính', icon: '/image/menu/calculator.webp' },
  { href: '/auth/login', label: 'Admin', icon: '/image/menu/admin.webp' }];

export default function MedievalBurgerMenu() {
  const pathname = usePathname();
  const { isMenuOpen, toggleMenu } = useUIStore();

  // Close menu when pathname changes
  useEffect(() => {
    useUIStore.setState({ isMenuOpen: false });
  }, [pathname]);

  // Close menu when pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        useUIStore.setState({ isMenuOpen: false });
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isMenuOpen]);

  return (
    <>
      <div className={styles.stickyWrapper}>
        {/* Sticky Burger Button - Bottom Right */}
        <button
          onClick={toggleMenu}
          className={styles.burgerButton}
          aria-label="Open menu"
        >
          <Image
            src="/image/burger_button.webp"
            alt="Menu"
            width={64}
            height={64}
            className={styles.burgerImage}
            draggable={false}
            priority={true}
          />
        </button>
      </div>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div className={styles.menuOverlay}>
          {/* Backdrop - Transparent */}
          <div 
            className={styles.backdrop}
            onClick={toggleMenu}
          />
          
          {/* Menu Grid */}
          <div className={styles.menuGrid}>
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              
              return (
                <MenuButton
                  key={item.href}
                  href={item.href}
                  text={item.label}
                  icon={item.icon}
                  isActive={isActive}
                  onClick={toggleMenu}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
