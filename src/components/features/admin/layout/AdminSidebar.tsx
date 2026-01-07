'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Users,
  Zap,
  Package,
  Star,
  GitBranch,
  FileText,
  Image,
  Tag,
  Calendar,
  LogOut,
  ExternalLink
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/classes', label: 'Classes', icon: Users },
  { href: '/admin/skills', label: 'Skills', icon: Zap },
  { href: '/admin/items', label: 'Items', icon: Package },
  { href: '/admin/talents', label: 'Talents', icon: Star },
  { href: '/admin/talent-trees', label: 'Talent Trees', icon: GitBranch },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
  { href: '/admin/media', label: 'Media', icon: Image },
  { href: '/admin/tags', label: 'Tags', icon: Tag },
  { href: '/admin/weekly-schedules', label: 'Weekly Schedules', icon: Calendar }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<{ label: string; top: number } | null>(null);
  const asideRef = useRef<HTMLElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const handleMouseEnter = (label: string, e: React.MouseEvent<HTMLElement>) => {
    if (!asideRef.current) return;
    const itemRect = e.currentTarget.getBoundingClientRect();
    const asideRect = asideRef.current.getBoundingClientRect();
    // Calculate top relative to aside, centered on the item
    const top = itemRect.top - asideRect.top + (itemRect.height / 2);
    setHoveredItem({ label, top });
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  return (
    <aside ref={asideRef} className="flex-shrink-0 bg-gray-900 border-r border-gray-800 w-16 h-screen sticky top-0 flex flex-col z-50">
      <div className="h-16 flex items-center justify-center border-b border-gray-800 mb-2">
        <Link href="/admin" className="text-blue-500 hover:text-blue-400 transition-colors" title="Wiki Admin">
          <LayoutDashboard className="w-6 h-6" />
        </Link>
      </div>

      <nav className="flex-grow overflow-y-auto overflow-x-hidden py-2 custom-scrollbar">
        <ul className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <li
                key={item.href}
                className="relative"
                onMouseEnter={(e) => handleMouseEnter(item.label, e)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={item.href}
                  className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto p-2 border-t border-gray-800 flex flex-col gap-1">
        <div
          className="relative"
          onMouseEnter={(e) => handleMouseEnter('Return to Wiki', e)}
          onMouseLeave={handleMouseLeave}
        >
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-12 h-12 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
          </Link>
        </div>

        <div
          className="relative"
          onMouseEnter={(e) => handleMouseEnter('Log Out', e)}
          onMouseLeave={handleMouseLeave}
        >
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-12 h-12 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Render Tooltip Portal-style (but relative to aside) */}
      {hoveredItem && (
        <div
          className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs font-medium rounded border border-gray-700 shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in slide-in-from-left-1 duration-200"
          style={{ top: hoveredItem.top, transform: 'translateY(-50%)' }}
        >
          {hoveredItem.label}
          {/* Arrow */}
          <div className="absolute top-1/2 right-full -translate-y-1/2 -mr-[1px] border-4 border-transparent border-r-gray-700"></div>
        </div>
      )}
    </aside>
  );
}
