import { AdminSidebar } from '@/components/features/admin/layout/AdminSidebar';
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 relative">
        {children}
      </main>
    </div>
  );
}
