'use client';

import React, { useState, useMemo } from 'react';
import { useTalentTreeStore } from './store';
import IconFrame from '@/components/shared/IconFrame';
import LongButton from '@/components/ui/LongButton';
import { TalentItem } from '@/types/talents';
import { formatFullTalentDescription } from '@/utils/talentUtils';

interface TalentSelectModalProps {
  onSelect: (talentId: number) => void;
  onClose: () => void;
}

const TalentSelectModal: React.FC<TalentSelectModalProps> = ({ onSelect, onClose }) => {
  const { availableTalents, treeData } = useTalentTreeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTalent, setExpandedTalent] = useState<number | null>(null);

  // Get talent IDs that are already in the tree
  const talentsInTree = useMemo(() => {
    return new Set(treeData.nodes.map(node => node.talent_id).filter(id => id > 0));
  }, [treeData.nodes]);

  // Filter and sort talents
  const filteredAndSortedTalents = useMemo(() => {
    let filtered = availableTalents;

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = availableTalents.filter(talent => 
        talent.name.toLowerCase().includes(searchLower) ||
        (talent.description && talent.description.toLowerCase().includes(searchLower))
      );
    }

    // Sort: talents not in tree first, then talents in tree
    return filtered.sort((a, b) => {
      const aInTree = talentsInTree.has(a.id);
      const bInTree = talentsInTree.has(b.id);
      
      if (aInTree && !bInTree) return 1;
      if (!aInTree && bInTree) return -1;
      
      // If both have same tree status, sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  }, [availableTalents, searchTerm, talentsInTree]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 w-11/12 max-w-4xl max-h-[90vh] flex flex-col">
        <h3 className="text-xl font-semibold mb-4 text-gray-200">Select Talent</h3>
        
        {/* Search input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search talents by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Results count */}
        <div className="mb-2 text-sm text-gray-400">
          {filteredAndSortedTalents.length} talent{filteredAndSortedTalents.length !== 1 ? 's' : ''} found
          {searchTerm && ` for "${searchTerm}"`}
        </div>

        {/* Talents grid */}
        <div className="flex-1 overflow-y-auto mb-4">
          {filteredAndSortedTalents.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              {availableTalents.length === 0 
                ? "No talents available. Please add talents first." 
                : "No talents match your search criteria."}
            </p>
          ) : (
            <ul className="grid grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredAndSortedTalents.map(talent => {
                const isInTree = talentsInTree.has(talent.id);
                const isExpanded = expandedTalent === talent.id;
                return (
                  <li
                    key={talent.id}
                    className="relative"
                  >
                    <div
                      className={`flex flex-col items-center p-3 rounded cursor-pointer transition-colors ${
                        isInTree 
                          ? 'bg-gray-600 hover:bg-gray-500 opacity-60' 
                          : 'bg-gray-700 hover:bg-gray-600'
                      } ${isExpanded ? 'border-2 border-blue-500' : ''}`}
                      onClick={() => onSelect(talent.id)}
                      title={isInTree ? 'This talent is already in the tree' : ''}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <IconFrame
                          size={40}
                          styleType="yellow"
                          altText={talent.name}
                          contentImageUrl={talent.icon_url}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-200 text-sm font-medium block truncate">
                            {talent.name}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            {talent.max_level > 1 && (
                              <span>Lvl {talent.max_level}</span>
                            )}
                            {talent.knowledge_levels && (
                              <span>
                                Cost: {talent.max_level > 1 
                                  ? Object.entries(talent.knowledge_levels)
                                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                                      .map(([level, cost]) => cost)
                                      .join('/')
                                  : Object.values(talent.knowledge_levels).reduce((sum, cost) => sum + cost, 0)
                                }
                              </span>
                            )}
                            {isInTree && (
                              <span className="text-yellow-400">In Tree</span>
                            )}
                          </div>
                        </div>
                        {talent.description && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedTalent(isExpanded ? null : talent.id);
                            }}
                            className="text-gray-400 hover:text-gray-200 p-1"
                            title={isExpanded ? 'Hide description' : 'Show description'}
                          >
                            <svg 
                              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    {isExpanded && talent.description && (
                      <div className="mt-2 p-3 bg-gray-800 rounded border border-gray-600">
                        <h4 className="text-sm font-medium text-gray-200 mb-2">{talent.name}</h4>
                        <div 
                          className="text-sm text-gray-300 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: formatFullTalentDescription(talent) }}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        
        <LongButton onClick={onClose} className="w-full" text="Cancel" width={100} />
      </div>
    </div>
  );
};

export default TalentSelectModal;
