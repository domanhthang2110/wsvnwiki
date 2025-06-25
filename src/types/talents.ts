import { Database } from './database.types';

// Base type from Supabase auto-generation
export type TalentRow = Database['public']['Tables']['talents']['Row'];
export type TalentTreeRow = Database['public']['Tables']['talent_trees']['Row'];
export type Json = Database['public']['Tables']['talents']['Row']['parameters_definition']; // Re-export Json type for convenience

// Specific types for JSONB columns
export interface TalentParameterDefinitionInForm {
  id: string; // Used for client-side form management (e.g., unique key for React lists)
  key: string;
}

export interface TalentParameterDefinitionStored {
  key: string;
}

export interface TalentLevelValue {
  level: number;
  [key: string]: any; // Dynamic keys for parameter values
}

// Define the specific types for the JSONB columns
type TalentParametersDefinition = TalentParameterDefinitionStored[];
type TalentLevelValues = TalentLevelValue[];

// Extended interface for Talent item, picking fields from TalentRow and overriding JSONB
export interface TalentItem extends Omit<TalentRow, 'parameters_definition' | 'level_values'> {
  parameters_definition: TalentParametersDefinition | null;
  level_values: TalentLevelValues | null;
  cost_levels: number | null;
  knowledge_levels: number | null;
}

// For the form data submission
export type TalentFormData = Omit<TalentItem, 'id' | 'created_at'> & {
  parameters_definition?: TalentParameterDefinitionInForm[] | null;
  level_values?: TalentLevelValue[] | null;
};

export const TALENT_TYPE_OPTIONS: Array<NonNullable<TalentItem['type']>> = ["normal", "key", "composite"];

// Talent Tree Types
export interface TalentNode {
  id: string;
  talent_id: number;
  x: number;
  y: number;
  icon_url?: string | null;
  node_type: 'normal' | 'composite' | 'composite_sub';
  group_id?: string | null;
  is_group_main?: boolean;
  width?: number;
  isToolbarItem?: boolean;
}

export interface TalentEdge {
  id: string;
  source: string;
  target: string;
}

export interface TalentTreeData {
  nodes: TalentNode[];
  edges: TalentEdge[];
}

export interface TalentTreeItem extends Omit<TalentTreeRow, 'talents_data'> {
  talents_data: TalentTreeData | null;
}

export type TalentTreeFormData = Omit<TalentTreeItem, 'id' | 'created_at'> & {
  talents_data?: TalentTreeData | null;
};
