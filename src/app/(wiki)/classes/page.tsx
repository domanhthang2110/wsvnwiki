import React from 'react';
import ClassContent from '@/components/features/wiki/classes/ClassContent';
import { getClassesWithSkills } from '@/lib/data/classes';

export const dynamic = 'force-dynamic';

interface ClassesPageProps {
  searchParams: {
    class?: string;
  };
}

export default async function ClassesPage({ searchParams }: ClassesPageProps) {
  const { class: classSlug } = await searchParams;
  const [classes] = await Promise.all([getClassesWithSkills()]);

  return (
    <>
      <ClassContent classes={classes} initialClassSlug={classSlug} />
    </>
  );
}
