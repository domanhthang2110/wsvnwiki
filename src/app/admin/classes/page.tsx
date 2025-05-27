'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Adjust path if your alias for src is different

// Define an interface for the structure of your Class data
interface ClassItem {
  id: number; // Assuming int8 for id
  created_at: string;
  name: string;
  avatar_url?: string | null;
  description?: string | null;
  skill_ids?: number[] | null; // Array of int8
}

export default function AdminClassesPage() {
  // State for the list of classes
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // State for the create class form
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Function to fetch classes
  const fetchClasses = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    const { data, error: fetchError } = await supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setListError(fetchError.message);
      console.error("Error fetching classes:", fetchError.message);
    } else if (data) {
      setClasses(data as ClassItem[]);
    }
    setListLoading(false);
  }, []);

  // Fetch classes when the component mounts
  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Handle form submission for creating a new class
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    if (!formName.trim()) {
      setFormError("Class name cannot be empty.");
      setIsSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('classes')
      .insert([
        {
          name: formName,
          description: formDescription,
          avatar_url: formAvatarUrl || null,
          // skill_ids will be managed when editing a class
        },
      ]);

    setIsSubmitting(false);

    if (insertError) {
      setFormError(insertError.message);
      console.error("Error inserting class:", insertError.message);
    } else {
      // Success! Clear form and refresh the list of classes
      setFormName('');
      setFormDescription('');
      setFormAvatarUrl('');
      setFormError(null); // Clear any previous form errors
      await fetchClasses(); // Re-fetch the list to show the new class
    }
  };

  return (
    <>
      {/* Page Title - The AdminLayout provides overall page padding */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
        Manage Classes
      </h1>

      {/* Create New Class Form */}
      <div className="mb-10 p-6 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Create New Class</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="formName" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Class Name:</label>
            <input
              type="text"
              id="formName"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="formDescription" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Description:</label>
            <textarea
              id="formDescription"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-5">
            <label htmlFor="formAvatarUrl" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Avatar URL (Optional):</label>
            <input
              type="text"
              id="formAvatarUrl"
              placeholder="https://example.com/image.png"
              value={formAvatarUrl}
              onChange={(e) => setFormAvatarUrl(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {formError && <p className="text-red-500 dark:text-red-400 mb-3">Error: {formError}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Class'}
          </button>
        </form>
      </div>

      {/* List of Existing Classes */}
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Existing Classes</h2>
      {listLoading && <p className="dark:text-gray-300">Loading classes...</p>}
      {listError && <p className="text-red-500 dark:text-red-400">Error loading classes: {listError}</p>}
      
      {!listLoading && !listError && classes.length === 0 && (
        <p className="dark:text-gray-300">No classes found. Add your first class using the form above!</p>
      )}

      {!listLoading && !listError && classes.length > 0 && (
        <ul className="list-none p-0 space-y-4">
          {classes.map((cls) => (
            <li key={cls.id} className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{cls.name}</h3>
                  {cls.description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{cls.description}</p>}
                  {cls.avatar_url && (
                    <div className="mt-2">
                      <img src={cls.avatar_url} alt={cls.name} className="max-w-[80px] max-h-[80px] rounded object-cover" />
                    </div>
                  )}
                </div>
                {/* Edit/Delete buttons will go here later */}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}