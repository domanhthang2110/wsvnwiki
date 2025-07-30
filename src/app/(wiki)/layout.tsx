'use client';

import { usePathname } from 'next/navigation';
import UIBox from '@/components/ui/Box/UIBox';
import MedievalBurgerMenu from '@/components/features/wiki/layout/MedievalBurgerMenu';

interface WikiLayoutProps {
  children: React.ReactNode;
}

// Page title mapping based on pathname
const getPageTitle = (pathname: string): string => {
  const titleMap: { [key: string]: string } = {
    '/classes': 'Lớp nhân vật',
    '/guides': 'Hướng dẫn',
    '/talents': 'Cây tài năng',
    '/skills': 'Kỹ năng',
    '/items': 'Vật phẩm',
    '/quests': 'Nhiệm vụ',
    '/dungeons': 'Dungeon',
    '/pvp': 'PvP',
    '/events': 'Sự kiện',
  };
  
  // Find matching path
  for (const [path, title] of Object.entries(titleMap)) {
    if (pathname.startsWith(path)) {
      return title;
    }
  }
  
  return 'Wiki'; // Default title
};

export default function WikiLayout({ children }: WikiLayoutProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  

  const headerContent = (
    <div className="flex items-center justify-end">
      <span 
        className="text-yellow-300 font-bold text-lg"
        style={{
          textShadow: '-1px -1px 1px black, 1px -1px 1px black, -1px 1px 1px black, 1px 1px 1px black'
        }}
      >
        {pageTitle}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full">
      <UIBox 
        className="w-full h-full flex-grow bg-gray-900" 
        headerEnabled={true} 
        headerHeight={40}
        headerContent={headerContent}
        contentCenteredAndMaxWidth={true}
        showClouds={true} // Enable clouds for this layout
        showAltBurgerMenu={true}
      >
        {children}
      </UIBox>
    </div>
  );
}
