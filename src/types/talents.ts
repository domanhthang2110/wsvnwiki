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
  [key: string]: unknown; // Dynamic keys for parameter values
}

// Define the specific types for the JSONB columns
type TalentParametersDefinition = TalentParameterDefinitionStored[];
type TalentLevelValues = TalentLevelValue[];

// Extended interface for Talent item, picking fields from TalentRow and overriding JSONB
// Define the specific types for the JSONB columns
type TalentKnowledgeCost = Record<number, number>;

// Extended interface for Talent item, picking fields from TalentRow and overriding JSONB
export interface TalentItem extends Omit<TalentRow, 'parameters_definition' | 'level_values' | 'knowledge_levels'> {
  parameters_definition: TalentParametersDefinition | null;
  level_values: TalentLevelValues | null;
  knowledge_levels: TalentKnowledgeCost | null;
}

// For the form data submission
export type TalentFormData = Omit<TalentItem, 'id' | 'created_at'> & {
  parameters_definition?: TalentParameterDefinitionInForm[] | null;
  level_values?: TalentLevelValue[] | null;
  knowledge_levels?: TalentKnowledgeCost | null;
};


// Talent Tree Types
export interface TalentNode {
  id: string;
  talent_id: number;
  x: number;
  y: number;
  icon_url?: string | null;
  node_type: 'normal' | 'key' | 'lesser' | 'composite' | 'composite_sub' | 'free_composite'; // Added 'key' and 'lesser'
  group_id?: string | null;
  is_group_main?: boolean;
  width?: number;
  isToolbarItem?: boolean;
  talent?: {
    icon_url?: string | null;
  };
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
