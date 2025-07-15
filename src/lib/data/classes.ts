import { createClient } from '@/lib/supabase/server';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ClassItem, ClassRow } from '@/types/classes';
import type { SkillItem, SkillRow } from '@/types/skills';
import type { TalentNode } from '@/types/talents';
import type { Item } from '@/types/items';
import { CacheManager } from '@/utils/cache';
// import { CLASSES_DATA } from './classesData'; // Removed as it's unused

interface SkillWithItemsQuery extends SkillRow {
  items?: { item: Item }[];
}

// Function to fetch all classes with their associated skills
export async function getClassesWithSkills(): Promise<ClassItem[]> {
  // const cacheKey = 'classes-with-skills';
  // const cachedData = CacheManager.get<ClassItem[]>(
  //   'classes',
  //   cacheKey,
  // );
  // if (cachedData) {
  //   return cachedData;
  // }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('classes')
    .select(`
      *,
      skills:class_skills(
        skill:skills(
          id, name, icon_url, description, activation_type, skill_type, cooldown, range, level_values, parameters_definition, max_level, energy_cost, reduced_energy_regen,
          items:skill_items(
            item:items(id, name, icon_url, description)
          )
        )
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
    if (talent_tree && talent_tree.talents_data && talent_tree.talents_data.nodes) {
      talent_tree.talents_data.nodes = talent_tree.talents_data.nodes.map((td: TalentNode) => ({ ...td, talent_id: td.talent_id || null }))
    }
    
    const image_assets = {
      ...(cls.image_assets as object),
      banner: `/image/classes/${cls.name.toLowerCase().replace(' ', '-')}/banner.gif`,
    };

    return {
      ...cls,
      image_assets,
      skills: cls.skills?.map((s: { skill: SkillWithItemsQuery }) => {
        const skillWithItems = {
          ...s.skill,
          items: s.skill.items?.map((i: { item: Item }) => i.item) || [],
        };
        return skillWithItems as SkillItem;
      }) || [],
      talent_tree: talent_tree || null
    }
  });

  // CacheManager.set('classes', cacheKey, transformedData);
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
  if (talent_tree && talent_tree.talents_data && talent_tree.talents_data.nodes) {
    talent_tree.talents_data.nodes = talent_tree.talents_data.nodes.map((td: TalentNode) => ({ ...td, talent_id: td.talent_id || null }))
  }
  return {
    ...data,
    skills: data.skills?.map((s: { skill: SkillRow }) => s.skill as SkillItem) || [],
    talent_tree: talent_tree || null
  } as ClassItem;
}

// Function to get all class IDs for static generation (if you have individual class pages)
export async function getAllClassIds(): Promise<{ id: number }[]> {
  try {
    const supabase = await createClient();
    const { data: classes } = await supabase
      .from('classes')
      .select('id');

    return classes?.map((cls) => ({ id: cls.id })) || [];
  } catch (e) {
    console.error("Error getting all class IDs:", e);
    return [];
  }
}
