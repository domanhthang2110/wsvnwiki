'use client';

import React, { useState } from 'react';
import { SkillItem } from '@/types/skills';
import IconFrame from '@/components/shared/IconFrame';
import InfoModal from '@/components/ui/InfoModal';
import Dropdown from '@/components/ui/Dropdown/Dropdown';
import LongButton from '@/components/ui/LongButton';
import { formatFullSkillDescription, formatRange, formatSkillDescriptionForLevel, formatEnergyCost, formatEnergyCostForLevel, formatReducedEnergyRegenForLevel } from '@/utils/skillUtils';
import translations from '@/lib/locales/vi.json';

interface SkillDisplayProps {
  skills: SkillItem[];
}

// Extracted SkillInfoModal component
interface SkillInfoModalProps {
  skill: SkillItem;
  displayLevel: number;
  setDisplayLevel: (level: number) => void;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  footer: (modalWidth: number) => React.ReactNode;
  showPvp: boolean;
  setShowPvp: (show: boolean) => void;
}

const getActivationTypeTranslation = (type: 'Active' | 'Passive' | 'Permanent' | string | null) => {
  switch (type) {
    case 'Active':
      return translations.active;
    case 'Passive':
      return translations.passive;
    case 'Permanent':
      return translations.permanent;
    default:
      return type;
  }
};

export const SkillInfoModal: React.FC<SkillInfoModalProps> = ({ skill, displayLevel, setDisplayLevel, onClose, onNext, onPrevious, footer, showPvp, setShowPvp }) => (
  <InfoModal
    isOpen={!!skill}
    onClose={onClose}
    data={skill}
    size="sm"
    onNext={onNext}
    onPrevious={onPrevious}
    footer={footer}
  >
    <button
      onClick={() => setShowPvp(!showPvp)}
      className="absolute top-4 right-4 z-[110] transition-opacity duration-200"
      style={{ opacity: showPvp ? 1 : 0.5 }}
      title={showPvp ? "Hide PVP" : "Show PVP"}
    >
      <img src="/image/ui/pvp_button.webp" alt="PVP Toggle" className="w-8 h-8" />
    </button>
    <div className="mt-4">
      <div className="flex flex-col">
        <p><strong>{translations.activation_type}:</strong> <span style={{ color: '#9dee05' }}>{getActivationTypeTranslation(skill.activation_type)}</span></p>
        {(skill.activation_type === 'Active' || skill.activation_type === 'Permanent') && (
          <>
            {(skill.activation_type === 'Active' || skill.activation_type === 'Permanent') && skill.cooldown && (
              <p><strong>{translations.cooldown}:</strong> <span style={{ color: '#9dee05' }}>{skill.cooldown}s</span></p>
            )}
            {skill.activation_type === 'Active' && skill.range && (
              <p><strong>{translations.range}:</strong> <span style={{ color: '#9dee05' }}>{formatRange(skill.range)}</span></p>
            )}
            <p><strong>Năng lượng:</strong> <span style={{ color: '#9dee05' }}>{displayLevel === 0 ? formatEnergyCost(skill.energy_cost) : formatEnergyCostForLevel(skill, displayLevel)}</span></p>
            {skill.activation_type === 'Permanent' && skill.reduced_energy_regen && (
              <p><strong>{translations.reduced_energy_regen}:</strong> <span style={{ color: '#9dee05' }}>
                {displayLevel === 0
                  ? Object.values(skill.reduced_energy_regen as Record<number, number>).join(' / ')
                  : formatReducedEnergyRegenForLevel(skill, displayLevel)}
              </span></p>
            )}
          </>
        )}
      </div>
    </div>
    <div className="mt-4">
      {/* Only show Dropdown if max_level > 1 */}
      {skill.max_level && skill.max_level > 1 && (
        <div className="flex items-center justify-center mb-4">
          <Dropdown
            title={displayLevel === 0 ? 'Mô tả' : `Cấp ${displayLevel}`}
            width="250px"
            showArrows
            dropdownDisabled={skill.max_level <= 1}
            onPrevious={() => setDisplayLevel((displayLevel - 1 + (skill.max_level || 0) + 1) % ((skill.max_level || 0) + 1))}
            onNext={() => setDisplayLevel((displayLevel + 1) % ((skill.max_level || 0) + 1))}
          >
            {['Mô tả'].concat(Array.from({ length: skill.max_level || 0 }, (_, i) => `Cấp ${i + 1}`)).map((option, index) => (
              <a
                key={option}
                href="#"
                className={displayLevel === index ? 'selected' : ''}
                onClick={() => {
                  setDisplayLevel(index);
                }}
              >
                {option}
              </a>
            ))}
          </Dropdown>
        </div>
      )}
      <div className="min-h-[6em]">
        {displayLevel === 0 ? (
          <p dangerouslySetInnerHTML={{ __html: formatFullSkillDescription(skill, showPvp) }} />
        ) : (
          <p dangerouslySetInnerHTML={{ __html: formatSkillDescriptionForLevel(skill, displayLevel, showPvp) }} />
        )}
      </div>
    </div>
  </InfoModal>
);

