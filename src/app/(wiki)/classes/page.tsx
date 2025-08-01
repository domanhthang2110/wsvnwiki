import React, { Suspense } from 'react';
import ClassContent from '@/components/features/wiki/classes/ClassContent';
import { getClassesWithSkills } from '@/lib/data/classes';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

export default async function ClassesPage() {
  const [classes] = await Promise.all([getClassesWithSkills()]);

  return (
    <Suspense fallback={<LoadingOverlay />}>
      <ClassContent classes={classes} />
    </Suspense>
  );
}
