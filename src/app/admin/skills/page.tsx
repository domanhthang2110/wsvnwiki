'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';

// --- INTERFACES ---
interface SkillParameterDefinitionInForm {
  id: string; 
  key: string;
  label: string;
}

interface SkillParameterDefinitionStored {
  key: string;
  label: string;
}

interface SkillLevelValue {
  level: number;
  [key: string]: any; 
}

interface SkillItem {
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

const MAX_SKILL_LEVEL_OPTIONS = [1, 2, 3, 4, 5];
const SKILL_TIER_OPTIONS: Array<NonNullable<SkillItem['skill_type']>> = ["Basic", "Expert", "Equipment", "Race"];
const ACTIVATION_TYPE_OPTIONS: Array<NonNullable<SkillItem['activation_type']>> = ["Active", "Passive"];

// --- HELPER FUNCTION ---
function formatFullSkillDescription(skill: SkillItem): string {
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

// --- MAIN COMPONENT ---
export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formIconUrl, setFormIconUrl] = useState('');
  const [formSkillTier, setFormSkillTier] = useState<SkillItem['skill_type']>(SKILL_TIER_OPTIONS[0]);
  const [formActivationType, setFormActivationType] = useState<SkillItem['activation_type']>(ACTIVATION_TYPE_OPTIONS[0]);
  const [formMaxLevel, setFormMaxLevel] = useState<string>("1"); // Kept as string for <select> value
  const [formCooldown, setFormCooldown] = useState('');
  const [formEnergyCost, setFormEnergyCost] = useState('');
  const [formRange, setFormRange] = useState('');
  const [formReducedEnergyRegen, setFormReducedEnergyRegen] = useState('');
  const [formDescriptionTemplate, setFormDescriptionTemplate] = useState('');

