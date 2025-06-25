import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from './Dropdown.module.css';

interface DropdownProps {
  title: string;
  width?: string;
  children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ title, width = '300px', children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (child: React.ReactElement<any>) => {
    if (child.props.onClick) {
      child.props.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdown} ref={dropdownRef} style={{ '--dropdown-width': width } as React.CSSProperties}>
      <button className={styles.dropdownButton} onClick={toggleDropdown}>
        <Image
          src="/image/dropdown_title.png"
          alt="Dropdown Title Background"
          layout="fill"
          objectFit="fill"
          className={styles.dropdownTitleBg}
        />
        <span className={styles.dropdownTitleText}>{title}</span>
        <Image
          src="/image/dropdown_arrow.svg"
          alt="Dropdown Arrow"
          width={16}
          height={16}
          className={`${styles.dropdownArrow} ${isOpen ? styles.open : ''}`}
        />
      </button>
      {isOpen && (
        <div className={styles.dropdownContent}>
          {React.Children.map(children, (child) =>
            React.cloneElement(child as React.ReactElement<any>, {
              onClick: () => handleOptionClick(child as React.ReactElement<any>),
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
