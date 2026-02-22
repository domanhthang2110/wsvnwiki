'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Users,
  Zap,
  Package,
  Star,
  GitBranch,
  FileText,
  Image as ImageIcon,
  Tag,
  Calendar,
  LogOut,
  ExternalLink,
  Menu,
  ChevronLeft
} from 'lucide-react';

const navItems = [
  { href: '/admin/classes', label: 'Classes', icon: Users },
  { href: '/admin/skills', label: 'Skills', icon: Zap },
  { href: '/admin/items', label: 'Items', icon: Package },
  { href: '/admin/talents', label: 'Talents', icon: Star },
  { href: '/admin/talent-trees', label: 'Talent Trees', icon: GitBranch },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
  { href: '/admin/media', label: 'Media', icon: ImageIcon },
  { href: '/admin/tags', label: 'Tags', icon: Tag },
  { href: '/admin/weekly-schedules', label: 'Schedules', icon: Calendar }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<{ label: string; top: number } | null>(null);
  const asideRef = useRef<HTMLElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const handleMouseEnter = (label: string, e: React.MouseEvent<HTMLElement>) => {
    if (isExpanded || !asideRef.current) return;
    const itemRect = e.currentTarget.getBoundingClientRect();
    const asideRect = asideRef.current.getBoundingClientRect();
    const top = itemRect.top - asideRect.top + (itemRect.height / 2);
    setHoveredItem({ label, top });
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    setHoveredItem(null);
  };

  return (
    <aside
      ref={asideRef}
      className={`flex-shrink-0 bg-gray-900 border-r border-gray-800 h-screen sticky top-0 flex flex-col z-50 transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-16'}`}
    >
      <div className="h-16 flex items-center justify-between border-b border-gray-800 mb-2 px-3">
        <div className={`flex items-center overflow-hidden transition-all duration-300 ${isExpanded ? 'w-full opacity-100' : 'w-0 opacity-0'}`}>
          <span className="font-bold text-gray-100 whitespace-nowrap ml-2">Wiki Admin</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0 mx-auto"
          title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-grow overflow-y-auto overflow-x-hidden py-2 custom-scrollbar">
        <ul className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                  className={`flex items-center w-full h-10 rounded-lg transition-all duration-200 group
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                    }`}
                >
                  <div className="w-12 h-10 flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-5 h-5 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`} />
                  </div>
                  <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                    {item.label}
                  </span>
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
            className="flex items-center w-full h-10 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors group"
          >
            <div className="w-12 h-10 flex items-center justify-center flex-shrink-0">
              <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </div>
            <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
              Wiki Home
            </span>
          </Link>
        </div>

        <div
          className="relative"
          onMouseEnter={(e) => handleMouseEnter('Log Out', e)}
          onMouseLeave={handleMouseLeave}
        >
          <button
            onClick={handleLogout}
            className="flex items-center w-full h-10 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors group"
          >
            <div className="w-12 h-10 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </div>
            <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
              Log Out
            </span>
          </button>
        </div>
      </div>

      {!isExpanded && hoveredItem && (
        <div
          className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs font-medium rounded border border-gray-700 shadow-xl whitespace-nowrap z-50 pointer-events-none animate-in fade-in slide-in-from-left-1 duration-200"
          style={{ top: hoveredItem.top, transform: 'translateY(-50%)' }}
        >
          {hoveredItem.label}
          <div className="absolute top-1/2 right-full -translate-y-1/2 -mr-[1px] border-4 border-transparent border-r-gray-700"></div>
        </div>
      )}
    </aside>
  );
}
