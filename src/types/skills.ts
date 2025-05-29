export interface SkillParameterDefinitionInForm {
  id: string;
  key: string;
  label: string;
}

export interface SkillParameterDefinitionStored {
  key: string;
  label: string;
}

export interface SkillLevelValue {
  level: number;
  [key: string]: any;
}

export interface SkillItem {
  id: number;
  created_at: string;
  name?: string | null;
  icon_url?: string | null;
  skill_type?: string | null;
  activation_type?: string | null;
  max_level?: number | null;
  cooldown?: number | null;
  energy_cost?: number | null;
  range?: number | null;
  reduced_energy_regen?: number | null;
  description?: string | null;
  parameters_definition?: SkillParameterDefinitionStored[] | null;
  level_values?: SkillLevelValue[] | null;
}

export const MAX_SKILL_LEVEL_OPTIONS = [1, 2, 3, 4, 5];
export const SKILL_TIER_OPTIONS: Array<NonNullable<SkillItem['skill_type']>> = ["Basic", "Expert", "Equipment", "Race"];
export const ACTIVATION_TYPE_OPTIONS: Array<NonNullable<SkillItem['activation_type']>> = ["Active", "Passive"];
