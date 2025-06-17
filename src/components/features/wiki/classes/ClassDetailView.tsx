'use client';

import { useState, useMemo } from 'react';
import { ClassItem } from '@/types/classes';
import { SkillItem } from '@/types/skills';
import IconFrame from '@/components/shared/IconFrame';
import SkillDetailTooltip from '@/components/features/admin/skills/SkillDetailTooltip';
import SkillDetailCard from './SkillDetailCard'; // New import
import DOMPurify from 'dompurify';
import { Toggle } from '@/components/ui/Toggle/toggle'; // Import Toggle component

interface ClassDetailViewProps {
  classItem: ClassItem;
}

export default function ClassDetailView({ classItem }: ClassDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'skills' | 'builds'>('skills');
  const [skillDisplayMode, setSkillDisplayMode] = useState<'compact' | 'detail'>('compact'); // New state for skill display mode
  
  const [skillForTooltip, setSkillForTooltip] = useState<SkillItem | null>(null);
  const [tooltipAnchorElement, setTooltipAnchorElement] = useState<HTMLElement | null>(null);
  
  const groupedSkills = useMemo(() => {
    if (!classItem.skills) return {};
    return classItem.skills.reduce((acc, skill) => {
      const type = skill.skill_type || 'Uncategorized';
      if (!acc[type]) acc[type] = [];
      acc[type].push(skill);
      return acc;
    }, {} as Record<string, SkillItem[]>);
  }, [classItem.skills]);

  const handleSkillIconMouseEnter = (skill: SkillItem, event: React.MouseEvent<HTMLDivElement>) => {
    if (skillDisplayMode === 'compact') { // Only show tooltip in compact mode
      setSkillForTooltip(skill);
      setTooltipAnchorElement(event.currentTarget);
    }
  };

  const handleSkillIconMouseLeave = () => {
    if (skillDisplayMode === 'compact') { // Only hide tooltip in compact mode
      setSkillForTooltip(null);
      setTooltipAnchorElement(null);
    }
  };

  const defaultAvatar = 'https://placehold.co/128x128/374151/9CA3AF?text=No+Avatar';

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Class Header */}
        <div className="flex flex-col sm:flex-row items-start gap-6 pb-4 border-b border-gray-700 mb-4">
          <img 
            src={classItem.avatar_url || defaultAvatar} 
            alt={`${classItem.name} avatar`} 
            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-600 flex-shrink-0"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = defaultAvatar; }}
          />
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-2">{classItem.name}</h2>
            <div 
              className="text-sm text-gray-300 prose prose-invert max-w-none [&_p]:my-0 [&_img]:my-0 [&_img]:mx-0 [&_img]:inline-block [&_img]:align-bottom"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(classItem.description || "No description available for this class.") }}
            />
          </div>
        </div>

        {/* Tabs Navigation and Skill Display Toggle */}
        <div className="border-b border-gray-700 mb-4 flex justify-between items-center">
          <nav className="flex space-x-4">
            <button 
              onClick={() => setActiveTab('skills')}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'skills' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-200 border-b-2 border-transparent'}`}
            >
              Skills
            </button>
            <button 
              onClick={() => setActiveTab('builds')}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === 'builds' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-200 border-b-2 border-transparent'}`}
            >
              Builds
            </button>
          </nav>
          {activeTab === 'skills' && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Display:</span>
              <Toggle
                pressed={skillDisplayMode === 'detail'}
                onPressedChange={(pressed) => setSkillDisplayMode(pressed ? 'detail' : 'compact')}
                aria-label="Toggle skill display mode"
              >
                {skillDisplayMode === 'compact' ? 'Compact' : 'Detail'}
              </Toggle>
            </div>
          )}
        </div>
        
        {/* Tab Content */}
        <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {Object.entries(groupedSkills).map(([type, skillsInSection]) => (
                <div key={type}>
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">{type}</h3>
                  {skillsInSection.length > 0 ? (
                    skillDisplayMode === 'compact' ? (
                      <div className="flex flex-wrap gap-x-4 gap-y-6 items-start">
                        {skillsInSection.map(skill => (
                          <div key={skill.id} className="flex flex-col items-center text-center w-[72px]">
                            <IconFrame
                              size={72}
                              contentImageUrl={skill.icon_url || null}
                              styleType="yellow"
                              altText={skill.name || 'Skill Icon'}
                              onMouseEnter={(e) => handleSkillIconMouseEnter(skill, e)}
                              onMouseLeave={handleSkillIconMouseLeave}
                              isActive={false}
                            />
                            <p 
                              className="mt-1.5 text-xs text-gray-300 w-full break-words"
                              title={skill.name || 'Unnamed Skill'}
                            >
                              {skill.name || 'Unnamed Skill'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : ( // Detail View
                      <div className="space-y-4">
                        {skillsInSection.map(skill => (
                          <SkillDetailCard key={skill.id} skill={skill} />
                        ))}
                      </div>
                    )
                  ) : (
                    <p className="text-gray-500 text-sm">No skills in this category for this class.</p>
                  )}
                </div>
              ))}
              {(!classItem.skills || classItem.skills.length === 0) && (
                <p className="text-gray-500 text-center py-6">This class has no skills defined.</p>
              )}
            </div>
          )}
          {activeTab === 'builds' && (
            <p className="text-center text-gray-500 py-8">Builds feature is coming soon.</p>
          )}
        </div>
      </div>

      {/* SkillDetailTooltip is only active in compact mode */}
      {skillDisplayMode === 'compact' && (
        <SkillDetailTooltip
          skill={skillForTooltip}
          isOpen={!!skillForTooltip}
          referenceElement={tooltipAnchorElement}
          onClose={() => {
              setSkillForTooltip(null);
              setTooltipAnchorElement(null);
          }}
        />
      )}
    </>
  );
}
