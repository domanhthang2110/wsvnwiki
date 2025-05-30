'use client';

import React, { useState, useEffect, FormEvent, useCallback, useRef } from 'react';
import { PostFormData, PostItem, PostTag } from '@/types/posts'; 
import { supabase } from '@/lib/supabaseClient'; 
import MediaFileExplorer from '../media/MediaFileExplorer'; 
import { CloseIcon } from '@/components/icons'; 
import TiptapEditor from '@/components/editor/TiptapEditor'; 
import { type Editor } from '@tiptap/react';

interface PostTypeItem {
  id: number;
  name: string;
  slug: string;
}

interface PostFormProps {
  onSubmit: (data: PostFormData) => Promise<boolean | void>;
  initialData?: PostItem | null;
  isEditing: boolean;
  postType: 'guide' | 'other'; 
}

// Helper function to generate slugs (assuming it's defined elsewhere or here)
const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '') 
    .replace(/--+/g, '-'); 
};

export default function PostForm({ onSubmit, initialData, isEditing, postType }: PostFormProps) {
  // --- 1. STATE DECLARATIONS ---
  const [title, setTitle] = useState('');
  const slug = slugify(title); // Slug is derived
  const [contentHtml, setContentHtml] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [availableTags, setAvailableTags] = useState<PostTag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());
  const [availableTypes, setAvailableTypes] = useState<PostTypeItem[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showContentPreview, setShowContentPreview] = useState(false);
  const [showMediaPickerModal, setShowMediaPickerModal] = useState(false);
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
      published_at: status === 'published' ? new Date().toISOString() : (isEditing ? initialData?.published_at : null),
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
    } catch (error: any) {
      setFormError(error.message || 'Failed to save post.');
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
        if (tagsData) setAvailableTags(tagsData as PostTag[]);
      } catch (error) { console.error("Error fetching tags:", error); }
      try {
        const { data: typesData, error: typesError } = await supabase.from('types').select('id, name, slug');
        if (typesError) throw typesError;
        if (typesData) setAvailableTypes(typesData as PostTypeItem[]);
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
      setStatus(initialData.status || 'draft');
      setSelectedTypeId(initialData.type_id || ''); 

      if (isEditing && initialData.id) {
        const fetchPostTags = async () => {
          const { data } = await supabase.from('post_tags').select('tag_id').eq('post_id', initialData.id);
          if (data) setSelectedTagIds(new Set(data.map(pt => pt.tag_id)));
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
      newSet.has(tagId) ? newSet.delete(tagId) : newSet.add(tagId);
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
            class: 'inline-block align-middle m-0',
          }
        })
        .run();
    }
    setShowMediaPickerModal(false);
    setImageTarget(null);
    editorRef.current?.commands.focus(); 
  };
  

  // --- 5. RENDER ---
  return (
    <div className="mb-10 p-6 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-md">
      <div className="flex justify-between items-center mb-6">
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

      <form onSubmit={(e) => { e.preventDefault(); triggerSave(); }} className="space-y-6">
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
            {featuredImageUrl && <img src={featuredImageUrl} alt="Featured" className="max-h-40 rounded border p-1 dark:border-gray-600 mb-2" />}
            <button type="button" onClick={() => openImagePicker('featured')} className="py-2 px-3 text-sm rounded-md border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                {featuredImageUrl ? 'Change' : 'Select'} Featured Image
            </button>
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
            content={contentHtml}
            onChange={handleContentChange}
            onImagePickerOpen={(editor) => openImagePicker('tiptap', editor)}
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
        </div>
      </form>

      {/* Modals remain the same */}
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
      {showMediaPickerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {imageTarget === 'featured' ? 'Select Featured Image' : 'Select Content Image'}
              </h3>
              <button onClick={() => {setShowMediaPickerModal(false); editorRef.current?.commands.focus();}} className="p-1 text-gray-500 hover:text-red-500"><CloseIcon /></button>
            </div>
            <div className="flex-grow overflow-y-auto min-h-[300px]">
              <MediaFileExplorer bucketName="media" initialPath={imageTarget === 'featured' ? "posts/featured/" : "posts/content/"} onFileSelect={handleFileSelectedFromPicker} mode="select" accept="image/*" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
