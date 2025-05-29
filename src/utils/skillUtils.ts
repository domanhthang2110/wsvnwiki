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
