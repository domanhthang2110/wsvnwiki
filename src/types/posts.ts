// src/types/posts.ts

// Interface for individual Tag items (remains the same)
export interface PostTag {
  id: number;
  name: string;
  slug: string;
}

// Interface for individual Type items (NEW - define this if not already global)
// This should match the structure of items from your 'types' table
export interface PostTypeItem {
  id: number;
  name: string;
  slug: string;
  // Add any other fields if your 'types' table has them (e.g., description)
}

// Interface for a Post item, reflecting database structure
export interface PostItem {
  id: number;
  created_at: string;
  title: string;
  slug: string;
  content: string | null; // Stores HTML or JSON from your editor
  featured_image_url?: string | null;
  
  // CHANGED: 'post_type' (string) is now 'type_id' (number)
  type_id: number | null; // Foreign key to the 'types' table

  // OPTIONAL: For displaying the type's name if you join 'types' table when fetching posts
  type?: PostTypeItem | null; 

  status?: 'draft' | 'published' | null;
  published_at?: string | null;
  author_id?: string | null; // Assuming this is a foreign key to a users table
  
  // For displaying joined tags (remains the same)
  tags?: PostTag[]; 
}

// For the form data submission
// Omit auto-generated fields and fields populated by joins (like 'tags' object array or 'type' object)
// Include foreign keys and arrays of IDs for relationships.
export type PostFormData = Omit<PostItem, 'id' | 'created_at' | 'tags' | 'type' | 'post_type'> & {
  tag_ids?: number[]; // Array of tag IDs to associate with the post
  type_id: number;     // Ensure type_id is present and is a number for submission
  // The 'post_type' prop from PostForm (e.g., 'guide') is for UI/logic, not direct DB column.
};
