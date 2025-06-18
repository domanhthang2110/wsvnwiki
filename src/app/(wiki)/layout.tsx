import { WikiSidebar } from '@/components/features/wiki/layout/WikiSidebar';

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <WikiSidebar />
      <main className="flex-1 h-full">
        {children}
      </main>
    </div>
  );
}
