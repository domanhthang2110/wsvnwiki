import { createClient } from '@/lib/supabase/server';
import type { ClassItem, ClassRow } from '@/types/classes';
import type { SkillItem, SkillRow } from '@/types/skills';

// Function to fetch all classes with their associated skills
export async function getClassesWithSkills(): Promise<ClassItem[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('classes')
    .select(`
      *,
      skills:class_skills(
        skill:skills(*)
      ),
      talent_tree:talent_trees(*)
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching classes:', error.message);
    return [];
  }

  // Transform the data to match our ClassItem type
  const transformedData = data.map(cls => {
    const talent_tree = Array.isArray(cls.talent_tree) ? cls.talent_tree[0] : cls.talent_tree;
    if (talent_tree && talent_tree.talents_data) {
      talent_tree.talents_data = talent_tree.talents_data.map((td: any) => ({ ...td, talent_id: td.talent_id || null }))
    }
    return {
      ...cls,
      skills: cls.skills?.map((s: { skill: SkillRow }) => s.skill as SkillItem) || [],
      talent_tree: talent_tree || null
    }
  });

  return transformedData as ClassItem[];
}

// Function to fetch a single class by ID (if needed for a detail page)
export async function getClassById(id: number): Promise<ClassItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('classes')
    .select(`
      *,
      skills:class_skills(
        skill:skills(*)
      ),
      talent_tree:talent_trees(*)
    `)
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error(`Error fetching class by ID "${id}":`, error);
    return null;
  }
  if (!data) return null;

  const talent_tree = Array.isArray(data.talent_tree) ? data.talent_tree[0] : data.talent_tree;
  if (talent_tree && talent_tree.talents_data) {
    talent_tree.talents_data = talent_tree.talents_data.map((td: any) => ({ ...td, talent_id: td.talent_id || null }))
  }
  return {
    ...data,
    skills: data.skills?.map((s: { skill: SkillRow }) => s.skill as SkillItem) || [],
    talent_tree: talent_tree || null
  } as ClassItem;
}

// Function to get all class IDs for static generation (if you have individual class pages)
export async function getAllClassIds(): Promise<{ id: number }[]> {
  const supabase = await createClient();
  try {
    const { data: classes } = await supabase
      .from('classes')
      .select('id');

    return classes?.map((cls) => ({ id: cls.id })) || [];
  } catch (e) {
    console.error("Error getting all class IDs:", e);
    return [];
  }
}
