'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import ClassSimpleCard from './ClassSimpleCard';
import { ClassItem } from '@/types/classes';
import { CLASS_FACTION_INFO_MAP, Faction, Side } from '@/lib/data/factionMap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMediaQuery } from 'react-responsive';
import { useMounted } from '@/hooks/use-mounted';
import { motion, AnimatePresence } from 'framer-motion';

interface ClassContentProps {
  classes: ClassItem[];
}

const FACTION_ORDER: Faction[] = ['Chosen', 'Firstborn', 'Mountain Clan', 'Forsaken'];
const SIDE_ORDER: Side[] = ['Sentinel', 'Legion'];

const ClassContent: React.FC<ClassContentProps> = ({ classes }) => {
  const [currentSideIndex, setCurrentSideIndex] = useState(0);
  const [currentFactionIndex, setCurrentFactionIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const displayTen = useMediaQuery({ query: '(min-width: 1024px)' });
  const mounted = useMounted();
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const groupedClasses = useMemo(() => {
    const groups: Record<Faction, ClassItem[]> = {
      'Chosen': [],
      'Firstborn': [],
      'Mountain Clan': [],
      'Forsaken': [],
    };
    classes.forEach((classItem) => {
      const info = CLASS_FACTION_INFO_MAP[classItem.name];
      if (info) {
        groups[info.faction].push(classItem);
      }
    });
    return groups;
  }, [classes]);

  const handleOpenDetail = (className: string) => {
    console.log(`Opening detail for class: ${className}`);
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
    if (event.deltaY > 0) {
      handleScroll('right');
    } else {
      handleScroll('left');
    }
  }, [currentSideIndex, currentFactionIndex, displayTen]);

  const renderClasses = () => {
    if (displayTen) {
      const side = SIDE_ORDER[currentSideIndex];
      const factionsInSide = FACTION_ORDER.filter(f => {
        const firstClass = groupedClasses[f][0];
        return firstClass && CLASS_FACTION_INFO_MAP[firstClass.name]?.side === side;
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
                      onOpenDetail={() => handleOpenDetail(classItem.name)}
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
      const classesToRender = groupedClasses[faction];
      return classesToRender.map((classItem) => (
        <ClassSimpleCard
          key={classItem.id}
          classItem={classItem}
          onOpenDetail={() => handleOpenDetail(classItem.name)}
        />
      ));
    }
  };

  const getHeaderContent = () => {
    if (displayTen) {
      return SIDE_ORDER[currentSideIndex];
    } else {
      return (
        <select
          className="bg-transparent text-white text-xl font-bold text-center border-none outline-none"
          value={currentFactionIndex}
          onChange={(e) => setCurrentFactionIndex(Number(e.target.value))}
        >
          {FACTION_ORDER.map((faction, index) => (
            <option key={faction} value={index} className="bg-gray-800">
              {faction}
            </option>
          ))}
        </select>
      );
    }
  };

  const classesToDisplay = renderClasses();

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
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  if (!mounted) {
    return null;
  }

  const paginate = (newDirection: number) => {
    const scrollDirection = newDirection > 0 ? 'right' : 'left';
    handleScroll(scrollDirection);
    setDirection(newDirection);
  };

  return (
    <div className="flex flex-col h-full w-full space-y-2">
      <div className="h-auto p-2 border border-[#e6ce63] shadow-lg bg-gray-900/20 text-white w-full overflow-hidden">
        <div className="flex justify-between items-center mb-2">
          <button onClick={() => paginate(-1)} className="p-1" disabled={isAnimating}><ChevronLeft /></button>
          <h3 className="text-xl font-bold text-center flex-grow">{getHeaderContent()}</h3>
          <button onClick={() => paginate(1)} className="p-1" disabled={isAnimating}><ChevronRight /></button>
        </div>
        <div className="relative h-[140px] md:h-[170px]">
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
      </div>
      <div className="w-full flex-grow p-4 border border-[#e6ce63] shadow-lg bg-gray-900/20 text-white overflow-y-auto">
        <h3 className="text-xl font-bold mb-2">Class Details</h3>
        <p className="mb-4">This is where the specific content for game classes will be displayed.</p>
        <p className="mb-4">You can add class details, lists, and other relevant information here.</p>
      </div>
    </div>
  );
};

export default ClassContent;
