'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useTalentTreeInteractiveStore } from './talent-tree-store';

interface CostBreakdownItem {
  name: string;
  level: number;
  cost: number;
}

interface TotalTalentCostDisplayProps {
  totalCost: number;
  costBreakdown: CostBreakdownItem[];
  onReset: () => void;
}

const TotalTalentCostDisplay: React.FC<TotalTalentCostDisplayProps> = ({ totalCost, costBreakdown, onReset }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'breakdown' | 'stats' | 'builds'>('summary');
  const [targetKnowledge, setTargetKnowledge] = useState<number>(totalCost);
  const [isMinimized, setIsMinimized] = useState(false);
  const [buildName, setBuildName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  // Get store functions
  const { saveBuild, loadBuild, getSavedBuilds, deleteBuild, generateBuildCode, loadFromBuildCode, selectedNodeLevels, nodes } = useTalentTreeInteractiveStore();
  const [savedBuilds, setSavedBuilds] = useState(() => getSavedBuilds());
  const [shareCode, setShareCode] = useState('');
  const [importCode, setImportCode] = useState('');

  // Calculate statistics
  const stats = useMemo(() => {
    const talentCount = costBreakdown.length;
    const avgCostPerTalent = talentCount > 0 ? Math.round(totalCost / talentCount) : 0;
    const maxCostTalent = costBreakdown.reduce((max, item) => item.cost > max.cost ? item : max, { cost: 0, name: '', level: 0 });
    const totalLevels = costBreakdown.reduce((sum, item) => sum + item.level, 0);
    
    return {
      talentCount,
      avgCostPerTalent,
      maxCostTalent,
      totalLevels,
      efficiency: talentCount > 0 ? Math.round((totalLevels / talentCount) * 100) / 100 : 0
    };
  }, [costBreakdown, totalCost]);

  // Calculate knowledge needed
  const knowledgeNeeded = Math.max(0, targetKnowledge - totalCost);
  const knowledgeProgress = targetKnowledge > 0 ? Math.min(100, (totalCost / targetKnowledge) * 100) : 0;

  if (isMinimized) {
    return (
      <div className="w-16 flex-shrink-0 bg-gradient-to-b from-amber-900/90 to-amber-950/90 backdrop-blur-sm border border-amber-700/50 rounded-l-lg shadow-2xl">
        <div className="p-2 flex flex-col items-center space-y-2">
          <button
            onClick={() => setIsMinimized(false)}
            className="w-10 h-10 bg-amber-600/20 hover:bg-amber-600/40 rounded-lg border border-amber-500/30 transition-all duration-200 flex items-center justify-center group"
          >
            <Image src="/image/talents/calculator.svg" width={20} height={20} alt="Expand" className="group-hover:scale-110 transition-transform" />
          </button>
          <div className="text-amber-200 text-xs font-bold text-center transform -rotate-90 whitespace-nowrap">
            {totalCost}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 h-full flex-shrink-0 bg-gradient-to-b from-amber-900/90 to-amber-950/90 backdrop-blur-sm border border-amber-700/50 rounded-l-lg shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-amber-700/50 bg-gradient-to-r from-amber-800/50 to-amber-900/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-amber-600/30 rounded-lg flex items-center justify-center border border-amber-500/30">
              <Image src="/image/talents/calculator.svg" width={16} height={16} alt="Calculator" />
            </div>
            <h3 className="text-lg font-bold text-amber-100 drop-shadow-lg">Talent Calculator</h3>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="w-6 h-6 bg-amber-600/20 hover:bg-amber-600/40 rounded border border-amber-500/30 transition-all duration-200 flex items-center justify-center text-amber-200 text-xs"
            >
              −
            </button>
            <button
              onClick={onReset}
              className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg border border-red-500/50 transition-all duration-200 text-sm font-medium shadow-lg"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-amber-700/50 bg-amber-900/30">
        {[
          { id: 'summary', label: 'Summary', icon: '📊' },
          { id: 'breakdown', label: 'Details', icon: '📋' },
          { id: 'stats', label: 'Stats', icon: '📈' },
          { id: 'builds', label: 'Builds', icon: '💾' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-amber-600/30 text-amber-100 border-b-2 border-amber-400'
                : 'text-amber-300 hover:text-amber-100 hover:bg-amber-700/20'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-track-amber-900/20 scrollbar-thumb-amber-600/50 hover:scrollbar-thumb-amber-500/70">
        {activeTab === 'summary' && (
          <div className="space-y-4">
            {/* Total Cost Display */}
            <div className="bg-gradient-to-r from-amber-800/30 to-amber-900/30 rounded-lg p-4 border border-amber-600/30">
              <div className="text-center">
                <p className="text-amber-300 text-sm font-medium">Total Knowledge Cost</p>
                <p className="text-3xl font-bold text-amber-100 drop-shadow-lg">{totalCost.toLocaleString()}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-amber-800/20 rounded-lg p-3 border border-amber-600/20">
                <p className="text-amber-300 text-xs">Talents</p>
                <p className="text-xl font-bold text-amber-100">{stats.talentCount}</p>
              </div>
              <div className="bg-amber-800/20 rounded-lg p-3 border border-amber-600/20">
                <p className="text-amber-300 text-xs">Avg Cost</p>
                <p className="text-xl font-bold text-amber-100">{stats.avgCostPerTalent}</p>
              </div>
            </div>

            {/* Knowledge Target */}
            <div className="bg-amber-800/20 rounded-lg p-3 border border-amber-600/20">
              <div className="flex justify-between items-center mb-2">
                <label className="text-amber-300 text-sm font-medium">Knowledge Target</label>
                <input
                  type="number"
                  value={targetKnowledge}
                  onChange={(e) => setTargetKnowledge(Number(e.target.value) || 0)}
                  className="w-20 px-2 py-1 bg-amber-900/50 border border-amber-600/30 rounded text-amber-100 text-sm"
                  min="0"
                />
              </div>
              <div className="w-full bg-amber-900/50 rounded-full h-2 border border-amber-600/30">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${knowledgeProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-amber-300 mt-1">
                <span>{totalCost}</span>
                <span>{knowledgeNeeded > 0 ? `Need: ${knowledgeNeeded}` : 'Target reached!'}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'breakdown' && (
          <div className="space-y-2">
            {costBreakdown.length === 0 ? (
              <div className="text-center py-8 text-amber-400">
                <p className="text-lg">🎯</p>
                <p className="text-sm">No talents selected</p>
                <p className="text-xs text-amber-500">Start building your talent tree!</p>
              </div>
            ) : (
              costBreakdown.map((item, index) => (
                <div key={index} className="bg-amber-800/20 rounded-lg p-3 border border-amber-600/20 hover:bg-amber-800/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-amber-100 text-sm">{item.name}</p>
                      <p className="text-amber-300 text-xs">Level {item.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-100">{item.cost}</p>
                      <p className="text-amber-400 text-xs">{((item.cost / totalCost) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-amber-800/20 rounded-lg p-3 border border-amber-600/20">
                <div className="flex justify-between">
                  <span className="text-amber-300 text-sm">Total Talents</span>
                  <span className="text-amber-100 font-bold">{stats.talentCount}</span>
                </div>
              </div>
              <div className="bg-amber-800/20 rounded-lg p-3 border border-amber-600/20">
                <div className="flex justify-between">
                  <span className="text-amber-300 text-sm">Total Levels</span>
                  <span className="text-amber-100 font-bold">{stats.totalLevels}</span>
                </div>
              </div>
              <div className="bg-amber-800/20 rounded-lg p-3 border border-amber-600/20">
                <div className="flex justify-between">
                  <span className="text-amber-300 text-sm">Avg Levels/Talent</span>
                  <span className="text-amber-100 font-bold">{stats.efficiency}</span>
                </div>
              </div>
              <div className="bg-amber-800/20 rounded-lg p-3 border border-amber-600/20">
                <div className="flex justify-between">
                  <span className="text-amber-300 text-sm">Avg Cost/Talent</span>
                  <span className="text-amber-100 font-bold">{stats.avgCostPerTalent}</span>
                </div>
              </div>
              {stats.maxCostTalent.cost > 0 && (
                <div className="bg-amber-800/20 rounded-lg p-3 border border-amber-600/20">
                  <p className="text-amber-300 text-sm mb-1">Most Expensive</p>
                  <p className="text-amber-100 font-bold text-sm">{stats.maxCostTalent.name}</p>
                  <p className="text-amber-400 text-xs">Cost: {stats.maxCostTalent.cost}</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="border-t border-amber-700/50 pt-4">
              <p className="text-amber-300 text-sm font-medium mb-2">Quick Actions</p>
              <div className="space-y-2">
                <button
                  onClick={() => setTargetKnowledge(totalCost * 1.5)}
                  className="w-full px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-100 rounded-lg border border-amber-500/30 transition-all duration-200 text-sm"
                >
                  Set Target +50%
                </button>
                <button
                  onClick={() => navigator.clipboard?.writeText(`Total Knowledge Cost: ${totalCost}\nTalents: ${stats.talentCount}\nBreakdown:\n${costBreakdown.map(item => `• ${item.name} (Lvl ${item.level}): ${item.cost}`).join('\n')}`)}
                  className="w-full px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-100 rounded-lg border border-blue-500/30 transition-all duration-200 text-sm"
                >
                  📋 Copy Build
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'builds' && (
          <div className="space-y-4">
            {/* Save Current Build */}
            <div className="bg-amber-800/20 rounded-lg p-3 border border-amber-600/20">
              <p className="text-amber-300 text-sm font-medium mb-2">Save Current Build</p>
              {!showSaveInput ? (
                <button
                  onClick={() => setShowSaveInput(true)}
                  disabled={totalCost === 0}
                  className="w-full px-3 py-2 bg-green-600/20 hover:bg-green-600/30 disabled:bg-gray-600/20 disabled:text-gray-400 text-green-100 rounded-lg border border-green-500/30 transition-all duration-200 text-sm"
                >
                  💾 Save Build
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={buildName}
                    onChange={(e) => setBuildName(e.target.value)}
                    placeholder="Enter build name..."
                    className="w-full px-3 py-2 bg-amber-900/50 border border-amber-600/30 rounded text-amber-100 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        saveBuild(buildName);
                        setSavedBuilds(getSavedBuilds());
                        setBuildName('');
                        setShowSaveInput(false);
                      }
                    }}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        saveBuild(buildName);
                        setSavedBuilds(getSavedBuilds());
                        setBuildName('');
                        setShowSaveInput(false);
                      }}
                      className="flex-1 px-3 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-100 rounded border border-green-500/30 transition-all duration-200 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowSaveInput(false);
                        setBuildName('');
                      }}
                      className="flex-1 px-3 py-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-100 rounded border border-gray-500/30 transition-all duration-200 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Share/Import Build Codes */}
            <div className="bg-amber-800/20 rounded-lg p-3 border border-amber-600/20">
              <p className="text-amber-300 text-sm font-medium mb-2">Share Build</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const code = generateBuildCode();
                    setShareCode(code);
                    navigator.clipboard?.writeText(code);
                  }}
                  disabled={totalCost === 0}
                  className="w-full px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 disabled:bg-gray-600/20 disabled:text-gray-400 text-blue-100 rounded-lg border border-blue-500/30 transition-all duration-200 text-sm"
                >
                  🔗 Generate Share Code
                </button>
                {shareCode && (
                  <div className="space-y-2">
                    <div className="bg-amber-900/50 rounded p-2 border border-amber-600/30">
                      <p className="text-amber-300 text-xs mb-1">Share Code (copied to clipboard):</p>
                      <p className="text-amber-100 text-xs font-mono break-all">{shareCode}</p>
                    </div>
                    <p className="text-amber-400 text-xs">Share this code with others to let them import your build!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-amber-800/20 rounded-lg p-3 border border-amber-600/20">
              <p className="text-amber-300 text-sm font-medium mb-2">Import Build Code</p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  placeholder="Paste build code here..."
                  className="w-full px-3 py-2 bg-amber-900/50 border border-amber-600/30 rounded text-amber-100 text-sm font-mono"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      if (importCode.trim()) {
                        const success = loadFromBuildCode(importCode.trim());
                        if (success) {
                          setImportCode('');
                          alert('Build loaded successfully!');
                        } else {
                          alert('Invalid build code. Please check and try again.');
                        }
                      }
                    }}
                    disabled={!importCode.trim()}
                    className="flex-1 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 disabled:bg-gray-600/20 disabled:text-gray-400 text-green-100 rounded-lg border border-green-500/30 transition-all duration-200 text-sm"
                  >
                    📥 Import Build
                  </button>
                  <button
                    onClick={() => setImportCode('')}
                    className="px-3 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-100 rounded-lg border border-gray-500/30 transition-all duration-200 text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Saved Builds List */}
            <div>
              <p className="text-amber-300 text-sm font-medium mb-2">Saved Builds ({savedBuilds.length})</p>
              {savedBuilds.length === 0 ? (
                <div className="text-center py-8 text-amber-400">
                  <p className="text-lg">💾</p>
                  <p className="text-sm">No saved builds</p>
                  <p className="text-xs text-amber-500">Save your first build above!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-amber-900/20 scrollbar-thumb-amber-600/50">
                  {savedBuilds.map((build) => (
                    <div key={build.id} className="bg-amber-800/20 rounded-lg p-3 border border-amber-600/20 hover:bg-amber-800/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-amber-100 text-sm">{build.name}</p>
                          <p className="text-amber-300 text-xs">
                            {new Date(build.timestamp).toLocaleDateString()} • {build.talentCount} talents • {build.totalCost} cost
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            loadBuild(build);
                          }}
                          className="flex-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-100 rounded border border-blue-500/30 transition-all duration-200 text-xs"
                        >
                          📥 Load
                        </button>
                        <button
                          onClick={() => {
                            // Generate v2 code from saved build data
                            const classId = nodes[0]?.id.split('-')[0] || 'unknown';
                            
                            // Create node ID to index mapping
                            const nodeIdMap = new Map<string, number>();
                            nodes.forEach((node, index) => {
                              nodeIdMap.set(node.id, index);
                            });
                            
                            const compactPairs: string[] = [];
                            for (const [nodeId, level] of Object.entries(build.selectedNodeLevels)) {
                              if (Number(level) > 0) {
                                const nodeIndex = nodeIdMap.get(nodeId);
                                if (nodeIndex !== undefined) {
                                  compactPairs.push(`${nodeIndex},${level}`);
                                }
                              }
                            }
                            
                            const dataString = compactPairs.join(';');
                            const encoded = btoa(dataString);
                            const code = `${classId}_${encoded}`;
                            navigator.clipboard?.writeText(code);
                            alert('Share code copied to clipboard!');
                          }}
                          className="flex-1 px-2 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-100 rounded border border-purple-500/30 transition-all duration-200 text-xs"
                        >
                          🔗 Share
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(`Build: ${build.name}\nCost: ${build.totalCost}\nTalents: ${build.talentCount}\nSaved: ${new Date(build.timestamp).toLocaleString()}`);
                          }}
                          className="flex-1 px-2 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-100 rounded border border-amber-500/30 transition-all duration-200 text-xs"
                        >
                          📋 Info
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete build "${build.name}"?`)) {
                              deleteBuild(build.id);
                              setSavedBuilds(getSavedBuilds());
                            }
                          }}
                          className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-100 rounded border border-red-500/30 transition-all duration-200 text-xs"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Import/Export */}
            <div className="border-t border-amber-700/50 pt-4">
              <p className="text-amber-300 text-sm font-medium mb-2">Import/Export</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const data = JSON.stringify(savedBuilds, null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'talent-builds.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-100 rounded-lg border border-purple-500/30 transition-all duration-200 text-sm"
                >
                  📤 Export All Builds
                </button>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const importedBuilds = JSON.parse(event.target?.result as string);
                          localStorage.setItem('talentBuilds', JSON.stringify(importedBuilds));
                          setSavedBuilds(getSavedBuilds());
                        } catch (error) {
                          alert('Invalid file format');
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="hidden"
                  id="import-builds"
                />
                <label
                  htmlFor="import-builds"
                  className="w-full px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-100 rounded-lg border border-orange-500/30 transition-all duration-200 text-sm cursor-pointer block text-center"
                >
                  📥 Import Builds
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TotalTalentCostDisplay;
