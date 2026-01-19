'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import NextImage from 'next/image';
import { PostFormData, PostItem, TagRow, TypeRow } from '@/types/posts'; // Use TagRow and TypeRow
import { supabase } from '@/lib/supabase/client'; // Update Supabase client path
import MediaFileExplorer from '@/components/features/admin/media/MediaFileExplorer'; // Update path
import { CloseIcon } from '@/components/shared/icons'; // Update icons path
import TiptapEditor from '@/components/features/editor/TiptapEditor'; // Update TiptapEditor path
import { type Editor } from '@tiptap/react';
import { slugify } from '@/lib/utils'; // Import slugify from utils
import { GuideContentRenderer } from '@/components/features/wiki/guides/GuideContentRenderer';

// Removed local PostTypeItem interface, using TypeRow from '@/types/posts'

interface PostFormProps {
  onSubmit: (data: PostFormData) => Promise<boolean | void>;
  initialData?: PostItem | null;
  isEditing: boolean;
  postType: 'guide' | 'other';
}

export default function PostForm({ onSubmit, initialData, isEditing, postType }: PostFormProps) {
  // --- 1. STATE DECLARATIONS ---
  const [title, setTitle] = useState('');
  const slug = slugify(title); // Slug is derived
  const [contentHtml, setContentHtml] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [availableTags, setAvailableTags] = useState<TagRow[]>([]); // Use TagRow
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());
  const [availableTypes, setAvailableTypes] = useState<TypeRow[]>([]); // Use TypeRow
  const [selectedTypeId, setSelectedTypeId] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showContentPreview, setShowContentPreview] = useState(false);
  const [showWikiPreview, setShowWikiPreview] = useState(false);
  const [showMediaPickerModal, setShowMediaPickerModal] = useState(false);
  const [showImageUrlModal, setShowImageUrlModal] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageTarget, setImageTarget] = useState<'featured' | 'tiptap' | null>(null);
  const editorRef = useRef<Editor | null>(null);
  // Removed autosave related state: isAutosaveEnabled, saveStatus, isDirty, autosaveTimeoutRef

  // --- 2. CALLBACKS & MEMOIZED FUNCTIONS ---
  const triggerSave = useCallback(async (): Promise<boolean> => {
    setIsSubmitting(true);
    setFormError(null);

    if (!title.trim() || !slug.trim() || !contentHtml.trim() || selectedTypeId === '') {
      setFormError("Title, Slug, Content, and Type are required.");
      setIsSubmitting(false);
      return false;
    }

    const postData: PostFormData = {
      title: title.trim(),
      slug: slug.trim(),
      content: contentHtml,
      featured_image_url: featuredImageUrl.trim() || null,
      status,
      // published_at logic depends on whether you want to update it on every save when 'published'
      // For simplicity, let's set/update it if status is 'published'
      published_at: status === 'published' ? new Date().toISOString() : (isEditing && initialData?.published_at ? initialData.published_at : null),
      tag_ids: Array.from(selectedTagIds),
      type_id: Number(selectedTypeId),
    };

    try {
      const success = await onSubmit(postData);
      if (success !== false) { // Assuming onSubmit returns true on success or void, and false/throws on error
        if (!isEditing) { // Reset form only if creating a new post
          setTitle('');
          setContentHtml('');
          setFeaturedImageUrl('');
          setStatus('draft');
          setSelectedTagIds(new Set());
          setSelectedTypeId('');
        }
        // Optionally, provide a success message to the user here (e.g., using a toast notification)
        return true;
      }
      return false; // onSubmit indicated failure
    } catch (error: unknown) {
      let errorMessage = 'Failed to save post.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setFormError(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [title, slug, contentHtml, featuredImageUrl, status, selectedTagIds, selectedTypeId, onSubmit, isEditing, initialData]);

  // --- 3. SIDE EFFECTS (useEffect) ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: tagsData, error: tagsError } = await supabase.from('tags').select('id, name, slug');
        if (tagsError) throw tagsError;
        if (tagsData) setAvailableTags(tagsData as TagRow[]); // Cast to TagRow[]
      } catch (error) { console.error("Error fetching tags:", error); }
      try {
        const { data: typesData, error: typesError } = await supabase.from('types').select('id, name, slug');
        if (typesError) throw typesError;
        if (typesData) setAvailableTypes(typesData as TypeRow[]); // Cast to TypeRow[]
      } catch (error) { console.error("Error fetching types:", error); }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      // Slug is derived, no need to set it from initialData directly unless you want to preserve old slugs
      // If you want to preserve old slugs that might not match the current title:
      // setSlugToPreserve(initialData.slug || ''); // And use this for the slug input if title hasn't changed
      setContentHtml(typeof initialData.content === 'string' ? initialData.content : '');
      setFeaturedImageUrl(initialData.featured_image_url || '');
      setStatus((initialData.status as 'draft' | 'published') || 'draft'); // Cast initialData.status
      setSelectedTypeId(initialData.type_id || '');

      if (isEditing && initialData.id) {
        const fetchPostTags = async () => {
          const { data } = await supabase.from('post_tags').select('tag_id').eq('post_id', initialData.id);
          if (data) setSelectedTagIds(new Set(data.map((pt: { tag_id: number }) => pt.tag_id))); // Explicitly type pt
        };
        fetchPostTags();
      }
    } else {
      setTitle('');
      setContentHtml('');
      setFeaturedImageUrl('');
      setStatus('draft');
      setSelectedTagIds(new Set());
      setSelectedTypeId('');
    }
  }, [initialData, isEditing]);

  // Removed autosave useEffect

  // --- 4. OTHER HANDLER FUNCTIONS ---
  // Removed setIsDirty from these handlers
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleContentChange = (newContent: string) => {
    setContentHtml(newContent);
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      return newSet;
    });
  };


  const handleFeaturedImageChange = (newUrl: string) => {
    setFeaturedImageUrl(newUrl);
  };

  const handleStatusChange = (newStatus: 'draft' | 'published') => {
    setStatus(newStatus);
  };

  const handleTypeChange = (newTypeId: number | '') => {
    setSelectedTypeId(newTypeId);
  };


  const openImagePicker = (target: 'featured' | 'tiptap', editor?: Editor) => {
    setImageTarget(target);
    if (editor) editorRef.current = editor;
    setShowMediaPickerModal(true);
  };

  const openImageUrlInput = (target: 'featured' | 'tiptap', editor?: Editor) => {
    setImageTarget(target);
    if (editor) editorRef.current = editor;
    setImageUrlInput('');
    setShowImageUrlModal(true);
  };

  const handleImageUrlSubmit = () => {
    if (!imageUrlInput.trim()) return;

    if (imageTarget === 'featured') {
      handleFeaturedImageChange(imageUrlInput.trim());
    } else if (imageTarget === 'tiptap' && editorRef.current) {
      editorRef.current
        .chain()
        .focus()
        .insertContent({
          type: 'image',
          attrs: {
            src: imageUrlInput.trim(),
            alt: '',
            class: 'inline-block align-bottom m-0',
          }
        })
        .run();
    }
    setShowImageUrlModal(false);
    setImageTarget(null);
    setImageUrlInput('');
    void editorRef.current?.commands.focus();
  };

  const handleFileSelectedFromPicker = (publicUrl: string) => {
    if (imageTarget === 'featured') {
      handleFeaturedImageChange(publicUrl);
    } else if (imageTarget === 'tiptap' && editorRef.current) {
      editorRef.current
        .chain()
        .focus()
        .insertContent({
          type: 'image',
          attrs: {
            src: publicUrl,
            alt: '',
            class: 'inline-block align-bottom m-0',
          }
        })
        .run();
    }
    setShowMediaPickerModal(false);
    setImageTarget(null);
    void editorRef.current?.commands.focus();
  };


  // --- 5. RENDER ---
  return (
    <div className="mb-6 p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
          {isEditing ? `Edit ${initialData?.title || 'Post'}` : `Create New ${postType}`}
        </h2>
        {/* Removed saveStatus display */}
      </div>

      {formError && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md">
          {formError}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); triggerSave(); }} className="space-y-4">
        <div>
          <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title:</label>
          <input type="text" id="postTitle" value={title} onChange={(e) => handleTitleChange(e.target.value)} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        </div>
        <div>
          <label htmlFor="postSlug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug:</label>
          <input type="text" id="postSlug" value={slug} readOnly required className="mt-1 w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed" />
        </div>

        <div>
          <label htmlFor="postTypeSelector" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type:</label>
          <select
            id="postTypeSelector"
            value={selectedTypeId}
            onChange={(e) => handleTypeChange(e.target.value === '' ? '' : Number(e.target.value))}
            required
            className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white h-[42px]"
          >
            <option value="" disabled>Select a type...</option>
            {availableTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Featured Image:</label>
          {featuredImageUrl && (
            <div className="relative w-40 h-40 max-h-40 rounded border p-1 dark:border-gray-600 mb-2 overflow-hidden">
              <NextImage src={featuredImageUrl} alt="Featured" fill className="object-contain" />
            </div>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => openImagePicker('featured')} className="py-2 px-3 text-sm rounded-md border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
              {featuredImageUrl ? 'Change from Files' : 'Select from Files'}
            </button>
            <button type="button" onClick={() => openImageUrlInput('featured')} className="py-2 px-3 text-sm rounded-md border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
              Enter Image URL
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags:</label>
          <div className="flex flex-wrap gap-2 p-2 border rounded-md dark:border-gray-600 max-h-32 overflow-y-auto">
            {availableTags.map(tag => (
              <button key={tag.id} type="button" onClick={() => handleTagToggle(tag.id)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedTagIds.has(tag.id) ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-500 dark:hover:bg-gray-600'}`}>{tag.name}</button>
            ))}
          </div>
        </div>

        <div className="w-full">
          <TiptapEditor
            key={initialData?.id || 'new-post'} // This 'key' is critical
            content={contentHtml}
            onChange={handleContentChange}
            onImagePickerOpen={(editor) => openImagePicker('tiptap', editor)}
            onImageUrlOpen={(editor) => openImageUrlInput('tiptap', editor)}
          />
        </div>

        <div>
          <label htmlFor="postStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
          <select id="postStatus" value={status} onChange={(e) => handleStatusChange(e.target.value as 'draft' | 'published')} className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white h-[42px]">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex items-center space-x-4 pt-4">
          <button type="submit" disabled={isSubmitting} className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-50">
            {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : `Create Post`)}
          </button>
          <button type="button" onClick={() => setShowContentPreview(true)} className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md">Preview Content</button>
          <button type="button" onClick={() => setShowWikiPreview(true)} className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md">Wiki Preview</button>
        </div>
      </form>

      {/* Content Preview Modal */}
      {showContentPreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-3 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Post Content Preview</h3>
              <button onClick={() => setShowContentPreview(false)} className="p-1 text-gray-500 hover:text-red-500"><CloseIcon /></button>
            </div>
            <div className="flex-grow overflow-y-auto prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />
          </div>
        </div>
      )}

      {/* Wiki Preview Modal - Fullscreen */}
      {showWikiPreview && (
        <div className="fixed inset-0 z-50 bg-gray-900">
          {/* Sticky Close Button */}
          <button
            onClick={() => setShowWikiPreview(false)}
            className="fixed top-4 right-4 z-60 p-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
            title="Close Wiki Preview"
          >
            <CloseIcon />
          </button>

          {/* Fullscreen Wiki Content */}
          <div className="h-full overflow-y-auto">
            <GuideContentRenderer
              content={contentHtml}
              title={title || 'Untitled Post'}
              featuredImageUrl={featuredImageUrl || undefined}
              tags={availableTags.filter(tag => selectedTagIds.has(tag.id))}
            />
          </div>
        </div>
      )}
      {showMediaPickerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {imageTarget === 'featured' ? 'Select Featured Image' : 'Select Content Image'}
              </h3>
              <button onClick={() => { setShowMediaPickerModal(false); editorRef.current?.commands.focus(); }} className="p-1 text-gray-500 hover:text-red-500"><CloseIcon /></button>
            </div>
            <div className="flex-grow overflow-y-auto min-h-[300px]">
              <MediaFileExplorer bucketName="media" onFileSelect={handleFileSelectedFromPicker} mode="select" accept="image/*" />
            </div>
          </div>
        </div>
      )}

      {showImageUrlModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {imageTarget === 'featured' ? 'Enter Featured Image URL' : 'Enter Image URL'}
              </h3>
              <button onClick={() => { setShowImageUrlModal(false); editorRef.current?.commands.focus(); }} className="p-1 text-gray-500 hover:text-red-500"><CloseIcon /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image URL:
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleImageUrlSubmit();
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowImageUrlModal(false); editorRef.current?.commands.focus(); }}
                  className="py-2 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImageUrlSubmit}
                  disabled={!imageUrlInput.trim()}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
