'use client';

import React, { useState, useEffect, FormEvent, useCallback, useRef } from 'react';
import { PostFormData, PostItem, PostTag } from '@/types/posts';
import { supabase } from '@/lib/supabaseClient';
import MediaFileExplorer from '../media/MediaFileExplorer';
import { CloseIcon } from '@/components/icons'; // Assuming icons.tsx is in src/components

// Dynamically import CKEditor to ensure it only runs on the client-side
import { CKEditor } from '@ckeditor/ckeditor5-react';
let ClassicEditor: any = null; // Will be assigned after import
if (typeof window !== 'undefined') {
  import('@ckeditor/ckeditor5-build-classic').then(editorModule => {
    ClassicEditor = editorModule.default;
  }).catch(error => console.error("Failed to load ClassicEditor", error));
}


interface PostFormProps {
  onSubmit: (data: PostFormData) => Promise<boolean | void>;
  initialData?: PostItem | null;
  isEditing: boolean;
  postType: 'guide' | 'other';
}

export default function PostForm({ onSubmit, initialData, isEditing, postType }: PostFormProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [contentHtml, setContentHtml] = useState(''); // For CKEditor HTML content
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  
  const [availableTags, setAvailableTags] = useState<PostTag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [showMediaPickerModal, setShowMediaPickerModal] = useState(false);
  // No mediaPickerTarget or activeEditorInstance needed for CKEditor basic image URL insertion yet

  // Autosave state
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>('');

  const [editorLoaded, setEditorLoaded] = useState(false);
  useEffect(() => {
    // This ensures ClassicEditor is loaded before trying to render CKEditor
    if (typeof window !== 'undefined' && ClassicEditor) {
      setEditorLoaded(true);
    }
  }, []);


  useEffect(() => { // Fetch available tags
    const fetchTags = async () => {
      const { data, error } = await supabase.from('tags').select('id, name, slug');
      if (error) console.error("Error fetching tags:", error);
      else if (data) setAvailableTags(data as PostTag[]);
    };
    fetchTags();
  }, []);
  
  useEffect(() => { // Populate form with initialData
    if (initialData) {
      setTitle(initialData.title || '');
      setSlug(initialData.slug || '');
      const initialEditorContent = typeof initialData.content === 'string' ? initialData.content : '';
      setContentHtml(initialEditorContent);
      lastSavedContentRef.current = initialEditorContent;
      setFeaturedImageUrl(initialData.featured_image_url || '');
      setStatus(initialData.status || 'draft');
      if (initialData.tags) {
        setSelectedTagIds(new Set(initialData.tags.map(t => t.id)));
      } else if (isEditing && initialData.id) { 
        const fetchPostTags = async () => {
            const { data: postTagsData } = await supabase.from('post_tags').select('tag_id').eq('post_id', initialData.id);
            if (postTagsData) setSelectedTagIds(new Set(postTagsData.map(pt => pt.tag_id)));
        };
        fetchPostTags();
      } else {
        setSelectedTagIds(new Set());
      }
      setIsDirty(false);
    } else { 
      setTitle(''); setSlug(''); setContentHtml(''); lastSavedContentRef.current = '';
      setFeaturedImageUrl(''); setStatus('draft'); setSelectedTagIds(new Set());
      setIsDirty(false);
    }
  }, [initialData, isEditing]);

  useEffect(() => { // Auto-generate slug
    if ((!isEditing && !slug) || (isEditing && slug !== initialData?.slug && title !== initialData?.title)) {
      if (title) setSlug(title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
      else setSlug('');
    }
  }, [title, isEditing, initialData, slug]);

  const handleEditorChange = (event: any, editor: any) => {
    const data = editor.getData(); // CKEditor instance provides getData()
    setContentHtml(data);
    if (data !== lastSavedContentRef.current) {
      setIsDirty(true);
    }
    setSaveStatus(''); 
  };
  
  const openMediaPickerForFeaturedImage = () => {
    setShowMediaPickerModal(true);
  };

  const handleFileSelectedFromPicker = (publicUrl: string) => {
    // For now, this only sets the featured image.
    // Inserting into CKEditor needs a custom adapter or different approach.
    setFeaturedImageUrl(publicUrl);
    setShowMediaPickerModal(false);
  };

  const triggerSave = useCallback(async (isAutosave: boolean = false): Promise<boolean> => {
    if (!isAutosave) setIsSubmitting(true);
    setFormError(null);
    if (isAutosave) setSaveStatus('Autosaving...');

    if (!title.trim() || !slug.trim()) { 
        setFormError("Title and Slug are required.");
        if (!isAutosave) setIsSubmitting(false);
        if (isAutosave) setSaveStatus('Autosave failed: Missing title/slug');
        return false; 
    }
    if (!contentHtml.trim() || contentHtml === '<p>&nbsp;</p>') { // CKEditor empty state might be <p>&nbsp;</p>
        setFormError("Content cannot be empty.");
        if (!isAutosave) setIsSubmitting(false);
        if (isAutosave) setSaveStatus('Autosave failed: Empty content');
        return false;
    }

    const postData: PostFormData = {
      title: title.trim(), slug: slug.trim(), content: contentHtml,
      featured_image_url: featuredImageUrl.trim() || null,
      post_type: postType, status: status,
      published_at: status === 'published' ? new Date().toISOString() : (isEditing ? initialData?.published_at : null),
      tag_ids: Array.from(selectedTagIds),
    };
    
    try {
      const success = await onSubmit(postData); 
      if (success || success === undefined) { // Assume success if onSubmit doesn't return false
        setIsDirty(false); 
        lastSavedContentRef.current = contentHtml;
        if (isAutosave) setSaveStatus('Saved ✓');
        if (!isEditing && !isAutosave) { 
          setTitle(''); setSlug(''); setContentHtml(''); lastSavedContentRef.current = '';
          setFeaturedImageUrl(''); setStatus('draft'); setSelectedTagIds(new Set());
        }
        return true; 
      }
      return false; // onSubmit returned false
    } catch (error: any) {
      setFormError(error.message || 'Failed to save post.');
      if (isAutosave) setSaveStatus('Autosave Error!');
      return false; 
    } finally {
      if (!isAutosave) setIsSubmitting(false);
    }
  }, [title, slug, contentHtml, featuredImageUrl, postType, status, selectedTagIds, onSubmit, isEditing, initialData]);

  useEffect(() => { // Autosave Effect
    if (isAutosaveEnabled && isDirty && isEditing && initialData?.id) { 
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = setTimeout(() => { triggerSave(true); }, 5000); 
    }
    return () => { if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current); };
  }, [contentHtml, isAutosaveEnabled, isDirty, isEditing, initialData?.id, triggerSave]);
  
  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) newSet.delete(tagId);
      else newSet.add(tagId);
      return newSet;
    });
    setIsDirty(true); // Changing tags makes the form dirty
  };

  return (
    <div className="mb-10 p-6 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-md">
        <h2 className="text-xl font-semibold mb-6 text-gray-700 dark:text-gray-200">
            {isEditing ? `Edit ${postType}` : `Create New ${postType}`}
        </h2>
        <form onSubmit={(e) => { e.preventDefault(); triggerSave(false); }} className="space-y-6">
            <div>
                <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title:</label>
                <input type="text" id="postTitle" value={title} onChange={(e) => {setTitle(e.target.value); setIsDirty(true);}} required
                       className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
                <label htmlFor="postSlug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug:</label>
                <input type="text" id="postSlug" value={slug} onChange={(e) => {setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); setIsDirty(true);}} required
                       className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Featured Image:</label>
                {featuredImageUrl && <img src={featuredImageUrl} alt="Featured" className="max-h-40 rounded border p-1 dark:border-gray-600 mb-2" />}
                <button type="button" onClick={openMediaPickerForFeaturedImage}
                        className="py-2 px-3 text-sm rounded-md border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                    {featuredImageUrl ? 'Change' : 'Select'} Featured Image
                </button>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags:</label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md dark:border-gray-600 max-h-32 overflow-y-auto">
                    {availableTags.length > 0 ? availableTags.map(tag => (
                        <button key={tag.id} type="button" onClick={() => handleTagToggle(tag.id)}
                                className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedTagIds.has(tag.id) ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-500 dark:hover:bg-gray-600'}`}>
                            {tag.name}
                        </button>
                    )) : <p className="text-xs text-gray-500 dark:text-gray-400">No tags available. Create some first in the 'Tags' section.</p>}
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content:</label>
                {editorLoaded && ClassicEditor ? (
                    <CKEditor
                        editor={ClassicEditor}
                        data={contentHtml}
                        onChange={handleEditorChange}
                        config={{
                            // Example: Basic toolbar configuration
                            // You can customize this extensively.
                            // The 'imageUpload' button in the default toolbar will likely prompt for a URL.
                            // We will replace this with a custom button/adapter later.
                            toolbar: [
                                'heading', '|', 
                                'bold', 'italic', 'link', '|',
                                'bulletedList', 'numberedList', '|',
                                'blockQuote', 'insertTable', '|',
                                'imageUpload', /* This is CKEditor's default, usually expects URL or adapter */
                                '|', 'undo', 'redo'
                            ],
                            // You might need to configure an image upload adapter here later
                            // for direct uploads or to integrate MediaFileExplorer.
                        }}
                    />
                ) : (
                     <div className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 min-h-[300px] flex items-center justify-center text-gray-400">
                        Loading Editor...
                     </div>
                )}
                 {isEditing && (
                    <div className="mt-2 flex items-center justify-end space-x-3 text-xs text-gray-600 dark:text-gray-400">
                    <label htmlFor="form-autosave-toggle" className="flex items-center cursor-pointer">
                        <input type="checkbox" id="form-autosave-toggle" checked={isAutosaveEnabled} onChange={() => setIsAutosaveEnabled(!isAutosaveEnabled)} className="mr-1.5 h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                        Autosave
                    </label>
                    {saveStatus && <span className="italic">{saveStatus}</span>}
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="postStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
                <select id="postStatus" value={status} onChange={(e) => {setStatus(e.target.value as 'draft' | 'published'); setIsDirty(true);}}
                        className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white h-[42px]">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                </select>
            </div>

            {formError && <p className="text-red-500 dark:text-red-400">{formError}</p>}
            <button type="submit" disabled={isSubmitting}
                    className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-50">
                {isSubmitting && !saveStatus.includes('Autosaving') ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : `Create ${postType}`)}
            </button>

            {/* Modal for Media Picker (for Featured Image) */}
            {showMediaPickerModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 pb-3 border-b dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Select Featured Image</h3>
                        <button onClick={() => {setShowMediaPickerModal(false);}} className="p-1 text-gray-500 hover:text-red-500"><CloseIcon /></button>
                        </div>
                        <div className="flex-grow overflow-y-auto min-h-[300px]">
                        <MediaFileExplorer
                            bucketName="media" // Or your specific bucket
                            initialPath={"posts/featured/"} // Suggest a starting path
                            onFileSelect={handleFileSelectedFromPicker}
                            mode="select"
                            accept="image/*" 
                        />
                        </div>
                    </div>
                </div>
            )}
        </form>
    </div>
  );
}