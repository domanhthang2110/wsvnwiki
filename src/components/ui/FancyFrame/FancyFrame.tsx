import React from 'react';

interface FancyFrameProps {
  children?: React.ReactNode;
  width: number;
  height: number;
  className?: string;
  scale?: number; // New scale prop
  overflowVisible?: boolean;
}

const FancyFrame: React.FC<FancyFrameProps> = ({ children, width, height, className, scale = 1, overflowVisible = false }) => {
  const cornerSize = 8; // 8x8 pixels for corner (original size)
  const horizontalBorderHeight = 6; // Height of fancy_horizontal.png (original size)
  const horizontalBorderWidth = 12; // Width of fancy_horizontal.png (original size)
  const verticalBorderWidth = 6; // Width of fancy_vertical.png (original size)
  const verticalBorderHeight = 12; // Height of fancy_vertical.png (original size)

  const scaledCornerSize = cornerSize * scale;
  const scaledHorizontalBorderHeight = horizontalBorderHeight * scale;
  const scaledHorizontalBorderWidth = horizontalBorderWidth * scale;
  const scaledVerticalBorderWidth = verticalBorderWidth * scale;
  const scaledVerticalBorderHeight = verticalBorderHeight * scale;

  const frameStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    position: 'relative',
    imageRendering: 'pixelated',
    overflow: overflowVisible ? 'visible' : 'hidden',
  };

  const contentStyle: React.CSSProperties = {
    position: 'absolute',
    top: scaledCornerSize,
    left: scaledCornerSize,
    width: width - scaledCornerSize * 2,
    height: height - scaledCornerSize * 2,
    overflow: overflowVisible ? 'visible' : 'hidden',
  };

  return (
    <div className={`fancy-frame-component ${className || ''}`} style={frameStyle}>
      {/* Top-left corner */}
      <div
        className="fancy-frame-corner top-left"
        style={{
          width: scaledCornerSize,
          height: scaledCornerSize,
          backgroundImage: 'url(/fancy_corner.png)',
          backgroundSize: '100% 100%', /* Stretch to fill div */
          imageRendering: 'pixelated',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      {/* Top-right corner */}
      <div
        className="fancy-frame-corner top-right"
        style={{
          width: scaledCornerSize,
          height: scaledCornerSize,
          backgroundImage: 'url(/fancy_corner.png)',
          backgroundSize: '100% 100%', /* Stretch to fill div */
          imageRendering: 'pixelated',
          position: 'absolute',
          top: 0,
          right: 0,
          transform: 'scaleX(-1)',
        }}
      />
      {/* Bottom-left corner */}
      <div
        className="fancy-frame-corner bottom-left"
        style={{
          width: scaledCornerSize,
          height: scaledCornerSize,
          backgroundImage: 'url(/fancy_corner.png)',
          backgroundSize: '100% 100%', /* Stretch to fill div */
          imageRendering: 'pixelated',
          position: 'absolute',
          bottom: 0,
          left: 0,
          transform: 'scaleY(-1)',
        }}
      />
      {/* Bottom-right corner */}
      <div
        className="fancy-frame-corner bottom-right"
        style={{
          width: scaledCornerSize,
          height: scaledCornerSize,
          backgroundImage: 'url(/fancy_corner.png)',
          backgroundSize: '100% 100%', /* Stretch to fill div */
          imageRendering: 'pixelated',
          position: 'absolute',
          bottom: 0,
          right: 0,
          transform: 'scale(-1, -1)',
        }}
      />

      {/* Top border */}
      <div
        className="fancy-frame-border top"
        style={{
          height: scaledHorizontalBorderHeight,
          backgroundImage: 'url(/fancy_horizontal.png)',
          backgroundSize: `${scaledHorizontalBorderWidth}px ${scaledHorizontalBorderHeight}px`, /* Scaled size of the horizontal border sprite */
          backgroundRepeat: 'repeat-x',
          imageRendering: 'pixelated',
          position: 'absolute',
          top: 0,
          left: scaledCornerSize,
          width: `calc(100% - ${scaledCornerSize * 2}px)`,
        }}
      />
      {/* Bottom border */}
      <div
        className="fancy-frame-border bottom"
        style={{
          height: scaledHorizontalBorderHeight,
          backgroundImage: 'url(/fancy_horizontal.png)',
          backgroundSize: `${scaledHorizontalBorderWidth}px ${scaledHorizontalBorderHeight}px`, /* Scaled size of the horizontal border sprite */
          backgroundRepeat: 'repeat-x',
          imageRendering: 'pixelated',
          position: 'absolute',
          bottom: 0,
          left: scaledCornerSize,
          width: `calc(100% - ${scaledCornerSize * 2}px)`,
          transform: 'scaleY(-1)',
        }}
      />
      {/* Left border */}
      <div
        className="fancy-frame-border left"
        style={{
          width: scaledVerticalBorderWidth,
          backgroundImage: 'url(/fancy_vertical.png)',
          backgroundSize: `${scaledVerticalBorderWidth}px ${scaledVerticalBorderHeight}px`, /* Scaled size of the vertical border sprite */
          backgroundRepeat: 'repeat-y',
          imageRendering: 'pixelated',
          position: 'absolute',
          top: scaledCornerSize,
          left: 0,
          height: `calc(100% - ${scaledCornerSize * 2}px)`,
        }}
      />
      {/* Right border */}
      <div
        className="fancy-frame-border right"
        style={{
          width: scaledVerticalBorderWidth,
          backgroundImage: 'url(/fancy_vertical.png)',
          backgroundSize: `${scaledVerticalBorderWidth}px ${scaledVerticalBorderHeight}px`, /* Scaled size of the vertical border sprite */
          backgroundRepeat: 'repeat-y',
          imageRendering: 'pixelated',
          position: 'absolute',
          top: scaledCornerSize,
          right: 0,
          height: `calc(100% - ${scaledCornerSize * 2}px)`,
          transform: 'scaleX(-1)',
        }}
      />

      <div className="fancy-frame-content" style={contentStyle}>
        {children}
      </div>
    </div>
  );
};

export default FancyFrame;
