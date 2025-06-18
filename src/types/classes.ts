import { Database } from './database.types';
import { SkillItem } from './skills';
import type { Faction, Side } from '@/lib/data/factionMap'; // Import new types

// Base type from Supabase auto-generation
export type ClassRow = Database['public']['Tables']['classes']['Row'];

// Extended interface for joined data or specific application needs
export interface ClassItem extends ClassRow {
  skills?: SkillItem[]; // For displaying joined skills
  faction: Faction; // Added
  side: Side;     // Added
}

// For the form data submission
// Omit auto-generated fields and fields populated by joins
export type ClassFormData = Omit<ClassItem, 'id' | 'created_at' | 'skills' | 'faction' | 'side'> & {
  // If you have a many-to-many relationship for skills, you might add:
  // skill_ids?: number[];
};
