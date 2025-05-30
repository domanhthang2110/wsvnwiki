'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { Edit3, Trash2, Tag, Type, AlertTriangle, PlusCircle } from 'lucide-react';

// --- Helper Function ---
const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
};

// --- TypeScript Interfaces ---
interface TaxonomyItem {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

interface TaxonomyFormProps {
  onSubmit: (data: { name: string; slug: string; category: 'tags' | 'types' }) => Promise<void>;
  initialData: { id?: number; name: string; category: 'tags' | 'types' } | null;
  isEditing: boolean;
  onCancelEdit: () => void;
}

interface TaxonomyCardProps {
  item: TaxonomyItem;
  categoryName: 'Tag' | 'Type';
  onEdit: (item: TaxonomyItem, category: 'tags' | 'types') => void;
  onDelete: (item: TaxonomyItem, category: 'tags' | 'types') => void;
}


// --- TaxonomyForm Component ---
function TaxonomyForm({ onSubmit, initialData, isEditing, onCancelEdit }: TaxonomyFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'tags' | 'types'>('tags');
  const [slug, setSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setSlug(slugify(initialData.name)); // Slug is always derived for simplicity
    } else {
      setName('');
      setCategory('tags'); // Default to tags for new entries
      setSlug('');
    }
  }, [initialData]);

  useEffect(() => {
    // Auto-generate slug from name, unless editing and name hasn't changed
    // Or if the initial slug was different (though we're enforcing slugify(name) now)
    if (!isEditing || (initialData && name !== initialData.name)) {
        setSlug(slugify(name));
    } else if (isEditing && initialData) {
        setSlug(slugify(name)); // Always keep slug in sync with name
    }
  }, [name, isEditing, initialData]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Name cannot be empty.');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await onSubmit({ name: name.trim(), slug: slug.trim(), category });
      if (!isEditing) { // Clear form only on successful creation
        setName('');
        // setCategory('tags'); // Keep category or reset as preferred
        setSlug('');
      }
    } catch (error: any) {
      setFormError(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl mb-10">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        {isEditing ? `Edit ${initialData?.category === 'tags' ? 'Tag' : 'Type'}` : 'Create New Tag/Type'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="taxonomy-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </label>
          <input
            id="taxonomy-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="taxonomy-slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Slug (auto-generated)
          </label>
          <input
            id="taxonomy-slug"
            type="text"
            value={slug}
            readOnly // Slug is not directly editable
            className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="taxonomy-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            id="taxonomy-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as 'tags' | 'types')}
            disabled={isEditing} // Cannot change category when editing
            className={`mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${isEditing ? 'bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed' : ''}`}
          >
            <option value="tags">Tag</option>
            <option value="types">Type</option>
          </select>
        </div>

        {formError && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertTriangle size={16} /> {formError}
          </p>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
          >
            {isSubmitting ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isEditing ? 'Save Changes' : 'Create Item'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 font-semibold rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// --- TaxonomyCard Component ---
function TaxonomyCard({ item, categoryName, onEdit, onDelete }: TaxonomyCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex flex-col justify-between transition-all hover:shadow-xl">
      <div>
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-1">{item.name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full inline-block">
          Slug: {item.slug}
        </p>
         <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Created: {new Date(item.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => onEdit(item, categoryName.toLowerCase() as 'tags' | 'types')}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-gray-700 transition"
          aria-label={`Edit ${categoryName}`}
        >
          <Edit3 size={18} />
        </button>
        <button
          onClick={() => onDelete(item, categoryName.toLowerCase() as 'tags' | 'types')}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-gray-700 transition"
          aria-label={`Delete ${categoryName}`}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

// --- AdminTaxonomyPage Component (Main Page) ---
export default function AdminTaxonomyPage() {

  const [tags, setTags] = useState<TaxonomyItem[]>([]);
  const [types, setTypes] = useState<TaxonomyItem[]>([]);
  
  const [tagsLoading, setTagsLoading] = useState(true);
  const [typesLoading, setTypesLoading] = useState(true);
  
  const [tagsError, setTagsError] = useState<string | null>(null);
  const [typesError, setTypesError] = useState<string | null>(null);
  
  const [selectedItem, setSelectedItem] = useState<{ id?: number; name: string; category: 'tags' | 'types' } | null>(null);

  const fetchTableData = useCallback(async (tableName: 'tags' | 'types') => {
    if (tableName === 'tags') {
      setTagsLoading(true);
      setTagsError(null);
    } else {
      setTypesLoading(true);
      setTypesError(null);
    }

    const { data, error: fetchError } = await supabase
      .from(tableName)
      .select('id, name, slug, created_at')
      .order('name', { ascending: true });

    if (fetchError) {
      console.error(`Error fetching ${tableName}:`, fetchError.message);
      if (tableName === 'tags') setTagsError(fetchError.message);
      else setTypesError(fetchError.message);
    } else if (data) {
      if (tableName === 'tags') setTags(data as TaxonomyItem[]);
      else setTypes(data as TaxonomyItem[]);
    }

    if (tableName === 'tags') setTagsLoading(false);
    else setTypesLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTableData('tags');
    fetchTableData('types');
  }, [fetchTableData]);

  const handleTaxonomySubmit = async (formData: { name: string; slug: string; category: 'tags' | 'types' }) => {
    const { name, slug, category } = formData;
    const dataToSubmit = { name, slug }; // id and created_at are auto-handled by DB

    try {
      if (selectedItem && selectedItem.id) { // Editing existing item
        if (selectedItem.category !== category) {
            throw new Error("Cannot change the category of an existing item."); // Should be prevented by disabled form field
        }
        const { error: updateError } = await supabase
          .from(category) // category comes from selectedItem, which is fixed
          .update(dataToSubmit)
          .eq('id', selectedItem.id);
        if (updateError) throw updateError;
        setSelectedItem(null); // Clear selection after edit
      } else { // Creating new item
        const { error: insertError } = await supabase
          .from(category) // category comes from form
          .insert([dataToSubmit]);
        if (insertError) throw insertError;
      }
      await fetchTableData(category); // Refresh only the relevant list
    } catch (error: any) {
      console.error(`Error saving ${category}:`, error.message);
      // This error will be re-thrown and caught by TaxonomyForm's handleSubmit
      throw new Error(error.message || `Failed to save ${category}. Name/Slug may need to be unique.`);
    }
  };

  const handleEdit = (item: TaxonomyItem, category: 'tags' | 'types') => {
    setSelectedItem({ id: item.id, name: item.name, category });
    document.getElementById('taxonomy-form-container')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setSelectedItem(null);
  };

  const handleDelete = async (item: TaxonomyItem, category: 'tags' | 'types') => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}" (${category === 'tags' ? 'Tag' : 'Type'})?`)) {
      return;
    }
    try {
      const { error: deleteError } = await supabase
        .from(category)
        .delete()
        .eq('id', item.id);
      if (deleteError) throw deleteError;
      await fetchTableData(category);
      if (selectedItem?.id === item.id && selectedItem?.category === category) {
        setSelectedItem(null); // Clear form if deleted item was being edited
      }
    } catch (error: any) {
      console.error(`Error deleting ${category}:`, error.message);
      alert(`Failed to delete: ${error.message}`);
    }
  };

  const renderList = (items: TaxonomyItem[], categoryName: 'Tag' | 'Type', categoryKey: 'tags' | 'types', loading: boolean, error: string | null) => {
    if (loading) return <p className="text-center text-gray-600 dark:text-gray-400 py-4">Loading {categoryName}s...</p>;
    if (error) return <p className="text-red-500 dark:text-red-400 py-4">Error loading {categoryName}s: {error}</p>;
    if (items.length === 0) return <p className="text-center text-gray-600 dark:text-gray-400 py-4">No {categoryName}s found. Add one using the form above.</p>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <TaxonomyCard
            key={`${categoryKey}-${item.id}`}
            item={item}
            categoryName={categoryName}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">
          Taxonomy Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Create and manage Tags and Types for your wiki content.</p>
      </header>

      <div id="taxonomy-form-container" className="max-w-2xl mx-auto">
        <TaxonomyForm
          onSubmit={handleTaxonomySubmit}
          initialData={selectedItem}
          isEditing={!!selectedItem}
          onCancelEdit={handleCancelEdit}
        />
      </div>

      {/* Tags Section */}
      <section className="mt-12">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-300 dark:border-gray-700">
            <Tag className="text-blue-600 dark:text-blue-400" size={28}/>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Existing Tags</h2>
        </div>
        {renderList(tags, 'Tag', 'tags', tagsLoading, tagsError)}
      </section>

      {/* Types Section */}
      <section className="mt-12">
         <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-300 dark:border-gray-700">
            <Type className="text-purple-600 dark:text-purple-400" size={28}/>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Existing Types</h2>
        </div>
        {renderList(types, 'Type', 'types', typesLoading, typesError)}
      </section>
    </div>
  );
}
