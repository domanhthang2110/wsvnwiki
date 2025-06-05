// src/components/admin/skills/SkillForm.tsx
'use client';

import { FormEvent, useState, useEffect } from 'react';
import type { ChangeEvent } from 'react'; // For completeness, though not used directly if direct upload removed
import { SkillItem, SkillParameterDefinitionInForm, SkillLevelValue, SkillRow } from '@/types/skills'; // Assuming types are here
import { supabase } from '@/lib/supabase/client'; // Update Supabase client path
import { MAX_SKILL_LEVEL_OPTIONS, SKILL_TIER_OPTIONS, ACTIVATION_TYPE_OPTIONS } from '@/types/skills'; // Assuming types are here

import ParameterDefinitions from './ParameterDefinitions'; // Assuming this component exists
import LevelValuesTable from './LevelValuesTable';     // Assuming this component exists
import MediaFileExplorer from '@/components/features/admin/media/MediaFileExplorer'; // Update path
import EnergyCostRow from './EnergyCostRow'; // Import the new energy cost row component

// Icon for the close button in the modal
const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>;

export interface SkillFormProps {
  onSubmit: (skillData: Omit<SkillItem, 'id' | 'created_at'>) => Promise<void>;
  isEditing: boolean;
  initialData: SkillItem | null;
}

export default function SkillForm({ onSubmit, isEditing, initialData }: SkillFormProps) {
  const [formName, setFormName] = useState('');
  const [formIconUrl, setFormIconUrl] = useState('');
  const [formSkillTier, setFormSkillTier] = useState<SkillItem['skill_type']>(SKILL_TIER_OPTIONS[0]);
  const [formActivationType, setFormActivationType] = useState<SkillItem['activation_type']>(ACTIVATION_TYPE_OPTIONS[0]);
  const [formMaxLevel, setFormMaxLevel] = useState<number>(5); 
  const [formCooldown, setFormCooldown] = useState('');
  // Remove formEnergyCost state as it will be handled in formLevelValues
  const [formRange, setFormRange] = useState('');
  const [formReducedEnergyRegen, setFormReducedEnergyRegen] = useState('');
  const [formDescriptionTemplate, setFormDescriptionTemplate] = useState('');
  
  const [formParamDefs, setFormParamDefs] = useState<SkillParameterDefinitionInForm[]>(
    () => [{ id: crypto.randomUUID(), key: 'damage', label: 'Damage Value' }]
  );
  const [formLevelValues, setFormLevelValues] = useState<SkillLevelValue[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Renamed from showMediaGallery for clarity
  const [showIconPickerModal, setShowIconPickerModal] = useState(false); 

  // NEW state for energy costs
  const [energyCosts, setEnergyCosts] = useState<Record<number, string>>({});
  // const [energyCostValues, setEnergyCostValues] = useState<string[]>(Array.from({ length: 5 }, () => '')); // Default to 5 empty strings

  // Effect to populate form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setFormName(initialData.name || '');
      setFormIconUrl(initialData.icon_url || '');
      setFormSkillTier(initialData.skill_type || SKILL_TIER_OPTIONS[0]);
      setFormActivationType(initialData.activation_type || ACTIVATION_TYPE_OPTIONS[0]);
      //setFormMaxLevel((initialData.max_level || 1).toString());
      setFormCooldown(initialData.cooldown?.toString() || '');
      // Remove energy cost setting here as it will be handled by level values
      setFormRange(initialData.range?.toString() || '');
      setFormReducedEnergyRegen(initialData.reduced_energy_regen?.toString() || '');
      setFormDescriptionTemplate(initialData.description || '');
      setFormParamDefs(
        initialData.parameters_definition && initialData.parameters_definition.length > 0
          ? initialData.parameters_definition.map(pd => ({ 
              id: crypto.randomUUID(), 
              key: pd.key, 
              label: pd.label 
            }))
          : [{ id: crypto.randomUUID(), key: 'damage', label: 'Damage Value' }]
      );
      // Level values will be set by the next useEffect based on initialData.level_values
      // and current paramDefs & maxLevel. This simplifies logic.
      setFormLevelValues(initialData.level_values || []);

      // Set energy costs from initialData
      if (initialData.energy_cost) {
        const costs: Record<number, string> = {};
        Object.entries(initialData.energy_cost).forEach(([level, cost]) => {
          costs[parseInt(level)] = cost.toString();
        });
        setEnergyCosts(costs);
      } else {
        setEnergyCosts({});
      }
    } else {
      // Reset form for "create new" mode if initialData becomes null
      setFormName('');
      setFormIconUrl('');
      setFormSkillTier(SKILL_TIER_OPTIONS[0]);
      setFormActivationType(ACTIVATION_TYPE_OPTIONS[0]);
      //setFormMaxLevel("1");
      setFormCooldown('');
      // Remove energy cost reset
      setFormRange('');
      setFormReducedEnergyRegen('');
      setFormDescriptionTemplate('');
      setFormParamDefs([{ id: crypto.randomUUID(), key: 'damage', label: 'Damage Value' }]);
      setFormLevelValues([]); // Will be populated by the effect below
      setEnergyCosts({});
    }
  }, [initialData]);

  // NEW useEffect to automatically set maxLevel based on skillTier
