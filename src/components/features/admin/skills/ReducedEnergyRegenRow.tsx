import { ChangeEvent } from 'react';

interface ReducedEnergyRegenRowProps {
  maxLevel: number;
  reducedEnergyRegenValues: Record<number, string>;
  onChange: (level: number, value: string) => void;
}

export default function ReducedEnergyRegenRow({ maxLevel, reducedEnergyRegenValues, onChange }: ReducedEnergyRegenRowProps) {
  return (
    <div className="grid gap-4">
      <label className="block text-sm font-medium text-gray-300">Reduced Energy Regen per Level:</label>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: maxLevel }, (_, i) => i + 1).map(level => (
          <div key={level} className="flex flex-col items-center">
            <label className="text-xs text-gray-400 mb-1">Level {level}</label>
            <input
              type="number"
              min="0"
              value={reducedEnergyRegenValues[level] || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(level, e.target.value)}
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 text-center"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
