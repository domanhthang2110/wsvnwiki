// src/components/admin/skills/SkillForm.tsx
'use client';

import { FormEvent, useState, useEffect, useCallback } from 'react';
import { SkillItem, SkillParameterDefinitionInForm, SkillLevelValue } from '@/types/skills'; // Assuming types are here
import { Item } from '@/types/items';
import { SKILL_TIER_OPTIONS, ACTIVATION_TYPE_OPTIONS } from '@/types/skills'; // Assuming types are here
import LevelValuesTable from '@/components/features/admin/shared/LevelValuesTable';
import MediaFileExplorer from '@/components/features/admin/media/MediaFileExplorer';
import { SkillInfoModal } from '@/components/features/wiki/classes/SkillDisplay';
import LongButton from '@/components/ui/LongButton';
import DescriptionAutocomplete from '@/components/features/admin/shared/DescriptionAutocomplete';

import EnergyCostRow from './EnergyCostRow';
import ReducedEnergyRegenRow from './ReducedEnergyRegenRow';

// Icon for the close button in the modal
const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>;

export interface SkillFormProps {
  onSubmit: (skillData: Omit<SkillItem, 'id' | 'created_at'>) => Promise<void>;
  isEditing: boolean;
  initialData: SkillItem | null;
  selectedItems: Item[];
  onItemSelect: () => void;
}

