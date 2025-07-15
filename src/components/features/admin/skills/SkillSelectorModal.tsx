import { SkillItem } from '@/types/skills';
import SkillCard from '@/components/features/wiki/classes/SkillCard';
import { SKILL_TIER_OPTIONS } from '@/types/skills';
import { useState } from 'react';

interface SkillSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: SkillItem[];
  selectedSkills: number[];
  onSkillToggle: (skillId: number) => void;
  onConfirm: (selectedIds: number[]) => void;
  assignedSkillIds: Set<number>; // New prop
}

export default function SkillSelectorModal({
  isOpen,
  onClose,
  skills,
  selectedSkills,
  onSkillToggle,
  onConfirm,
  assignedSkillIds // Destructure new prop
}: SkillSelectorModalProps) {
  const [search, setSearch] = useState('');
  const [skillType, setSkillType] = useState<string>('');
  const [hideAssigned, setHideAssigned] = useState(false); // New state for toggle

  if (!isOpen) return null;

  // Filter skills by type, search, and assigned status
  const filteredSkills = skills.filter(skill => {
    const matchesType = skillType ? skill.skill_type === skillType : true;
    const name = skill.name?.toLowerCase() || '';
    const desc = skill.description?.toLowerCase() || '';
    const matchesSearch =
      name.includes(search.toLowerCase()) ||
      desc.includes(search.toLowerCase());
    
    const isAssigned = assignedSkillIds.has(skill.id);
    if (hideAssigned && isAssigned) {
      return false;
    }

    return matchesType && matchesSearch;
  });

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

        {/* Filters */}
        <div className="flex gap-4 p-4 border-b border-gray-700 bg-gray-900">
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ minWidth: 200 }}
          />
          <select
            value={skillType}
            onChange={e => setSkillType(e.target.value)}
            className="px-3 py-2 rounded-md bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {SKILL_TIER_OPTIONS.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-gray-300">
            <input
              type="checkbox"
              checked={hideAssigned}
              onChange={e => setHideAssigned(e.target.checked)}
              className="bg-gray-800 border-gray-600 rounded"
            />
            Hide skills already assigned to a class
          </label>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex flex-wrap gap-2">
            {filteredSkills.length === 0 && (
              <p className="text-gray-400 text-center w-full py-4">
                No skills found matching your criteria.
              </p>
            )}
            {filteredSkills.map(skill => (
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
                  />
                  {selectedSkills.includes(skill.id) && (
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
                  )}
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