const SkillDisplay: React.FC<SkillDisplayProps> = ({ skills }) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [displayLevel, setDisplayLevel] = useState(0);
  const [showPvp, setShowPvp] = useState(true);

  const handleSkillClick = (skill: SkillItem) => {
    setSelectedSkill(skill);
    setDisplayLevel(0);
  };

  const handleCloseModal = () => {
    setSelectedSkill(null);
  };

  const handleNextSkill = () => {
    if (!selectedSkill) return;
    const currentIndex = skills.findIndex(s => s.id === selectedSkill.id);
    const nextIndex = (currentIndex + 1) % skills.length;
    setSelectedSkill(skills[nextIndex]);
  };

  const handlePreviousSkill = () => {
    if (!selectedSkill) return;
    const currentIndex = skills.findIndex(s => s.id === selectedSkill.id);
    const previousIndex = (currentIndex - 1 + skills.length) % skills.length;
    setSelectedSkill(skills[previousIndex]);
  };

  // Group skills by type
  const raceAndEquipmentSkills = skills.filter(s => s.skill_type === 'Race' || s.skill_type === 'Equipment');
  const basicSkills = skills.filter(s => s.skill_type === 'Basic');
  const expertSkills = skills.filter(s => s.skill_type === 'Expert');

  // Helper to render a section
  const renderSkillSection = (header: string, skillList: SkillItem[]) => (
    skillList.length > 0 && (
      <div className="mb-6">
        <div className="bg-[#3a2a2a] border-t border-b border-[#e6ce63] text-center w-full mb-2 py-1">
          <h3 className="text-lg font-semibold text-[#e6ce63]" style={{ textShadow: '1px 1px 1px #000' }}>{header}</h3>
        </div>
        <div className="w-full flex justify-center px-10">
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
            {skillList.map((skill) => (
              <div
                key={skill.id}
                className="w-20 flex flex-col items-center cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => handleSkillClick(skill)}
              >
                <IconFrame
                  size={64}
                  styleType="yellow"
                  altText={skill.name ?? undefined}
                  contentImageUrl={skill.icon_url ?? undefined}
                />
                <p className="text-sm text-center mt-1">{skill.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="flex flex-col gap-4">
      {renderSkillSection('Nội tại', raceAndEquipmentSkills)}
      {renderSkillSection('Kỹ năng cơ bản', basicSkills)}
      {renderSkillSection('Kỹ năng nâng cao', expertSkills)}

      {selectedSkill && (
        <SkillInfoModal
          skill={selectedSkill}
          displayLevel={displayLevel}
          setDisplayLevel={setDisplayLevel}
          onClose={handleCloseModal}
          onNext={handleNextSkill}
          onPrevious={handlePreviousSkill}
          showPvp={showPvp}
          setShowPvp={setShowPvp}
          footer={() => (
            <div className="flex items-center justify-center gap-2">
              <LongButton
                width={40}
                text="<<"
                onClick={handlePreviousSkill}
              />
              <LongButton
                width={280}
                text="Đóng"
                onClick={handleCloseModal}
              />
              <LongButton
                width={40}
                text=">>"
                onClick={handleNextSkill}
              />
            </div>
          )}
        />
      )}
    </div>
  );
};

export default SkillDisplay;
