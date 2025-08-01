'use client';

import React, { useState } from 'react';

interface LongButtonProps {
  width: number;
  text?: string;
  onClick?: () => void;
  className?: string;
  hoverHighlightingEnabled?: boolean;
  isHighlighted?: boolean;
  style?: React.CSSProperties; // Allow external styles, including transform
  children?: React.ReactNode;
}

const LongButton: React.FC<LongButtonProps> = ({
  width,
  text,
  onClick,
  className = '',
  hoverHighlightingEnabled = true,
  isHighlighted = false,
  style, // Destructure the style prop
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const capWidth = 16;
  const capHeight = 36;
  const middleWidth = Math.max(0, width - 2 * capWidth);

  const spriteUrl = '/long_button.webp';

  const showHighlightedSprite = (hoverHighlightingEnabled && isHovered) || isHighlighted;

  const getSpritePosition = (part: 'cap' | 'middle') => {
    if (showHighlightedSprite) {
      return part === 'cap' ? '0px 0px' : '0px -72px';
    }
    return part === 'cap' ? '0px -36px' : '0px -108px';
  };

  const baseStyle: React.CSSProperties = {
    height: `${capHeight}px`,
    backgroundImage: `url(${spriteUrl})`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated', // For pixel-perfect rendering (modern browsers)
    // Fallback for older browsers, if needed. 'crisp-edges' is a more widely supported alias.
    // imageRendering: 'crisp-edges',
  };

  const leftCapStyle: React.CSSProperties = {
    ...baseStyle,
    width: `${capWidth}px`,
    backgroundPosition: getSpritePosition('cap'),
  };

  const middleStyle: React.CSSProperties = {
    ...baseStyle,
    width: `${middleWidth}px`,
    backgroundPosition: getSpritePosition('middle'),
    backgroundRepeat: 'repeat-x',
  };

  const rightCapStyle: React.CSSProperties = {
    ...baseStyle,
    width: `${capWidth}px`,
    backgroundPosition: getSpritePosition('cap'),
    transform: 'scaleX(-1)',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-center relative p-0 border-none bg-transparent cursor-pointer ${className}`}
      style={{
        width: `${width}px`,
        height: `${capHeight}px`,
        fontFamily: 'sans-serif',
        ...style, // Apply external styles
      }}
    >
      <div style={leftCapStyle} />
      <div style={middleStyle} />
      <div style={rightCapStyle} />
      {children ? (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      ) : (
        text && (
          <span
            className="absolute inset-0 flex items-center justify-center text-center pointer-events-none uppercase font-bold"
            style={{
              color: "#feda5d",
              textShadow: "1px 1px 0px black",
            }}
          >
            {text}
          </span>
        )
      )}
    </button>
  );
};

export default LongButton;
