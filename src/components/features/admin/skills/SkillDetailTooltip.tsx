'use client';

import NextImage from 'next/image';
import { 
  useFloating, 
  offset, 
  shift, 
  flip, 
  autoUpdate, 
  FloatingPortal,
  // Re-import the interaction hooks we need
  useDismiss,
  useInteractions
} from '@floating-ui/react';
import { SkillItem } from '@/types/skills';
import { formatEnergyCost, formatFullSkillDescription, formatRange } from '@/utils/skillUtils';

interface SkillDetailTooltipProps {
  skill: SkillItem | null;
  isOpen: boolean;
  onClose: () => void; // <-- ADD THIS PROP BACK
  referenceElement: HTMLElement | null;
}

export default function SkillDetailTooltip({ skill, isOpen, onClose, referenceElement }: SkillDetailTooltipProps) {
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    // ADD onOpenChange BACK - This is called by the interaction hooks
    onOpenChange: (open) => {
      if (!open) {
        onClose(); // Call the parent's onClose function when dismissed
      }
    },
    middleware: [offset(10), shift({ padding: 5 }), flip({ padding: 5 })],
    elements: { reference: referenceElement },
    whileElementsMounted: autoUpdate,
  });

  // ADD THE DISMISS HOOK BACK
  const dismiss = useDismiss(context);

  // ADD THE INTERACTIONS HOOK BACK, using only dismiss
  const { getFloatingProps } = useInteractions([
    dismiss
  ]);

  if (!isOpen || !skill) return null;

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        {...getFloatingProps()} // <-- APPLY THE FLOATING PROPS
        style={floatingStyles}
        className="z-[100] w-80 p-4 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700"
      >
        {/* The JSX content does not need to change */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            {skill.icon_url && <NextImage src={skill.icon_url} alt={skill.name || ''} width={48} height={48} className="w-12 h-12 object-contain rounded bg-gray-800 p-1" />}
            <div className="flex-grow">
              <h3 className="text-base font-medium text-gray-100">{skill.name || "Unnamed Skill"}</h3>
              <p className="text-xs text-gray-400">ID: {skill.id}</p>
              <p className="text-sm text-gray-300">{skill.skill_type || "N/A Type"}{skill.max_level && ` • Level ${skill.max_level}`}{skill.activation_type && ` • ${skill.activation_type}`}</p>
            </div>
          </div>
          <div className="text-sm space-y-1">
            {skill.energy_cost && <p><span className="text-gray-400">Energy Cost: </span><span className="text-gray-200">{formatEnergyCost(skill.energy_cost)}</span></p>}
            {skill.cooldown != null && <p><span className="text-gray-400">Cooldown: </span><span className="text-gray-200">{skill.cooldown}s</span></p>}
            {skill.range != null && <p><span className="text-gray-400">Range: </span><span className="text-gray-200">{formatRange(skill.range)}</span></p>}
          </div>
          <div className="text-sm">
            <p className="text-gray-200">{formatFullSkillDescription(skill)}</p>
          </div>
        </div>
      </div>
    </FloatingPortal>
  );
}
