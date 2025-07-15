import React from 'react';
import ClassContent from '@/components/features/wiki/classes/ClassContent';
import { getClassesWithSkills } from '@/lib/data/classes';

export const dynamic = 'force-static';

export default async function ClassesPage() {
  const [classes] = await Promise.all([
    getClassesWithSkills(),
  ]);


  return (
    <>
      <ClassContent classes={classes} />
    </>
  );
}
