'use client';

import { useState, useEffect, useCallback } from 'react';
import { SkillItem } from '@/types/skills';
import { ClassItem, ClassFormData } from '@/types/classes';
import MediaFileExplorer from '@/components/features/admin/media/MediaFileExplorer';
import SkillCard from '@/components/features/admin/skills/SkillCard';
import { AlertTriangle } from 'lucide-react';
import TiptapEditor from '@/components/features/editor/TiptapEditor';
import { Editor } from '@tiptap/react';
import DOMPurify from 'dompurify';
import JsonDisplayModal from '@/components/shared/JsonDisplayModal';

// Helper component to render image or video based on URL
const MediaPreview = ({ url, alt }: { url: string; alt: string }) => {
  if (!url) return null;

  const isVideo = url.endsWith('.webm') || url.endsWith('.mp4');

  if (isVideo) {
    return (
      <video
        src={url}
        muted
        loop
        autoPlay
        playsInline
        className="w-24 h-24 rounded-lg object-cover border-2 border-gray-700"
      />
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className="w-24 h-24 rounded-lg object-cover border-2 border-gray-700"
    />
  );
};

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
    lore: '',
    logo_url: '', // Renamed from avatar_url
    avatar_url: '', // New field for class avatar
    banner_url: '', // New field for class banner
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMediaExplorerOpen, setMediaExplorerOpen] = useState(false);
  const [currentImageField, setCurrentImageField] = useState<'logo_url' | 'avatar_url' | 'banner_url' | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isRawDataModalOpen, setRawDataModalOpen] = useState(false);
  // We need to store the Tiptap editor instance to insert images
  const [currentTiptapEditor, setCurrentTiptapEditor] = useState<Editor | null>(null);

  useEffect(() => {
    if (initialData) {
      // When editing, set form data from initialData, sanitizing description on read
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        lore: initialData.lore || '',
        logo_url: initialData.image_assets?.logo || '', // Populate from image_assets.logo
        avatar_url: (typeof initialData.image_assets?.avatar === 'string' ? initialData.image_assets.avatar : '') || '', // Populate from image_assets.avatar
        banner_url: initialData.image_assets?.banner || '', // Populate from image_assets.banner
        // Ensure image_assets is also set for initial data if it's part of ClassFormData
        image_assets: initialData.image_assets,
      });
    } else {
      // Clear form for new creation
      setFormData({ name: '', description: '', lore: '', logo_url: '', avatar_url: '', banner_url: '', image_assets: null });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    // Get HTML content from Tiptap editor
    const sanitizedDescription = DOMPurify.sanitize(formData.description || '');
    const sanitizedLore = DOMPurify.sanitize(formData.lore || '');

    // Construct the image_assets object from individual URL fields
    const image_assets_payload = {
      logo: formData.logo_url || undefined, // Use undefined for null/empty to omit from JSON
      avatar: formData.avatar_url || undefined,
      banner: formData.banner_url || undefined,
    };

    const dataToSubmit: ClassFormData = {
      ...formData,
      description: sanitizedDescription, // Use sanitized HTML from Tiptap
      lore: sanitizedLore,
      // Pass the constructed image_assets object.
      image_assets: image_assets_payload,
    };

    // Remove individual URL fields from dataToSubmit as they are now part of image_assets
    delete dataToSubmit.logo_url;
    delete dataToSubmit.avatar_url;
    delete dataToSubmit.banner_url;

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

  const handleImageSelect = (publicUrl: string) => {
    if (currentImageField) {
      setFormData((prev: ClassFormData) => ({ ...prev, [currentImageField]: publicUrl || '' }));
    }
    setMediaExplorerOpen(false);
    setCurrentImageField(null); // Reset the field tracker
  };

  // This handler is passed to TiptapEditor's onImagePickerOpen prop
  const handleTiptapImagePickerOpen = useCallback((editorInstance: Editor) => {
    setCurrentTiptapEditor(editorInstance); // Store the editor instance
    setMediaExplorerOpen(true);
    setCurrentImageField(null); // Ensure no specific image field is targeted for Tiptap images
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

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Lore
          </label>
          <TiptapEditor
            content={formData.lore || ''}
            onChange={(newContent) => {
              setFormData(prev => ({ ...prev, lore: newContent }));
            }}
            onImagePickerOpen={handleTiptapImagePickerOpen}
          />
        </div>

        {/* Class Logo Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Class Logo (formerly Avatar)
          </label>
          <div className="flex items-start gap-4">
            {formData.logo_url && (
              <div className="relative group">
                <MediaPreview url={formData.logo_url} alt="Class logo" />
                <button
                  type="button"
                  onClick={() => setFormData((prev: ClassFormData) => ({ ...prev, logo_url: '' }))}
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
              onClick={() => { setMediaExplorerOpen(true); setCurrentImageField('logo_url'); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formData.logo_url ? 'Change Logo' : 'Select Logo'}
            </button>
          </div>
        </div>

        {/* Class Avatar Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Class Avatar
          </label>
          <div className="flex items-start gap-4">
            {formData.avatar_url && (
              <div className="relative group">
                <MediaPreview url={formData.avatar_url} alt="Class avatar" />
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
              onClick={() => { setMediaExplorerOpen(true); setCurrentImageField('avatar_url'); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formData.avatar_url ? 'Change Avatar' : 'Select Avatar'}
            </button>
          </div>
        </div>

        {/* Class Banner Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Class Banner
          </label>
          <div className="flex items-start gap-4">
            {formData.banner_url && (
              <div className="relative group">
                <MediaPreview url={formData.banner_url} alt="Class banner" />
                <button
                  type="button"
                  onClick={() => setFormData((prev: ClassFormData) => ({ ...prev, banner_url: '' }))}
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
              onClick={() => { setMediaExplorerOpen(true); setCurrentImageField('banner_url'); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formData.banner_url ? 'Change Banner' : 'Select Banner'}
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
                  onEdit={() => {}}
                  onDelete={() => {}}
                  isSelected={false}
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
            type="button"
            onClick={() => setRawDataModalOpen(true)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
          >
            View Raw
          </button>
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
              <h3 className="text-xl font-semibold text-gray-100">
                Select {currentImageField === 'logo_url' ? 'Class Logo' :
                        currentImageField === 'avatar_url' ? 'Class Avatar' :
                        currentImageField === 'banner_url' ? 'Class Banner' : 'Image'}
              </h3>
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
                onFileSelect={handleImageSelect} // Use the generic handler
                mode="select"
                accept="image/*"
              />
            </div>
          </div>
        </div>
      )}

      {isRawDataModalOpen && (
        <JsonDisplayModal
          data={formData}
          onClose={() => setRawDataModalOpen(false)}
        />
      )}
    </div>
  );
}
