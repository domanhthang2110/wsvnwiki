import React, { useState } from 'react';
import { SkillItem } from '@/types/skills';

interface SkillListSidebarProps {
    skills: SkillItem[];
    selectedSkillId: number | null;
    onSelectSkill: (skill: SkillItem) => void;
    className?: string;
}

export default function SkillListSidebar({
    skills,
    selectedSkillId,
    onSelectSkill,
    className = ''
}: SkillListSidebarProps) {
    const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});
    const [searchTerm, setSearchTerm] = useState('');

    // Group skills by class
    const groupedSkills = skills.reduce((acc, skill) => {
        const className = skill.className || 'Uncategorized';
        if (!acc[className]) {
            acc[className] = [];
        }
        acc[className].push(skill);
        return acc;
    }, {} as Record<string, SkillItem[]>);

    // Sort classes
    const sortedClasses = Object.keys(groupedSkills).sort((a, b) => {
        if (a === 'Uncategorized') return -1;
        if (b === 'Uncategorized') return 1;
        return a.localeCompare(b);
    });

    // Filter skills based on search
    const filteredClasses = sortedClasses.filter(className => {
        const classSkills = groupedSkills[className];
        const matchesClass = className.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSkills = classSkills.some(s => (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesClass || matchesSkills;
    });

    const toggleClass = (className: string) => {
        setExpandedClasses(prev => ({
            ...prev,
            [className]: !(prev[className] ?? false)
        }));
    };

    return (
        <div className={`flex flex-col h-full bg-gray-900 border-l border-gray-700 ${className}`}>
            <div className="p-3 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-gray-200 mb-1">Skills</h3>
                <input
                    type="text"
                    placeholder="Search skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                />
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredClasses.map(className => {
                    const classSkills = groupedSkills[className].filter(s =>
                        (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        className.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    if (classSkills.length === 0) return null;

                    const isExpanded = expandedClasses[className] ?? false; // Default collapsed

                    return (
                        <div key={className} className="rounded-md overflow-hidden border border-gray-800">
                            <button
                                onClick={() => toggleClass(className)}
                                className="w-full flex items-center justify-between px-3 py-1.5 bg-gray-800 hover:bg-gray-700 transition-colors border-b border-gray-700"
                            >
                                <div className="flex items-center gap-2">
                                    {classSkills[0]?.classIconUrl && (
                                        <img src={classSkills[0].classIconUrl} alt="" className="w-5 h-5 object-contain" />
                                    )}
                                    <span className="font-semibold text-sm text-gray-200">{className}</span>
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded">{classSkills.length}</span>
                            </button>

                            {isExpanded && (
                                <div className="bg-gray-900/30 py-1">
                                    {classSkills.map(skill => (
                                        <button
                                            key={skill.id}
                                            onClick={() => onSelectSkill(skill)}
                                            className={`w-full text-left px-3 pl-8 py-1.5 text-sm border-l-2 transition-colors flex items-center gap-2 ${selectedSkillId === skill.id
                                                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                                                }`}
                                        >
                                            {skill.icon_url && (
                                                <img src={skill.icon_url} alt="" className="w-6 h-6 object-contain rounded bg-black/40" />
                                            )}
                                            <span>{skill.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
