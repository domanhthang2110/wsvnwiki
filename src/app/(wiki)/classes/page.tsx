import React from 'react';
import ClassContent from '@/components/features/wiki/classes/ClassContent';
import { getClassesWithSkills } from '@/lib/data/classes';

export const dynamic = 'force-dynamic';

export default async function ClassesPage({
  params: _params,
  searchParams,
}: {
  params: Promise<object>;
  searchParams: Promise<{ class?: string }>;
}) {
  const { class: classSlug } = await searchParams;
  const [classes] = await Promise.all([getClassesWithSkills()]);

  return (
    <>
      <ClassContent classes={classes} initialClassSlug={classSlug} />
    </>
  );
}
