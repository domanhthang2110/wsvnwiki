'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useFloating, offset, flip, shift, arrow } from '@floating-ui/react';

interface NameTooltipProps {
  name: string;
  isOpen: boolean;
  referenceElement: HTMLElement | null;
}

export default function NameTooltip({ name, isOpen, referenceElement }: NameTooltipProps) {
  const arrowRef = useRef(null);
  const { x, y, strategy, refs, context, middlewareData } = useFloating({
    open: isOpen,
    placement: 'top',
    middleware: [
      offset(8),
      flip(),
      shift(),
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: (reference, floating, update) => {
      const cleanup = autoUpdate(reference, floating, update);
      return cleanup;
    },
  });

  // Function to prevent autoUpdate from being undefined
  const autoUpdate = (reference: any, floating: any, update: any) => {
    const interval = setInterval(update, 100); // Update every 100ms
    return () => clearInterval(interval);
  };

  if (!isOpen || !referenceElement) return null;

  return (
    <div
      ref={refs.setFloating}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        zIndex: 9999,
        pointerEvents: 'none', // Ensure tooltip doesn't block interaction with elements below
      }}
      className="bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap"
    >
      {name}
      <div
        ref={arrowRef}
        className="absolute bg-gray-700 h-2 w-2 rotate-45"
        style={{
          left: middlewareData.arrow?.x != null ? middlewareData.arrow.x : '',
          top: middlewareData.arrow?.y != null ? middlewareData.arrow.y : '',
          [context.placement.split('-')[0]]: '-4px', // Position arrow correctly
        }}
      />
    </div>
  );
}
