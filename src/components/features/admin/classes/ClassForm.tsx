'use client';

import { useState, useEffect, useCallback } from 'react';
import { SkillItem } from '@/types/skills';
import { ClassItem, ClassFormData } from '@/types/classes';
import MediaFileExplorer from '@/components/features/admin/media/MediaFileExplorer';
import SkillCard from '@/components/features/admin/skills/SkillCard';
import { AlertTriangle } from 'lucide-react';
import TiptapEditor from '@/components/features/editor/TiptapEditor'; // Import TiptapEditor
import { Editor } from '@tiptap/react'; // Import Editor type
import DOMPurify from 'dompurify'; // Import DOMPurify for sanitization

interface ClassFormProps {
  initialData: ClassItem | null;
  selectedSkills: SkillItem[];
  onSubmit: (data: ClassFormData) => Promise<{ success: boolean; error?: string }>;
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
  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    description: '', // description will now hold HTML
    avatar_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMediaExplorerOpen, setMediaExplorerOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // We need to store the Tiptap editor instance to insert images
  const [currentTiptapEditor, setCurrentTiptapEditor] = useState<Editor | null>(null); 

  useEffect(() => {
    if (initialData) {
      // When editing, set form data from initialData, sanitizing description on read
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        avatar_url: initialData.avatar_url || '',
      });
    } else {
      // Clear form for new creation
      setFormData({ name: '', description: '', avatar_url: '' });
    }
  }, [initialData]); // Removed currentTiptapEditor from dependencies

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    // Get HTML content from Tiptap editor
    const tiptapContentHtml = currentTiptapEditor?.getHTML() || ''; // Get HTML from stored instance
    // Sanitize HTML content before sending to parent (and then to DB)
    const sanitizedDescription = DOMPurify.sanitize(tiptapContentHtml);

    const dataToSubmit: ClassFormData = {
      ...formData,
      description: sanitizedDescription, // Use sanitized HTML from Tiptap
    };

    try {
      const result = await onSubmit(dataToSubmit);
      if (result.success) {
        // Parent (AdminClassesPage) will handle resetting editingClass and selectedSkills
        // This useEffect will then clear the form via initialData becoming null
      } else if (result.error) {
        setFormError(result.error);
      }
    } catch (error: any) {
      setFormError(error.message || 'An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarSelect = (publicUrl: string) => {
    setFormData((prev: ClassFormData) => ({ ...prev, avatar_url: publicUrl || '' }));
    setMediaExplorerOpen(false);
  };

  // This handler is passed to TiptapEditor's onImagePickerOpen prop
  const handleTiptapImagePickerOpen = useCallback((editorInstance: Editor) => {
    setCurrentTiptapEditor(editorInstance); // Store the editor instance
    setMediaExplorerOpen(true);
  }, []);

  // This handler is passed to MediaFileExplorer's onFileSelect prop
  const handleMediaFileSelectForTiptap = useCallback((publicUrl: string) => {
    if (currentTiptapEditor) {
      currentTiptapEditor.chain().focus().setImage({ src: publicUrl }).run();
    }
    setMediaExplorerOpen(false);
  }, [currentTiptapEditor]); // Dependency on currentTiptapEditor

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
            onChange={e => setFormData((prev: ClassFormData) => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <TiptapEditor
            content={formData.description || ''}
            onChange={(newContent) => {
              setFormData(prev => ({ ...prev, description: newContent }));
            }}
            onImagePickerOpen={handleTiptapImagePickerOpen}
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
                  src={formData.avatar_url || ''} 
                  alt="Class avatar" 
                  className="w-24 h-24 rounded-lg object-cover border-2 border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev: ClassFormData) => ({ ...prev, avatar_url: '' }))}
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

      {formError && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md flex items-center gap-2">
          <AlertTriangle size={20} />
          <span>Form Error: {formError}</span>
        </div>
      )}

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
                onFileSelect={handleMediaFileSelectForTiptap} // Corrected: Use specific handler for Tiptap images
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
