'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Home, Swords, Book, ScrollText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/classes', label: 'Classes', icon: Swords },
  { href: '/guides', label: 'Guides', icon: ScrollText },
  { href: '/lore', label: 'Lore', icon: Book },
];

export function WikiSidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar sticky top-0 shadow-lg flex flex-col border-r border-sidebar-border",
        "transition-[width] duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "absolute z-50 -right-3 top-6 bg-background border border-border rounded-full p-1 shadow-md hover:bg-accent",
          "transition-all duration-300 ease-in-out"
        )}
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <ChevronRight className={cn(
          "h-4 w-4 transition-transform duration-300 ease-in-out",
          isExpanded ? "rotate-180" : "rotate-0"
        )} />
      </button>

      {/* Header */}
      <div className="h-16 border-b border-sidebar-border flex items-center px-4">
        <Menu className="h-6 w-6 shrink-0 text-muted-foreground" />
        <div className={cn(
          "ml-3 transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "w-40 opacity-100" : "w-0 opacity-0"
        )}>
          <div className="whitespace-nowrap">
            <span className="font-semibold">Warspear</span>
            <span className="text-muted-foreground ml-1">Wiki</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center rounded-md h-10 px-4",
                  pathname === href ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <div className={cn(
                  "ml-3 transition-all duration-300 ease-in-out overflow-hidden",
                  isExpanded ? "w-40 opacity-100" : "w-0 opacity-0"
                )}>
                  <span className="whitespace-nowrap">{label}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