export default function SkillForm({ onSubmit, isEditing, initialData, selectedItems, onItemSelect }: SkillFormProps) {
  const [formName, setFormName] = useState('');
  const [formIconUrl, setFormIconUrl] = useState('');
  const [formSkillTier, setFormSkillTier] = useState<SkillItem['skill_type']>(SKILL_TIER_OPTIONS[0]);
  const [formActivationType, setFormActivationType] = useState<SkillItem['activation_type']>(ACTIVATION_TYPE_OPTIONS[0]);
  const [formMaxLevel, setFormMaxLevel] = useState<number>(5);
  const [formCooldown, setFormCooldown] = useState('');
  // Remove formEnergyCost state as it will be handled in formLevelValues
  const [formRange, setFormRange] = useState('');
  const [formDescriptionTemplate, setFormDescriptionTemplate] = useState('');

  const [formParamDefs, setFormParamDefs] = useState<SkillParameterDefinitionInForm[]>(
    () => [{ id: crypto.randomUUID(), key: 'damage', hasPvp: false }]
  );
  const [formLevelValues, setFormLevelValues] = useState<SkillLevelValue[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Renamed from showMediaGallery for clarity
  const [showIconPickerModal, setShowIconPickerModal] = useState(false);

  // NEW state for energy costs
  const [energyCosts, setEnergyCosts] = useState<Record<number, string>>({});
  const [reducedEnergyRegenValues, setReducedEnergyRegenValues] = useState<Record<number, string>>({});

  const [previewSkill, setPreviewSkill] = useState<SkillItem | null>(null);
  const [previewLevel, setPreviewLevel] = useState(0);
  const [showPvp, setShowPvp] = useState(true);

  const [liveFormData, setLiveFormData] = useState<Omit<SkillItem, 'id' | 'created_at'>>({
    name: '',
    icon_url: null,
    skill_type: SKILL_TIER_OPTIONS[0],
    activation_type: ACTIVATION_TYPE_OPTIONS[0],
    max_level: 5,
    description: null,
    parameters_definition: null,
    level_values: null,
    cooldown: null,
    range: null,
    reduced_energy_regen: null,
    energy_cost: null,
  });

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
      setFormDescriptionTemplate(initialData.description || '');
      setFormParamDefs(
        initialData.parameters_definition && initialData.parameters_definition.length > 0
          ? initialData.parameters_definition.map(pd => ({
            id: crypto.randomUUID(),
            key: pd.key,
            hasPvp: !!pd.hasPvp
          }))
          : [{ id: crypto.randomUUID(), key: 'damage', hasPvp: false }]
      );
      // Level values will be set by the next useEffect based on initialData.level_values
      // and current paramDefs & maxLevel. This simplifies logic.
      setFormLevelValues(initialData.level_values || []);

      // Set energy costs from initialData
      if (initialData.energy_cost) {
        const costs: Record<number, string> = {};
        // Handle both array-like (legacy 0-indexed) and object-like (current 1-indexed) data
        if (Array.isArray(initialData.energy_cost)) {
          // This path handles legacy 0-indexed array data
          initialData.energy_cost.forEach((cost, index) => {
            costs[index + 1] = cost.toString(); // Map 0-indexed array to 1-indexed levels
          });
        } else if (typeof initialData.energy_cost === 'object' && initialData.energy_cost !== null) {
          // This path handles current 1-indexed object data (e.g., {"1": 12, "2": 13})
          Object.entries(initialData.energy_cost).forEach(([key, value]) => {
            const level = parseInt(key, 10);
            if (!isNaN(level) && value !== null) {
              costs[level] = value.toString(); // Use the key directly as the level
            }
          });
        }
        setEnergyCosts(costs);
      } else {
        setEnergyCosts({});
      }

      if (initialData.reduced_energy_regen) {
        const regens: Record<number, string> = {};
        if (Array.isArray(initialData.reduced_energy_regen)) {
          initialData.reduced_energy_regen.forEach((regen, index) => {
            if (regen !== null) {
              regens[index + 1] = regen.toString();
            }
          });
        } else if (typeof initialData.reduced_energy_regen === 'object' && initialData.reduced_energy_regen !== null) {
          Object.entries(initialData.reduced_energy_regen).forEach(([key, value]) => {
            const level = parseInt(key, 10);
            if (!isNaN(level) && value !== null && value !== undefined) {
              regens[level] = value.toString();
            }
          });
        }
        setReducedEnergyRegenValues(regens);
      } else {
        setReducedEnergyRegenValues({});
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
      setFormDescriptionTemplate('');
      setFormParamDefs([{ id: crypto.randomUUID(), key: 'damage', hasPvp: false }]);
      setFormLevelValues([]); // Will be populated by the effect below
      setEnergyCosts({});
      setReducedEnergyRegenValues({});
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
    const currentMaxLevel = formMaxLevel;

    setFormLevelValues(prevLevels => {
      const newLevels: SkillLevelValue[] = [];
      for (let i = 1; i <= currentMaxLevel; i++) {
        // Find existing data for this level from the previous state
        const existingDataForThisLevel = prevLevels.find(l => l.level === i) ?? { level: i };
        const levelEntry: SkillLevelValue = { level: i };

        formParamDefs.forEach(def => {
          const trimmedKey = def.key.trim();
          if (trimmedKey) {
            // Preserve existing normal value
            levelEntry[trimmedKey] = existingDataForThisLevel[trimmedKey] ?? '';

            // Preserve existing PvP value if applicable
            // Note: We preserve it even if hasPvp is toggled off momentarily, 
            // but usually we might want to clean it up. For safety in form, we keep it.
            const pvpKey = `${trimmedKey}_pvp`;
            if (existingDataForThisLevel[pvpKey] !== undefined) {
              levelEntry[pvpKey] = existingDataForThisLevel[pvpKey];
            }
          }
        });
        newLevels.push(levelEntry);
      }
      return newLevels;
    });
  }, [formMaxLevel, formParamDefs]); // Removed initialData and isEditing from dependencies

  const prepareSkillData = useCallback((): Omit<SkillItem, 'id' | 'created_at'> => {
    const currentMaxLevel = formMaxLevel;

    const finalParamDefs = formParamDefs
      .filter(p => p.key.trim())
      .map(({ key, hasPvp }) => ({ key: key.trim(), hasPvp }));

    const finalLevelValues = formLevelValues
      .filter(lv => lv.level <= currentMaxLevel)
      .map(lv => {
        const filteredLevel: SkillLevelValue = { level: lv.level };
        finalParamDefs.forEach(pd => {
          // Normal Value
          const rawValue = lv[pd.key];
          filteredLevel[pd.key] = (rawValue && !isNaN(Number(rawValue))) ? Number(rawValue) : (rawValue ?? '');

          // PvP Value
          if (pd.hasPvp) {
            const pvpKey = `${pd.key}_pvp`;
            const rawPvpValue = lv[pvpKey];
            filteredLevel[pvpKey] = (rawPvpValue && !isNaN(Number(rawPvpValue))) ? Number(rawPvpValue) : (rawPvpValue ?? '');
          }
        });
        return filteredLevel;
      });

    // Process Energy Costs
    let finalEnergyCost: Record<number, number> | null = null;
    if (formActivationType === 'Active' || formActivationType === 'Permanent') {
      const parsedEnergyCosts: Record<number, number> = {};
      Object.entries(energyCosts).forEach(([level, value]) => {
        if (value && !isNaN(parseInt(value))) {
          parsedEnergyCosts[parseInt(level)] = parseInt(value);
        }
      });
      if (Object.keys(parsedEnergyCosts).length > 0) finalEnergyCost = parsedEnergyCosts;
    }

    // Process Reduced Regen
    let finalReducedRegen: Record<number, number> | null = null;
    if (formActivationType === 'Permanent') {
      const parsedReducedEnergyRegen: Record<number, number> = {};
      Object.entries(reducedEnergyRegenValues).forEach(([level, value]) => {
        if (value && !isNaN(parseInt(value))) {
          parsedReducedEnergyRegen[parseInt(level)] = parseInt(value);
        }
      });
      if (Object.keys(parsedReducedEnergyRegen).length > 0) finalReducedRegen = parsedReducedEnergyRegen;
    }

    return {
      name: formName.trim() || null,
      icon_url: formIconUrl.trim() || null,
      skill_type: formSkillTier || SKILL_TIER_OPTIONS[0],
      activation_type: formActivationType || ACTIVATION_TYPE_OPTIONS[0],
      max_level: currentMaxLevel,
      description: formDescriptionTemplate.trim() || null,
      parameters_definition: finalParamDefs.length > 0 ? finalParamDefs : null,
      level_values: finalLevelValues.length > 0 ? finalLevelValues : null,
      cooldown: formCooldown.trim() ? parseInt(formCooldown, 10) : null,
      range: formRange.trim() ? parseInt(formRange, 10) : null,
      reduced_energy_regen: finalReducedRegen,
      energy_cost: finalEnergyCost,
    };
  }, [formName, formIconUrl, formSkillTier, formActivationType, formMaxLevel, formDescriptionTemplate, formParamDefs, formLevelValues, formCooldown, formRange, energyCosts, reducedEnergyRegenValues]);

  // Effect to update liveFormData
  useEffect(() => {
    setLiveFormData(prepareSkillData());
  }, [prepareSkillData]);


  const handleRenameParam = (id: string, oldKey: string, newKey: string) => {
    // 1. Update Definition
    const cleanNewKey = newKey.replace(/\s+/g, '').replace(/[^a-zA-Z0-9_]/g, '');

    setFormParamDefs(prev => prev.map(p =>
      p.id === id ? { ...p, key: cleanNewKey } : p
    ));

    // 2. Migrate Values in Level Data if key actually changed
    // We do this by updating formLevelValues directly
    if (oldKey && cleanNewKey && oldKey !== cleanNewKey) {
      setFormLevelValues(prev => prev.map(lv => {
        const newVal = { ...lv };
        // Migrate normal value
        if (newVal[oldKey] !== undefined) {
          newVal[cleanNewKey] = newVal[oldKey];
          delete newVal[oldKey];
        }
        // Migrate PvP value
        const oldPvpKey = `${oldKey}_pvp`;
        const newPvpKey = `${cleanNewKey}_pvp`;
        if (newVal[oldPvpKey] !== undefined) {
          newVal[newPvpKey] = newVal[oldPvpKey];
          delete newVal[oldPvpKey];
        }
        return newVal;
      }));
    }
  };

  const handleAddParamDef = () => {
    setFormParamDefs([...formParamDefs, { id: crypto.randomUUID(), key: '', hasPvp: false }]);
  };

  const handleRemoveParamDef = (idToRemove: string) => {
    setFormParamDefs(formParamDefs.filter(param => param.id !== idToRemove));
    // Optional: Clean up level values immediately, though useEffect will likely handle re-shaping
  };

  const handleTogglePvp = (id: string, hasPvp: boolean) => {
    setFormParamDefs(prev => prev.map(p =>
      p.id === id ? { ...p, hasPvp } : p
    ));

    if (hasPvp) {
      const param = formParamDefs.find(p => p.id === id);
      if (param) {
        setFormLevelValues(prev => prev.map(lv => {
          const pveValue = lv[param.key];
          const pvpKey = `${param.key}_pvp`;

          // Copy PvE value if PvP value is empty/undefined
          if (lv[pvpKey] === undefined || lv[pvpKey] === '') {
            return {
              ...lv,
              [pvpKey]: pveValue
            };
          }
          return lv;
        }));
      }
    }
  };

  const handleToggleConstant = (id: string, constant: boolean) => {
    setFormParamDefs(prev => prev.map(p =>
      p.id === id ? { ...p, constant } : p
    ));
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

  const handleBulkLevelValueChange = (paramKey: string, valuesByLevel: Record<number, string>) => {
    setFormLevelValues(prevLevels => {
      return prevLevels.map(levelItem => {
        const newValue = valuesByLevel[levelItem.level];
        if (newValue !== undefined) {
          return { ...levelItem, [paramKey]: newValue };
        }
        return levelItem;
      });
    });
  };

  // NEW: Handler for when an icon is selected from the MediaFileExplorer
  const handleIconSelectedFromPicker = (publicUrl: string) => {
    setFormIconUrl(publicUrl);
    setShowIconPickerModal(false); // Close the modal
  };

  const handleEnergyCostChange = (level: number, value: string) => {
    setEnergyCosts(prev => ({
      ...prev,
      [level]: value
    }));
  };

  const handleReducedEnergyRegenChange = (level: number, value: string) => {
    setReducedEnergyRegenValues(prev => ({
      ...prev,
      [level]: value
    }));
  };

  const handleShowPreview = () => {
    const data = prepareSkillData();
    // Mock full SkillItem with ID/Date for display purposes
    const mockSkill: SkillItem = {
      ...data,
      id: initialData?.id || 0,
      created_at: initialData?.created_at || new Date().toISOString()
    };
    setPreviewSkill(mockSkill);
    setPreviewLevel(0);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (!formName.trim()) throw new Error("Skill name is required.");
      if (formMaxLevel < 1) throw new Error("Max level must be at least 1.");

      const definitions = prepareSkillData().parameters_definition || [];
      const paramKeysFromDefs = definitions.map(p => p.key);

      if (definitions.some(p => !p.key)) {
        throw new Error("All defined parameters must have a non-empty key.");
      }
      const uniqueParamKeys = new Set(paramKeysFromDefs);
      if (uniqueParamKeys.size !== paramKeysFromDefs.length) {
        throw new Error("Parameter keys must be unique.");
      }

      const skillDataToSubmit = prepareSkillData();
      await onSubmit(skillDataToSubmit);

      // Reset form logic
      if (!isEditing) {
        setFormName('');
        setFormIconUrl('');
        setFormSkillTier(SKILL_TIER_OPTIONS[0]);
        setFormActivationType(ACTIVATION_TYPE_OPTIONS[0]);
        setFormCooldown('');
        setFormRange('');
        setFormDescriptionTemplate('');
        setFormParamDefs([{ id: crypto.randomUUID(), key: 'damage', hasPvp: false }]);
        setEnergyCosts({});
        setReducedEnergyRegenValues({});
      }
      setFormError(null);

    } catch (error: unknown) {
      console.error("SkillForm handleSubmit error:", error);
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError('An unknown error occurred while saving the skill');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-10 p-6 border border-gray-700 rounded-lg bg-gray-800 shadow-md max-w-full">
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
        <div className="relative space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Skill Icon:
          </label>
          {formIconUrl && (
            <div className="mb-2">
              <img src={formIconUrl} alt="Selected skill icon" className="w-16 h-16 object-contain rounded border p-1 border-gray-600 bg-gray-700" draggable={false} />
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
        {(formActivationType === 'Active' || formActivationType === 'Permanent') && (
          <div className="p-4 border border-gray-600 rounded-md space-y-4 mt-4">
            <h3 className="text-lg font-medium text-gray-300">{formActivationType} Skill Properties</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(formActivationType === 'Active' || formActivationType === 'Permanent') && (
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
                )}
                {formActivationType === 'Active' && (
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
                )}
              </div>
              <EnergyCostRow
                maxLevel={formMaxLevel}
                energyCosts={energyCosts}
                onChange={handleEnergyCostChange}
              />
              {formActivationType === 'Permanent' && (
                <ReducedEnergyRegenRow
                  maxLevel={formMaxLevel}
                  reducedEnergyRegenValues={reducedEnergyRegenValues}
                  onChange={handleReducedEnergyRegenChange}
                />
              )}
            </div>
          </div>
        )}

        {/* Level Values Table - New Transposed Version */}
        <LevelValuesTable
          maxLevel={formMaxLevel}
          paramDefs={formParamDefs}
          levelValues={formLevelValues}
          onChange={handleLevelValueChange}
          onBulkChange={handleBulkLevelValueChange}
          onAddParam={handleAddParamDef}
          onRemoveParam={handleRemoveParamDef}
          onRenameParam={handleRenameParam}
          onTogglePvp={handleTogglePvp}
          onToggleConstant={handleToggleConstant}
        />

        {/* Description Editor with Autocomplete */}
        <div>
          <label htmlFor="formDescriptionTemplate" className="block mb-2 text-sm font-medium text-gray-300">Description:</label>
          <DescriptionAutocomplete
            value={formDescriptionTemplate}
            onChange={setFormDescriptionTemplate}
            parameters={formParamDefs}
            placeholder="Enter skill description... Type { to insert parameters"
            rows={6}
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-300">Linked Items</h3>
          <button
            type="button"
            onClick={onItemSelect}
            className="mt-2 py-2 px-3 text-sm font-medium rounded-md border border-gray-600 hover:bg-gray-700 text-gray-300"
          >
            Select Items
          </button>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedItems.map(item => (
              <div key={item.id} className="flex items-center gap-2 px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                {item.icon_url && (
                  <img src={item.icon_url} alt={item.name || ''} className="w-4 h-4 object-cover rounded" draggable={false} />
                )}
                {item.name}
              </div>
            ))}
          </div>
        </div>

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
          <button
            type="button"
            onClick={handleShowPreview}
            className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg border border-purple-500"
          >
            Preview Skill
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

      <div className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-200 mb-2">Raw Form Data</h3>
        <pre className="text-xs text-gray-300 bg-gray-800 p-2 rounded max-h-60 block w-full" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowX: 'hidden', boxSizing: 'border-box' }}>
          {JSON.stringify(liveFormData, null, 2)}
        </pre>
      </div>

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

      {/* Preview Modal */}
      {previewSkill && (
        <SkillInfoModal
          skill={previewSkill}
          displayLevel={previewLevel}
          setDisplayLevel={setPreviewLevel}
          onClose={() => setPreviewSkill(null)}
          onNext={() => { }} // No-op in preview
          onPrevious={() => { }} // No-op in preview
          showPvp={showPvp}
          setShowPvp={setShowPvp}
          footer={() => (
            <div className="flex items-center justify-center gap-2">
              <LongButton width={280} text="Đóng" onClick={() => setPreviewSkill(null)} />
            </div>
          )}
        />
      )}
    </div>
  );
}
