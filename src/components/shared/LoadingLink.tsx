'use client';

import React from 'react';
import Link, { LinkProps } from 'next/link';
import { useNavigationLoading } from '@/components/features/wiki/layout/NavigationLoadingProvider';

interface LoadingLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
}

export function LoadingLink({ children, href, className, ...props }: LoadingLinkProps) {
  const { setIsLoading } = useNavigationLoading();

  const handleClick = () => {
    // Use top loading bar for inter-page navigation
    setIsLoading(true, 'topbar');
  };

  return (
    <Link 
      href={href} 
      className={className} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}