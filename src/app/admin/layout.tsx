'use client';

import { AdminSidebar } from '@/components/features/admin/layout/AdminSidebar';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 relative">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
