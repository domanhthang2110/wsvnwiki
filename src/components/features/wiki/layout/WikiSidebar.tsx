'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Home, Swords, Book, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';
import AuthStatusButtons from '@/components/features/auth/AuthStatusButtons';

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
      {/* Header and Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-16 border-b border-sidebar-border flex items-center px-4 w-full justify-between cursor-pointer hover:bg-accent transition-colors duration-300 ease-in-out"
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <div className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "w-40 opacity-100" : "w-0 opacity-0"
        )}>
          <div className="whitespace-nowrap text-left">
            <span className="font-semibold text-foreground">Warspear</span>
            <span className="text-muted-foreground ml-1">Wiki</span>
          </div>
        </div>
        <Menu className="h-6 w-6 shrink-0 text-muted-foreground ml-auto" />
      </button>

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
      {/* Auth Status Buttons at the bottom */}
      <AuthStatusButtons />
    </aside>
  );
}
