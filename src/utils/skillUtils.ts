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
      formattedDesc = formattedDesc.replace(new RegExp(`\\{${paramDef.key}\\}%?`, 'g'), (match) => {
        const hasPercent = match.endsWith('%');
        return `<span style="color: #9dee05">${levelSpecificValues.join(' / ')}${hasPercent ? '%' : ''}</span>`;
      });
    }
  });
  
  return formattedDesc;
}
export function formatSkillDescriptionForLevel(skill: SkillItem, level: number): string {
  if (!skill.description) {
    return "No description template provided.";
  }

  if (!skill.parameters_definition || skill.parameters_definition.length === 0 ||
      !skill.level_values || skill.level_values.length === 0) {
    return skill.description;
  }

  let formattedDesc = skill.description;
  const levelData = skill.level_values.find(lv => lv.level === level);

  if (!levelData) {
    return formattedDesc; // or some other fallback
  }

  skill.parameters_definition.forEach(paramDef => {
    const placeholder = `{${paramDef.key}}`;
    if (formattedDesc.includes(placeholder)) {
      const value = levelData[paramDef.key] !== undefined
                    ? String(levelData[paramDef.key])
                    : '?';
      formattedDesc = formattedDesc.replace(new RegExp(`\\{${paramDef.key}\\}%?`, 'g'), (match) => {
        const hasPercent = match.endsWith('%');
        return `<span style="color: #9dee05">${value}${hasPercent ? '%' : ''}</span>`;
      });
    }
  });

  return formattedDesc;
}
export const formatEnergyCostForLevel = (skill: SkillItem, level: number): string => {
  if (!skill.energy_cost) {
    return 'N/A';
  }

  const energyCost = (skill.energy_cost as Record<number, number>)[level];
  return energyCost ? String(energyCost) : 'N/A';
};

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
  return range === 1 ? 'Cận chiến' : `${range} ô`;
};

export const formatReducedEnergyRegenForLevel = (skill: SkillItem, level: number): string => {
  if (!skill.reduced_energy_regen) {
    return 'N/A';
  }

  const reducedEnergyRegen = (skill.reduced_energy_regen as Record<number, number>)[level];
  return reducedEnergyRegen ? String(reducedEnergyRegen) : 'N/A';
};
