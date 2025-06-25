'use client';

import TalentTreeEditor from '@/components/features/admin/talents/TalentTreeEditor';
import React from 'react';

export default function AdminTalentTreesPage() {
  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
        Manage Talent Trees
      </h1>
      <TalentTreeEditor />
    </>
  );
}
