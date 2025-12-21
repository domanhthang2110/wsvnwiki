import React, { useState } from 'react';
import { SkillItem } from '@/types/skills';
import IconFrame from '@/components/shared/IconFrame';
import { formatFullSkillDescription, formatEnergyCost } from '@/utils/skillUtils';
import JsonDisplayModal from '@/components/shared/JsonDisplayModal';
import MediaFileExplorer from '@/components/features/admin/media/MediaFileExplorer';
import Image from 'next/image';
const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>;

interface SkillCardProps {
  skill: SkillItem;
  onEdit: (skill: SkillItem) => void;
  onDelete: (skill: SkillItem) => void;
  onIconChange: (skillId: number, newIconUrl: string) => void;
  isSelected: boolean;
  className?: string; // Add className prop
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, onEdit, onDelete, onIconChange, isSelected }) => {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isLinkedItemsExpanded, setIsLinkedItemsExpanded] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [showIconPickerModal, setShowIconPickerModal] = useState(false);

  const handleIconSelectedFromPicker = (publicUrl: string) => {
    onIconChange(skill.id, publicUrl);
    setShowIconPickerModal(false);
  };

  const formattedDescription = formatFullSkillDescription(skill);
  const formattedEnergyCost = formatEnergyCost(skill.energy_cost);

  return (
    <div
      className={`bg-gray-800 rounded-lg shadow-md p-4 flex flex-col max-w-sm cursor-pointer ${isSelected ? 'border-2 border-blue-500' : 'border border-gray-700'
        }`}
      onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
    >
      <div className="flex items-center">
        {skill.icon_url && (
          <IconFrame
            size={48}
            contentImageUrl={skill.icon_url}
            altText={`${skill.name} icon`}
            frameType="regular"
            styleType="yellow"
          />
        )}
        <h3 className="text-lg font-semibold text-gray-100 ml-4">{skill.name}</h3>
        <div className="ml-auto text-gray-400">
          {isDetailsExpanded ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          )}
        </div>
      </div>

      {isDetailsExpanded && (
        <div className="mt-4">
          <p className="text-gray-300 text-sm mb-2 break-words">Description: <span dangerouslySetInnerHTML={{ __html: formattedDescription }} /></p>
          <p className="text-gray-300 text-sm mb-2">Max Level: {skill.max_level || 'N/A'}</p>
          <p className="text-gray-300 text-sm mb-2">Skill Type: {skill.skill_type || 'N/A'}</p>
          <p className="text-gray-300 text-sm mb-2">Activation Type: {skill.activation_type || 'N/A'}</p>
          <p className="text-gray-300 text-sm mb-2">Cooldown: {skill.cooldown || 'N/A'}</p>
          <p className="text-gray-300 text-sm mb-2">Energy Cost: {formattedEnergyCost}</p>

          {skill.items && skill.items.length > 0 && (
            <div className="mt-2">
              <div
                className="flex items-center cursor-pointer text-gray-200 hover:text-gray-100"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent skill card from collapsing
                  setIsLinkedItemsExpanded(!isLinkedItemsExpanded);
                }}
              >
                <h4 className="text-sm font-semibold">Linked Items:</h4>
                <div className="ml-2 text-gray-400">
                  {isLinkedItemsExpanded ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  )}
                </div>
              </div>
              {isLinkedItemsExpanded && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {skill.items.map(item => (
                    <div key={item.id} className="flex relative items-center gap-1 px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                      {item.icon_url && (
                        <Image src={item.icon_url} fill alt={item.name || ''} className="w-4 h-4 object-cover rounded" draggable={false} />
                      )}
                      {item.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowIconPickerModal(true);
          }}
          className="py-1 px-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm"
        >
          Change Icon
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsJsonModalOpen(true);
          }}
          className="py-1 px-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm"
        >
          View Raw
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent skill card from collapsing
            onEdit(skill);
          }}
          className="py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent skill card from collapsing
            onDelete(skill);
          }}
          className="py-1 px-3 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
        >
          Delete
        </button>
      </div>
      {isJsonModalOpen && (
        <JsonDisplayModal
          data={skill}
          onClose={() => setIsJsonModalOpen(false)}
        />
      )}
      {showIconPickerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4 transition-opacity duration-300">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-gray-100">Select Skill Icon</h3>
              <button
                onClick={() => setShowIconPickerModal(false)}
                className="p-1 text-gray-400 hover:text-red-400"
                title="Close"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto min-h-[300px]">
              <MediaFileExplorer
                bucketName="media"
                initialPath="classes"
                onFileSelect={handleIconSelectedFromPicker}
                mode="select"
                accept="image/*"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillCard;
