'use client';

import React, { useState, useMemo } from 'react';
import { FrameStyleType, FrameType } from './IconFrame';

// Reuse the same frame configs from IconFrame
const frameConfigs = {
  regular: {
    originalWidth: 44,
    originalHeight: 44,
    spriteSheetUrl: '/icon_frame.webp',
    spriteColumns: 3,
    spriteRows: 2,
    originalBorderThickness: 7,
  },
  key: {
    originalWidth: 44,
    originalHeight: 44,
    spriteSheetUrl: '/image/key_talent_frame.webp',
    spriteColumns: 3,
    spriteRows: 2,
    originalBorderThickness: 7,
  },
  lesser: {
    originalWidth: 44,
    originalHeight: 44,
    spriteSheetUrl: '/image/lesser_talent_frame.webp',
    spriteColumns: 3,
    spriteRows: 2,
    originalBorderThickness: 7,
  },
};

const frameStyleIndices = {
  yellow: { default: 3, hover: 0 },
  red: { default: 4, hover: 1 },
  green: { default: 5, hover: 2 },
};

interface InlineIconFrameProps {
  contentImageUrl?: string | null;
  styleType?: FrameStyleType;
  frameType?: FrameType;
  altText?: string;
  size?: number;
}

export function InlineIconFrame({
  contentImageUrl,
  styleType = 'yellow',
  frameType = 'regular',
  altText = 'Icon',
  size,
}: InlineIconFrameProps) {
  const [isHovered, setIsHovered] = useState(false);

  const currentFrameConfig = frameConfigs[frameType];

  // Calculate effective dimensions
  let calculatedSize = size ?? currentFrameConfig.originalWidth;
  if (['key', 'lesser'].includes(frameType)) {
    calculatedSize += 8;
  }
  const effectiveWidth = calculatedSize;
  const effectiveHeight = (effectiveWidth / currentFrameConfig.originalWidth) * currentFrameConfig.originalHeight;

  const currentFrameIndices = frameStyleIndices[styleType];
  const currentFrameIndex = isHovered ? currentFrameIndices.hover : currentFrameIndices.default;

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

  // Calculate content area for background image positioning
  const scaleX = effectiveWidth / currentFrameConfig.originalWidth;
  const scaleY = effectiveHeight / currentFrameConfig.originalHeight;
  const frameBorderThicknessX = currentFrameConfig.originalBorderThickness * scaleX;
  const frameBorderThicknessY = currentFrameConfig.originalBorderThickness * scaleY;
  const contentAreaWidth = Math.max(0, effectiveWidth - 2 * frameBorderThicknessX);
  const contentAreaHeight = Math.max(0, effectiveHeight - 2 * frameBorderThicknessY);
  const contentAreaOffsetX = frameBorderThicknessX + (1 * scaleX);
  const contentAreaOffsetY = frameBorderThicknessY + (1 * scaleY);

  const containerStyle: React.CSSProperties = {
    display: 'inline-block',
    width: `${effectiveWidth}px`,
    height: `${effectiveHeight}px`,
    position: 'relative',
    verticalAlign: 'middle',
    // Combined background: content image + frame overlay
    backgroundImage: contentImageUrl 
      ? `url(${currentFrameConfig.spriteSheetUrl}), url(${contentImageUrl})`
      : `url(${currentFrameConfig.spriteSheetUrl})`,
    backgroundPosition: contentImageUrl
      ? `${backgroundPosition}, ${contentAreaOffsetX}px ${contentAreaOffsetY}px`
      : backgroundPosition,
    backgroundSize: contentImageUrl
      ? `${backgroundSize}, ${contentAreaWidth}px ${contentAreaHeight}px`
      : backgroundSize,
    backgroundRepeat: 'no-repeat, no-repeat',
    imageRendering: 'pixelated',
  };

  return (
    <span
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={altText}
    />
  );
}