import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { supabase as browserSupabaseClient } from '@/lib/supabase/client'; // Import the client-side client
import type { PostItem, PostRow, TagRow, TypeRow } from '@/types/posts';
import DOMPurify from 'isomorphic-dompurify';

// Function to fetch a single post by slug, including relations and sanitization
export async function getPostBySlug(slug: string): Promise<PostItem | null> {
  const supabase = await createServerSupabaseClient(); // Use server client for request-scoped data
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      tags(id, name, slug),
      types(id, name, slug)
    `)
    .eq('slug', slug)
    .eq('types.slug', 'guide') // Assuming 'guide' is a slug in the 'types' table
    .eq('status', 'published')
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error(`Error fetching post "${slug}":`, error);
    return null;
  }
  if (!data) return null;

  type PostWithRelations = PostRow & {
    tags: TagRow[];
    types: TypeRow;
  };
  const postData = data as PostWithRelations;

  const sanitizedContent = postData.content ? DOMPurify.sanitize(postData.content) : null;

  return {
    ...postData,
    content: sanitizedContent,
    tags: Array.isArray(postData.tags) ? postData.tags : [],
    type: postData.types,
  } as PostItem;
}

// Function to get all post slugs for static generation (uses browser client for build-time safety)
export async function getAllPostSlugs(): Promise<{ slug: string }[]> {
  const supabase = browserSupabaseClient; // Use browser client for build-time data fetching
  try {
    const { data: posts } = await supabase
      .from('posts')
      .select(`slug`) // Removed types!inner(slug) and eq('types.slug', 'guide') for broader testing
      .eq('status', 'published');

    return posts?.map((post: { slug: string }) => ({ slug: post.slug })) || [];
  } catch (e) {
    console.error("Error getting all post slugs:", e);
    return [];
  }
}

// Function to get a list of posts (e.g., for an index page)
export async function getPosts(options?: { typeSlug?: string; limit?: number }): Promise<PostItem[]> {
  const supabase = browserSupabaseClient; // Use browser client for build-time data fetching
  let query = supabase
    .from('posts')
    .select(`
      *,
      tags(id, name, slug),
      types(id, name, slug)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (options?.typeSlug) {
    query = query.eq('types.slug', options.typeSlug);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return data.map(postData => {
    const sanitizedContent = postData.content ? DOMPurify.sanitize(postData.content) : null;
    return {
      ...postData,
      content: sanitizedContent,
      tags: Array.isArray(postData.tags) ? postData.tags : [],
      type: postData.types,
    } as PostItem;
  });
}

// Function to get all tags
export async function getAllTags(): Promise<TagRow[]> {
  const supabase = browserSupabaseClient; // Use browser client for build-time data fetching
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return data;
}
