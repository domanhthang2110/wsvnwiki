import { Database } from './database.types';
import { SkillItem } from './skills';
import { TalentTreeItem } from './talents';
import type { Faction, Side } from '@/lib/data/classesData';

// Define the structure for the image_assets JSON object
export interface ClassImageAssets {
  logo?: string;    // For the class logo (previously avatar_url)
  avatar?: string;  // For the new class avatar
  banner?: string;  // For the class banner
  // Allows for other dynamic keys, useful for future-proofing
  [key: string]: string | undefined;
}

// Base type from Supabase auto-generation
// ClassRow now implicitly includes: image_assets: Json | null;
export type ClassRow = Database['public']['Tables']['classes']['Row'];

// Extended interface for joined data or specific application needs
// We Omit the generic 'image_assets: Json | null' from ClassRow
// and replace it with our specific 'image_assets: ClassImageAssets | null'
export interface ClassItem extends Omit<ClassRow, 'image_assets'> {
  image_assets: ClassImageAssets | null;
  skills?: SkillItem[];
  talent_tree?: TalentTreeItem | null;
  faction: Faction;
  side: Side;
}

// For the form data submission
// Omit auto-generated fields, fields populated by joins, and the image_assets object itself
// We'll handle individual URL fields in the form and assemble the image_assets object upon submission.
// For the form data submission
// We need to explicitly make image_assets optional here, as ClassItem makes it non-optional.
export type ClassFormData = Omit<ClassItem, 'id' | 'created_at' | 'skills' | 'faction' | 'side' | 'image_assets'> & {
  name: string;
  description?: string | null;
  lore?: string | null;
  // Individual fields for the form to handle image URLs
  logo_url?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  // The assembled image_assets object will also be part of the form data for submission
  image_assets?: ClassImageAssets | null;
};
