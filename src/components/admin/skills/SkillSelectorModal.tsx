import { useState } from 'react';
import { SkillItem } from '@/types/skills';
import SkillCard from './SkillCard';

interface SkillSelectorModalProps {
  skills: SkillItem[];
  selectedSkillIds: number[];
  onClose: () => void;
  onConfirm: (selectedIds: number[]) => void;
}

export default function SkillSelectorModal({
  skills,
  selectedSkillIds,
  onClose,
  onConfirm,
}: SkillSelectorModalProps) {
  const [localSelectedIds, setLocalSelectedIds] = useState<number[]>(selectedSkillIds);
  const [tooltipSkill, setTooltipSkill] = useState<SkillItem | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent, skill: SkillItem) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    setTooltipSkill(skill);
  };

  const handleMouseLeave = () => {
    setTooltipSkill(null);
  };

  const toggleSkill = (skillId: number) => {
    setLocalSelectedIds(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100">Select Skills</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map(skill => (
              <div
                key={skill.id}
                className={`relative cursor-pointer transition-all ${
                  localSelectedIds.includes(skill.id)
                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800'
                    : ''
                }`}
                onClick={() => toggleSkill(skill.id)}
                onMouseMove={(e) => handleMouseMove(e, skill)}
                onMouseLeave={handleMouseLeave}
              >
                <SkillCard skill={skill} />
              </div>
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {tooltipSkill && (
          <div
            className="fixed bg-gray-900 p-4 rounded shadow-xl border border-gray-700 z-50 max-w-sm pointer-events-none"
            style={{
              left: mousePos.x + 16,
              top: mousePos.y + 16
            }}
          >
            <h3 className="text-gray-100 font-medium mb-2">{tooltipSkill.name}</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p><span className="text-gray-400">Type:</span> {tooltipSkill.skill_type}</p>
              <p><span className="text-gray-400">Activation:</span> {tooltipSkill.activation_type}</p>
              {tooltipSkill.cooldown && (
                <p><span className="text-gray-400">Cooldown:</span> {tooltipSkill.cooldown}</p>
              )}
              {tooltipSkill.range && (
                <p><span className="text-gray-400">Range:</span> {tooltipSkill.range}</p>
              )}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-300 hover:text-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(localSelectedIds)}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}
