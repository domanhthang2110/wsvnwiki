import { SkillItem } from '@/types/skills';

export function formatFullSkillDescription(skill: SkillItem): string {
  if (!skill.description) {
    return "No description template provided.";
  }
  
  if (!skill.parameters_definition || skill.parameters_definition.length === 0 || 
      !skill.level_values || skill.level_values.length === 0 || 
      typeof skill.max_level !== 'number' || skill.max_level < 1) {
    return skill.description;
  }
  
  let formattedDesc = skill.description;
  skill.parameters_definition.forEach(paramDef => {
    const placeholder = `{${paramDef.key}}`;
    if (formattedDesc.includes(placeholder)) {
      const levelSpecificValues: string[] = [];
      for (let i = 1; i <= skill.max_level!; i++) {
        const levelData = skill.level_values?.find(lv => lv.level === i);
        const value = levelData && levelData[paramDef.key] !== undefined 
                      ? String(levelData[paramDef.key]) 
                      : '?';
        levelSpecificValues.push(value);
      }
      formattedDesc = formattedDesc.replace(new RegExp(`\\{${paramDef.key}\\}`, 'g'), levelSpecificValues.join('/'));
    }
  });
  
  return formattedDesc;
}

export const formatEnergyCost = (energyCost: Record<number, number> | undefined | null): string => {
  if (!energyCost || Object.keys(energyCost).length === 0) return 'None';
  
  // This provides a generic display. You could enhance this if you have a way
  // to map the numeric keys to resource names (e.g., using parameters_definition).
  return Object.values(energyCost)
    .map(value => String(value))
    .join(' / ');
};

/**
 * Formats the skill's range for display.
 */
export const formatRange = (range: number | undefined | null): string => {
  if (range === undefined || range === null) return 'N/A';
  return range === 1 ? 'Melee' : `${range}m`;
};
