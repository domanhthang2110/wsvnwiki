'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './SkillsPage.module.css';
import { InputField } from '@/components/ui/InputField';
import { SkillsService } from '@/services/skillsService';
import { SkillItem } from '@/types/skills';
import IconFrame from '@/components/shared/IconFrame';
import Image from 'next/image';
import { SkillInfoModal } from '@/components/features/wiki/classes/SkillDisplay';
import LongButton from '@/components/ui/LongButton';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

const SkillsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [skills, setSkills] = useState<Pick<SkillItem, 'id' | 'name' | 'icon_url'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchWidth, setSearchWidth] = useState(400);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [displayLevel, setDisplayLevel] = useState(0);

  const handleSkillClick = async (skill: Pick<SkillItem, 'id' | 'name' | 'icon_url'>) => {
    setIsModalLoading(true);
    try {
      const fullSkillData = await SkillsService.getSkillById(skill.id);
      setSelectedSkill(fullSkillData);
    } catch (err) {
      console.error('Failed to fetch skill details', err);
      // Optionally, show an error in the modal
    } finally {
      setIsModalLoading(false);
      setDisplayLevel(0);
    }
  };

  const handleCloseModal = () => {
    setSelectedSkill(null);
  };

  const handleNextSkill = () => {
    if (!selectedSkill) return;
    const currentIndex = filteredSkills.findIndex(s => s.id === selectedSkill.id);
    const nextIndex = (currentIndex + 1) % filteredSkills.length;
    handleSkillClick(filteredSkills[nextIndex]);
  };

  const handlePreviousSkill = () => {
    if (!selectedSkill) return;
    const currentIndex = filteredSkills.findIndex(s => s.id === selectedSkill.id);
    const previousIndex = (currentIndex - 1 + filteredSkills.length) % filteredSkills.length;
    handleSkillClick(filteredSkills[previousIndex]);
  };

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skillsData = await SkillsService.getSkillList();
        setSkills(skillsData);
      } catch (err) {
        setError('Failed to fetch skills.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  useEffect(() => {
    const calculateSearchWidth = () => {
      if (searchContainerRef.current) {
        const containerWidth = searchContainerRef.current.offsetWidth;
        const newWidth = Math.max(200, Math.min(600, containerWidth - 20));
        setSearchWidth(newWidth);
      }
    };

    calculateSearchWidth();
    window.addEventListener('resize', calculateSearchWidth);
    return () => window.removeEventListener('resize', calculateSearchWidth);
  }, []);

  const filteredSkills = skills.filter(
    (skill) =>
      skill.name &&
      skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`${styles.pixelBackground} flex flex-col w-full h-full text-white`}>
      <div className="flex-shrink-0 p-4 border-b-[3px] border-double border-[#e6ce63]" style={{ backgroundColor: '#3e2e2b' }}>
        <div className={styles.searchContainer} ref={searchContainerRef}>
          <InputField
            placeholder="Search for skills..."
            value={searchTerm}
            width={searchWidth}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            leftIcon={
              <Image
                src="/image/spyglass.webp"
                alt="Search"
                width={20}
                height={20}
                className="object-contain"
                draggable={false}
              />
            }
            iconOffsetLeft={8}
            textOffsetLeft={32}
          />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto" style={{ backgroundColor: 'rgb(0,0,0, 0.5)' }}>
        <div className="p-4 border-[3px] border-double border-[#e6ce63] h-full">
          {isLoading && <LoadingOverlay />}
          {error && <p>{error}</p>}
          {!isLoading && !error && (
            <div className={styles.skillsGrid}>
              {filteredSkills.map((skill) => (
                <div key={skill.id} className={styles.skillItem}>
                  <IconFrame
                    contentImageUrl={skill.icon_url}
                    altText={skill.name || undefined}
                    size={64}
                    onClick={() => handleSkillClick(skill)}
                  />
                  <span className={styles.skillName}>{skill.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {isModalLoading && <LoadingOverlay darkened />}
      {selectedSkill && !isModalLoading && (
        <SkillInfoModal
          skill={selectedSkill}
          displayLevel={displayLevel}
          setDisplayLevel={setDisplayLevel}
          onClose={handleCloseModal}
          onNext={handleNextSkill}
          onPrevious={handlePreviousSkill}
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

export default SkillsPage;
