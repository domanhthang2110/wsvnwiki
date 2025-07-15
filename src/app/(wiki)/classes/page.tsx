import React from 'react';
import ClassContent from '@/components/features/wiki/classes/ClassContent';
import { getClassesWithSkills } from '@/lib/data/classes';

export const dynamic = 'force-dynamic';

export default async function ClassesPage() {
  console.log('ClassesPage server component rendering at runtime...'); // New log for runtime
  console.log('ClassesPage server component rendering during build...'); // Added log
  const classes = await getClassesWithSkills();
  console.log('getClassesWithSkills completed. Classes data:', JSON.stringify(classes?.length, null, 2));


  return (
    <>
      <ClassContent classes={classes} />
    </>
  );
}
