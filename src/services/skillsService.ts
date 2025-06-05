import { supabase } from '../lib/supabase/client';
import type { SkillItem } from '../types/skills';
import { validateSkill } from '../utils/validation';
import { CacheManager } from '../utils/cache';
import { RetryManager } from '../utils/retry';

const CACHE_NAMESPACE = 'skills';
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export class SkillsService {
  /**
   * Fetch all skills ordered by name with caching
   */
  static async getAllSkills(): Promise<SkillItem[]> {
    const cacheKey = 'all-skills';
    const cached = CacheManager.get<SkillItem[]>(CACHE_NAMESPACE, cacheKey, { ttl: CACHE_TTL });
    if (cached) {
      console.log('Returning cached skills data');
      return cached;
    }

    console.log('Fetching all skills');
    return await RetryManager.retry(async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching skills:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned when fetching skills');
      }

      // Update cache
      CacheManager.set(CACHE_NAMESPACE, cacheKey, data);

      return data;
    });
  }

  /**
   * Create a new skill with validation
   */
  static async createSkill(skillData: Omit<SkillItem, 'id' | 'created_at'>): Promise<SkillItem> {
    const validation = validateSkill(skillData); // Assuming validateSkill is compatible with Omit<SkillItem, 'id' | 'created_at'>
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

      // Invalidate cache
      CacheManager.clear(CACHE_NAMESPACE);

      return data;
    });
  }

  /**
   * Update an existing skill with validation
   */
  static async updateSkill(id: number, skillData: Partial<SkillItem>): Promise<SkillItem> {
    const validation = validateSkill(skillData); // Assuming validateSkill is compatible with Partial<SkillItem>
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

      // Invalidate cache
      CacheManager.clear(CACHE_NAMESPACE);

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

      // Invalidate cache
      CacheManager.clear(CACHE_NAMESPACE);
    });
  }
}
