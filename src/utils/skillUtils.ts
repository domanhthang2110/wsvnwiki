import { SkillItem } from '@/types/skills';

export function formatFullSkillDescription(skill: SkillItem, showPvp: boolean = true): string {
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
      const pveValues: string[] = [];
      const pvpValues: string[] = [];
      let hasDifferentPvp = false;

      for (let i = 1; i <= skill.max_level!; i++) {
        const levelData = skill.level_values?.find(lv => lv.level === i);

        let val = '?';
        let pvpVal = '?';

        if (levelData && levelData[paramDef.key] !== undefined) {
          val = String(levelData[paramDef.key]);
          const pvpKey = `${paramDef.key}_pvp`;
          const rawPvpVal = levelData[pvpKey];

          if (rawPvpVal !== undefined && rawPvpVal !== null) {
            pvpVal = String(rawPvpVal);
            if (paramDef.hasPvp || pvpVal !== val) {
              hasDifferentPvp = true;
            }
          } else if (paramDef.hasPvp) {
            // If hasPvp is true but no pvp value found (shouldn't happen with new form logic, but for safety),
            // assume pvpVal = val, but we still want to show it? 
            // Actually if rawPvpVal is missing, pvpVal defaults to val (line 39).
            // So if hasPvp is true, we flag it.
            pvpVal = val;
            hasDifferentPvp = true;
          } else {
            pvpVal = val;
          }
        }

        pveValues.push(val);
        pvpValues.push(pvpVal);
      }

      formattedDesc = formattedDesc.replace(new RegExp(`\\{${paramDef.key}\\}%?`, 'g'), (match) => {
        const hasPercent = match.endsWith('%');

        const joiner = '/';
        let pveStr = pveValues.join(joiner);
        let pvpStr = pvpValues.join(joiner);

        if (hasPercent) {
          pveStr += '%';
          pvpStr += '%';
        }

        if (hasDifferentPvp && showPvp) {
          return `<span style="color: #9dee05">${pveStr}</span> <span style="color: #ff9999;">(${pvpStr} <img src="/image/ui/pvp.webp" alt="PvP" style="width: 1em; height: 1em; display: inline; vertical-align: middle;" />)</span>`;
        } else {
          return `<span style="color: #9dee05">${pveStr}</span>`;
        }
      });
    }
  });

  return formattedDesc;
}

export function formatSkillDescriptionForLevel(skill: SkillItem, level: number, showPvp: boolean = true): string {
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
    return formattedDesc;
  }

  skill.parameters_definition.forEach(paramDef => {
    const placeholder = `{${paramDef.key}}`;
    if (formattedDesc.includes(placeholder)) {

      formattedDesc = formattedDesc.replace(new RegExp(`\\{${paramDef.key}\\}%?`, 'g'), (match) => {
        const hasPercent = match.endsWith('%');

        let pvePart = '';
        let pvpPart = '';

        if (levelData[paramDef.key] !== undefined) {
          const val = String(levelData[paramDef.key]);
          const pvpKey = `${paramDef.key}_pvp`;
          const pvpVal = levelData[pvpKey];

          // Build PVE part
          pvePart = hasPercent ? `${val}%` : val;

          // Check PvP
          if (paramDef.hasPvp || (pvpVal !== undefined && pvpVal !== null && String(pvpVal) !== val)) {
            const finalPvpVal = (pvpVal !== undefined && pvpVal !== null) ? String(pvpVal) : val;
            if ((finalPvpVal !== val || paramDef.hasPvp) && showPvp) {
              const pvpDisplayVal = hasPercent ? `${finalPvpVal}%` : finalPvpVal;
              pvpPart = ` <span style="color: #ff9999;">(${pvpDisplayVal} <img src="/image/ui/pvp.webp" alt="PvP" style="width: 1em; height: 1em; display: inline; vertical-align: middle;" />)</span>`;
            }
          }
        } else {
          pvePart = '?';
        }

        return `<span style="color: #9dee05">${pvePart}</span>${pvpPart}`;
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
