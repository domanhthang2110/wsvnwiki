'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ClassSimpleCard from './ClassSimpleCard';
import { ClassItem } from '@/types/classes';
import { CLASSES_DATA, FACTION_ORDER, SIDE_ORDER } from '@/lib/data/classesData';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMounted } from '@/hooks/use-mounted';
import SkillDisplay from './SkillDisplay';
import headerStyles from './ClassDetailHeader.module.css';
import TalentTreeView from './TalentTreeView';
import Dropdown from '@/components/ui/Dropdown/Dropdown';
import { supabase } from '@/lib/supabase/client';
import { TalentItem, TalentTreeItem } from '@/types/talents';
import FactionSwitcher from '@/components/ui/FactionSwitcher/FactionSwitcher';
import ClassOverviewTab from './ClassOverviewTab';
import classContentStyles from './ClassContent.module.css';
interface ClassContentProps {
  classes: ClassItem[];
}

// Helper component to preload images
const PreloadImages: React.FC<{ classes: ClassItem[] }> = ({ classes }) => {
  return (
    <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
      {classes.map(cls => (
        <React.Fragment key={cls.id}>
          {cls.image_assets?.logo && (
            <Image src={cls.image_assets.logo} alt="" width={32} height={32} priority={true} loading="eager" />
          )}
          {cls.image_assets?.banner && (
            <video src={cls.image_assets.banner} preload="auto" style={{ display: 'none' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const DIAMOND_DOT_SIZE = 32;
const DIAMOND_DOT_COLOR = '#e6ce63';

function DiamondDot({ size = DIAMOND_DOT_SIZE, color = DIAMOND_DOT_COLOR, left = 0 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ display: 'block', position: 'relative', left }}>
      <rect x="8" y="0" width="16" height="16" fill={color} transform="rotate(45 16 16)" style={{ filter: 'drop-shadow(0 0 2px #000)' }} />
    </svg>
  );
}

const ClassContent: React.FC<ClassContentProps> = ({ classes }) => {
  const searchParams = useSearchParams();
  const initialClassSlug = searchParams.get('class');
  const [currentSideIndex, setCurrentSideIndex] = useState(0);
  const [currentFactionIndex, setCurrentFactionIndex] = useState(0);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Skills' | 'Talents'>('Overview');
  const mounted = useMounted();
  const [displayTen, setDisplayTen] = useState(false);
  const [isClassListCollapsed, setIsClassListCollapsed] = useState(false);
  const [fetchedTalents, setFetchedTalents] = useState<Record<number, TalentItem[]>>({});
  const classListContainerRef = useRef<HTMLDivElement>(null);
  const [showDiamondDot, setShowDiamondDot] = useState(false);

  // CSS media query hook replacement
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    setDisplayTen(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setDisplayTen(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const fetchTalentData = useCallback(async (classItem: ClassItem) => {
    if (!classItem.talent_tree) return;

    const tree = classItem.talent_tree;
    const hasFullData = !!tree.talents_data;
    const hasFetchedDetails = !!fetchedTalents[tree.id];

    if (hasFullData && hasFetchedDetails) {
      return;
    }

    let treeData = tree;
    if (!hasFullData) {
      const { data, error } = await supabase
        .from('talent_trees')
        .select('id, name, talents_data')
        .eq('id', tree.id)
        .single();
      
      if (error || !data) {
        console.error("Failed to fetch talent tree data", error);
        return;
      }
      treeData = { ...tree, ...data };
    }

    if (treeData.talents_data && !hasFetchedDetails) {
      const talentIds = treeData.talents_data.nodes
        .map(n => n.talent_id)
        .filter(Boolean);

      if (talentIds.length > 0) {
        const { data: talentDetails, error: talentError } = await supabase
          .from('talents')
          .select('*')
          .in('id', talentIds);

        if (talentError) {
          console.error("Failed to fetch talent details", talentError);
          return;
        }
        
        setFetchedTalents(prev => ({ ...prev, [treeData.id]: talentDetails as TalentItem[] }));
      }
    }

    if (!hasFullData) {
      setSelectedClass(current => {
        if (current?.id === classItem.id) {
          return { ...current, talent_tree: treeData as TalentTreeItem };
        }
        return current;
      });
    }
  }, [fetchedTalents]);

  const handleOpenDetail = useCallback(async (classItem: ClassItem) => {
    if (selectedClass?.id !== classItem.id) {
      setSelectedClass(classItem);
      setActiveTab('Overview');
      await fetchTalentData(classItem);
    }
  }, [selectedClass, fetchTalentData]);

  useEffect(() => {
    if (initialClassSlug) {
      const classInfo = CLASSES_DATA.find(c => c.slug === initialClassSlug);
      if (classInfo) {
        const classToSelect = classes.find(c => c.name === classInfo.name);
        if (classToSelect) {
          handleOpenDetail(classToSelect);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialClassSlug, classes]);

  // Smart gap detection for FactionSwitcher
  useEffect(() => {
    if (!displayTen) {
      setShowDiamondDot(false);
      return;
    }
    let animationFrame: number | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let debounceTimeout: NodeJS.Timeout | null = null;
    const checkGap = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const container = classListContainerRef.current;
        if (!container) return;
        const children = Array.from(container.children);
        if (children.length < 2) {
          setShowDiamondDot(false);
          return;
        }
        const first = children[0] as HTMLElement;
        const second = children[1] as HTMLElement;
        if (!first || !second) {
          setShowDiamondDot(false);
          return;
        }
        const firstRect = first.getBoundingClientRect();
        const secondRect = second.getBoundingClientRect();
        const gap = secondRect.left - firstRect.right;
        setShowDiamondDot(gap < 100);
      });
    };
    // Debounced version for resize events
    const debouncedCheckGap = () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(checkGap, 50);
    };
    checkGap();
    window.addEventListener('resize', debouncedCheckGap);
    // Use ResizeObserver for container and children
    if (classListContainerRef.current && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(debouncedCheckGap);
      resizeObserver.observe(classListContainerRef.current);
      Array.from(classListContainerRef.current.children).forEach(child => {
        resizeObserver!.observe(child);
      });
    }
    return () => {
      window.removeEventListener('resize', debouncedCheckGap);
      if (resizeObserver) resizeObserver.disconnect();
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, [displayTen, currentSideIndex, classes]);

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

  

  const handleTabClick = (tab: 'Overview' | 'Skills' | 'Talents') => {
    setActiveTab(tab);
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
        <div ref={classListContainerRef} className="flex w-full justify-center items-start gap-12 md:gap-16 lg:gap-24 xl:gap-32">
          {factionsInSide.map((faction) => (
            <div key={faction} className="flex flex-col items-center gap-y-2">
              <div className="flex flex-row items-center justify-center gap-2 md:gap-4">
                {groupedClasses[faction].map((classItem: ClassItem, index: number) => (
                  <ClassSimpleCard
                    key={`position-${index}`}
                    classItem={classItem}
                    onOpenDetail={() => handleOpenDetail(classItem)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      const faction = FACTION_ORDER[currentFactionIndex];
      const classesToRender = groupedClasses[faction] || [];
      return classesToRender.map((classItem: ClassItem, index: number) => (
        <ClassSimpleCard
          key={`mobile-position-${index}`}
          classItem={classItem}
          onOpenDetail={() => handleOpenDetail(classItem)}
        />
      ));
    }
  };

  const paginate = (newDirection: number) => {
    const scrollDirection = newDirection > 0 ? 'right' : 'left';
    handleScroll(scrollDirection);
  };

  const getHeaderContent = () => {
    if (displayTen) {
      const dropdownOptions = [
        { factions: ["Chosen", "Firstborn"] },
        { factions: ["Mountain Clan", "Forsaken"] },
      ];

      const renderDropdownContent = (factions: string[]) => (
        <div className="flex items-center justify-around w-full">
          {factions.map((factionName) => {
            const factionData = CLASSES_DATA.find(c => c.faction === factionName);
            if (!factionData) return null;
            return (
              <div key={factionName} className="flex items-center justify-center gap-x-2 w-1/2 whitespace-nowrap">
                <Image draggable={false} src={factionData.faction_icon} alt={`${factionName} icon`} width={22} height={22} />
                <span>{factionName}</span>
              </div>
            );
          })}
        </div>
      );

      return (
        <Dropdown
          title={renderDropdownContent(dropdownOptions[currentSideIndex].factions)}
          width="320px"
          showArrows={true}
          onPrevious={() => setCurrentSideIndex(prev => (prev - 1 + dropdownOptions.length) % dropdownOptions.length)}
          onNext={() => setCurrentSideIndex(prev => (prev + 1) % dropdownOptions.length)}
        >
          {dropdownOptions.map((option, index) => (
            <a
              key={index}
              href="#"
              className={`flex items-center gap-x-2 ${currentSideIndex === index ? 'selected' : ''}`}
              onClick={() => setCurrentSideIndex(index)}
            >
              {renderDropdownContent(option.factions)}
            </a>
          ))}
        </Dropdown>
      );
    } else {
      const currentFactionName = FACTION_ORDER[currentFactionIndex];
      const currentFactionData = CLASSES_DATA.find(c => c.faction === currentFactionName);

      const titleContent = (
        <div className="flex items-center justify-center gap-x-2">
          {currentFactionData && <Image draggable={false} src={currentFactionData.faction_icon} alt={`${currentFactionName} icon`} width={22} height={22} />}
          <span>{currentFactionName}</span>
        </div>
      );

      return (
          <Dropdown
            title={titleContent}
            width="210px"
            showArrows={true}
            onPrevious={() => paginate(-1)}
            onNext={() => paginate(1)}
          >
            {FACTION_ORDER.map((faction, index) => (
              <a
                key={faction}
                href="#"
                className={`flex items-center justify-center gap-x-2 ${currentFactionIndex === index ? 'selected' : ''}`}
                onClick={() => {
                  setCurrentFactionIndex(index);
                }}
              >
                <Image draggable={false} src={`/image/factions/${faction.toLowerCase().replace(' ', '-')}/icon.webp`} alt={`${faction} icon`} width={22} height={22} />
                <span>{faction}</span>
              </a>
            ))}
          </Dropdown>
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


  if (!mounted) {
    return null;
  }

  return (
    <div id="class-content-wrapper" className={`${classContentStyles.pixelBackground} border-[#e6ce63] border-b-0 border-[7px] border-double flex flex-col flex-grow w-full`}>
      <PreloadImages classes={classes} /> {/* Add the preloader here */}
      <div id="upper-box-container" className={`relative pt-2 border-b-[#e6ce63] border-[3px] border-double text-white w-full transition-all duration-300 ${isClassListCollapsed ? 'h-16' : 'h-auto'}`}>
        <div className="flex items-center mb-4">
          <div className="text-xl font-bold text-center flex-grow">
            {getHeaderContent()}
          </div>
          <button
            onClick={() => setIsClassListCollapsed(!isClassListCollapsed)}
            className="absolute top-2 right-2 p-1"
          >
            {isClassListCollapsed ? <ChevronLeft className="rotate-90" /> : <ChevronRight className="-rotate-90" />}
          </button>
        </div>
        {!isClassListCollapsed && (
          <div className="relative h-[150px] md:h-[170px] overflow-hidden pt-2">
            <div className={`absolute w-full flex flex-row items-center justify-center gap-1 md:gap-4 pb-2 flex-nowrap flex-shrink-0 ${classContentStyles['centered']}`}>
              {classes.length > 0 ? classesToDisplay : <p>No classes found.</p>}
            </div>
            {displayTen && (
              <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                {showDiamondDot ? (
                  // Adjust the 'left' value below to fine-tune centering
                  <DiamondDot left={-4} />
                ) : (
                  <FactionSwitcher
                    faction={currentSideIndex === 0 ? 'elf' : 'mc'}
                    onToggle={() => {}}
                    size={100}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div id="lower-box-container" className="w-full shadow-lg text-white flex flex-col flex-grow">
        {selectedClass ? (
          <>
            <div id="tab-header-container" className={`${headerStyles.header}`}>
              <button
                className={`${headerStyles.tabButton} ${headerStyles.overview} ${activeTab === 'Overview' ? headerStyles.active : ''} ${activeTab === 'Overview' ? headerStyles.expanded : ''}`}
                onClick={() => handleTabClick('Overview')}
              >
                <Image draggable={false} src={selectedClass.image_assets?.logo || ''} alt="Overview" width={32} height={32} className={headerStyles.tabIcon} priority={true} />
                {activeTab === 'Overview' && <span className={headerStyles.tabName}>{selectedClass.name}</span>}
              </button>
              <button
                className={`${headerStyles.tabButton} ${activeTab === 'Skills' ? headerStyles.active : ''} ${activeTab === 'Skills' ? headerStyles.expanded : ''}`}
                onClick={() => handleTabClick('Skills')}
              >
                <Image draggable={false} src="/image/classes/class_skill.webp" alt="Skills" width={32} height={32} className={headerStyles.tabIcon} />
                {activeTab === 'Skills' && <span className={headerStyles.tabName}>Kỹ năng (Skill)</span>}
              </button>
              <button
                className={`${headerStyles.tabButton} ${activeTab === 'Talents' ? headerStyles.active : ''} ${activeTab === 'Talents' ? headerStyles.expanded : ''}`}
                onClick={() => handleTabClick('Talents')}
              >
                <Image draggable={false} src="/image/classes/class_talent.webp" alt="Talents" width={32} height={32} className={headerStyles.tabIcon} />
                {activeTab === 'Talents' && <span className={headerStyles.tabName}>Thiên phú (Talent)</span>}
              </button>
              <div className={headerStyles.spacer}></div>
            </div>
            <div id="tab-content-container" className="w-full flex-1  shadow-lg text-white flex flex-col relative flex-grow min-h-0">
              {activeTab === 'Overview' && (
                <>
                  <ClassOverviewTab classItem={selectedClass} />
                </>
              )}
              {activeTab === 'Skills' && selectedClass.skills && (
                <SkillDisplay skills={selectedClass.skills} />
              )}
              {activeTab === 'Talents' && memoizedTalentTreeView}
            </div>
          </>
        ) : (
          <div className="w-full flex flex-col flex-grow border-t-0 border-[#e6ce63] shadow-lg text-white">
            <div className="flex items-center justify-center flex-grow">
              <p className="text-gray-400">Chọn một lớp nhân vật để xem chi tiết</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassContent;