useEffect(() => {
  let newMaxLevel = 1; // Default for "Equipment", "Race", or any other type
  switch (formSkillTier) {
    case 'Basic':
      newMaxLevel = 5;
      break;
    case 'Expert':
      newMaxLevel = 4;
      break;
    // Add other cases if "Equipment" or "Race" have different max levels than 1
    // default: newMaxLevel = 1; // Already handled by initialization
  }
  setFormMaxLevel(newMaxLevel);
}, [formSkillTier]); // Re-run ONLY when formSkillTier changes

// Effect to update formLevelValues based on maxLevel and paramDefs
useEffect(() => {
  const currentMaxLevel = formMaxLevel; // formMaxLevel is now a number

  setFormLevelValues(prevLevelsOrInitial => {
    // Determine the base for existing values: if editing and initialData's levels are relevant, use them.
    // This logic helps preserve initialData values when the form loads for an edit.
    const baseValuesSource = (isEditing && initialData && initialData.max_level === currentMaxLevel && initialData.level_values) 
                            ? initialData.level_values 
                            : prevLevelsOrInitial;

    const newLevels: SkillLevelValue[] = [];
    for (let i = 1; i <= currentMaxLevel; i++) {
      const existingDataForThisLevel: Record<string, any> = baseValuesSource.find(l => l.level === i) || {};
      const levelEntry: SkillLevelValue = { level: i };
      
      formParamDefs.forEach(def => {
        const trimmedKey = def.key.trim();
        if (trimmedKey) {
          levelEntry[trimmedKey] = existingDataForThisLevel[trimmedKey] ?? '';
        }
      });
      newLevels.push(levelEntry);
    }
    return newLevels;
  });
}, [formMaxLevel, formParamDefs, initialData, isEditing]); // Added isEditing and initialData


  const handleParamDefChange = (index: number, field: 'key' | 'label', value: string) => {
    const newParamDefs = [...formParamDefs];
    if (field === 'key') {
      value = value.replace(/\s+/g, '').replace(/[^a-zA-Z0-9_]/g, '');
    }
    newParamDefs[index][field] = value;
    setFormParamDefs(newParamDefs);
  };

  const handleAddParamDef = () => {
    setFormParamDefs([...formParamDefs, { id: crypto.randomUUID(), key: '', label: '' }]);
  };

  const handleRemoveParamDef = (idToRemove: string) => {
    setFormParamDefs(formParamDefs.filter(param => param.id !== idToRemove));
    // Note: The useEffect for level_values will automatically clean up keys from formLevelValues
  };

  const handleLevelValueChange = (levelNumber: number, paramKey: string, value: string) => {
    setFormLevelValues(prevLevels => {
      return prevLevels.map(level => {
        if (level.level === levelNumber) {
          return { ...level, [paramKey]: value };
        }
        return level;
      });
    });
  };

  // NEW: Handler for when an icon is selected from the MediaFileExplorer
  const handleIconSelectedFromPicker = (publicUrl: string, pathInBucket: string) => {
    setFormIconUrl(publicUrl);
    setShowIconPickerModal(false); // Close the modal
  };

  const handleEnergyCostChange = (level: number, value: string) => {
    setEnergyCosts(prev => ({
      ...prev,
      [level]: value
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const currentMaxLevel = formMaxLevel;

      if (!formName.trim()) throw new Error("Skill name is required.");
      if (currentMaxLevel < 1) throw new Error("Max level must be at least 1.");

      const finalParamDefs = formParamDefs
        .filter(p => p.key.trim() && p.label.trim())
        .map(({ id, key, label }) => ({ key: key.trim(), label })); // Strip temporary id

      const paramKeysFromDefs = finalParamDefs.map(p => p.key);
      if (finalParamDefs.some(p => !p.key)) {
        throw new Error("All defined parameters must have a non-empty key.");
      }
      const uniqueParamKeys = new Set(paramKeysFromDefs);
      if (uniqueParamKeys.size !== paramKeysFromDefs.length) {
        throw new Error("Parameter keys must be unique.");
      }

      const finalLevelValues = formLevelValues
        .filter(lv => lv.level <= currentMaxLevel) // Only include levels up to max_level
        .map(lv => {
          const filteredLevel: SkillLevelValue = { level: lv.level };
          // Only include keys that are in finalParamDefs
          finalParamDefs.forEach(pd => {
            filteredLevel[pd.key] = lv[pd.key] ?? ''; 
          });
          return filteredLevel;
        });

      const skillDataToSubmit: Omit<SkillItem, 'id' | 'created_at'> = {
        name: formName.trim() || null,
        icon_url: formIconUrl.trim() || null,
        skill_type: formSkillTier || SKILL_TIER_OPTIONS[0],
        activation_type: formActivationType || ACTIVATION_TYPE_OPTIONS[0],
        max_level: currentMaxLevel,
        description: formDescriptionTemplate.trim() || null,
        parameters_definition: finalParamDefs.length > 0 ? finalParamDefs : null,
        level_values: finalLevelValues.length > 0 ? finalLevelValues : null,
        // Ensure all properties are explicitly included, even if null
        cooldown: formCooldown.trim() ? parseInt(formCooldown, 10) : null,
        range: formRange.trim() ? parseInt(formRange, 10) : null,
        reduced_energy_regen: formReducedEnergyRegen.trim() ? parseInt(formReducedEnergyRegen, 10) : null,
        energy_cost: null, // Default to null, will be set below if active
      };

      if (formActivationType === 'Active') {
        // These are already assigned above, but we can re-assign to be explicit
        // skillDataToSubmit.cooldown = formCooldown.trim() ? parseInt(formCooldown, 10) : null;
        
        // Convert energy costs to the new format
        const parsedEnergyCosts: Record<number, number> = {};
        Object.entries(energyCosts).forEach(([level, value]) => {
          if (value && !isNaN(parseInt(value))) {
            parsedEnergyCosts[parseInt(level)] = parseInt(value);
          }
        });
        skillDataToSubmit.energy_cost = Object.keys(parsedEnergyCosts).length > 0 ? parsedEnergyCosts : null;
        
        // skillDataToSubmit.range = formRange.trim() ? parseInt(formRange, 10) : null;
        // skillDataToSubmit.reduced_energy_regen = formReducedEnergyRegen.trim() ? parseInt(formReducedEnergyRegen, 10) : null;
      } else {
        // These are already assigned above, but we can re-assign to be explicit
        // skillDataToSubmit.cooldown = null;
        // skillDataToSubmit.energy_cost = null;
        // skillDataToSubmit.range = null;
        // skillDataToSubmit.reduced_energy_regen = null;
      }

      await onSubmit(skillDataToSubmit); // Call the prop passed by AdminSkillsPage

      // Reset form only if NOT editing, or if parent handles it
      if (!isEditing) {
          setFormName('');
          setFormIconUrl('');
          setFormSkillTier(SKILL_TIER_OPTIONS[0]);
          setFormActivationType(ACTIVATION_TYPE_OPTIONS[0]);
          //setFormMaxLevel("1");
          setFormCooldown('');
          // Remove energy cost reset
          setFormRange('');
          setFormReducedEnergyRegen('');
          setFormDescriptionTemplate('');
          setFormParamDefs([{ id: crypto.randomUUID(), key: 'damage', label: 'Damage Value' }]);
          // formLevelValues will be reset by its own useEffect when maxLevel and paramDefs reset
      }
      setFormError(null);

    } catch (error: any) {
      console.error("SkillForm handleSubmit error:", error);
      setFormError(error.message || 'An error occurred while saving the skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-10 p-6 border border-gray-700 rounded-lg bg-gray-800 shadow-md">
      <h2 className="text-xl font-semibold mb-6 text-gray-200">
        {isEditing ? `Edit Skill: ${initialData?.name || ''}` : 'Create New Skill'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div>
          <label htmlFor="formName" className="block mb-1 text-sm font-medium text-gray-300">
            Skill Name:
          </label>
          <input
            type="text"
            id="formName"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
            className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
          />
        </div>

        {/* Skill Icon Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Skill Icon:
          </label>
          {formIconUrl && (
            <div className="mb-2">
              <img src={formIconUrl} alt="Selected skill icon" className="w-16 h-16 object-contain rounded border p-1 border-gray-600 bg-gray-700" />
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowIconPickerModal(true)}
            className="py-2 px-3 text-sm font-medium rounded-md border border-gray-600 hover:bg-gray-700 text-gray-300"
          >
            {formIconUrl ? 'Change Icon' : 'Select Icon from Media'}
          </button>
        </div>
        
        {/* Skill Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="formSkillTier" className="block mb-1 text-sm font-medium text-gray-300">Skill Type (Tier):</label>
            <select 
              id="formSkillTier" 
              value={formSkillTier || ''} 
              onChange={(e) => setFormSkillTier(e.target.value as SkillItem['skill_type'])}
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 h-[42px]"
            >
              {SKILL_TIER_OPTIONS.map(tier => <option key={tier} value={tier!}>{tier}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="formActivationType" className="block mb-1 text-sm font-medium text-gray-300">Activation Type:</label>
            <select 
              id="formActivationType" 
              value={formActivationType || ''} 
              onChange={(e) => setFormActivationType(e.target.value as SkillItem['activation_type'])}
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 h-[42px]"
            >
              {ACTIVATION_TYPE_OPTIONS.map(type => <option key={type} value={type!}>{type}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-300">
              Max Level:
            </label>
            <p className="p-2 text-gray-300 font-semibold">{formMaxLevel}</p>
          </div>
        </div>

        {/* Active Skill Properties */}
        {formActivationType === 'Active' && (
          <div className="p-4 border border-gray-600 rounded-md space-y-4 mt-4">
            <h3 className="text-lg font-medium text-gray-300">Active Skill Properties</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="formCooldown" className="block mb-1 text-sm font-medium text-gray-300">
                    Cooldown (number):
                  </label>
                  <input 
                    type="number" 
                    id="formCooldown" 
                    value={formCooldown} 
                    onChange={(e) => setFormCooldown(e.target.value)} 
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
                  />
                </div>
                {/* Remove energy cost input from here */}
                <div>
                  <label htmlFor="formRange" className="block mb-1 text-sm font-medium text-gray-300">Range (Optional, number):</label>
                  <input 
                    type="number" 
                    id="formRange" 
                    value={formRange} 
                    onChange={(e) => setFormRange(e.target.value)} 
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="formReducedEnergyRegen" className="block mb-1 text-sm font-medium text-gray-300">Reduced Regen (Optional, number):</label>
                  <input 
                    type="number" 
                    id="formReducedEnergyRegen" 
                    value={formReducedEnergyRegen} 
                    onChange={(e) => setFormReducedEnergyRegen(e.target.value)} 
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
                  />
                </div>
              </div>
              <EnergyCostRow
                maxLevel={formMaxLevel}
                energyCosts={energyCosts}
                onChange={handleEnergyCostChange}
              />
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label htmlFor="formDescriptionTemplate" className="block mb-1 text-sm font-medium text-gray-300">Description (use {'{key}'} for params):</label>
          <textarea 
            id="formDescriptionTemplate" 
            value={formDescriptionTemplate} 
            onChange={(e) => setFormDescriptionTemplate(e.target.value)} 
            rows={3}
            className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
          />
        </div>

        {/* Parameter Definitions */}
        <ParameterDefinitions
          paramDefs={formParamDefs}
          onAdd={handleAddParamDef}
          onChange={handleParamDefChange}
          onRemove={handleRemoveParamDef}
        />

        {/* Level Values Table */}
        {formParamDefs.filter(p => p.key.trim()).length > 0 && (
          <LevelValuesTable
            maxLevel={formMaxLevel}
            paramDefs={formParamDefs.filter(p => p.key.trim())}
            levelValues={formLevelValues}
            onChange={handleLevelValueChange}
          />
        )}

        {formError && (
          <p className="text-red-400 mt-2">{formError}</p>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-50"
          >
            {isSubmitting 
              ? (isEditing ? 'Saving Changes...' : 'Creating Skill...') 
              : (isEditing ? 'Save Changes' : 'Create Skill')}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => onSubmit(initialData!)}
              className="py-2 px-4 text-gray-300 hover:bg-gray-700 font-medium rounded-lg border border-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Media File Explorer Modal */}
      {showIconPickerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4 transition-opacity duration-300">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-gray-100">Select Skill Icon</h3>
              <button 
                onClick={() => setShowIconPickerModal(false)} 
                className="p-1 text-gray-400 hover:text-red-400"
                title="Close"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto min-h-[300px]">
              <MediaFileExplorer
                bucketName="media"
                initialPath="classes"
                onFileSelect={handleIconSelectedFromPicker}
                mode="select" 
                accept="image/*"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
