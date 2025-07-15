'use client';

import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils'; // Assuming cn utility for class merging

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  width: number;
  height?: number; // Optional height, default to capHeight if not provided
  className?: string;
  inputClassName?: string; // Class for the actual input element
  leftIcon?: React.ReactNode; // New prop for left-aligned icon
  iconOffsetLeft?: number; // Offset for the left icon in pixels
  textOffsetLeft?: number; // Offset for the text input in pixels
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ width, height, className, inputClassName, type, leftIcon, iconOffsetLeft = 8, textOffsetLeft = 8, ...props }, ref) => {
    const capWidth = 12;
    const capHeight = 32; // Top half of 64px image is 32px

    const effectiveHeight = height || capHeight;
    const middleWidth = Math.max(0, width - 2 * capWidth);

    const spriteUrl = '/image/input_field.webp';

    const baseStyle: React.CSSProperties = {
      height: `${effectiveHeight}px`,
      backgroundImage: `url(${spriteUrl})`,
      backgroundRepeat: 'no-repeat',
      imageRendering: 'pixelated',
    };

    const leftCapStyle: React.CSSProperties = {
      ...baseStyle,
      width: `${capWidth}px`,
      backgroundPosition: '0px 0px', // Top half for left cap
    };

    const middleStyle: React.CSSProperties = {
      ...baseStyle,
      width: `${middleWidth}px`,
      backgroundPosition: '0px -32px', // Bottom half for middle part
      backgroundRepeat: 'repeat-x',
      position: 'relative', // Needed for absolute positioning of icon and input
    };

    const rightCapStyle: React.CSSProperties = {
      ...baseStyle,
      width: `${capWidth}px`,
      backgroundPosition: '0px 0px', // Top half for right cap (flipped)
      transform: 'scaleX(-1)',
    };

    return (
      <div
        className={cn(
          'flex items-center relative p-0 border-none bg-transparent',
          className
        )}
        style={{
          width: `${width}px`,
          height: `${effectiveHeight}px`,
        }}
      >
        <div style={leftCapStyle} />
        <div style={middleStyle}>
          {leftIcon && (
            <div
              className="absolute top-1/2 -translate-y-1/2 z-10"
              style={{ left: `${iconOffsetLeft}px` }}
            >
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'absolute inset-0 w-full h-full bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-400 pr-2',
              inputClassName
            )}
            style={{ paddingLeft: `${textOffsetLeft}px` }} // Apply dynamic padding
            ref={ref}
            {...props}
          />
        </div>
        <div style={rightCapStyle} />
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export { InputField };
