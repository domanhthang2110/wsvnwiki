'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // To highlight the active link
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

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <aside className="w-60 flex-shrink-0 bg-gray-800 p-4 h-screen sticky top-0 shadow-lg flex flex-col">
      <div className="mb-8 text-center">
        <Link href="/admin" className="text-2xl font-bold text-blue-400 hover:text-blue-500">
          Wiki Admin
        </Link>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.href} className="mb-2">
              <Link
                href={item.href}
                className={`block py-2.5 px-4 rounded-lg text-sm font-medium transition-colors
                  ${
                    pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-700">
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
