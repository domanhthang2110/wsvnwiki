'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { PostItem, PostFormData } from '@/types/posts'; // Adjust path
import PostForm from '@/components/admin/posts/PostForm'; // Adjust path
import Link from 'next/link';
import { EditIcon, DeleteIcon } from '@/components/icons'; // Assuming icons.tsx

export default function AdminGuidesPage() {
  const [guides, setGuides] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingGuide, setEditingGuide] = useState<PostItem | null>(null);

  const fetchGuides = useCallback(async () => { /* ... same as before ... */ 
    setIsLoading(true); setPageError(null);
    const { data, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, slug, created_at, status, post_type, tags(id, name)') 
      .eq('post_type', 'guide')
      .order('created_at', { ascending: false });

    if (fetchError) setPageError(fetchError.message);
    else if (data) {
      const formattedData = data.map(post => ({...post, tags: Array.isArray(post.tags) ? post.tags : []})) as PostItem[];
      setGuides(formattedData);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchGuides(); }, [fetchGuides]);

  const handleFormSubmit = async (formData: PostFormData): Promise<boolean> => { /* ... same as before ... */ 
    let operationError = null;
    let postIdForTags: number | null = editingGuide ? editingGuide.id : null;
    const { tag_ids, ...postCoreData } = formData;

    if (editingGuide && editingGuide.id) {
      const { error: updateError } = await supabase.from('posts').update(postCoreData).eq('id', editingGuide.id);
      operationError = updateError;
    } else {
      const { data: newPostData, error: insertError } = await supabase.from('posts').insert([postCoreData]).select('id').single();
      operationError = insertError;
      if (newPostData) postIdForTags = newPostData.id;
    }

    if (!operationError && postIdForTags && tag_ids !== undefined) {
      await supabase.from('post_tags').delete().eq('post_id', postIdForTags);
      if (tag_ids.length > 0) {
        const newPostTags = tag_ids.map(tag_id => ({ post_id: postIdForTags!, tag_id }));
        const { error: tagsInsertError } = await supabase.from('post_tags').insert(newPostTags);
        if (tagsInsertError) operationError = operationError || tagsInsertError;
      }
    }
    
    if (operationError) {
      console.error("Error saving guide/tags:", operationError);
      setPageError(`Error saving guide: ${operationError.message}`);
      throw operationError; 
    } else {
      setShowForm(false); setEditingGuide(null);
      await fetchGuides();
      return true; 
    }
  };

  const handleEdit = (guide: PostItem) => { /* ... same as before ... */ 
    setEditingGuide(guide); setShowForm(true);
    setTimeout(() => document.getElementById('guideFormContainer')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };
  const handleDelete = async (guideId: number, guideTitle?: string) => { /* ... same as before ... */ 
     if (!window.confirm(`Delete guide "${guideTitle || 'this guide'}"?`)) return;
    const { error: deleteError } = await supabase.from('posts').delete().eq('id', guideId);
    if (deleteError) setPageError(`Error deleting guide: ${deleteError.message}`);
    else {
      await fetchGuides();
      if (editingGuide?.id === guideId) { setEditingGuide(null); setShowForm(false); }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 dark:text-gray-100">
      {/* ... Title and New Guide/Cancel buttons (same as before) ... */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Manage Guides</h1>
        {!showForm && (<button onClick={() => { setEditingGuide(null); setShowForm(true); setTimeout(() => document.getElementById('guideFormContainer')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),0); }} className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md text-sm font-medium">+ New Guide</button>)}
        {showForm && (<button onClick={() => { setShowForm(false); setEditingGuide(null); }} className="py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md text-sm font-medium">{editingGuide ? 'Cancel Edit' : 'Cancel Create'}</button>)}
      </div>


      {showForm && (
        <div id="guideFormContainer">
          <PostForm 
            onSubmit={handleFormSubmit}
            initialData={editingGuide}
            isEditing={!!editingGuide}
            postType="guide"
          />
        </div>
      )}

      {!showForm && (
        <div className="mt-8">
          {/* ... List rendering using guide.title, guide.slug, guide.status, guide.tags, EditIcon, DeleteIcon (same as before) ... */}
          <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Existing Guides</h2>
          {isLoading && <p className="text-center py-4">Loading guides...</p>}
          {pageError && <p className="text-red-500 dark:text-red-400 text-center py-4">Error: {pageError}</p>}
          {!isLoading && !pageError && guides.length === 0 && <p className="text-center py-4 text-gray-500 dark:text-gray-400">No guides yet.</p>}
          
          {guides.length > 0 && (
            <ul className="space-y-3">
                {guides.map(guide => (
                <li key={guide.id} className="p-4 border rounded-md dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex justify-between items-center">
                    <div className="min-w-0 flex-1">
                      <Link href={`/guides/${guide.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400 truncate">{guide.title}</h3>
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                          Slug: {guide.slug} | Status: {guide.status || 'N/A'} | 
                          Tags: {guide.tags && guide.tags.length > 0 ? guide.tags.map(t => t.name).join(', ') : 'None'}
                      </p>
                    </div>
                    <div className="space-x-2 flex-shrink-0">
                      <button onClick={() => handleEdit(guide)} className="p-1.5 text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-500" title="Edit"><EditIcon/></button>
                      <button onClick={() => handleDelete(guide.id, guide.title)} className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500" title="Delete"><DeleteIcon/></button>
                    </div>
                </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}