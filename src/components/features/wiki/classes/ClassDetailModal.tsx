// components/classes/ClassDetailModal.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { ClassItem } from '@/types/classes'; // Ensure this path is correct
import { SkillItem } from '@/types/skills';   // Ensure this path is correct
import IconFrame from '@/components/shared/IconFrame';
import SkillDetailTooltip from '@/components/features/admin/skills/SkillDetailTooltip';
import DOMPurify from 'dompurify';

interface ClassDetailModalProps {
  classItem: ClassItem;
  onClose: () => void;
}

export default function ClassDetailModal({ classItem, onClose }: ClassDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'skills' | 'builds'>('skills');
  
  // State for tooltip visibility, now only controlled by hover (and dismiss)
  const [skillForTooltip, setSkillForTooltip] = useState<SkillItem | null>(null);
  const [tooltipAnchorElement, setTooltipAnchorElement] = useState<HTMLElement | null>(null);
  
  // clickedSkillId state is removed

  useEffect(() => {
    // When the modal is unmounted (closed), clear tooltip state
    return () => {
      setSkillForTooltip(null);
      setTooltipAnchorElement(null);
    };
  }, []);

  const groupedSkills = useMemo(() => {
    if (!classItem.skills) return {};
    return classItem.skills.reduce((acc, skill) => {
      const type = skill.skill_type || 'Uncategorized';
      if (!acc[type]) acc[type] = [];
      acc[type].push(skill);
      return acc;
    }, {} as Record<string, SkillItem[]>);
  }, [classItem.skills]);

  const handleSkillIconClick = (skill: SkillItem, event: React.MouseEvent<HTMLDivElement>) => {
    // Click interaction for showing/sticking the tooltip is now removed.
    // If clicking the icon should perform another action, implement it here.
    // For example, you might want to select the skill for a different purpose.
    console.log("IconFrame clicked (tooltip interaction removed):", skill.name); 
  };

  const handleSkillIconMouseEnter = (skill: SkillItem, event: React.MouseEvent<HTMLDivElement>) => {
    setSkillForTooltip(skill); // Show tooltip on hover
    setTooltipAnchorElement(event.currentTarget);
  };

  const handleSkillIconMouseLeave = () => {
    // Always hide tooltip on mouse leave as there's no "sticky" click state for the tooltip
    setSkillForTooltip(null);
    setTooltipAnchorElement(null);
  };

  const defaultAvatar = 'https://placehold.co/128x128/374151/9CA3AF?text=No+Avatar';

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => {
            onClose();
            setSkillForTooltip(null); // Also clear tooltip on backdrop click
        }}
      >
        {/* Modal Content */}
        <div 
          className="bg-gray-800 text-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-700 mb-4">
            <h2 className="text-2xl font-bold">{classItem.name}</h2>
            <button 
              onClick={() => {
                onClose();
                setSkillForTooltip(null); // Also clear tooltip on modal close button
              }} 
              className="p-1 text-gray-400 hover:text-red-400 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body - Scrollable Area */}
          <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {/* Class Info: Avatar and Description */}
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
              <img 
                src={classItem.avatar_url || defaultAvatar} 
                alt={`${classItem.name} avatar`} 
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-600 flex-shrink-0"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = defaultAvatar; }}
              />
              <div 
                className="text-sm text-gray-300 flex-1 min-h-[8rem] sm:min-h-0 prose prose-invert max-w-none [&_p]:my-0 [&_img]:my-0 [&_img]:mx-0 [&_img]:inline-block [&_img]:align-bottom"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(classItem.description || "No description available for this class.") }}
              />
            </div>
            
            {/* Tabs Navigation */}
            <div className="border-b border-gray-700 mb-4">
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
            </div>
            
            {/* Tab Content */}
            <div className="mt-4">
              {activeTab === 'skills' && (
                <div className="space-y-6">
                  {Object.entries(groupedSkills).map(([type, skillsInSection]) => (
                    <div key={type}>
                      <h3 className="text-lg font-semibold text-blue-400 mb-3">{type}</h3>
                      {skillsInSection.length > 0 ? (
                        <div className="flex flex-wrap gap-x-4 gap-y-6 items-start">
                          {skillsInSection.map(skill => (
                            <div key={skill.id} className="flex flex-col items-center text-center w-[72px]">
                              <IconFrame
                                size={72}
                                contentImageUrl={skill.icon_url || ''}
                                styleType="yellow"
                                altText={skill.name || 'Skill Icon'}
                                onClick={(e) => handleSkillIconClick(skill, e)} // This click no longer makes tooltip sticky
                                onMouseEnter={(e) => handleSkillIconMouseEnter(skill, e)}
                                onMouseLeave={handleSkillIconMouseLeave}
                                isActive={false} // No "sticky" active state for tooltip
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
        </div>
      </div>

      <SkillDetailTooltip
        skill={skillForTooltip}
        isOpen={!!skillForTooltip}
        referenceElement={tooltipAnchorElement}
        onClose={() => { // This handles dismiss actions like ESC or outside click
            setSkillForTooltip(null);
            setTooltipAnchorElement(null);
        }}
      />
    </>
  );
}
