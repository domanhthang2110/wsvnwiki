'use client';

import React from 'react';
import { SkillItem, SkillLevelValue, SkillParameterDefinitionStored } from '@/types/skills';
import IconFrame from '@/components/shared/IconFrame';
import { formatEnergyCost, formatRange, formatFullSkillDescription } from '@/utils/skillUtils'; // Import formatFullSkillDescription
import DOMPurify from 'dompurify';

interface SkillDetailCardProps {
  skill: SkillItem;
}

export default function SkillDetailCard({ skill }: SkillDetailCardProps) {
  const defaultIcon = 'https://placehold.co/72x72/374151/9CA3AF?text=No+Icon';

  // No longer need getParameterValues as formatFullSkillDescription handles it

  return (
    <div className="bg-gray-700 p-4 rounded-lg shadow-md flex flex-col sm:flex-row gap-4 items-start">
      {/* Skill Icon */}
      <div className="flex-shrink-0">
        <IconFrame
          size={72}
          contentImageUrl={skill.icon_url || null}
          styleType="yellow"
          altText={`${skill.name || 'Unnamed Skill'} icon`}
        />
      </div>

      {/* Skill Details */}
      <div className="flex-grow space-y-2">
        {/* Name and Meta */}
        <div className="flex flex-col">
          <h3 className="text-xl font-bold text-white">{skill.name || "Unnamed Skill"}</h3>
          <p className="text-sm text-gray-300">
            {skill.skill_type || "N/A Type"}
            {skill.max_level && ` • Level ${skill.max_level}`}
            {skill.activation_type && ` • ${skill.activation_type}`}
          </p>
        </div>

        {/* Core Stats */}
        <div className="text-sm text-gray-200 flex flex-wrap gap-x-4 gap-y-1">
          {skill.energy_cost && (
            <p><span className="text-gray-400">Energy Cost: </span>{formatEnergyCost(skill.energy_cost)}</p>
          )}
          {skill.cooldown != null && (
            <p><span className="text-gray-400">Cooldown: </span>{skill.cooldown}s</p>
          )}
          {skill.range != null && (
            <p><span className="text-gray-400">Range: </span>{formatRange(skill.range)}</p>
          )}
        </div>

        {/* Description - now uses formatted description */}
        {skill.description && (
          <div
            className="text-sm text-gray-300 prose prose-invert max-w-none [&_p]:my-0 [&_img]:my-0 [&_img]:mx-0 [&_img]:inline-block [&_img]:align-bottom"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatFullSkillDescription(skill)) }}
          />
        )}

        {/* Parameters Table/List - REMOVED as they are now in the description */}
      </div>
    </div>
  );
}
