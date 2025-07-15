import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from './Dropdown.module.css';

interface DropdownProps {
  title: React.ReactNode;
  width?: string;
  children: React.ReactNode;
  showArrows?: boolean;
 onPrevious?: () => void;
 onNext?: () => void;
 dropdownDisabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
 title,
 width = '300px',
 children,
 showArrows = false,
 onPrevious,
 onNext,
 dropdownDisabled = false,
}) => {
 const [isOpen, setIsOpen] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);

 const toggleDropdown = () => {
   if (!dropdownDisabled) {
     setIsOpen(!isOpen);
   }
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
    <div className="flex items-center justify-center">
      {showArrows && onPrevious && (
        <button onClick={onPrevious} className="hover:brightness-125 transition-all duration-200">
          <Image src="/image/arrow_button.svg" alt="Previous" width={45} height={39} className={styles.pixelated} />
        </button>
      )}
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
         {!dropdownDisabled && (
           <Image
             src="/image/dropdown_arrow.svg"
             alt="Dropdown Arrow"
             width={16}
             height={16}
             className={`${styles.dropdownArrow} ${isOpen ? styles.open : ''}`}
           />
         )}
       </button>
       {isOpen && !dropdownDisabled && (
         <div className={styles.dropdownContent}>
           {React.Children.map(children, (child) =>
             React.cloneElement(child as React.ReactElement<any>, {
                onClick: () => handleOptionClick(child as React.ReactElement<any>),
              })
            )}
          </div>
        )}
      </div>
      {showArrows && onNext && (
        <button onClick={onNext} className="hover:brightness-125 transition-all duration-200">
          <Image src="/image/arrow_button.svg" alt="Next" width={45} height={39} className={`${styles.pixelated} scale-x-[-1]`} />
        </button>
      )}
    </div>
  );
};

export default Dropdown;
