'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // To highlight the active link
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button/button';

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/classes', label: 'Classes' },
  { href: '/admin/skills', label: 'Skills' },
  { href: '/admin/items', label: 'Items' },
  { href: '/admin/talents', label: 'Talents' },
  { href: '/admin/talent-trees', label: 'Talent Trees' },
  { href: '/admin/posts', label: 'Posts' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/tags', label: 'Tags' }
];

export function AdminSidebar({ onToggleCollapse }: { onToggleCollapse: (isCollapsed: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Effect to notify parent of collapse state change
  useEffect(() => {
    onToggleCollapse(isCollapsed);
  }, [isCollapsed, onToggleCollapse]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <aside className={`flex-shrink-0 bg-gray-800 p-4 h-screen sticky top-0 shadow-lg flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-60'}`}>
      <div className="mb-8 text-center relative">
        <Link href="/admin" className={`text-2xl font-bold text-blue-400 hover:text-blue-500 ${isCollapsed ? 'hidden' : ''}`}>
          Wiki Admin
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute top-0 ${isCollapsed ? 'left-1/2 -translate-x-1/2' : '-right-2'} p-1 text-gray-400 hover:text-gray-200 transition-transform duration-300`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 12h14"></path></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
          )}
        </button>
      </div>
      <nav className="flex-grow overflow-hidden">
        <ul>
          {navItems.map((item) => (
            <li key={item.href} className="mb-2">
              <Link
                href={item.href}
                className={`flex items-center py-2.5 px-4 rounded-lg text-sm font-medium transition-colors
                  ${
                    pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
              >
                {/* Optional: Add icons here if desired */}
                <span className={`${isCollapsed ? 'hidden' : ''}`}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={`mt-auto pt-4 border-t border-gray-700 ${isCollapsed ? 'hidden' : ''}`}>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="block py-2.5 px-4 rounded-lg text-sm font-medium transition-colors text-gray-300 hover:bg-gray-700 mb-2"
        >
          Return to Wiki
        </Link>
        <Button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 text-white">
          Log Out
        </Button>
      </div>
    </aside>
  );
}
