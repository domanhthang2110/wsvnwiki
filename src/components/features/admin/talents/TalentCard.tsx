'use client';

import { TalentItem } from '@/types/talents';
import { formatFullTalentDescription, formatKnowledgeCost } from '@/utils/talentUtils';

interface TalentCardProps {
  talent: TalentItem;
  onEdit?: (talent: TalentItem) => void;
  onDelete?: (talent: TalentItem) => void;
  isSelected?: boolean;
}

export default function TalentCard({ talent, onEdit, onDelete, isSelected }: TalentCardProps) {
  const formattedDescription = formatFullTalentDescription(talent);
  const knowledgeCostString = formatKnowledgeCost(talent.knowledge_levels);

  return (
    <div 
      className={`relative p-4 group border rounded-lg bg-gray-800 shadow-sm hover:shadow-md transition-all ${
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' 
          : 'border-gray-700 hover:border-gray-600'
      }`}
    >
      <div className="flex items-start">
        {/* Icon */}
        <div className="w-12 h-12 flex-shrink-0 rounded bg-gray-700">
          {talent.icon_url ? (
            <img 
              src={talent.icon_url} 
              alt={talent.name || 'Talent icon'} 
              className="w-full h-full object-cover rounded"
              onError={(e) => (e.currentTarget.src = 'https://placehold.co/48x48/374151/9CA3AF?text=?')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-500 text-xs">No icon</span>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 min-w-0 mx-3">
            <h3 className="text-sm font-medium text-gray-100 break-words leading-tight">
              {talent.name || 'Unnamed Talent'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {talent.type || 'N/A Type'} - Max Level: {talent.max_level}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {formattedDescription}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Knowledge: {knowledgeCostString}
            </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(talent);
              }}
              className="p-1 text-blue-400 hover:text-blue-300"
              title="Edit talent"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(talent);
              }}
              className="p-1 text-red-400 hover:text-red-300"
              title="Delete talent"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
