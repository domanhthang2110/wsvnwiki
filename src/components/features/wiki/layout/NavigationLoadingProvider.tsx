'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { TopLoadingBar } from '@/components/ui/TopLoadingBar';

type LoadingType = 'overlay' | 'topbar';

interface NavigationLoadingContextType {
  isLoading: boolean;
  loadingType: LoadingType;
  setIsLoading: (loading: boolean, type?: LoadingType) => void;
}

const NavigationLoadingContext = createContext<NavigationLoadingContextType | undefined>(undefined);

export function useNavigationLoading() {
  const context = useContext(NavigationLoadingContext);
  if (!context) {
    throw new Error('useNavigationLoading must be used within NavigationLoadingProvider');
  }
  return context;
}

interface NavigationLoadingProviderProps {
  children: React.ReactNode;
}

export function NavigationLoadingProvider({ children }: NavigationLoadingProviderProps) {
  const [isLoading, setIsLoadingState] = useState(false);
  const [loadingType, setLoadingType] = useState<LoadingType>('overlay');
  const pathname = usePathname();

  const setIsLoading = (loading: boolean, type: LoadingType = 'overlay') => {
    setIsLoadingState(loading);
    if (loading) {
      setLoadingType(type);
    }
  };

  // Reset loading state when pathname changes (navigation complete)
  useEffect(() => {
    setIsLoadingState(false);
  }, [pathname]);

  // Timeout mechanism to prevent infinite loading (15 seconds max)
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        console.warn('Navigation loading timeout - clearing loading state');
        setIsLoadingState(false);
      }, 15000);

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  return (
    <NavigationLoadingContext.Provider value={{ isLoading, loadingType, setIsLoading }}>
      {children}
      <TopLoadingBar isLoading={isLoading && loadingType === 'topbar'} />
      {isLoading && loadingType === 'overlay' && <LoadingOverlay darkened />}
    </NavigationLoadingContext.Provider>
  );
}