  const [formParamDefs, setFormParamDefs] = useState<SkillParameterDefinitionInForm[]>([
    { id: crypto.randomUUID(), key: 'damage', label: 'Damage Value' },
  ]);
  const [formLevelValues, setFormLevelValues] = useState<SkillLevelValue[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const fetchSkills = useCallback(async () => { /* ... same as before ... */ 
    setListLoading(true);
    setListError(null);
    const { data, error: fetchError } = await supabase
      .from('skills')
      .select('*')
      .order('name', { ascending: true });
    if (fetchError) {
      setListError(fetchError.message);
      console.error("Error fetching skills:", fetchError.message);
    } else if (data) {
      setSkills(data as SkillItem[]);
    }
    setListLoading(false);
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  useEffect(() => { /* ... same as before ... */ 
    const currentMaxLevel = parseInt(formMaxLevel, 10);
    setFormLevelValues(prevLevels => {
      const newLevels: SkillLevelValue[] = [];
      for (let i = 1; i <= currentMaxLevel; i++) {
        const existingLevelData: SkillLevelValue | undefined = prevLevels.find(l => l.level === i);
        const levelEntry: SkillLevelValue = { level: i };
        formParamDefs.forEach(def => {
          const trimmedKey = def.key.trim();
          if (trimmedKey) {
            levelEntry[trimmedKey] = (existingLevelData && existingLevelData[trimmedKey] !== undefined)
              ? existingLevelData[trimmedKey]
              : '';
          }
        });
        newLevels.push(levelEntry);
      }
      return newLevels;
    });
  }, [formMaxLevel, formParamDefs]);

  const handleAddParamDef = () => { /* ... same as before ... */ 
     setFormParamDefs([...formParamDefs, { id: crypto.randomUUID(), key: '', label: '' }]);
  };
  const handleParamDefChange = (index: number, field: 'key' | 'label', value: string) => { /* ... same as before ... */
    const newParamDefs = [...formParamDefs];
    if (field === 'key') {
      value = value.replace(/\s+/g, '').replace(/[^a-zA-Z0-9_]/g, ''); 
    }
    newParamDefs[index][field] = value;
    setFormParamDefs(newParamDefs);
  };
  const handleRemoveParamDef = (idToRemove: string) => { /* ... same as before ... */ 
    const removedParamKey = formParamDefs.find(p => p.id === idToRemove)?.key.trim();
    setFormParamDefs(formParamDefs.filter(param => param.id !== idToRemove));
    if (removedParamKey) {
      setFormLevelValues(prevLevels =>
        prevLevels.map(level => {
          const { [removedParamKey]: _, ...restOfLevel } = level; 
          return restOfLevel as SkillLevelValue;
        })
      );
    }
  };
  const handleLevelValueChange = (levelNumber: number, paramKey: string, value: string) => { /* ... same as before ... */
    setFormLevelValues(prevLevels => {
      return prevLevels.map(level => {
        if (level.level === levelNumber) {
          return { ...level, [paramKey]: value };
        }
        return level;
      });
    });
  };
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => { /* ... same as before, ensure skillDataToInsert is correct ... */
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    const currentMaxLevel = parseInt(formMaxLevel, 10);

    if (!formName.trim()) { setFormError("Skill name is required."); setIsSubmitting(false); return; }
    if (currentMaxLevel < 1) { setFormError("Max level must be at least 1."); setIsSubmitting(false); return; }

    const finalParamDefs = formParamDefs
        .filter(p => p.key.trim() && p.label.trim())
        .map(({ id, key, label }) => ({ key: key.trim(), label }));

    const paramKeysFromDefs = new Set(finalParamDefs.map(p => p.key));
    if (finalParamDefs.some(p => !p.key)) {
        setFormError("All defined parameters must have a non-empty key.");
        setIsSubmitting(false);
        return;
    }
    if (paramKeysFromDefs.size !== finalParamDefs.length) {
        setFormError("Parameter keys must be unique.");
        setIsSubmitting(false);
        return;
    }
    
    const finalLevelValues = formLevelValues
        .filter(lv => lv.level <= currentMaxLevel)
        .map(lv => {
            const filteredLevel: SkillLevelValue = { level: lv.level };
            finalParamDefs.forEach(pd => {
                if (lv[pd.key] !== undefined) { 
                    filteredLevel[pd.key] = lv[pd.key];
                } else {
                    filteredLevel[pd.key] = ''; 
                }
            });
            return filteredLevel;
        });

    const skillDataToInsert: Omit<SkillItem, 'id' | 'created_at'> = {
      name: formName.trim() || null,
      icon_url: formIconUrl.trim() || null,
      skill_type: formSkillTier || null, 
      activation_type: formActivationType || null,
      max_level: currentMaxLevel || null,
      description: formDescriptionTemplate.trim() || null, 
      parameters_definition: finalParamDefs.length > 0 ? finalParamDefs : null,
      level_values: finalLevelValues.length > 0 ? finalLevelValues : null,
    };

    if (formActivationType === 'Active') {
      skillDataToInsert.cooldown = formCooldown.trim() ? parseInt(formCooldown, 10) : null;
      skillDataToInsert.energy_cost = formEnergyCost.trim() ? parseInt(formEnergyCost, 10) : null;
      skillDataToInsert.range = formRange.trim() ? parseInt(formRange, 10) : null;
      skillDataToInsert.reduced_energy_regen = formReducedEnergyRegen.trim() ? parseInt(formReducedEnergyRegen, 10) : null;
    } else {
        skillDataToInsert.cooldown = null;
        skillDataToInsert.energy_cost = null;
        skillDataToInsert.range = null;
        skillDataToInsert.reduced_energy_regen = null;
    }

    const { error: insertError } = await supabase.from('skills').insert([skillDataToInsert]);
    setIsSubmitting(false);

    if (insertError) {
      setFormError(insertError.message);
      console.error("Error inserting skill:", insertError);
    } else {
      setFormName(''); 
      setFormIconUrl('');
      setFormSkillTier(SKILL_TIER_OPTIONS[0]);
      setFormActivationType(ACTIVATION_TYPE_OPTIONS[0]);
      setFormMaxLevel("1");
      setFormCooldown('');
      setFormEnergyCost('');
      setFormRange('');
      setFormReducedEnergyRegen('');
      setFormDescriptionTemplate('');
      setFormParamDefs([{ id: crypto.randomUUID(), key: 'damage', label: 'Damage Value' }]);
      setFormError(null);
      await fetchSkills();
    }
   };

  const preparedParamDefsForDB = formParamDefs
    .filter(p => p.key.trim() && p.label.trim())
    .map(({ id, ...rest }) => ({key: rest.key.trim(), label: rest.label}));
  
  const currentMaxLevelNum = parseInt(formMaxLevel, 10);

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
        Manage Skills
      </h1>

      <div className="mb-10 p-6 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-md">
        <h2 className="text-xl font-semibold mb-6 text-gray-700 dark:text-gray-200">Create New Skill</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name, Icon */}
          <div>
            <label htmlFor="formName" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Skill Name:</label>
            <input type="text" id="formName" value={formName} onChange={(e) => setFormName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="formIconUrl" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Icon URL (Optional):</label>
            <input type="text" id="formIconUrl" value={formIconUrl} onChange={(e) => setFormIconUrl(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="formSkillTier" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Skill Type (Tier):</label>
              <select 
                id="formSkillTier" 
                value={formSkillTier || ''}
                onChange={(e) => setFormSkillTier(e.target.value as SkillItem['skill_type'])}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 h-[42px]">
                {SKILL_TIER_OPTIONS.map(tier => <option key={tier} value={tier}>{tier}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="formActivationType" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Activation Type:</label>
              <select 
                id="formActivationType" 
                value={formActivationType || ''}
                onChange={(e) => setFormActivationType(e.target.value as SkillItem['activation_type'])}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 h-[42px]">
                {ACTIVATION_TYPE_OPTIONS.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="formMaxLevel" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Max Level (1-5):</label>
              <select 
                id="formMaxLevel" 
                value={formMaxLevel}
                onChange={(e) => setFormMaxLevel(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 h-[42px]">
                {MAX_SKILL_LEVEL_OPTIONS.map(level => (
                  <option key={level} value={level.toString()}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional Active Skill Properties */}
          {formActivationType === 'Active' && (
             <div className="p-4 border dark:border-gray-600 rounded-md space-y-4 mt-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Active Skill Properties:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="formCooldown" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Cooldown (number):</label>
                    <input type="number" id="formCooldown" value={formCooldown} onChange={(e) => setFormCooldown(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="formEnergyCost" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Energy Cost (number):</label>
                    <input type="number" id="formEnergyCost" value={formEnergyCost} onChange={(e) => setFormEnergyCost(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="formRange" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Range (Optional, number):</label>
                    <input type="number" id="formRange" value={formRange} onChange={(e) => setFormRange(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="formReducedEnergyRegen" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Reduced Regen (Optional, number):</label>
                    <input type="number" id="formReducedEnergyRegen" value={formReducedEnergyRegen} onChange={(e) => setFormReducedEnergyRegen(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>
             </div>
          )}

          {/* Description Template */}
          <div>
            <label htmlFor="formDescriptionTemplate" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Description (use {'{key}'} for params):</label>
            <textarea id="formDescriptionTemplate" value={formDescriptionTemplate} onChange={(e) => setFormDescriptionTemplate(e.target.value)} rows={3}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          {/* Parameters Definition Section */}
          <div className="p-4 border dark:border-gray-600 rounded-md space-y-3">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Define Skill Parameters</h3>
            {formParamDefs.map((param, index) => (
              <div key={param.id} className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded">
                <input type="text" placeholder="Key (no spaces, e.g. damage)" value={param.key} 
                       onChange={(e) => handleParamDefChange(index, 'key', e.target.value)}
                       className="flex-1 p-2 border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" />
                <input type="text" placeholder="Label (e.g. Damage Value)" value={param.label}
                       onChange={(e) => handleParamDefChange(index, 'label', e.target.value)}
                       className="flex-1 p-2 border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" />
                <button type="button" onClick={() => handleRemoveParamDef(param.id)}
                        className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs">Remove</button>
              </div>
            ))}
            <button type="button" onClick={handleAddParamDef}
                    className="mt-2 py-1 px-3 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm">
              Add Parameter
            </button>
          </div>

          {/* Parameter Values Per Level Section */}
          {formParamDefs.filter(p => p.key.trim()).length > 0 && (
            <div className="p-4 border dark:border-gray-600 rounded-md space-y-4">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Parameter Values Per Level</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Parameter</th>
                      {Array.from({ length: currentMaxLevelNum }, (_, i) => i + 1).map(level => (
                        <th key={level} className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lvl {level}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {formParamDefs.filter(pDef => pDef.key.trim()).map(paramDef => (
                      <tr key={paramDef.id}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{paramDef.label || paramDef.key}</td>
                        {Array.from({ length: currentMaxLevelNum }, (_, i) => i + 1).map(levelNum => {
                          const levelValueObj = formLevelValues.find(lv => lv.level === levelNum);
                          return (
                            <td key={`${paramDef.key}-${levelNum}`} className="px-1 py-1">
                              <input
                                type="text" 
                                value={levelValueObj && levelValueObj[paramDef.key.trim()] !== undefined ? levelValueObj[paramDef.key.trim()] : ''}
                                onChange={(e) => handleLevelValueChange(levelNum, paramDef.key.trim(), e.target.value)}
                                className="w-24 p-1.5 border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm focus:ring-blue-500 focus:border-blue-500 text-center"
                                placeholder={`Lvl ${levelNum}`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {formError && <p className="text-red-500 dark:text-red-400 mt-4">Error: {formError}</p>}
          <div className="flex items-center gap-4 mt-6">
            <button type="submit" disabled={isSubmitting}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 disabled:opacity-50">
              {isSubmitting ? 'Creating Skill...' : 'Create Skill'}
            </button>
            <button type="button" onClick={() => setShowPreview(!showPreview)}
              className="py-2 px-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md">
              {showPreview ? 'Hide' : 'Show'} Data Preview
            </button>
          </div>
        </form>

        {showPreview && (
          <div className="mt-6 p-4 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700">
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Data Preview (to be saved)</h3>
            <div>
              <h4 className="font-medium text-gray-600 dark:text-gray-300">parameters_definition:</h4>
              <pre className="text-xs p-2 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(preparedParamDefsForDB, null, 2)}
              </pre>
            </div>
            <div className="mt-2">
              <h4 className="font-medium text-gray-600 dark:text-gray-300">level_values:</h4>
              <pre className="text-xs p-2 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(formLevelValues.filter(lv => lv.level <= currentMaxLevelNum).map(lv => {
                    const filteredLevel: SkillLevelValue = { level: lv.level };
                    preparedParamDefsForDB.forEach(pd => {
                        if (Object.prototype.hasOwnProperty.call(lv, pd.key)) {
                           filteredLevel[pd.key] = lv[pd.key];
                        } else {
                           filteredLevel[pd.key] = '';
                        }
                    });
                    return filteredLevel;
                }), null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* --- EXISTING SKILLS LIST --- */}
      <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">Existing Skills</h2>
      {listLoading && <p className="dark:text-gray-300">Loading skills...</p>}
      {listError && <p className="text-red-500 dark:text-red-400">Error: {listError}</p>}
      
      {!listLoading && !listError && skills.length === 0 && (
        <p className="dark:text-gray-300">No skills found. Add your first skill using the form above!</p>
      )}

      {!listLoading && !listError && skills.length > 0 && (
        <ul className="list-none p-0 space-y-4">
          {skills.map((skill) => (
            <li key={skill.id} className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {skill.name || 'Unnamed Skill'} 
                  {skill.activation_type && <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">({skill.activation_type})</span>}
                </h3>
                {/* Edit/Delete buttons will go here */}
              </div>
              
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                {skill.icon_url && (
                  <div className="mb-2">
                      <img src={skill.icon_url} alt={skill.name || 'Skill icon'} className="max-w-[40px] max-h-[40px] rounded object-cover inline-block mr-2 align-middle" />
                      <span className="italic text-xs text-gray-500 dark:text-gray-400">(Icon)</span>
                  </div>
                )}
                <p><strong>Tier:</strong> {skill.skill_type || 'N/A'}</p>
                {skill.max_level && <p><strong>Max Level:</strong> {skill.max_level}</p>}
                
                {skill.activation_type === 'Active' && (
                  <>
                    {(skill.energy_cost !== null && skill.energy_cost !== undefined) && <p><strong>Energy Cost:</strong> {skill.energy_cost}</p>}
                    {(skill.cooldown !== null && skill.cooldown !== undefined) && <p><strong>Cooldown:</strong> {skill.cooldown}</p>}
                    {(skill.range !== null && skill.range !== undefined) && <p><strong>Range:</strong> {skill.range}</p>}
                    {(skill.reduced_energy_regen !== null && skill.reduced_energy_regen !== undefined) && <p><strong>Reduced Regen:</strong> {skill.reduced_energy_regen}</p>}
                  </>
                )}
                
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Description:</p>
                  <p className="whitespace-pre-line text-gray-600 dark:text-gray-400">{formatFullSkillDescription(skill)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}