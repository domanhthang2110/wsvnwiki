'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { formatFullSkillDescription } from '@/utils/skillUtils';
import { SkillItem } from '@/types/skills';

interface ClassSkillInfo {
  id: number;
  name: string;
  description: string;
  skills: {
    name: string;
    description: string;
  }[];
}

export default function ClassInfoQuery() {
  const [classesData, setClassesData] = useState<ClassSkillInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryClassesInfo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          id,
          name,
          description,
          skills:class_skills(
            skill:skills(
              id, name, description, activation_type, skill_type, cooldown, range, 
              level_values, parameters_definition, max_level, energy_cost, reduced_energy_regen
            )
          )
        `)
        .order('name', { ascending: true });

      if (error) throw error;

      const transformedData = data?.map(cls => ({
        id: cls.id,
        name: cls.name,
        description: cls.description || '',
        skills: cls.skills?.map((s: any) => {
          const skill = s.skill as SkillItem;
          const formattedDescription = formatFullSkillDescription(skill);
          return {
            name: skill.name,
            description: formattedDescription
          };
        }) || []
      })) || [];

      setClassesData(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadJson = () => {
    const output = classesData.map(cls => ({
      name: cls.name,
      description: cls.description,
      skills: cls.skills.map(skill => ({
        name: skill.name,
        description: skill.description.replace(/<[^>]*>/g, '') // Remove HTML tags
      }))
    }));

    const jsonString = JSON.stringify(output, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'classes-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
      <div className="flex gap-2 mb-4">
        <button
          onClick={queryClassesInfo}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Query Classes Info'}
        </button>
        
        {classesData.length > 0 && (
          <button
            onClick={downloadJson}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Download JSON
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 rounded">
          Error: {error}
        </div>
      )}

      {classesData.length > 0 && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {classesData.map(cls => (
            <div key={cls.id} className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                {cls.name}
              </h3>
              {cls.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 italic">
                  {cls.description}
                </p>
              )}
              <div className="mt-2 space-y-1">
                {cls.skills.map((skill, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {skill.name}:
                    </span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {skill.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}