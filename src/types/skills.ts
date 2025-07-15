import { Database } from './database.types';
import { Item } from './items';

// Base type from Supabase auto-generation
export type SkillRow = Database['public']['Tables']['skills']['Row'];
export type Json = Database['public']['Tables']['skills']['Row']['energy_cost']; // Re-export Json type for convenience

// Specific types for JSONB columns
export interface SkillParameterDefinitionInForm {
  id: string; // Used for client-side form management (e.g., unique key for React lists)
  key: string;
}

export interface SkillParameterDefinitionStored {
  key: string;
}

export interface SkillLevelValue {
  level: number;
  [key: string]: any; // Dynamic keys for parameter values
}

// Define the specific types for the JSONB columns
type SkillEnergyCost = Record<number, number>;
type SkillParametersDefinition = SkillParameterDefinitionStored[];
type SkillLevelValues = SkillLevelValue[];

// Extended interface for Skill item, picking fields from SkillRow and overriding JSONB
export interface SkillItem extends Omit<SkillRow, 'energy_cost' | 'parameters_definition' | 'level_values'> {
  energy_cost: SkillEnergyCost | null;
  parameters_definition: SkillParametersDefinition | null;
  level_values: SkillLevelValues | null;
  items?: Item[];
  className?: string | null;
  classIconUrl?: string | null; // Add classIconUrl property
}

// For the form data submission
export type SkillFormData = Omit<SkillItem, 'id' | 'created_at'> & {
  energy_cost?: SkillEnergyCost | null;
  parameters_definition?: SkillParameterDefinitionInForm[] | null;
  level_values?: SkillLevelValue[] | null;
};

export const MAX_SKILL_LEVEL_OPTIONS = [1, 2, 3, 4, 5];
export const SKILL_TIER_OPTIONS: Array<NonNullable<SkillItem['skill_type']>> = ["Basic", "Expert", "Equipment", "Race"];
export const ACTIVATION_TYPE_OPTIONS: Array<NonNullable<SkillItem['activation_type']>> = ["Active", "Passive", "Permanent"];
