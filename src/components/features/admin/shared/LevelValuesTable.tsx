import { TalentParameterDefinitionInForm, TalentLevelValue } from '@/types/talents';
import { SkillParameterDefinitionInForm, SkillLevelValue } from '@/types/skills';

type ParameterDefinition = TalentParameterDefinitionInForm | SkillParameterDefinitionInForm;
type LevelValue = TalentLevelValue | SkillLevelValue;

interface LevelValuesTableProps {
  maxLevel: number;
  paramDefs: ParameterDefinition[];
  levelValues: LevelValue[];
  onChange: (level: number, param: string, value: string) => void;
}

export default function LevelValuesTable({
  maxLevel,
  paramDefs,
  levelValues,
  onChange
}: LevelValuesTableProps) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-300 mb-4">Level Values</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-600">
          <thead>
            <tr>
              <th className="px-4 py-3 bg-gray-700 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Level
              </th>
              {paramDefs.map(param => (
                <th
                  key={param.id}
                  className="px-4 py-3 bg-gray-700 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  {param.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {Array.from({ length: maxLevel }, (_, i) => i + 1).map(level => {
              const levelData = levelValues.find(lv => lv.level === level) || { level };
              return (
                <tr key={level} className="hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm text-gray-100">
                    {level}
                  </td>
                  {paramDefs.map(param => (
                    <td key={param.id} className="px-4 py-3">
                      <input
                        type="text"
                        value={levelData[param.key] || ''}
                        onChange={(e) => onChange(level, param.key, e.target.value)}
                        className="w-full p-2 text-sm border border-gray-600 rounded-md bg-gray-700 text-gray-100"
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
