import { TalentItem } from '@/types/talents';

export function formatFullTalentDescription(talent: TalentItem): string {
  if (!talent.description) {
    return "No description template provided.";
  }
  
  if (!talent.parameters_definition || talent.parameters_definition.length === 0 || 
      !talent.level_values || talent.level_values.length === 0 || 
      typeof talent.max_level !== 'number' || talent.max_level < 1) {
    return talent.description;
  }
  
  let formattedDesc = talent.description;
  talent.parameters_definition.forEach(paramDef => {
    const placeholder = `{${paramDef.key}}`;
    if (formattedDesc.includes(placeholder)) {
      const levelSpecificValues: string[] = [];
      for (let i = 1; i <= talent.max_level!; i++) {
        const levelData = talent.level_values?.find(lv => lv.level === i);
        const value = levelData && levelData[paramDef.key] !== undefined 
                      ? String(levelData[paramDef.key]) 
                      : '?';
        levelSpecificValues.push(value);
      }
      formattedDesc = formattedDesc.replace(new RegExp(`\\{${paramDef.key}\\}`, 'g'), levelSpecificValues.join(' / '));
    }
  });
  
  return formattedDesc;
}

export const formatKnowledgeCost = (knowledgeCost: Record<number, number> | undefined | null): string => {
  if (!knowledgeCost || Object.keys(knowledgeCost).length === 0) return 'None';
  
  return Object.entries(knowledgeCost)
    .map(([level, cost]) => `L${level}: ${cost}`)
    .join(', ');
};
