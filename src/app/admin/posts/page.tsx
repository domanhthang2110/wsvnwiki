'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { PostItem, PostFormData } from '@/types/posts'; 
import PostForm from '@/components/features/admin/posts/PostForm'; 
import Link from 'next/link';
import { Edit, Trash2, PlusCircle, X } from 'lucide-react'; 

export default function AdminPostsPage() {

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);

  const fetchPosts = useCallback(async () => { 
    setIsLoading(true); 
    setPageError(null);

    const { data, error: fetchError } = await supabase
      .from('posts')
      .select('*, types(id, name), tags(id, name)') 
      .order('created_at', { ascending: false });

    if (fetchError) {
        setPageError(fetchError.message);
    } else if (data) {
      const formattedData = data.map((post: PostItem) => ({
        ...post,
        tags: Array.isArray(post.tags) ? post.tags : [],
        type: post.type, 
        type_id: post.type_id || (post.type as any)?.id || null,
      })) as PostItem[];
      setPosts(formattedData);
    }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => { 
    fetchPosts(); 
  }, [fetchPosts]);

  const handleFormSubmit = async (formData: PostFormData): Promise<boolean> => { 
    // Initialize postIdForTags based on whether we are editing or creating
    let postIdForTags: number | null = editingPost ? editingPost.id : null;
    
    const { tag_ids, ...postCoreData } = formData;

    try {
      // --- Step 1: Save or Update the core post data ---
      if (editingPost && editingPost.id) {
        // UPDATE existing post
        const { error: updateError } = await supabase.from('posts').update(postCoreData).eq('id', editingPost.id);
        if (updateError) throw updateError; // If post update fails, throw error
        // postIdForTags is already set from editingPost.id
      } else {
        // CREATE new post
        const { data: newPostData, error: insertError } = await supabase.from('posts').insert([postCoreData]).select('id').single();
        if (insertError) throw insertError; // If post insert fails, throw error
        if (newPostData) {
          postIdForTags = newPostData.id; // Get the ID of the newly created post
        } else {
          // This case should ideally not happen if insertError is null
          throw new Error("Failed to retrieve ID of the newly created post.");
        }
      }

      // --- Step 2: Handle many-to-many relationship for tags ---
      // This part only runs if the post core data was saved successfully AND we have a valid postIdForTags
      if (postIdForTags && tag_ids !== undefined) {
        // Step 2a: Delete all existing tags for this post
        const { error: deleteTagsError } = await supabase
          .from('post_tags')
          .delete()
          .eq('post_id', postIdForTags);

        if (deleteTagsError) {
          // If deleting old tags failed, this is a critical error.
          console.error("Error deleting existing post_tags:", deleteTagsError);
          // We shouldn't proceed to insert new tags as it will likely cause duplicates or leave inconsistent data.
          throw deleteTagsError; 
        }
        
        // Step 2b: Insert new tags if any were selected
        if (tag_ids.length > 0) {
          const newPostTags = tag_ids.map(tag_id => ({ post_id: postIdForTags!, tag_id }));
          const { error: tagsInsertError } = await supabase.from('post_tags').insert(newPostTags);
          
          if (tagsInsertError) {
            // This is where the "duplicate key" error would be caught if delete failed or postIdForTags was wrong.
            console.error("Error inserting new post_tags:", tagsInsertError);
            throw tagsInsertError;
          }
        }
      }
      
      // If we've reached here, all operations were successful.
      setShowForm(false); 
      setEditingPost(null);
      await fetchPosts();
      return true; // Indicate success to the form

    } catch (error: any) {
      // Catch any error thrown from the try block (post save, tags delete, or tags insert)
      console.error("Error in handleFormSubmit:", error);
      setPageError(`Error saving post: ${error.message}`);
      // Re-throw the error so PostForm can catch it and display it in its local formError state
      throw error; 
    }
  };

  const handleEdit = (post: PostItem) => { 
    setEditingPost(post); 
    setShowForm(true);
    setTimeout(() => document.getElementById('postFormContainer')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const handleDelete = async (postId: number, postTitle?: string) => { 
    if (!window.confirm(`Are you sure you want to delete the post "${postTitle || 'this post'}"?`)) return;
    
    const { error: deleteError } = await supabase.from('posts').delete().eq('id', postId);
    
    if (deleteError) {
      setPageError(`Error deleting post: ${deleteError.message}`);
    } else {
      await fetchPosts();
      if (editingPost?.id === postId) { 
        setEditingPost(null); 
        setShowForm(false); 
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 dark:text-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Manage Posts</h1>
        {!showForm && (
          <button 
            onClick={() => { setEditingPost(null); setShowForm(true); setTimeout(() => document.getElementById('postFormContainer')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0); }} 
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md text-sm font-medium flex items-center gap-2"
          >
            <PlusCircle size={18} /> New Post
          </button>
        )}
        {showForm && (
          <button 
            onClick={() => { setShowForm(false); setEditingPost(null); }} 
            className="py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-md text-sm font-medium flex items-center gap-2"
          >
            <X size={18} /> {editingPost ? 'Cancel Edit' : 'Cancel Create'}
          </button>
        )}
      </div>

      {showForm && (
        <div id="postFormContainer">
          <PostForm 
            onSubmit={handleFormSubmit}
            initialData={editingPost}
            isEditing={!!editingPost}
            postType="guide" 
          />
        </div>
      )}

      {!showForm && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Existing Posts</h2>
          {isLoading && <p className="text-center py-4">Loading posts...</p>}
          {pageError && <p className="text-red-500 dark:text-red-400 text-center py-4">Error: {pageError}</p>}
          {!isLoading && !pageError && posts.length === 0 && <p className="text-center py-4 text-gray-500 dark:text-gray-400">No posts yet. Click "New Post" to create one.</p>}
          
          {posts.length > 0 && (
            <ul className="space-y-3">
                {posts.map(post => (
                <li key={post.id} className="p-4 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex justify-between items-center transition-shadow hover:shadow-md">
                    <div className="min-w-0 flex-1">
                      <Link href={`/guides/${post.slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400 truncate">{post.title}</h3>
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-x-2">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                            Type: {post.type?.name || 'N/A'}
                          </span>
                          <span className="inline-block px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                            Status: {post.status || 'N/A'}
                          </span>
                          <span>
                            Tags: {post.tags && post.tags.length > 0 ? post.tags.map(t => t.name).join(', ') : 'None'}
                          </span>
                      </p>
                    </div>
                    <div className="space-x-1 flex-shrink-0 ml-4">
                      <button onClick={() => handleEdit(post)} className="p-2 text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Edit">
                        <Edit size={16}/>
                      </button>
                      <button onClick={() => handleDelete(post.id, post.title)} className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Delete">
                        <Trash2 size={16}/>
                      </button>
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
