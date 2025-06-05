import { SkillItem } from '@/types/skills';
import SkillCard from './SkillCard';

interface SkillSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: SkillItem[];
  selectedSkills: number[];
  onSkillToggle: (skillId: number) => void;
  onConfirm: (selectedIds: number[]) => void;
}

export default function SkillSelectorModal({
  isOpen,
  onClose,
  skills,
  selectedSkills,
  onSkillToggle,
  onConfirm
}: SkillSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-100">Select Skills</h2>
            <p className="text-sm text-gray-400 mt-1">
              {selectedSkills.length} skills selected
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6 text-gray-400 hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <div 
                key={skill.id} 
                onClick={() => onSkillToggle(skill.id)}
                className="transform transition-all duration-200 hover:scale-[1.02] cursor-pointer relative"
                style={{ 
                  width: '300px',
                  maxWidth: '100%'
                }}
              >
                <div className="relative z-10">
                  <SkillCard
                    skill={skill}
                    isSelected={selectedSkills.includes(skill.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-between items-center bg-gray-900">
          <span className="text-sm text-gray-400">
            Click on a skill card to select/deselect
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-gray-100 hover:bg-gray-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm(selectedSkills);
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Confirm Selection ({selectedSkills.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
