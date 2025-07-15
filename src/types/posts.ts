// src/types/posts.ts

import { Database } from './database.types';

// Base types from Supabase auto-generation
export type PostRow = Database['public']['Tables']['posts']['Row'];
export type TagRow = Database['public']['Tables']['tags']['Row'];
export type TypeRow = Database['public']['Tables']['types']['Row'];

// Extended interfaces for joined data or specific application needs
export interface PostItem extends Omit<PostRow, 'image_url' | 'featured_image_url'> {
  tags?: TagRow[]; // For displaying joined tags
  type?: TypeRow;   // For displaying joined type data
  image_url?: string | null; // Add image_url to PostItem
  featured_image_url?: string | null; // Add featured_image_url to PostItem
}

// For the form data submission
// Omit auto-generated fields and fields populated by joins (like 'tags' object array or 'type' object)
// Include foreign keys and arrays of IDs for relationships.
export type PostFormData = Omit<PostItem, 'id' | 'created_at' | 'tags' | 'type' | 'image_url' | 'updated_at'> & {
  tag_ids?: number[]; // Array of tag IDs to associate with the post
  type_id: number;     // Ensure type_id is present and is a number for submission
  image_url?: string | null; // Make image_url optional and allow null
  updated_at?: string; // Allow updated_at to be optional
};
