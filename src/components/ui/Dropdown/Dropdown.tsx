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

  const handleOptionClick = (child: React.ReactElement<React.HTMLAttributes<HTMLElement>>) => {
    if (child.props.onClick) {
      child.props.onClick({} as React.MouseEvent<HTMLElement>); // Pass a dummy event or adjust onClick signature if needed
    }
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-center">
      {showArrows && onPrevious && (
        <button onClick={onPrevious} className="hover:brightness-125 transition-all duration-200">
          <Image 
            src="/image/arrow_button.webp" 
            alt="Previous" 
            width={45} 
            height={45} // placeholder height
            className={`${styles.pixelated}`} 
            draggable={false} 
            priority={true}
            style={{height: 'auto'}}
          />
        </button>
      )}
      <div className={styles.dropdown} ref={dropdownRef} style={{ '--dropdown-width': width } as React.CSSProperties}>
        <button className={styles.dropdownButton} onClick={toggleDropdown}>
          <Image
            src="/image/dropdown_title.webp"
            alt="Dropdown Title Background"
            fill
            sizes="300px"
            className={styles.dropdownTitleBg}
            draggable={false}
            priority={true}
          />
          <span className={styles.dropdownTitleText}>{title}</span>
         {!dropdownDisabled && (
           <Image
             src="/image/dropdown_arrow.webp"
             alt="Dropdown Arrow"
             width={16}
             height={16}
             className={`${styles.dropdownArrow} ${isOpen ? styles.open : ''}`}
             draggable={false}
             priority={true}
           />
         )}
       </button>
       {isOpen && !dropdownDisabled && (
         <div className={styles.dropdownContent}>
           {React.Children.map(children, (child) =>
             React.cloneElement(child as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
                onClick: () => handleOptionClick(child as React.ReactElement<React.HTMLAttributes<HTMLElement>>),
              })
            )}
          </div>
        )}
      </div>
      {showArrows && onNext && (
        <button onClick={onNext} className="hover:brightness-125 transition-all duration-200">
          <Image 
            src="/image/arrow_button.webp" 
            alt="Next" 
            width={45} 
            height={45} // placeholder height
            className={`${styles.pixelated} scale-x-[-1]`} 
            draggable={false} 
            priority={true}
            style={{height: 'auto'}}
          />
        </button>
      )}
    </div>
  );
};

export default Dropdown;
