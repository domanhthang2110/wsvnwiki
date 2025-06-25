'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import ClassSimpleCard from './ClassSimpleCard';
import { ClassItem } from '@/types/classes';
import { CLASSES_DATA, FACTION_ORDER, SIDE_ORDER } from '@/lib/data/classesData';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMediaQuery } from 'react-responsive';
import { useMounted } from '@/hooks/use-mounted';
import { motion, AnimatePresence } from 'framer-motion';
import IconFrame from '@/components/shared/IconFrame';
import SkillCard from './SkillCard';
import headerStyles from './ClassDetailHeader.module.css';
import TalentTreeView from './TalentTreeView';
import Dropdown from '@/components/ui/Dropdown/Dropdown';
import { supabase } from '@/lib/supabase/client';
import { TalentItem } from '@/types/talents';

interface ClassContentProps {
  classes: ClassItem[];
}

const ClassContent: React.FC<ClassContentProps> = ({ classes }) => {
  const [currentSideIndex, setCurrentSideIndex] = useState(0);
  const [currentFactionIndex, setCurrentFactionIndex] = useState(0);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Skills' | 'Talents'>('Overview');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const displayTen = useMediaQuery({ query: '(min-width: 1024px)' });
  const mounted = useMounted();
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClassListCollapsed, setIsClassListCollapsed] = useState(false); // New state for collapsing
  const [fetchedTalents, setFetchedTalents] = useState<Record<number, TalentItem[]>>({});

  const groupedClasses = useMemo(() => {
    const groups: Record<string, ClassItem[]> = {};
    for (const faction of FACTION_ORDER) {
      groups[faction] = [];
    }
    for (const classItem of classes) {
      const info = CLASSES_DATA.find(c => c.name === classItem.name);
      if (info) {
        groups[info.faction].push(classItem);
      }
    }
    return groups;
  }, [classes]);

  const handleOpenDetail = async (classItem: ClassItem) => {
    setSelectedClass(classItem);
    setActiveTab('Overview');
    if (classItem.talent_tree && !fetchedTalents[classItem.talent_tree.id]) {
      const talentTree = classItem.talent_tree;
      if (talentTree && talentTree.talents_data) {
        const talentIds = talentTree.talents_data
          .filter(t => t.type === 'talent' && t.talent_id)
          .map(t => t.talent_id as number);

        if (talentIds.length > 0) {
          const { data, error } = await supabase
            .from('talents')
            .select('*')
            .in('id', talentIds);

          if (error) {
            console.error('Error fetching talents:', error);
            return;
          }
          setFetchedTalents(prev => ({ ...prev, [talentTree.id]: data as TalentItem[] }));
        }
      }
    }
  };


  const handleScroll = (direction: 'left' | 'right') => {
    if (displayTen) {
      const newIndex = direction === 'right'
        ? (currentSideIndex + 1) % SIDE_ORDER.length
        : (currentSideIndex - 1 + SIDE_ORDER.length) % SIDE_ORDER.length;
      setCurrentSideIndex(newIndex);
    } else {
      const newIndex = direction === 'right'
        ? (currentFactionIndex + 1) % FACTION_ORDER.length
        : (currentFactionIndex - 1 + FACTION_ORDER.length) % FACTION_ORDER.length;
      setCurrentFactionIndex(newIndex);
    }
  };

  const onWheel = useCallback((event: React.WheelEvent) => {
    if (isAnimating) return; // Prevent scrolling if animation is playing

    if (event.deltaY > 0) {
      handleScroll('right');
      setDirection(1); // Set direction for right scroll
    } else {
      handleScroll('left');
      setDirection(-1); // Set direction for left scroll
    }
  }, [isAnimating, currentSideIndex, currentFactionIndex, displayTen]);

  const renderClasses = () => {
    if (displayTen) {
      const side = SIDE_ORDER[currentSideIndex];
      const factionsInSide = FACTION_ORDER.filter(f => {
        const classItems = groupedClasses[f];
        const firstClass = classItems ? classItems[0] : undefined;
        const info = firstClass ? CLASSES_DATA.find(c => c.name === firstClass.name) : null;
        return info?.side === side;
      });

      return (
        <div className="flex w-full justify-around items-start">
          {factionsInSide.map((faction, index) => (
            <React.Fragment key={faction}>
              <div className="flex flex-col items-center gap-y-2">
                <h4 className="text-lg font-semibold">{faction}</h4>
                <div className="flex flex-row items-center justify-center gap-2 md:gap-4">
                  {groupedClasses[faction].map(classItem => (
                    <ClassSimpleCard
                      key={classItem.id}
                      classItem={classItem}
                      onOpenDetail={() => handleOpenDetail(classItem)}
                    />
                  ))}
                </div>
              </div>
              {index < factionsInSide.length - 1 && (
                <div className="flex items-center justify-center h-[116px] text-2xl text-yellow-400 self-center">❖</div>
              )}
            </React.Fragment>
          ))}
        </div>
      );
    } else {
      const faction = FACTION_ORDER[currentFactionIndex];
      const classesToRender = groupedClasses[faction] || [];
      return classesToRender.map((classItem) => (
        <ClassSimpleCard
          key={classItem.id}
          classItem={classItem}
          onOpenDetail={() => handleOpenDetail(classItem)}
        />
      ));
    }
  };

  const paginate = (newDirection: number) => {
    const scrollDirection = newDirection > 0 ? 'right' : 'left';
    handleScroll(scrollDirection);
    setDirection(newDirection);
  };

  const getHeaderContent = () => {
    if (displayTen) {
      return SIDE_ORDER[currentSideIndex];
    } else {
      return (
        <div className="flex items-center justify-center">
          <button onClick={() => paginate(-1)} className="" disabled={isAnimating}>
            <Image src="/image/arrow_button.svg" alt="Previous" width={45} height={39} className="hover:brightness-125 transition-all duration-200" />
          </button>
          <Dropdown
            title={FACTION_ORDER[currentFactionIndex]}
            width="210px"
          >
            {FACTION_ORDER.map((faction, index) => (
              <a
                key={faction}
                href="#"
                className={currentFactionIndex === index ? 'selected' : ''}
                onClick={() => {
                  setCurrentFactionIndex(index);
                }}
              >
                <Image src={`/image/factions/${faction.toLowerCase().replace(' ', '-')}/icon.webp`} alt={`${faction} icon`} width={24} height={24} />
                {faction}
              </a>
            ))}
          </Dropdown>
          <button onClick={() => paginate(1)} className="" disabled={isAnimating}>
            <Image src="/image/arrow_button.svg" alt="Next" width={45} height={39} className="scale-x-[-1] hover:brightness-125 transition-all duration-200" />
          </button>
        </div>
      );
    }
  };

  const classesToDisplay = renderClasses();

  const memoizedTalentTreeView = useMemo(() => {
    if (selectedClass?.talent_tree) {
      const talentTree = selectedClass.talent_tree;
      const talents = fetchedTalents[talentTree.id] || [];
      return <TalentTreeView talentTree={talentTree} talents={talents} />;
    }
    return <p>No talent tree available for {selectedClass?.name}.</p>;
  }, [selectedClass, fetchedTalents]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction > 0 ? -1000 : 1000, // Corrected exit direction
      opacity: 0
    })
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col w-full">
      <div className={`relative p-2 border border-[#e6ce63] shadow-lg bg-gray-900/20 text-white w-full transition-all duration-300 ${isClassListCollapsed ? 'h-16' : 'h-auto'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-center flex-grow">
            {getHeaderContent()}
          </h3>
          <button
            onClick={() => setIsClassListCollapsed(!isClassListCollapsed)}
            className="absolute top-2 right-2 p-1"
          >
            {isClassListCollapsed ? <ChevronLeft className="rotate-90" /> : <ChevronRight className="-rotate-90" />}
          </button>
        </div>
        {!isClassListCollapsed && (
          <div className="relative h-[150px] md:h-[170px] overflow-hidden pt-2">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={displayTen ? currentSideIndex : currentFactionIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "tween", ease: "easeInOut", duration: 0.4 },
                  opacity: { duration: 0.4 }
                }}
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationComplete={() => setIsAnimating(false)}
                className={`absolute w-full top-1/2 -translate-y-1/2 flex flex-row items-center justify-center gap-2 md:gap-4 pb-2 flex-nowrap flex-shrink-0`}
                onWheel={onWheel}
              >
                {classes.length > 0 ? classesToDisplay : <p>No classes found.</p>}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
      {selectedClass && (
        <div className={headerStyles.header}>
              <button
                className={`${headerStyles.tabButton} ${headerStyles.overview} ${activeTab === 'Overview' ? headerStyles.active : ''} ${activeTab === 'Overview' ? headerStyles.expanded : ''}`}
                onClick={() => setActiveTab('Overview')}
              >
                <Image src={selectedClass.image_assets?.logo || ''} alt="Overview" width={32} height={32} className={headerStyles.tabIcon} />
                {activeTab === 'Overview' && <span className={headerStyles.tabName}>{selectedClass.name}</span>}
              </button>
              <button
                className={`${headerStyles.tabButton} ${activeTab === 'Skills' ? headerStyles.active : ''} ${activeTab === 'Skills' ? headerStyles.expanded : ''}`}
                onClick={() => setActiveTab('Skills')}
              >
                <Image src="/image/classes/class_skill.png" alt="Skills" width={32} height={32} className={headerStyles.tabIcon} />
                {activeTab === 'Skills' && <span className={headerStyles.tabName}>Kỹ năng (Skill)</span>}
              </button>
              <button
                className={`${headerStyles.tabButton} ${activeTab === 'Talents' ? headerStyles.active : ''} ${activeTab === 'Talents' ? headerStyles.expanded : ''}`}
                onClick={() => setActiveTab('Talents')}
              >
                <Image src="/image/classes/class_talent.png" alt="Talents" width={32} height={32} className={headerStyles.tabIcon} />
                {activeTab === 'Talents' && <span className={headerStyles.tabName}>Thiên phú (Talent)</span>}
              </button>
              <div className={headerStyles.spacer}></div>
            </div>
      )}
      <div className="w-full flex-grow border-t-0 border-[3px] border-double border-[#e6ce63] shadow-lg bg-gray-900/20 text-white min-h-0">
        <div className="p-4 overflow-y-auto">
          {selectedClass ? (
            <div>
              {activeTab === 'Overview' && (
                <div className="flex space-x-4">
                  <IconFrame size={128} styleType="yellow" altText={selectedClass.name} contentImageUrl={selectedClass.image_assets?.logo || null} />
                  <p>{selectedClass.description}</p>
                </div>
              )}
              {activeTab === 'Skills' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedClass.skills?.map(skill => (
                    <SkillCard key={skill.id} skill={skill} />
                  ))}
                </div>
              )}
              {activeTab === 'Talents' && memoizedTalentTreeView}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Select a class to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassContent;
