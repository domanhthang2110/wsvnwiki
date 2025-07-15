import Image from 'next/image';
import React from 'react';

interface CheckboxProps {
  isChecked: boolean;
  onClick: () => void;
  label: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ isChecked, onClick, label }) => {
  const spriteYOffset = isChecked ? -32 : 0; // 32px height for each state

  return (
    <div
      className="flex items-center cursor-pointer select-none"
      onClick={onClick}
    >
      <div
        className="relative w-8 h-8 overflow-hidden" // 32x32 display area
        style={{ flexShrink: 0 }}
      >
        <Image
          src="/image/ui/checkbox/checkbox.webp"
          alt="Checkbox"
          width={32}
          height={64} // Total sprite height
          style={{ transform: `translateY(${spriteYOffset}px)` }}
          className="absolute top-0 left-0"
        />
      </div>
      <span className="ml-2 text-white text-sm">{label}</span>
    </div>
  );
};

export default Checkbox;
