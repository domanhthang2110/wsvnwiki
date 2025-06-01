// app/classes/page.tsx
// This is a Server Component, so it uses the 'server' client.

import { createClient } from '@/lib/supabaseServer'; // <-- This import will now work!
import { ClassItem } from '@/types/classes';
import ClassList from './ClassList';
async function fetchClassesWithSkills(): Promise<ClassItem[]> {
  const supabase = await createClient(); // This now correctly creates a server-side client
  
  const { data, error } = await supabase
    .from('classes')
    .select(`
      *,
      skills (*)
    `);

  if (error) {
    console.error('Error fetching classes:', error.message);
    return [];
  }
  return data as ClassItem[];
}

export default async function ClassesPage() {
  const classes = await fetchClassesWithSkills();

  return (
    <main className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-white mb-12">
        Game Classes
      </h1>
      <ClassList classes={classes} />
    </main>
  );
}