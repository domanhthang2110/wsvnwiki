'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useTalentTreeInteractiveStore } from './talent-tree-store';

import Dropdown from '@/components/ui/Dropdown/Dropdown';
import LongButton from '@/components/ui/LongButton';

interface TotalTalentCostDisplayProps {
  onReset: () => void;
}

const TotalTalentCostDisplay: React.FC<TotalTalentCostDisplayProps> = ({ onReset }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'builds'>('summary');
  const [buildName, setBuildName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [shareError, setShareError] = useState('');

  const {
    saveBuild,
    loadBuild,
    getSavedBuilds,
    deleteBuild,
    generateBuildCode,
    loadFromBuildCode,
    selectedNodeLevels,
    nodes,
    talentInfoMap,
    nodeMap
  } = useTalentTreeInteractiveStore();

  const [savedBuilds, setSavedBuilds] = useState(() => getSavedBuilds());
  const [shareCode, setShareCode] = useState('');
  const [importCode, setImportCode] = useState('');

  // Calculate total cost and breakdown
  const { totalCost, costBreakdown } = useMemo(() => {
    const breakdown: { name: string; level: number; cost: number }[] = [];
    let total = 0;
    const processedGroupIds = new Set<string>();

    for (const [nodeId, level] of selectedNodeLevels.entries()) {
      if (level > 0) {
        const node = nodeMap.get(nodeId);
        const talent = node?.talent_id ? talentInfoMap.get(node.talent_id) : undefined;

        if (talent?.knowledge_levels && node) {
          if (node.group_id) {
            if (!processedGroupIds.has(node.group_id)) {
              const groupNodes = nodes.filter((n) => n.group_id === node.group_id);
              const mainNode = groupNodes.find((n) => n.is_group_main) || groupNodes[0];
              const mainTalent = talentInfoMap.get(mainNode.talent_id);

              if (mainTalent?.knowledge_levels) {
                let talentCost = 0;
                const mainNodeLevel = selectedNodeLevels.get(mainNode.id) || 0;
                for (let i = 1; i <= mainNodeLevel; i++) {
                  talentCost += mainTalent.knowledge_levels[i] || 0;
                }
                if (talentCost > 0) {
                  breakdown.push({ name: 'Talent cluster', level: mainNodeLevel, cost: talentCost });
                  total += talentCost;
                }
              }
              processedGroupIds.add(node.group_id);
            }
          } else {
            let talentCost = 0;
            for (let i = 1; i <= level; i++) {
              talentCost += talent.knowledge_levels[i] || 0;
            }
            if (talentCost > 0) {
              breakdown.push({ name: talent.name, level, cost: talentCost });
              total += talentCost;
            }
          }
        }
      }
    }
    return { totalCost: total, costBreakdown: breakdown };
  }, [selectedNodeLevels, talentInfoMap, nodes, nodeMap]);

  const dropdownOptions = [
    { id: 'summary', label: 'Tổng quan (Summary)' },
    { id: 'builds', label: 'Lưu trữ (Builds)' }
  ];
  const currentTabIndex = dropdownOptions.findIndex(o => o.id === activeTab);

  const handleShare = () => {
    if (totalCost === 0) {
      setShareError('Chưa có talent nào được chọn!');
      setShareCode('');
      return;
    }
    setShareError('');
    const code = generateBuildCode();
    setShareCode(code);
    navigator.clipboard?.writeText(code);
  };

  return (
    <div className="w-80 h-full flex-shrink-0 bg-[#1a1a1a] border-l-[3px] border-[#e6ce63] flex flex-col">
      {/* Header */}
      <div className="p-3 border-b-[3px] border-[#e6ce63] bg-[#0a0a0a] flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Image src="/image/talents/calculator.svg" width={20} height={20} alt="Calculator" />
          <h3 className="text-base text-[#feda5d]" style={{ textShadow: '1px 1px 0px black' }}>Máy tính (Calc)</h3>
        </div>
        <LongButton text="Reset" width={80} onClick={onReset} />
      </div>

      {/* Tab Navigation via Dropdown */}
      <div className="flex justify-center border-b-[3px] border-[#e6ce63] bg-[#111111] p-2">
        <Dropdown
          title={dropdownOptions[currentTabIndex].label}
          width="240px"
          showArrows={true}
          onPrevious={() => setActiveTab(dropdownOptions[(currentTabIndex - 1 + dropdownOptions.length) % dropdownOptions.length].id as any)}
          onNext={() => setActiveTab(dropdownOptions[(currentTabIndex + 1) % dropdownOptions.length].id as any)}
        >
          {dropdownOptions.map((opt) => (
            <a
              key={opt.id}
              href="#"
              className={`flex items-center justify-center gap-x-2 py-2 text-[#e6ce63] ${activeTab === opt.id ? 'bg-[#2a2a2a]' : 'hover:bg-[#2a2a2a]'}`}
              onClick={(e) => {
                if (e && e.preventDefault) e.preventDefault();
                setActiveTab(opt.id as any);
              }}
            >
              <span>{opt.label}</span>
            </a>
          ))}
        </Dropdown>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 overflow-y-auto scrollbar-thin scrollbar-track-[#1a1a1a] scrollbar-thumb-[#e6ce63]">
        {activeTab === 'summary' && (
          <div className="space-y-3 text-[#e6ce63]">
            {/* Total Cost */}
            <div className="bg-[#2a2a2a] p-3 text-center border-[2px] border-[#e6ce63]">
              <p className="text-xs uppercase text-gray-400 mb-1">Tổng Knowledge</p>
              <p className="text-3xl font-mono text-[#feda5d]" style={{ textShadow: '2px 2px 0px black' }}>{totalCost.toLocaleString()}</p>
            </div>

            {/* Breakdown */}
            <div className="border-[2px] border-[#e6ce63]">
              <div className="bg-[#2a2a2a] px-2 py-1 text-xs uppercase text-gray-400 border-b-[2px] border-[#e6ce63]">
                Chi tiết (Breakdown)
              </div>
              <div className="divide-y divide-[#333333]">
                {costBreakdown.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-xs">Chưa có Talent nào</div>
                ) : (
                  costBreakdown.map((item, index) => {
                    const matchedTalent = Array.from(talentInfoMap.values()).find(t => t.name === item.name);
                    const iconUrl = matchedTalent?.icon_url;
                    return (
                      <div key={index} className="flex justify-between items-center px-2 py-1.5 hover:bg-[#2a2a2a]">
                        <div className="flex items-center gap-2">
                          {iconUrl && (
                            <Image src={iconUrl} width={20} height={20} alt="" style={{ imageRendering: 'pixelated' }} />
                          )}
                          <div>
                            <p className="text-[#e6ce63] text-xs max-w-[110px] truncate" title={item.name}>{item.name}</p>
                            <p className="text-gray-500 text-[10px]">Cấp {item.level}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-[#feda5d] text-xs">{item.cost}</p>
                          <p className="text-gray-500 text-[10px]">{((item.cost / totalCost) * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'builds' && (
          <div className="space-y-3 text-[#e6ce63]">
            {/* Save Build */}
            <div className="border-[2px] border-[#e6ce63] bg-[#2a2a2a] p-3">
              <p className="text-xs uppercase text-gray-400 text-center mb-2">Lưu Build Hiện Tại</p>
              {!showSaveInput ? (
                <div className="flex justify-center">
                  <LongButton text="Lưu Build" width={160} onClick={() => setShowSaveInput(true)} />
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={buildName}
                    onChange={(e) => setBuildName(e.target.value)}
                    placeholder="Tên build..."
                    className="w-full px-2 py-1 bg-[#0a0a0a] border-[2px] border-[#e6ce63] text-[#feda5d] font-mono text-sm outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && buildName.trim()) {
                        saveBuild(buildName);
                        setSavedBuilds(getSavedBuilds());
                        setBuildName('');
                        setShowSaveInput(false);
                      }
                    }}
                  />
                  <div className="flex space-x-2 justify-center">
                    <LongButton text="OK" width={80} onClick={() => {
                      if (buildName.trim()) {
                        saveBuild(buildName);
                        setSavedBuilds(getSavedBuilds());
                        setBuildName('');
                        setShowSaveInput(false);
                      }
                    }} />
                    <LongButton text="Hủy" width={80} onClick={() => {
                      setShowSaveInput(false);
                      setBuildName('');
                    }} />
                  </div>
                </div>
              )}
            </div>

            {/* Share Code */}
            <div className="border-[2px] border-[#e6ce63] bg-[#1a1a1a] p-3 space-y-2">
              <p className="text-xs uppercase text-gray-400 text-center">Chia Sẻ Build</p>
              <div className="flex justify-center">
                <LongButton text="Lấy Mã Chia Sẻ" width={200} onClick={handleShare} />
              </div>
              {shareError && (
                <p className="text-red-400 text-xs text-center border border-red-700 bg-[#1a0000] px-2 py-1">{shareError}</p>
              )}
              {shareCode && (
                <div className="bg-[#0a0a0a] border-[2px] border-dashed border-[#e6ce63] p-2 text-center">
                  <p className="text-[10px] text-gray-500 mb-1">Đã copy vào bộ nhớ tạm:</p>
                  <p className="text-[#feda5d] text-xs font-mono break-all">{shareCode}</p>
                </div>
              )}

              <hr className="border-gray-700" />

              <p className="text-xs uppercase text-gray-400 text-center">Nhập Mã Build</p>
              <input
                type="text"
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="Paste mã build vào đây..."
                className="w-full px-2 py-1 bg-[#0a0a0a] border-[2px] border-[#e6ce63] text-[#feda5d] text-xs font-mono outline-none"
              />
              <div className="flex space-x-2 justify-center">
                <LongButton text="Nhập" width={80} onClick={() => {
                  if (importCode.trim()) {
                    const success = loadFromBuildCode(importCode.trim());
                    if (success) {
                      setImportCode('');
                      alert('Tải build thành công!');
                    } else {
                      alert('Mã build không hợp lệ.');
                    }
                  }
                }} />
                <LongButton text="Xóa" width={80} onClick={() => setImportCode('')} />
              </div>
            </div>

            {/* Saved Builds List */}
            <div>
              <p className="text-xs uppercase text-gray-400 text-center mb-2">Danh sách đã lưu ({savedBuilds.length})</p>
              {savedBuilds.length === 0 ? (
                <div className="text-center py-4 text-gray-600 text-xs border-[2px] border-dashed border-gray-700">Chưa có build nào.</div>
              ) : (
                <div className="space-y-2">
                  {savedBuilds.map((build) => (
                    <div key={build.id} className="bg-[#2a2a2a] p-2 border-[2px] border-[#e6ce63]">
                      <p className="text-[#e6ce63] text-sm truncate">{build.name}</p>
                      <p className="text-gray-500 text-[10px] font-mono mb-2">
                        {new Date(build.timestamp).toLocaleDateString()} · {build.talentCount} talents · {build.totalCost} knw
                      </p>
                      <div className="flex flex-wrap gap-1 justify-center">
                        <LongButton text="Tải" width={90} onClick={() => loadBuild(build)} />
                        <LongButton text="Chia Sẻ" width={110} onClick={() => {
                          const classId = nodes[0]?.id.split('-')[0] || 'unknown';
                          const nodeIdMap = new Map<string, number>();
                          nodes.forEach((node, index) => nodeIdMap.set(node.id, index));
                          const compactPairs: string[] = [];
                          for (const [nodeId, level] of Object.entries(build.selectedNodeLevels)) {
                            if (Number(level) > 0) {
                              const nodeIndex = nodeIdMap.get(nodeId);
                              if (nodeIndex !== undefined) compactPairs.push(`${nodeIndex},${level}`);
                            }
                          }
                          const code = `${classId}_${btoa(compactPairs.join(';'))}`;
                          navigator.clipboard?.writeText(code);
                          alert('Đã copy mã chia sẻ!');
                        }} />
                        <button
                          onClick={() => {
                            if (confirm(`Xóa build "${build.name}"?`)) {
                              deleteBuild(build.id);
                              setSavedBuilds(getSavedBuilds());
                            }
                          }}
                          className="w-full mt-1 bg-red-950 border border-red-700 text-red-300 uppercase text-xs py-1 hover:bg-red-900"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TotalTalentCostDisplay;
