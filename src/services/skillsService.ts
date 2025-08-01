import { supabase } from '../lib/supabase/client';
import type { Item } from '../types/items';
import type { SkillItem } from '../types/skills';
import { validateSkill } from '../utils/validation';
import { RetryManager } from '../utils/retry';

// const CACHE_NAMESPACE = 'skills'; // No longer needed
// const CACHE_TTL = 1000 * 60 * 5; // No longer needed

export class SkillsService {
  /**
   * Fetch all skills ordered by name with caching
   */
  static async getSkillList(): Promise<Pick<SkillItem, 'id' | 'name' | 'icon_url'>[]> {
    console.log('Fetching skill list');
    return await RetryManager.retry(async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('id, name, icon_url')
        .order('name');

      if (error) {
        console.error('Error fetching skill list:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned when fetching skill list');
      }

      return data;
    });
  }

  static async getSkillById(id: number): Promise<SkillItem> {
    console.log('Fetching skill by id', id);
    return await RetryManager.retry(async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*, items:skill_items(items(*))')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching skill by id:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned when fetching skill by id');
      }

      // We need to flatten the items array
      const skillData = { ...data, items: data.items.map((i: { items: Item }) => i.items) };

      return skillData as SkillItem;
    });
  }

  /**
   * Fetch all skills ordered by name with caching
   */
  static async getAllSkills(): Promise<SkillItem[]> {
    console.log('Fetching all skills');
    return await RetryManager.retry(async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*, items:skill_items(items(*))')
        .order('name');

      if (error) {
        console.error('Error fetching skills:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned when fetching skills');
      }
      
      // We need to flatten the items array
      const skillsData = data.map(d => ({ ...d, items: d.items.map((i: { items: Item }) => i.items) }));

      return skillsData as SkillItem[];
    });
  }

  /**
   * Create a new skill with validation
   */
  static async createSkill(skillData: Omit<SkillItem, 'id' | 'created_at'>): Promise<SkillItem> {
    const validation = validateSkill(skillData as SkillItem);
    if (!validation.isValid) {
      throw new Error('Invalid skill data: ' + validation.errors.join(', '));
    }

    console.log('Creating new skill:', skillData.name);
    return await RetryManager.retry(async () => {
      const { data, error } = await supabase
        .from('skills')
        .insert([skillData])
        .select()
        .single();

      if (error || !data) {
        console.error('Error creating skill:', error);
        throw new Error('Failed to create skill: ' + (error?.message || 'No data returned'));
      }

      return data;
    });
  }

  /**
   * Update an existing skill with validation
   */
  static async updateSkill(id: number, skillData: Partial<SkillItem>): Promise<SkillItem> {
    const validation = validateSkill(skillData);
    if (!validation.isValid) {
      throw new Error('Invalid skill data: ' + validation.errors.join(', '));
    }

    console.log('Updating skill:', id);
    return await RetryManager.retry(async () => {
      const { data, error } = await supabase
        .from('skills')
        .update(skillData)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        console.error('Error updating skill:', error);
        throw new Error('Failed to update skill: ' + (error?.message || 'No data returned'));
      }

      return data;
    });
  }

  /**
   * Delete a skill by ID
   */
  static async deleteSkill(id: number): Promise<void> {
    console.log('Deleting skill:', id);
    return await RetryManager.retry(async () => {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting skill:', error);
        throw new Error('Failed to delete skill: ' + error.message);
      }
    });
  }
}
