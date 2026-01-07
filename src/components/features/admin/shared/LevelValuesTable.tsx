import React from 'react';
import { TalentParameterDefinitionInForm, TalentLevelValue } from '@/types/talents';
import { SkillParameterDefinitionInForm, SkillLevelValue } from '@/types/skills';

// Define a unified type for internal use within the component

type LevelValue = TalentLevelValue | SkillLevelValue;

interface LevelValuesTableProps {
  maxLevel: number;
  paramDefs: (SkillParameterDefinitionInForm | TalentParameterDefinitionInForm)[];
  levelValues: LevelValue[];
  onChange: (level: number, paramKey: string, value: string) => void;
  onBulkChange?: (paramKey: string, valuesByLevel: Record<number, string>) => void; // Optional for backward compatibility with Talent form if needed
  // New props for managing params internally
  onAddParam: () => void;
  onRemoveParam: (id: string, key: string) => void;
  onRenameParam: (id: string, oldKey: string, newKey: string) => void;
  onTogglePvp: (id: string, hasPvp: boolean) => void;
  onToggleConstant?: (id: string, constant: boolean) => void; // New: toggle constant value
  isTalent?: boolean; // Talents might not have PvP support, flag to disable if needed
}

export default function LevelValuesTable({
  maxLevel,
  paramDefs,
  levelValues,
  onChange,
  onBulkChange,
  onAddParam,
  onRemoveParam,
  onRenameParam,
  onTogglePvp,
  onToggleConstant,
  isTalent = false
}: LevelValuesTableProps) {

  // Helper to safely get value
  const getValue = (level: number, key: string) => {
    const levelData = levelValues.find(lv => lv.level === level);
    return levelData ? String(levelData[key] ?? '') : '';
  };

  // New state to track which param has the paste input open, including position
  const [activePastePopover, setActivePastePopover] = React.useState<{ key: string; top: number; left: number } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input when it opens
  React.useEffect(() => {
    if (activePastePopover && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activePastePopover]);

  // Click outside to close
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activePastePopover && !(event.target as Element).closest('.paste-popover-content') && !(event.target as Element).closest('.paste-trigger-btn')) {
        setActivePastePopover(null);
      }
    };
    // Use capture to ensure we catch it before other handlers if needed, though bubble is fine usually.
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activePastePopover]);

  // Handle scroll to close popover (optional but good for fixed positioning simple impl)
  React.useEffect(() => {
    const handleScroll = () => {
      if (activePastePopover) setActivePastePopover(null);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [activePastePopover]);


  const handleManualPaste = (key: string, text: string) => {
    if (!onBulkChange || !text) return;

    // Logic: Split by slash, trim, remove optional percent
    const parts = text.split('/').map(p => p.trim());
    if (parts.length === 0) return;

    const updates: Record<number, string> = {};
    parts.forEach((part, index) => {
      const level = index + 1;
      if (level <= maxLevel) {
        let cleanVal = part;
        if (cleanVal.endsWith('%')) {
          cleanVal = cleanVal.slice(0, -1).trim();
        }
        updates[level] = cleanVal;
      }
    });

    if (Object.keys(updates).length > 0) {
      onBulkChange(key, updates);
    }
    setActivePastePopover(null);
  };

  const togglePastePopover = (e: React.MouseEvent<HTMLButtonElement>, targetKey: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (activePastePopover?.key === targetKey) {
      setActivePastePopover(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    // Position below the button, centered horizontally relative to button
    // Fixed position is relative to viewport
    setActivePastePopover({
      key: targetKey,
      top: rect.bottom + 4, // 4px gap
      left: rect.left + (rect.width / 2)
    });
  };

  const renderPasteButton = (targetKey: string) => {
    const isOpen = activePastePopover?.key === targetKey;

    return (
      <button
        type="button"
        onClick={(e) => togglePastePopover(e, targetKey)}
        className={`paste-trigger-btn p-1 rounded transition-colors ${isOpen ? 'text-green-400 bg-gray-700' : 'text-gray-500 hover:text-green-400'}`}
        title="Open paste input"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
      </button>
    );
  };

  return (
    <div className="mt-6 overflow-hidden border border-gray-700 rounded-lg bg-gray-900 shadow-sm">
      <div className="flex justify-between items-center px-4 py-3 bg-gray-800 border-b border-gray-700">
        <h3 className="text-lg font-medium text-gray-200">Parameter Configuration</h3>
        <button
          type="button"
          onClick={onAddParam}
          className="px-3 py-1.5 text-sm font-medium text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 rounded-md transition-colors"
        >
          + Add Parameter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th scope="col" className="px-4 py-3 bg-gray-800 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-64 min-w-[250px] sticky left-0 z-10 border-r border-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                Parameter Name
              </th>
              {Array.from({ length: maxLevel }, (_, i) => i + 1).map(level => (
                <th key={level} scope="col" className="px-3 py-3 bg-gray-800 text-center text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[80px]">
                  Lv {level}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-800">
            {paramDefs.length === 0 ? (
              <tr>
                <td colSpan={maxLevel + 1} className="px-6 py-8 text-center text-gray-500 italic">
                  No parameters defined. Click &quot;Add Parameter&quot; to start.
                </td>
              </tr>
            ) : (
              paramDefs.map((param) => {
                const hasPvp = 'hasPvp' in param ? param.hasPvp : false;
                const pvpKey = `${param.key}_pvp`;

                return (
                  <React.Fragment key={param.id}>
                    {/* Main Parameter Row */}
                    <tr className="group hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-2 whitespace-nowrap border-r border-gray-800 bg-gray-900 group-hover:bg-gray-800/50 sticky left-0 z-10">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={param.key}
                            onChange={(e) => onRenameParam(param.id, param.key, e.target.value)}
                            placeholder="param_name"
                            className="flex-1 min-w-0 bg-transparent border-b border-transparent hover:border-gray-600 focus:border-blue-500 focus:outline-none text-sm text-gray-200 px-1 py-0.5"
                          />

                          {!isTalent && (
                            <div className="relative group/tooltip">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!hasPvp}
                                  onChange={(e) => onTogglePvp(param.id, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-8 h-4 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[0px] after:left-[0px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block px-2 py-1 text-xs text-white bg-black/80 rounded whitespace-nowrap z-50">
                                Toggle PvP Values
                              </span>
                            </div>
                          )}

                          {!isTalent && onToggleConstant && (
                            <div className="relative group/tooltip ml-2">
                              <label className="flex items-center cursor-pointer gap-1.5">
                                <input
                                  type="checkbox"
                                  checked={!!param.constant}
                                  onChange={(e) => onToggleConstant(param.id, e.target.checked)}
                                  className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2 focus:ring-offset-0 focus:ring-offset-gray-900"
                                />
                                <span className="text-xs text-gray-400 select-none">Const</span>
                              </label>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block px-2 py-1 text-xs text-white bg-black/80 rounded whitespace-nowrap z-50">
                                Constant Value (All Levels)
                              </span>
                            </div>
                          )}

                          {renderPasteButton(param.key)}

                          <button
                            type="button"
                            onClick={() => onRemoveParam(param.id, param.key)}
                            className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors"
                            title="Delete Parameter"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      {param.constant ? (
                        <td colSpan={maxLevel} className="px-2 py-2">
                          <input
                            type="text"
                            value={getValue(1, param.key)}
                            onChange={(e) => {
                              for (let i = 1; i <= maxLevel; i++) {
                                onChange(i, param.key, e.target.value);
                              }
                            }}
                            className="w-full text-center bg-gray-800 border border-gray-700 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 text-sm text-gray-200 px-2 py-1"
                            placeholder="Value for all levels"
                          />
                        </td>
                      ) : (
                        Array.from({ length: maxLevel }, (_, i) => i + 1).map(level => (
                          <td key={`${param.id}-lv${level}`} className="px-2 py-2 whitespace-nowrap">
                            <input
                              type="text"
                              value={getValue(level, param.key)}
                              onChange={(e) => onChange(level, param.key, e.target.value)}
                              className="w-full text-center bg-gray-800 border border-gray-700 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-200 px-2 py-1"
                              placeholder="-"
                            />
                          </td>
                        ))
                      )}
                    </tr>

                    {/* PvP Secondary Row */}
                    {hasPvp && !isTalent && (
                      <tr className="bg-blue-900/10">
                        <td className="px-4 py-2 whitespace-nowrap border-r border-gray-800 bg-gray-900/95 sticky left-0 z-10 pl-8">
                          <div className="flex items-center gap-2 text-xs text-blue-300 font-medium">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            <span className="flex-grow">PvP Value</span>
                            {renderPasteButton(pvpKey)}
                          </div>
                        </td>
                        {param.constant ? (
                          <td colSpan={maxLevel} className="px-2 py-2">
                            <input
                              type="text"
                              value={getValue(1, pvpKey)}
                              onChange={(e) => {
                                for (let i = 1; i <= maxLevel; i++) {
                                  onChange(i, pvpKey, e.target.value);
                                }
                              }}
                              className="w-full text-center bg-blue-900/20 border border-blue-900/30 rounded focus:ring-1 focus:ring-green-400 focus:border-green-400 text-sm text-blue-100 px-2 py-1 placeholder-blue-700/50"
                              placeholder="PvP Value (All Levels)"
                            />
                          </td>
                        ) : (
                          Array.from({ length: maxLevel }, (_, i) => i + 1).map(level => (
                            <td key={`${param.id}-pvp-lv${level}`} className="px-2 py-2 whitespace-nowrap">
                              <input
                                type="text"
                                value={getValue(level, pvpKey)}
                                onChange={(e) => onChange(level, pvpKey, e.target.value)}
                                className="w-full text-center bg-blue-900/20 border border-blue-900/30 rounded focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm text-blue-100 px-2 py-1 placeholder-blue-700/50"
                                placeholder="PvP"
                              />
                            </td>
                          ))
                        )}
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {activePastePopover && (
        <div
          className="fixed z-[9999] paste-popover-content bg-gray-800 border border-gray-600 rounded shadow-xl p-2 min-w-[200px]"
          style={{
            top: `${activePastePopover.top}px`,
            left: `${activePastePopover.left}px`,
            transform: 'translateX(-50%)' // Center horizontally based on left coord
          }}
        >
          <div className="text-xs text-gray-400 mb-1">Paste &quot;1/2/3...&quot; here:</div>
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none mb-1 shadow-inner"
            placeholder="10/20..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleManualPaste(activePastePopover.key, e.currentTarget.value);
              } else if (e.key === 'Escape') {
                setActivePastePopover(null);
              }
            }}
          />
          <div className="text-[10px] text-gray-500 text-center">Press Enter to Apply</div>
        </div>
      )}
    </div>
  );
}
