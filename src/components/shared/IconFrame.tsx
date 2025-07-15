// components/wiki/IconFrame.tsx
'use client';

import React, { useState, useMemo, ForwardedRef } from 'react';
import Image from 'next/image';

// Constants
export type FrameStyleType = 'yellow' | 'red' | 'green';
export type FrameType = 'regular' | 'key' | 'lesser';

interface FrameConfig {
  originalWidth: number;
  originalHeight: number;
  spriteSheetUrl: string;
  spriteColumns: number;
  spriteRows: number;
  originalBorderThickness: number; // This will be for the top/bottom/left/right border
  originalBorderThicknessY?: number; // Optional for different Y-axis border thickness
}

const frameConfigs: Record<FrameType, FrameConfig> = {
  regular: {
    originalWidth: 44,
    originalHeight: 44,
    spriteSheetUrl: '/icon_frame.png',
    spriteColumns: 3,
    spriteRows: 2,
    originalBorderThickness: 7,
  },
  key: {
    originalWidth: 44,
    originalHeight: 44,
    spriteSheetUrl: '/image/key_talent_frame.png',
    spriteColumns: 3,
    spriteRows: 2,
    originalBorderThickness: 7,
  },
  lesser: {
    originalWidth: 44,
    originalHeight: 44,
    spriteSheetUrl: '/image/lesser_talent_frame.png',
    spriteColumns: 3,
    spriteRows: 2,
    originalBorderThickness: 7,
  },
};

const frameStyleIndices: Record<FrameStyleType, { default: number; hover: number }> = {
  yellow: { default: 3, hover: 0 },
  red:    { default: 4, hover: 1 },
  green:  { default: 5, hover: 2 },
};

interface IconFrameProps {
  contentImageUrl: string | null | undefined;
  styleType?: FrameStyleType; // Make optional as it's only for 'regular' frame
  frameType?: FrameType; // New prop for frame type
  altText?: string;
  disableHover?: boolean;
  size?: number;
  onClick?: (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => void;
  isActive?: boolean;
  style?: React.CSSProperties; // Add style prop
  // These props allow the parent to be notified of hover events
  onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const IconFrame = React.forwardRef<HTMLDivElement, IconFrameProps>(({
  contentImageUrl,
  styleType = 'yellow', // Default to 'yellow' for regular frame
  frameType = 'regular', // Default to 'regular' frame
  altText = "User content",
  disableHover = false,
  size, // This 'size' prop will now be interpreted as a desired width
  onClick,
  isActive = false,
  onMouseEnter: parentOnMouseEnter,
  onMouseLeave: parentOnMouseLeave,
  style, // Destructure the new style prop
}, ref: ForwardedRef<HTMLDivElement>) => {
  const [isHovered, setIsHovered] = useState(false);

  const currentFrameConfig = frameConfigs[frameType];

  // Calculate effective dimensions based on provided size or original dimensions
  let calculatedSize = size ?? currentFrameConfig.originalWidth;
  if (['key', 'lesser'].includes(frameType)) {
    calculatedSize += 8; // Add 8px for key and lesser frames
  }
  const effectiveWidth = calculatedSize;
  const effectiveHeight = (effectiveWidth / currentFrameConfig.originalWidth) * currentFrameConfig.originalHeight;

  const dimensions = useMemo(() => {
    const scaleX = effectiveWidth / currentFrameConfig.originalWidth;
    const scaleY = effectiveHeight / currentFrameConfig.originalHeight;

    const frameBorderThicknessX = currentFrameConfig.originalBorderThickness * scaleX;
    const frameBorderThicknessY = currentFrameConfig.originalBorderThickness * scaleY;

    const contentAreaWidth = Math.max(0, effectiveWidth - 2 * frameBorderThicknessX);
    const contentAreaHeight = Math.max(0, effectiveHeight - 2 * frameBorderThicknessY);

    // Assuming content area offset is based on border thickness + a small inner padding (1px scaled)
    const contentAreaOffsetX = frameBorderThicknessX + (1 * scaleX);
    const contentAreaOffsetY = frameBorderThicknessY + (1 * scaleY);

    return { scaleX, scaleY, contentAreaWidth, contentAreaHeight, contentAreaOffsetX, contentAreaOffsetY };
  }, [effectiveWidth, effectiveHeight, currentFrameConfig.originalWidth, currentFrameConfig.originalHeight, currentFrameConfig.originalBorderThickness]);

  const currentFrameIndices = frameStyleIndices[styleType];
  const showActiveState = isActive || (isHovered && !disableHover);
  const currentFrameIndex = showActiveState 
    ? currentFrameIndices.hover 
    : currentFrameIndices.default;

  const { backgroundPosition, backgroundSize } = useMemo(() => {
    const col = currentFrameIndex % currentFrameConfig.spriteColumns;
    const row = Math.floor(currentFrameIndex / currentFrameConfig.spriteColumns);
    const xPos = -(col * effectiveWidth);
    const yPos = -(row * effectiveHeight);
    const scaledSheetWidth = currentFrameConfig.spriteColumns * effectiveWidth;
    const scaledSheetHeight = currentFrameConfig.spriteRows * effectiveHeight;
    return {
      backgroundPosition: `${xPos}px ${yPos}px`,
      backgroundSize: `${scaledSheetWidth}px ${scaledSheetHeight}px`,
    };
  }, [currentFrameIndex, effectiveWidth, effectiveHeight, currentFrameConfig]);

  const containerStyle: React.CSSProperties = {
    width: `${effectiveWidth}px`,
    height: `${effectiveHeight}px`,
    position: 'relative',
    display: 'inline-block',
    cursor: onClick ? 'pointer' : 'default',
    ...style, // Apply the passed style prop
  };

  const contentImageWrapperStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${dimensions.contentAreaOffsetY}px`,
    left: `${dimensions.contentAreaOffsetX}px`,
    width: `${dimensions.contentAreaWidth}px`,
    height: `${dimensions.contentAreaHeight}px`,
    zIndex: 1,
  };

  const frameOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url(${currentFrameConfig.spriteSheetUrl})`,
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
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e); } : undefined}
    >
      {contentImageUrl && ( // Conditionally render img tag only if contentImageUrl exists
        <div style={contentImageWrapperStyle}>
          <Image
            draggable={false}
            src={contentImageUrl}
            alt={altText || ""}
            fill
            style={{ objectFit: 'cover', imageRendering: 'pixelated' }}
          />
        </div>
  )}
  <div style={frameOverlayStyle} />
</div>
);
});

IconFrame.displayName = 'IconFrame';
export default IconFrame;
