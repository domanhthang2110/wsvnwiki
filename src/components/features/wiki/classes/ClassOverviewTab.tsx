import React, { useState } from 'react';
import Image from 'next/image';
import { ClassItem } from '@/types/classes';
import styles from './ClassOverviewTab.module.css';
import IconFrame from '@/components/shared/IconFrame';
import { CLASSES_DATA } from '@/lib/data/classesData';
import LongButton from '@/components/ui/LongButton';
import { SkillItem } from '@/types/skills';
import { SkillInfoModal } from './SkillDisplay';

interface ClassOverviewTabProps {
  classItem: ClassItem | null;
  // theme: 'dark' | 'light'; // Remove this line
}

const ClassOverviewTab: React.FC<ClassOverviewTabProps> = ({ classItem }) => {
  const classData = CLASSES_DATA.find(c => c.name === classItem?.name);

  const sideIcon = classData?.side === 'Sentinel' ? '/image/factions/elf_badge.webp' : '/image/factions/mc_badge.webp';

  // --- Skill Modal State and Logic (copied from SkillDisplay) ---
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [displayLevel, setDisplayLevel] = useState(0);
  const skillsToShow: SkillItem[] = Array.isArray(classItem?.skills)
    ? [...classItem.skills.filter((s: SkillItem) => s.skill_type === 'Race'), ...classItem.skills.filter((s: SkillItem) => s.skill_type === 'Equipment')]
    : [];

  const handleSkillClick = (skill: SkillItem) => {
    setSelectedSkill(skill);
    setDisplayLevel(0);
  };
  const handleCloseModal = () => setSelectedSkill(null);
  const handleNextSkill = () => {
    if (!selectedSkill) return;
    const currentIndex = skillsToShow.findIndex((s: SkillItem) => s.id === selectedSkill.id);
    const nextIndex = (currentIndex + 1) % skillsToShow.length;
    setSelectedSkill(skillsToShow[nextIndex]);
    setDisplayLevel(0);
  };
  const handlePreviousSkill = () => {
    if (!selectedSkill) return;
    const currentIndex = skillsToShow.findIndex((s: SkillItem) => s.id === selectedSkill.id);
    const previousIndex = (currentIndex - 1 + skillsToShow.length) % skillsToShow.length;
    setSelectedSkill(skillsToShow[previousIndex]);
    setDisplayLevel(0);
  };
  // -------------------------------------------------------------

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        {classItem?.image_assets?.banner && (
          <video
            src={classItem.image_assets.banner}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className={styles.bannerImage}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <div className={styles.classHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <IconFrame size={64} styleType="yellow" altText={classItem?.name} contentImageUrl={classItem?.image_assets?.logo || null} priority={true} />
              <div className={styles.classInfo}>
                <h2 className={styles.className} style={{ fontSize: '1.6rem' }}>{classItem?.name}</h2>
                {classData && (
                  <div className={styles.factionInfo}>
                    <Image
                      draggable={false}
                      src={classData.faction_icon}
                      alt={classData.faction}
                      width={20}
                      height={20}
                      style={{ border: '1px solid #e6ce63', background: '#222', marginRight: 6 }}
                      priority={true}
                    />
                    <span style={{ marginLeft: 2 }}>{classData.faction}</span>
                  </div>
                )}
              </div>
            </div>
            {classData && (
              <div className={styles.sideIcon}>
                <Image draggable={false} src={sideIcon} alt={classData.side} layout="fill" />
              </div>
            )}
          </div>
          <div className={styles.relicInspiredHeader}>
            <h3>Nội tại</h3>
          </div>
          {/* Race/Equipment Skills Grid */}
          {skillsToShow.length > 0 && (
            <div className={styles.passiveSkillsGrid}>
              {skillsToShow.map(skill => (
                <div
                  key={skill.id}
                  className={styles.passiveSkillItem}
                  onClick={() => handleSkillClick(skill)}
                >
                  <IconFrame
                    size={48}
                    styleType="yellow"
                    altText={skill.name ?? undefined}
                    contentImageUrl={skill.icon_url ?? undefined}
                  />
                  <span className={styles.passiveSkillName}>{skill.name}</span>
                </div>
              ))}
            </div>
          )}
          {/* Skill Modal (use extracted SkillInfoModal) */}
          {selectedSkill && (
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
          <div className={styles.relicInspiredHeader}>
            <h3>Giới thiệu</h3>
          </div>
          <div className={`${styles.introduction} ${styles.themedContent}`}>
            <div dangerouslySetInnerHTML={{ __html: classItem?.description || '' }} />
          </div>
        </div>
        <div className={styles.separator}>
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.relicInspiredHeader}>
            <h3>Tiểu sử</h3>
          </div>
          <div
            className={`${styles.loreContent} ${styles.themedContent}`}
            dangerouslySetInnerHTML={{ __html: classItem?.lore || 'Lore for this class is not available yet.' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ClassOverviewTab;
