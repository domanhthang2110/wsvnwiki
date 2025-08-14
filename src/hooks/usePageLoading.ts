'use client';

import { useNavigationLoading } from '@/components/features/wiki/layout/NavigationLoadingProvider';

/**
 * Hook for pages that need to show overlay loading while initial content loads
 * Use this for pages that are empty/useless until content is ready
 */
export function usePageLoading() {
  const { setIsLoading } = useNavigationLoading();

  const showPageLoading = () => {
    setIsLoading(true, 'overlay');
  };

  const hidePageLoading = () => {
    setIsLoading(false);
  };

  return {
    showPageLoading,
    hidePageLoading,
  };
}