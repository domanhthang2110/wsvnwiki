import { AdminSidebar } from '@/components/admin/AdminSidebar'; // Adjust path if your components folder is different
import { ThemeToggleButton } from '@/components/ThemeToggleButton'; // Assuming your toggle button is in src/components/

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto relative">
        {/* Position toggle button within the main content area if desired, or keep in sidebar */}
        <div className="absolute top-6 right-6 z-50">
             <ThemeToggleButton />
        </div>
        {children}
      </main>
    </div>
  );
}