import { useState } from 'react';
import { SkillItem } from '@/types/skills';
import { formatFullSkillDescription } from '@/utils/skillUtils';

interface SkillCardProps {
  skill: SkillItem;
  onEdit?: (skill: SkillItem) => void;
  onDelete?: (skill: SkillItem) => void;
}

export default function SkillCard({ skill, onEdit, onDelete }: SkillCardProps) {
  const [showMediaGallery, setShowMediaGallery] = useState(false);

  return (
    <div className="relative group p-4 border border-gray-700 rounded-lg bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      {/* Icon and Name */}
      <div className="flex items-center space-x-3 mb-2">
        <div className="relative w-10 h-10 flex-shrink-0">
          {skill.icon_url ? (
            <img 
              src={skill.icon_url} 
              alt={skill.name || 'Skill icon'} 
              className="w-full h-full object-contain rounded"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 rounded flex items-center justify-center">
              <span className="text-gray-500 text-xs">No icon</span>
            </div>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="text-sm font-medium text-gray-100 truncate">
            {skill.name || 'Unnamed Skill'}
          </h3>
          <p className="text-xs text-gray-400">
            ID: {skill.id} • {skill.activation_type} • Level {skill.max_level} • {skill.skill_type}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={() => onEdit(skill)}
            className="p-1 text-blue-400 hover:text-blue-300"
            title="Edit skill"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(skill)}
            className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            title="Delete skill"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Description Preview */}
      <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-2">
        {formatFullSkillDescription(skill)}
      </p>
    </div>
  );
}