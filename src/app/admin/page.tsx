'use client';

import ClassInfoQuery from '@/components/shared/ClassInfoQuery';

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Admin Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Welcome to the admin portal. Select an option from the menu to manage your wiki content.</p>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Classes Info Query</h2>
        <ClassInfoQuery />
      </div>
    </div>
  );
}