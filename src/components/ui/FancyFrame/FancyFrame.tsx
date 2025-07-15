import React from 'react';

interface FancyFrameProps {
  children?: React.ReactNode;
  width: number;
  height: number;
  className?: string;
  scale?: number;
  overflowVisible?: boolean;
}

const FancyFrame: React.FC<FancyFrameProps> = ({
  children,
  width,
  height,
  className = '',
  scale = 1,
  overflowVisible = false
}) => {
  const cornerSize = 8 * scale;
  const contentPadding = cornerSize;

  const frameStyles: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    position: 'relative',
    imageRendering: 'pixelated',
    overflow: overflowVisible ? 'visible' : 'hidden',
    
    // CSS custom properties for the CSS to use
    '--corner-size': `${cornerSize}px`,
    '--h-border-height': `${6 * scale}px`,
    '--h-border-width': `${12 * scale}px`,
    '--v-border-width': `${6 * scale}px`,
    '--v-border-height': `${12 * scale}px`,
    '--frame-width': `${width}px`,
    '--frame-height': `${height}px`,
  } as React.CSSProperties;

  const contentStyles: React.CSSProperties = {
    position: 'absolute',
    top: contentPadding,
    left: contentPadding,
    right: contentPadding,
    bottom: contentPadding,
    overflow: overflowVisible ? 'visible' : 'hidden',
  };

  return (
    <>
      {/* Static CSS - only rendered once */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .fancy-frame-static {
            position: relative;
            image-rendering: pixelated;
          }
          
          /* Top-left corner */
          .fancy-frame-static::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: var(--corner-size);
            height: var(--corner-size);
            background-image: url(/fancy_corner.png);
            background-size: 100% 100%;
            image-rendering: pixelated;
            z-index: 4;
          }
          
          /* Top-right corner */
          .fancy-frame-static::after {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: var(--corner-size);
            height: var(--corner-size);
            background-image: url(/fancy_corner.png);
            background-size: 100% 100%;
            image-rendering: pixelated;
            transform: scaleX(-1);
            will-change: transform;
            z-index: 4;
          }
          
          /* Bottom corners container */
          .fancy-frame-static .frame-bottom::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: var(--corner-size);
            height: var(--corner-size);
            background-image: url(/fancy_corner.png);
            background-size: 100% 100%;
            image-rendering: pixelated;
            transform: scaleY(-1);
            will-change: transform;
            z-index: 4;
          }
          
          .fancy-frame-static .frame-bottom::after {
            content: '';
            position: absolute;
            bottom: 0;
            right: 0;
            width: var(--corner-size);
            height: var(--corner-size);
            background-image: url(/fancy_corner.png);
            background-size: 100% 100%;
            image-rendering: pixelated;
            transform: scale(-1, -1);
            will-change: transform;
            z-index: 4;
          }
          
          /* Horizontal borders */
          .fancy-frame-static .frame-borders::before {
            content: '';
            position: absolute;
            top: 0;
            left: var(--corner-size);
            width: calc(100% - calc(var(--corner-size) * 2));
            height: var(--h-border-height);
            background-image: url(/fancy_horizontal.png);
            background-size: var(--h-border-width) var(--h-border-height);
            background-repeat: repeat-x;
            image-rendering: pixelated;
            z-index: 3;
          }
          
          .fancy-frame-static .frame-borders::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: var(--corner-size);
            width: calc(100% - calc(var(--corner-size) * 2));
            height: var(--h-border-height);
            background-image: url(/fancy_horizontal.png);
            background-size: var(--h-border-width) var(--h-border-height);
            background-repeat: repeat-x;
            image-rendering: pixelated;
            transform: scaleY(-1);
            will-change: transform;
            z-index: 3;
          }
          
          /* Vertical borders */
          .fancy-frame-static .frame-sides::before {
            content: '';
            position: absolute;
            top: var(--corner-size);
            left: 0;
            width: var(--v-border-width);
            height: calc(100% - calc(var(--corner-size) * 2));
            background-image: url(/fancy_vertical.png);
            background-size: var(--v-border-width) var(--v-border-height);
            background-repeat: repeat-y;
            image-rendering: pixelated;
            z-index: 3;
          }
          
          .fancy-frame-static .frame-sides::after {
            content: '';
            position: absolute;
            top: var(--corner-size);
            right: 0;
            width: var(--v-border-width);
            height: calc(100% - calc(var(--corner-size) * 2));
            background-image: url(/fancy_vertical.png);
            background-size: var(--v-border-width) var(--v-border-height);
            background-repeat: repeat-y;
            image-rendering: pixelated;
            transform: scaleX(-1);
            will-change: transform;
            z-index: 3;
          }
          
          .fancy-frame-static .frame-content {
            position: relative;
            z-index: 10;
          }
        `
      }} />
      
      <div 
        className={`fancy-frame-static ${className}`}
        style={frameStyles}
      >
        {/* Minimal helper containers */}
        <div className="frame-bottom" style={{ position: 'absolute', inset: 0 }} />
        <div className="frame-borders" style={{ position: 'absolute', inset: 0 }} />
        <div className="frame-sides" style={{ position: 'absolute', inset: 0 }} />
        
        <div className="frame-content" style={contentStyles}>
          {children}
        </div>
      </div>
    </>
  );
};

export default FancyFrame;