'use client';

import React from 'react';

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
  return (
    <div className="w-64 flex-shrink-0 bg-gray-800 p-4 border-r border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-200">Cost Calculator</h3>
        <button
          onClick={onReset}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
        >
          Reset
        </button>
      </div>
      <div className="space-y-2 text-sm">
        {costBreakdown.map((item, index) => (
          <div key={index} className="text-gray-300">
            <p className="font-semibold">{item.name} (Lvl {item.level})</p>
            <p className="text-right">Cost: {item.cost}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-700 mt-4 pt-4">
        <p className="text-gray-200 font-bold text-right">Total Knowledge Cost: {totalCost}</p>
      </div>
    </div>
  );
};

export default TotalTalentCostDisplay;
