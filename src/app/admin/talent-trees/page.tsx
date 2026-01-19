'use client';

import TalentTreeEditorV3 from '@/components/features/admin/talents/v3/TalentTreeEditorV3';
import React from 'react';

export default function AdminTalentTreesPage() {
  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">
        Manage Talent Trees (V3)
      </h1>
      <TalentTreeEditorV3 />
    </>
  );
}
