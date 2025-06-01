// components/wiki/IconFrame.tsx
'use client';

import React, { useState, useMemo, ForwardedRef } from 'react';

// Constants
const ORIGINAL_FRAME_SIZE = 44;
const SPRITE_SHEET_URL = '/icon_frame.png'; // Ensure this path is correct in your public folder
const SPRITE_COLUMNS = 3;
const SPRITE_ROWS = 2;
const ORIGINAL_BORDER_THICKNESS = 7;

export type FrameStyleType = 'yellow' | 'red' | 'green';

const frameStyleIndices: Record<FrameStyleType, { default: number; hover: number }> = {
  yellow: { default: 3, hover: 0 },
  red:    { default: 4, hover: 1 },
  green:  { default: 5, hover: 2 },
};

interface IconFrameProps {
  contentImageUrl: string;
  styleType: FrameStyleType;
  altText?: string;
  disableHover?: boolean;
  size?: number;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  isActive?: boolean;
  // These props allow the parent to be notified of hover events
  onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const IconFrame = React.forwardRef<HTMLDivElement, IconFrameProps>(({
  contentImageUrl,
  styleType,
  altText = "User content",
  disableHover = false,
  size = ORIGINAL_FRAME_SIZE,
  onClick,
  isActive = false,
  onMouseEnter: parentOnMouseEnter, // Destructure parent's onMouseEnter
  onMouseLeave: parentOnMouseLeave, // Destructure parent's onMouseLeave
}, ref: ForwardedRef<HTMLDivElement>) => {
  const [isHovered, setIsHovered] = useState(false); // For IconFrame's own visual hover effect

  const dimensions = useMemo(() => {
    const scale = size / ORIGINAL_FRAME_SIZE;
    const frameBorderThickness = ORIGINAL_BORDER_THICKNESS * scale;
    const contentAreaSize = Math.max(0, size - 2 * frameBorderThickness);
    const contentAreaOffset = frameBorderThickness + (1 * scale);
    return { scale, contentAreaSize, contentAreaOffset };
  }, [size]);

  const currentFrameIndices = frameStyleIndices[styleType];
  const showActiveState = isActive || (isHovered && !disableHover);
  const currentFrameIndex = showActiveState 
    ? currentFrameIndices.hover 
    : currentFrameIndices.default;

  const { backgroundPosition, backgroundSize } = useMemo(() => {
    const col = currentFrameIndex % SPRITE_COLUMNS;
    const row = Math.floor(currentFrameIndex / SPRITE_COLUMNS);
    const xPos = -(col * size);
    const yPos = -(row * size);
    const scaledSheetWidth = SPRITE_COLUMNS * size;
    const scaledSheetHeight = SPRITE_ROWS * size;
    return {
      backgroundPosition: `${xPos}px ${yPos}px`,
      backgroundSize: `${scaledSheetWidth}px ${scaledSheetHeight}px`,
    };
  }, [currentFrameIndex, size]);

  const containerStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    position: 'relative',
    display: 'inline-block',
    cursor: onClick ? 'pointer' : 'default',
  };

  const contentImageStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${dimensions.contentAreaOffset}px`,
    left: `${dimensions.contentAreaOffset}px`,
    width: `${dimensions.contentAreaSize}px`,
    height: `${dimensions.contentAreaSize}px`,
    objectFit: 'cover',
    imageRendering: 'pixelated',
    zIndex: 1,
  };

  const frameOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url(${SPRITE_SHEET_URL})`,
    backgroundPosition: backgroundPosition,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated',
    zIndex: 2,
    pointerEvents: 'none',
    backgroundSize: backgroundSize,
  };

  // These handlers now manage the internal hover state AND call the parent's handlers
  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disableHover) {
      setIsHovered(true);
    }
    if (parentOnMouseEnter) { // If the parent passed an onMouseEnter, call it
      parentOnMouseEnter(event);
    }
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disableHover) {
      setIsHovered(false);
    }
    if (parentOnMouseLeave) { // If the parent passed an onMouseLeave, call it
      parentOnMouseLeave(event);
    }
  };

  return (
    <div
      ref={ref}
      style={containerStyle}
      onMouseEnter={handleMouseEnter} // Use the new combined handler
      onMouseLeave={handleMouseLeave} // Use the new combined handler
      onClick={onClick}
      role={onClick ? "button" : "img"}
      tabIndex={onClick ? 0 : -1}
      aria-label={altText || `Framed content with ${styleType} style`}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e as any); } : undefined}
    >
      <img
        src={contentImageUrl}
        alt={altText || ""}
        style={contentImageStyle}
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://placehold.co/${dimensions.contentAreaSize || 30}x${dimensions.contentAreaSize || 30}/374151/9CA3AF?text=?`;
        }}
      />
      <div style={frameOverlayStyle} />
    </div>
  );
});

IconFrame.displayName = 'IconFrame';
export default IconFrame;