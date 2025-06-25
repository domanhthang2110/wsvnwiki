'use client';

import { FormEvent, useState, useEffect } from 'react';
import { TalentItem, TalentParameterDefinitionInForm, TalentLevelValue, TALENT_TYPE_OPTIONS } from '@/types/talents';
import MediaFileExplorer from '@/components/features/admin/media/MediaFileExplorer';
import ParameterDefinitions from '@/components/features/admin/shared/ParameterDefinitions';
import LevelValuesTable from '@/components/features/admin/shared/LevelValuesTable';

const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>;

export interface TalentFormProps {
  onSubmit: (talentData: Omit<TalentItem, 'id' | 'created_at'>) => Promise<void>;
  isEditing: boolean;
  initialData: TalentItem | null;
}

export default function TalentForm({ onSubmit, isEditing, initialData }: TalentFormProps) {
  const [formName, setFormName] = useState('');
  const [formIconUrl, setFormIconUrl] = useState('');
  const [formType, setFormType] = useState<TalentItem['type']>(TALENT_TYPE_OPTIONS[0]);
  const [formMaxLevel, setFormMaxLevel] = useState(1);
  const [formDescription, setFormDescription] = useState('');
  const [formCostLevels, setFormCostLevels] = useState<number | null>(null);
  const [formKnowledgeLevels, setFormKnowledgeLevels] = useState<number | null>(null);
  
  const [formParamDefs, setFormParamDefs] = useState<TalentParameterDefinitionInForm[]>(
    () => [{ id: crypto.randomUUID(), key: 'value' }]
  );
  const [formLevelValues, setFormLevelValues] = useState<TalentLevelValue[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showIconPickerModal, setShowIconPickerModal] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormName(initialData.name || '');
      setFormIconUrl(initialData.icon_url || '');
      setFormType(initialData.type || TALENT_TYPE_OPTIONS[0]);
      setFormMaxLevel(initialData.max_level || 1);
      setFormDescription(initialData.description || '');
      setFormCostLevels(initialData.cost_levels || null);
      setFormKnowledgeLevels(initialData.knowledge_levels || null);
      setFormParamDefs(
        initialData.parameters_definition && initialData.parameters_definition.length > 0
          ? initialData.parameters_definition.map(pd => ({ 
              id: crypto.randomUUID(), 
              key: pd.key
            }))
          : [{ id: crypto.randomUUID(), key: 'value' }]
      );
      setFormLevelValues(initialData.level_values || []);
    } else {
      setFormName('');
      setFormIconUrl('');
      setFormType(TALENT_TYPE_OPTIONS[0]);
      setFormMaxLevel(1);
      setFormDescription('');
      setFormCostLevels(null);
      setFormKnowledgeLevels(null);
      setFormParamDefs([{ id: crypto.randomUUID(), key: 'value' }]);
      setFormLevelValues([]);
    }
  }, [initialData]);

  useEffect(() => {
    const currentMaxLevel = formMaxLevel;
    const baseValuesSource = (isEditing && initialData && initialData.max_level === currentMaxLevel && initialData.level_values) 
                            ? initialData.level_values 
                            : formLevelValues;

    const newLevels: TalentLevelValue[] = [];
    for (let i = 1; i <= currentMaxLevel; i++) {
      const existingDataForThisLevel: Record<string, any> = baseValuesSource.find(l => l.level === i) || {};
      const levelEntry: TalentLevelValue = { level: i };
      
      formParamDefs.forEach(def => {
        const trimmedKey = def.key.trim();
        if (trimmedKey) {
          levelEntry[trimmedKey] = existingDataForThisLevel[trimmedKey] ?? '';
        }
      });
      newLevels.push(levelEntry);
    }
    setFormLevelValues(newLevels);
  }, [formMaxLevel, formParamDefs, initialData, isEditing]);

  const handleParamDefChange = (index: number, field: 'key', value: string) => {
    const newParamDefs = [...formParamDefs];
    if (field === 'key') {
      value = value.replace(/\s+/g, '').replace(/[^a-zA-Z0-9_]/g, '');
    }
    newParamDefs[index][field] = value;
    setFormParamDefs(newParamDefs);
  };

  const handleAddParamDef = () => {
    setFormParamDefs([...formParamDefs, { id: crypto.randomUUID(), key: '' }]);
  };

  const handleRemoveParamDef = (idToRemove: string) => {
    setFormParamDefs(formParamDefs.filter(param => param.id !== idToRemove));
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

  const handleIconSelectedFromPicker = (publicUrl: string, pathInBucket: string) => {
    setFormIconUrl(publicUrl);
    setShowIconPickerModal(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (!formName.trim()) throw new Error("Talent name is required.");

      const finalParamDefs = formParamDefs
        .filter(p => p.key.trim())
        .map(({ id, key }) => ({ key: key.trim() }));

      const paramKeysFromDefs = finalParamDefs.map(p => p.key);
      if (finalParamDefs.some(p => !p.key)) {
        throw new Error("All defined parameters must have a non-empty key.");
      }
      const uniqueParamKeys = new Set(paramKeysFromDefs);
      if (uniqueParamKeys.size !== paramKeysFromDefs.length) {
        throw new Error("Parameter keys must be unique.");
      }

      const finalLevelValues = formLevelValues
        .filter(lv => lv.level <= formMaxLevel)
        .map(lv => {
          const filteredLevel: TalentLevelValue = { level: lv.level };
          finalParamDefs.forEach(pd => {
            filteredLevel[pd.key] = lv[pd.key] ?? ''; 
          });
          return filteredLevel;
        });

      const talentDataToSubmit: Omit<TalentItem, 'id' | 'created_at'> = {
        name: formName.trim(),
        icon_url: formIconUrl.trim() || null,
        type: formType,
        max_level: formMaxLevel,
        description: formDescription.trim() || null,
        cost_levels: formCostLevels,
        knowledge_levels: formKnowledgeLevels,
        parameters_definition: finalParamDefs.length > 0 ? finalParamDefs : null,
        level_values: finalLevelValues.length > 0 ? finalLevelValues : null,
      };

      await onSubmit(talentDataToSubmit);

      if (!isEditing) {
        setFormName('');
        setFormIconUrl('');
        setFormType(TALENT_TYPE_OPTIONS[0]);
        setFormMaxLevel(1);
        setFormDescription('');
        setFormCostLevels(null);
        setFormKnowledgeLevels(null);
        setFormParamDefs([{ id: crypto.randomUUID(), key: 'value' }]);
      }
      setFormError(null);

    } catch (error: any) {
      console.error("TalentForm handleSubmit error:", error);
      setFormError(error.message || 'An error occurred while saving the talent');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-10 p-6 border border-gray-700 rounded-lg bg-gray-800 shadow-md">
      <h2 className="text-xl font-semibold mb-6 text-gray-200">
        {isEditing ? `Edit Talent: ${initialData?.name || ''}` : 'Create New Talent'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="formName" className="block mb-1 text-sm font-medium text-gray-300">
            Talent Name:
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Talent Icon:
          </label>
          {formIconUrl && (
            <div className="mb-2">
              <img src={formIconUrl} alt="Selected talent icon" className="w-16 h-16 object-contain rounded border p-1 border-gray-600 bg-gray-700" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="formType" className="block mb-1 text-sm font-medium text-gray-300">Type:</label>
            <select 
              id="formType" 
              value={formType || ''} 
              onChange={(e) => setFormType(e.target.value as TalentItem['type'])}
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 h-[42px]"
            >
              {TALENT_TYPE_OPTIONS.map(type => <option key={type} value={type!}>{type}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="formMaxLevel" className="block mb-1 text-sm font-medium text-gray-300">Max Level:</label>
            <input
              type="number"
              id="formMaxLevel"
              value={formMaxLevel}
              onChange={(e) => setFormMaxLevel(parseInt(e.target.value, 10))}
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="formCost" className="block mb-1 text-sm font-medium text-gray-300">Cost:</label>
            <input
              type="number"
              id="formCost"
              value={formCostLevels ?? ''}
              onChange={(e) => setFormCostLevels(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
            />
          </div>
          <div>
            <label htmlFor="formKnowledge" className="block mb-1 text-sm font-medium text-gray-300">Knowledge:</label>
            <input
              type="number"
              id="formKnowledge"
              value={formKnowledgeLevels ?? ''}
              onChange={(e) => setFormKnowledgeLevels(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
            />
          </div>
        </div>

        <div>
          <label htmlFor="formDescription" className="block mb-1 text-sm font-medium text-gray-300">Description (use {'{key}'} for params):</label>
          <textarea 
            id="formDescription" 
            value={formDescription} 
            onChange={(e) => setFormDescription(e.target.value)} 
            rows={3}
            className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
          />
        </div>

        <ParameterDefinitions
          paramDefs={formParamDefs}
          onAdd={handleAddParamDef}
          onChange={handleParamDefChange}
          onRemove={handleRemoveParamDef}
        />

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
              ? (isEditing ? 'Saving Changes...' : 'Creating Talent...') 
              : (isEditing ? 'Save Changes' : 'Create Talent')}
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

      {showIconPickerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4 transition-opacity duration-300">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-gray-100">Select Talent Icon</h3>
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
                initialPath="talents"
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
