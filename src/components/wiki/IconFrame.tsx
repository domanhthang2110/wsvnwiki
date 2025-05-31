// components/IconFrame.tsx
'use client';

import React, { useState, useMemo } from 'react';

// Original dimensions of a single frame in the sprite sheet
const ORIGINAL_FRAME_SIZE = 44;
const SPRITE_SHEET_URL = '/icon_frame.png';
const SPRITE_COLUMNS = 3;
const SPRITE_ROWS = 2; // The sprite has 2 rows of frames

// Original border thickness
const ORIGINAL_BORDER_THICKNESS = 7;
const ORIGINAL_CONTENT_OFFSET = ORIGINAL_BORDER_THICKNESS + 1;


export type FrameStyleType = 'yellow' | 'red' | 'green';

const frameStyleIndices: Record<FrameStyleType, { default: number; hover: number }> = {
  yellow: { default: 3, hover: 0 },
  red:    { default: 4, hover: 1 },
  green:  { default: 5, hover: 2 },
};

// STEP 1: Add a "size" prop to the interface
interface IconFrameProps {
  contentImageUrl: string;
  styleType: FrameStyleType;
  altText?: string;
  disableHover?: boolean;
  size?: number; // New prop to control the component's size
}

const IconFrame: React.FC<IconFrameProps> = ({
  contentImageUrl,
  styleType,
  altText = "User content",
  disableHover = false,
  size = ORIGINAL_FRAME_SIZE, // Use original size as the default
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // STEP 2: Calculate all dimensions dynamically based on the size prop
  // We use useMemo to avoid recalculating on every render unless 'size' changes
  const dimensions = useMemo(() => {
    const scale = size / ORIGINAL_FRAME_SIZE;
    const frameBorderThickness = ORIGINAL_BORDER_THICKNESS * scale;
    const contentAreaSize = size - 2 * frameBorderThickness;
    const contentAreaOffset = frameBorderThickness + (1 * scale); // Scale the 1px gap too

    return {
      scale,
      contentAreaSize,
      contentAreaOffset,
    };
  }, [size]);

  const currentFrameIndices = frameStyleIndices[styleType];
  const currentFrameIndex = (isHovered && !disableHover) ? currentFrameIndices.hover : currentFrameIndices.default;

  // STEP 3: Update background calculations to use the new size
  const { backgroundPosition, backgroundSize } = useMemo(() => {
    const col = currentFrameIndex % SPRITE_COLUMNS;
    const row = Math.floor(currentFrameIndex / SPRITE_COLUMNS);

    // Position must be scaled by the new size
    const xPos = -(col * size);
    const yPos = -(row * size);
    
    // The entire sprite sheet must be scaled up
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
    // STEP 4: Add the backgroundSize property
    backgroundSize: backgroundSize,
  };

  return (
    <div
      style={containerStyle}
      onMouseEnter={() => !disableHover && setIsHovered(true)}
      onMouseLeave={() => !disableHover && setIsHovered(false)}
      role="img"
      aria-label={altText || `Framed content with ${styleType} style`}
    >
      <img
        src={contentImageUrl}
        alt={altText}
        style={contentImageStyle}
      />
      <div style={frameOverlayStyle} />
    </div>
  );
};

export default IconFrame;