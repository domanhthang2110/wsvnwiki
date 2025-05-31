import { useState } from 'react';
import { SkillItem } from '@/types/skills';
import { formatFullSkillDescription } from '@/utils/skillUtils';
import { useFloating, offset, shift, flip, useHover, useInteractions } from '@floating-ui/react';
import { createPortal } from 'react-dom';

interface SkillCardProps {
  skill: SkillItem;
  onEdit?: (skill: SkillItem) => void;
  onDelete?: (skill: SkillItem) => void;
  isSelected?: boolean;
}

export default function SkillCard({ skill, onEdit, onDelete, isSelected }: SkillCardProps) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isTooltipOpen,
    onOpenChange: setIsTooltipOpen,
    middleware: [
      offset(10),
      shift({ padding: 5 }),
      flip({ padding: 5 }),
    ],
  });

  const hover = useHover(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  // Format energy cost for display
  const formatEnergyCost = (energyCost: Record<string, number> | undefined) => {
    if (!energyCost) return 'None';
    return Object.values(energyCost).join('/');
  };

  // Format range for display
  const formatRange = (range: number | undefined) => {
    if (!range) return undefined;
    return range === 1 ? 'Melee' : range.toString();
  };

  return (
    <>
      <div 
        ref={refs.setReference}
        {...getReferenceProps()}
        className={`relative p-2 w-64 group border rounded-lg bg-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer ${
          isSelected 
            ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' 
            : 'border-gray-700 hover:border-gray-600'
        }`}
      >
        <div className="flex items-start">
          {/* Icon */}
          <div className="w-12 h-12 flex-shrink-0 rounded bg-gray-700">
            {skill.icon_url ? (
              <img 
                src={skill.icon_url} 
                alt={skill.name || 'Skill icon'} 
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500 text-xs">No icon</span>
              </div>
            )}
          </div>

          {/* Info Section - with max width to prevent overflow into buttons */}
          <div className="flex-1 min-w-0 mx-3">
              <h3 className="text-sm font-medium text-gray-100 break-words leading-tight">
                {skill.name || 'Unnamed Skill'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {skill.skill_type}
              </p>
          </div>

          {/* Action Buttons - Now vertical */}
          <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(skill);
                }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(skill);
                }}
                className="p-1 text-red-400 hover:text-red-300"
                title="Delete skill"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating UI Tooltip */}
      {isTooltipOpen && createPortal(
        <div
          ref={refs.setFloating}
          {...getFloatingProps()}
          style={floatingStyles}
          className="z-50 w-80 p-4 bg-gray-900 rounded-lg shadow-xl border border-gray-700"
        >
          <div className="space-y-3">
            {/* Header with Icon and Basic Info */}
            <div className="flex items-start space-x-3">
              {skill.icon_url && (
                <img 
                  src={skill.icon_url} 
                  alt={skill.name || 'Skill details'} 
                  className="w-12 h-12 object-contain rounded"
                />
              )}
              <div className="flex-grow">
                <h3 className="text-base font-medium text-gray-100">{skill.name}</h3>
                <p className="text-xs text-gray-400">ID: {skill.id}</p>
                <p className="text-sm text-gray-300">
                  {skill.skill_type} • Level {skill.max_level} • {skill.activation_type}
                </p>
              </div>
            </div>

            {/* Skill Properties */}
            <div className="text-sm space-y-1">
              {skill.energy_cost && (
                <p>
                  <span className="text-gray-400">Energy Cost: </span>
                  <span className="text-gray-200">{formatEnergyCost(skill.energy_cost)}</span>
                </p>
              )}
              {skill.cooldown && (
                <p>
                  <span className="text-gray-400">Cooldown: </span>
                  <span className="text-gray-200">{skill.cooldown}</span>
                </p>
              )}
              {skill.reduced_energy_regen && (
                <p>
                  <span className="text-gray-400">Reduced Energy Regen: </span>
                  <span className="text-gray-200">{skill.reduced_energy_regen}</span>
                </p>
              )}
              {skill.range && (
                <p>
                  <span className="text-gray-400">Range: </span>
                  <span className="text-gray-200">{formatRange(skill.range)}</span>
                </p>
              )}
            </div>

            {/* Description */}
            <div className="text-sm">
              <p className="text-gray-200">{formatFullSkillDescription(skill)}</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}