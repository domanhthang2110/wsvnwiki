// app/classes/page.tsx
// This is a Server Component, so it uses the 'server' client.

import { ClassItem } from '@/types/classes';
import { getClassesWithSkills } from '@/lib/data/classes'; // Import data fetching function
import ClassList from './ClassList';

export default async function ClassesPage() {
  const classes = await getClassesWithSkills();

  return (
    <main className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-white mb-12">
        Game Classes
      </h1>
      <ClassList classes={classes} />
    </main>
  );
}
