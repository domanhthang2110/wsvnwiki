'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // To highlight the active link

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/classes', label: 'Classes' },
  { href: '/admin/skills', label: 'Skills' },
  { href: '/admin/guides', label: 'Guides' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/others', label: 'Others' },
  { href: '/admin/tags', label: 'Tags' },
  { href: '/admin/settings', label: 'Site Settings' }, // Assuming you'll create a page for this
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 bg-gray-800 p-4 h-screen sticky top-0 shadow-lg">
      <div className="mb-8 text-center">
        <Link href="/admin" className="text-2xl font-bold text-blue-400 hover:text-blue-500">
          Wiki Admin
        </Link>
      </div>
      <nav>
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
    </aside>
  );
}