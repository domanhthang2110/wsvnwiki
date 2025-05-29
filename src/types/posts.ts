// src/types/posts.ts
export interface PostTag {
  id: number;
  name: string;
  slug: string;
}

export interface PostItem {
  id: number;
  created_at: string;
  title: string;
  slug: string;
  content: string | null; // Will store HTML string from CKEditor
  featured_image_url?: string | null;
  post_type: 'guide' | 'other';
  status?: 'draft' | 'published' | null;
  published_at?: string | null;
  author_id?: string | null;
  tags?: PostTag[]; // For displaying joined tags
}

// For the form, we omit auto-generated fields and include tag_ids for submission
export type PostFormData = Omit<PostItem, 'id' | 'created_at' | 'tags'> & {
  tag_ids?: number[];
};