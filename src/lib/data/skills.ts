import { createClient } from '@/lib/supabase/server';
import type { SkillItem, SkillRow } from '@/types/skills';

// Function to fetch all skills
export async function getSkills(): Promise<SkillItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
  return data as SkillItem[];
}

// Function to fetch a single skill by ID (if needed)
export async function getSkillById(id: number): Promise<SkillItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error(`Error fetching skill by ID "${id}":`, error);
    return null;
  }
  if (!data) return null;
  return data as SkillItem;
}

// Function to get all skill IDs for static generation (if you have individual skill pages)
export async function getAllSkillIds(): Promise<{ id: number }[]> {
  const supabase = await createClient();
  try {
    const { data: skills } = await supabase
      .from('skills')
      .select('id');

    return skills?.map((skill) => ({ id: skill.id })) || [];
  } catch (e) {
    console.error("Error getting all skill IDs:", e);
    return [];
  }
}
