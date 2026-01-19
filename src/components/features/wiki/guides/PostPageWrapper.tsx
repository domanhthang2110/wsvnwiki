'use client';

import React, { useEffect, useRef } from 'react';
import { usePageLoading } from '@/hooks/usePageLoading';

interface PostPageWrapperProps {
  children: React.ReactNode;
}

export function PostPageWrapper({ children }: PostPageWrapperProps) {
  const { showPageLoading, hidePageLoading } = usePageLoading();
  const hasShownLoading = useRef(false);

  useEffect(() => {
    // Only show loading once when component first mounts
    if (!hasShownLoading.current) {
      hasShownLoading.current = true;
      showPageLoading();

      // Wait for content to be ready
      const timer = setTimeout(() => {
        hidePageLoading();
      }, 600);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [showPageLoading, hidePageLoading]);

  // Always render children, loading overlay handles the visual state
  return <>{children}</>;
}