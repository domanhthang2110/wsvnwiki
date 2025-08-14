'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePageLoading } from '@/hooks/usePageLoading';

interface PostPageWrapperProps {
  children: React.ReactNode;
}

export function PostPageWrapper({ children }: PostPageWrapperProps) {
  const { showPageLoading, hidePageLoading } = usePageLoading();
  const [isContentReady, setIsContentReady] = useState(false);
  const hasShownLoading = useRef(false);

  useEffect(() => {
    // Only show loading once when component first mounts
    if (!hasShownLoading.current) {
      hasShownLoading.current = true;
      showPageLoading();

      // Wait for content to be ready
      const timer = setTimeout(() => {
        setIsContentReady(true);
        hidePageLoading();
      }, 600);

      return () => {
        clearTimeout(timer);
      };
    }
  }, []); // Empty dependency array to run only once

  // Always render children, loading overlay handles the visual state
  return <>{children}</>;
}