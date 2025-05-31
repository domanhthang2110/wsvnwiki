'use client';

import { useState, useEffect } from 'react';
import { SkillItem } from '@/types/skills';
import { ClassItem, NewClassItem } from '@/types/classes';
import MediaFileExplorer from '@/components/admin/media/MediaFileExplorer';
import SkillCard from '@/components/admin/skills/SkillCard';

interface ClassFormProps {
  initialData: ClassItem | null;
  selectedSkills: SkillItem[];
  onSubmit: (data: NewClassItem) => Promise<void>;
  onSkillSelect: () => void;
  isEditing?: boolean;
}

export default function ClassForm({
  initialData,
  selectedSkills,
  onSubmit,
  onSkillSelect,
  isEditing
}: ClassFormProps) {
  const [formData, setFormData] = useState<NewClassItem>({
    name: '',
    description: '',
    avatar_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMediaExplorerOpen, setMediaExplorerOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      if (!isEditing) {
        setFormData({ name: '', description: '', avatar_url: '' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarSelect = (publicUrl: string) => {
    setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
    setMediaExplorerOpen(false);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-100 mb-6">
        {isEditing ? 'Edit Class' : 'Create New Class'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Class Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Class Avatar
          </label>
          <div className="flex items-start gap-4">
            {formData.avatar_url && (
              <div className="relative group">
                <img 
                  src={formData.avatar_url} 
                  alt="Class avatar" 
                  className="w-24 h-24 rounded-lg object-cover border-2 border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, avatar_url: '' }))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setMediaExplorerOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formData.avatar_url ? 'Change Avatar' : 'Select Avatar'}
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Class Skills
            </label>
            <button
              type="button"
              onClick={onSkillSelect}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Select Skills ({selectedSkills.length})
            </button>
          </div>
          <div className="flex flex-wrap gap-4 p-4 bg-gray-800 rounded-md min-h-[100px] border border-gray-700">
            {selectedSkills.map(skill => (
              <div key={skill.id} className="flex-none" style={{ width: 'min(100%, 300px)' }}>
                <SkillCard 
                  skill={skill}
                />
              </div>
            ))}
            {selectedSkills.length === 0 && (
              <p className="text-gray-500 text-sm w-full text-center py-4">
                No skills selected. Click the button above to add skills.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Class' : 'Create Class'}
          </button>
        </div>
      </form>

      {isMediaExplorerOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-gray-100">Select Class Avatar</h3>
              <button 
                onClick={() => setMediaExplorerOpen(false)}
                className="p-1 text-gray-400 hover:text-red-400"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto min-h-[300px]">
              <MediaFileExplorer
                bucketName="media"
                initialPath="classes"
                onFileSelect={handleAvatarSelect}
                mode="select"
                accept="image/*"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
