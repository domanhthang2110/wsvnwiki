import { SkillParameterDefinitionInForm } from '@/types/skills';

interface ParameterDefinitionsProps {
  paramDefs: SkillParameterDefinitionInForm[];
  onAdd: () => void;
  onChange: (index: number, field: 'key' | 'label', value: string) => void;
  onRemove: (id: string) => void;
}

export default function ParameterDefinitions({
  paramDefs,
  onAdd,
  onChange,
  onRemove
}: ParameterDefinitionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-300">Parameter Definitions</h3>
        <button
          type="button"
          onClick={onAdd}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          + Add Parameter
        </button>
      </div>

      <div className="space-y-3">
        {paramDefs.map((param, index) => (
          <div key={param.id} className="flex gap-3 items-start">
            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Parameter Key:
              </label>
              <input
                type="text"
                value={param.key}
                onChange={(e) => onChange(index, 'key', e.target.value)}
                className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
                placeholder="damage"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Display Label:
              </label>
              <input
                type="text"
                value={param.label}
                onChange={(e) => onChange(index, 'label', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                placeholder="Damage Value"
              />
            </div>
            <button
              type="button"
              onClick={() => onRemove(param.id)}
              className="mt-7 p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              title="Remove parameter"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
