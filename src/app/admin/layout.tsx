'use client';

import { AdminSidebar } from '@/components/features/admin/layout/AdminSidebar';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar onToggleCollapse={setIsSidebarCollapsed} />
      <main className="flex-1 relative transition-all duration-300">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
