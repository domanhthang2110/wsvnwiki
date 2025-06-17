import React from 'react';

interface BoxProps {
  children?: React.ReactNode;
  className?: string;
  headerEnabled?: boolean;
  headerHeight?: number;
  headerContent?: React.ReactNode;
}

const Box: React.FC<BoxProps> = ({
  children,
  className,
  headerEnabled = false,
  headerHeight = 30, // Default height for the header
  headerContent,
}) => {
  return (
    <div className={`box-component ${className || ''}`}>
      <img src="/corner.png" alt="corner" className="corner-sprite top-left" />
      <img src="/corner.png" alt="corner" className="corner-sprite top-right" />
      <img src="/corner.png" alt="corner" className="corner-sprite bottom-left" />
      <img src="/corner.png" alt="corner" className="corner-sprite bottom-right" />
      <div className="box-content" style={{ '--header-height': headerEnabled ? `${headerHeight}px` : '0px' } as React.CSSProperties}>
        {headerEnabled && (
          <div className="box-header" style={{ height: `${headerHeight}px` }}>
            {headerContent}
            <div className="box-header-border-top"></div>
            <div className="box-header-border-bottom"></div>
          </div>
        )}
        <div className="box-children-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Box;
