'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggleButton() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder or null to avoid rendering mismatch during SSR
    // You could return a styled button placeholder if you prefer
    return <button className="fixed top-4 right-4 z-50 p-2 rounded-md border opacity-0" aria-label="Toggle dark mode" disabled />;
  }

  // Use resolvedTheme if theme is 'system' to show the correct current icon
  const currentDisplayTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <button
      onClick={() => setTheme(currentDisplayTheme === 'dark' ? 'light' : 'dark')}
      className="fixed top-4 right-4 z-50 p-2 rounded-md border bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors shadow"
      aria-label="Toggle dark mode"
    >
      {currentDisplayTheme === 'dark' ? '🌞 Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}