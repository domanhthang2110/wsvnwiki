// src/app/admin/classes/page.tsx
'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Adjust path if your alias for src is different
import Link from 'next/link';
import MediaFileExplorer from '@/components/admin/media/MediaFileExplorer'; // Import the new explorer
import SkillSelectorModal from '@/components/admin/skills/SkillSelectorModal';

// Update the ClassItem interface
interface ClassItem {
  id: number;
  created_at: string;
  name: string;
  avatar_url?: string | null;
  description?: string | null;
}

// Add new interface for Skills
interface Skill {
  id: number;
  name: string;
  description?: string | null;
}

// Simple CloseIcon component for the modal (You already have this)
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// NEW: Icon for Edit button
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
  </svg>
);

// NEW: Icon for Delete button
const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
  </svg>
);

export default function AdminClassesPage() {
  // State for the list of classes
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // State for the create/edit class form
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState(''); // This will be set by the media explorer
  // Add formSkillIdsString if you are editing skill_ids directly in this form
  // const [formSkillIdsString, setFormSkillIdsString] = useState(''); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // State for controlling form visibility and mode (create/edit)
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

  // NEW: State to control the visibility of the media picker modal for avatar
  const [showAvatarPickerModal, setShowAvatarPickerModal] = useState(false);

  // Add new state for skills
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);

  // NEW: State to control the visibility of the skill selector modal
  const [showSkillSelectorModal, setShowSkillSelectorModal] = useState(false);

  const fetchClasses = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    const { data, error: fetchError } = await supabase
      .from('classes')
      .select('*')
      .order('name', { ascending: true }); // Changed order to name

    if (fetchError) {
      setListError(fetchError.message);
      console.error("Error fetching classes:", fetchError.message);
    } else if (data) {
      setClasses(data as ClassItem[]);
    }
    setListLoading(false);
  }, []);

  // Add fetchSkills function
  const fetchSkills = useCallback(async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching skills:', error);
      return;
    }

    setAvailableSkills(data || []);
    setSkillsLoading(false);
  }, []);

  // Add fetchClassSkills function
  const fetchClassSkills = useCallback(async (classId: number) => {
    const { data, error } = await supabase
      .from('class_skills')
      .select('skill_id')
      .eq('class_id', classId);
    
    if (error) {
      console.error('Error fetching class skills:', error);
      return;
    }

    setSelectedSkills(data.map(cs => cs.skill_id));
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Add useEffect to load skills
  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // Effect to populate form when editingClass changes
  useEffect(() => {
    if (editingClass) {
      setFormName(editingClass.name || '');
      setFormDescription(editingClass.description || '');
      setFormAvatarUrl(editingClass.avatar_url || '');
      fetchClassSkills(editingClass.id);
    } else {
      // Reset for "create new" mode
      setFormName('');
      setFormDescription('');
      setFormAvatarUrl('');
      setSelectedSkills([]);
    }
  }, [editingClass, fetchClassSkills]);


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    if (!formName.trim()) {
      setFormError("Class name cannot be empty.");
      setIsSubmitting(false);
      return;
    }

    const classDataToSubmit = {
      name: formName.trim(),
      description: formDescription.trim() || null,
      avatar_url: formAvatarUrl.trim() || null,
    };

    try {
      let classId;
      if (editingClass) {
        // Update existing class
        const { error: updateError } = await supabase
          .from('classes')
          .update(classDataToSubmit)
          .eq('id', editingClass.id);
        
        if (updateError) throw updateError;
        classId = editingClass.id;
      } else {
        // Create new class
        const { data, error: insertError } = await supabase
          .from('classes')
          .insert([classDataToSubmit])
          .select();
        
        if (insertError) throw insertError;
        classId = data[0].id;
      }

      // Delete existing skill associations
      await supabase
        .from('class_skills')
        .delete()
        .eq('class_id', classId);

      // Insert new skill associations
      if (selectedSkills.length > 0) {
        const skillAssociations = selectedSkills.map(skillId => ({
          class_id: classId,
          skill_id: skillId
        }));

        const { error: skillsError } = await supabase
          .from('class_skills')
          .insert(skillAssociations);

        if (skillsError) throw skillsError;
      }

      setEditingClass(null);
      await fetchClasses();
    } catch (error: any) {
      setFormError(error.message);
      console.error("Error saving class:", error);
    }
    
    setIsSubmitting(false);
  };

  const handleEditClick = (cls: ClassItem) => {
    setEditingClass(cls);
    document.getElementById('classFormContainer')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteClass = async (classToDelete: ClassItem) => {
    if (!window.confirm(`Are you sure you want to delete "${classToDelete.name || 'this class'}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('classes')
        .delete()
        .eq('id', classToDelete.id);

      if (deleteError) {
        throw deleteError;
      }

      alert('Class deleted successfully.'); // Or use a more sophisticated notification
      await fetchClasses(); // Refresh the list

      // If the deleted class was the one being edited, clear the form
      if (editingClass?.id === classToDelete.id) {
        setEditingClass(null);
      }
    } catch (error: any) {
      console.error('Error deleting class:', error.message);
      setListError(`Failed to delete class: ${error.message}`); // Update listError state
      // alert(`Failed to delete class: ${error.message}`); // Or use a proper notification
    }
  };

  const handleCreateNewClick = () => {
    setEditingClass(null); // Clears form for new entry
     document.getElementById('classFormContainer')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handler for when an avatar is selected from the MediaFileExplorer
  const handleAvatarSelectedFromPicker = (publicUrl: string, pathInBucket: string) => {
    setFormAvatarUrl(publicUrl);
    setShowAvatarPickerModal(false); // Close the modal
  };

  // Add function to fetch skills for class listing
  const fetchClassWithSkills = useCallback(async (classId: number) => {
    const { data, error } = await supabase
      .from('class_skills')
      .select(`
        skill_id,
        skills (
          id,
          name
        )
      `)
      .eq('class_id', classId);
    
    if (error) {
      console.error('Error fetching class skills:', error);
      return [];
    }

    return data.map(item => item.skills);
  }, []);

  // Add handler for skill selection confirmation
  const handleSkillSelectionConfirm = (selectedIds: number[]) => {
    setSelectedSkills(selectedIds);
    setShowSkillSelectorModal(false);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
          Manage Classes
        </h1>
      </div>
      
      {/* Form for Create/Edit Class */}
      {/* We can always show the form, or make it toggleable with a showForm state */}
      <div id="classFormContainer" className="mb-10 p-6 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          {editingClass ? `Edit Class: ${editingClass.name}` : 'Create New Class'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="formName" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Class Name:</label>
            <input
              type="text"
              id="formName"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="formDescription" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Description:</label>
            <textarea
              id="formDescription"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Class Avatar Field with Modal Picker */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Class Avatar:
            </label>
            {formAvatarUrl && (
              <div className="mb-2">
                <img 
                  src={formAvatarUrl} 
                  alt="Current class avatar" 
                  className="w-20 h-20 object-contain rounded border p-1 dark:border-gray-600 bg-gray-50 dark:bg-gray-700" 
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowAvatarPickerModal(true)}
              className="py-2 px-3 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {formAvatarUrl ? 'Change Avatar' : 'Select Avatar from Media'}
            </button>
          </div>
          
          {/* Class Skills Selection */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Class Skills:
            </label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowSkillSelectorModal(true)}
                className="w-full py-2 px-3 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Select Skills ({selectedSkills.length} selected)
              </button>
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {availableSkills
                    .filter(skill => selectedSkills.includes(skill.id))
                    .map(skill => (
                      <span 
                        key={skill.id}
                        className="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded"
                      >
                        {skill.name}
                        <button
                          type="button"
                          onClick={() => setSelectedSkills(prev => prev.filter(id => id !== skill.id))}
                          className="ml-1 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>

          {formError && <p className="text-red-500 dark:text-red-400 mt-2">{formError}</p>}
          <div className="flex items-center gap-4 pt-3 border-t dark:border-gray-600">
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (editingClass ? 'Saving...' : 'Creating...') : (editingClass ? 'Save Changes' : 'Create Class')}
            </button>
            {editingClass && (
              <button
                type="button"
                onClick={() => setEditingClass(null)} // This will clear the form via useEffect
                className="py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium rounded-lg border dark:border-gray-600"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Modal for Media File Explorer for Avatar */}
      {showAvatarPickerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Select Class Avatar</h3>
              <button 
                onClick={() => setShowAvatarPickerModal(false)} 
                className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                title="Close"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto min-h-[300px]">
              <MediaFileExplorer
                bucketName="media" // Ensure this is your correct bucket name
                initialPath="classes/avatars" // Suggest a starting path for class avatars
                onFileSelect={handleAvatarSelectedFromPicker}
                mode="select" 
                accept="image/*"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal for Skill Selector */}
      {showSkillSelectorModal && (
        <SkillSelectorModal
          skills={availableSkills}
          selectedSkillIds={selectedSkills}
          onClose={() => setShowSkillSelectorModal(false)}
          onConfirm={handleSkillSelectionConfirm}
        />
      )}

      {/* List of Existing Classes */}
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 mt-10 text-gray-800 dark:text-gray-100">Existing Classes</h2>
      {listLoading && <p className="dark:text-gray-300">Loading classes...</p>}
      {listError && <p className="text-red-500 dark:text-red-400">Error loading classes: {listError}</p>}
      
      {!listLoading && !listError && classes.length === 0 && (
        <p className="dark:text-gray-300">No classes found. Add your first class using the form above!</p>
      )}

      {!listLoading && !listError && classes.length > 0 && (
        <ul className="list-none p-0 space-y-4">
          {classes.map((cls) => (
            <li key={cls.id} className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  {cls.avatar_url && (
                    <img src={cls.avatar_url} alt={cls.name} className="w-16 h-16 object-cover rounded flex-shrink-0 border dark:border-gray-600" />
                  )}
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{cls.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {cls.id}</p>
                    {cls.description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{cls.description}</p>}
                    {/* Add Skills Display */}
                    <div className="mt-2">
                      {availableSkills
                        .filter(skill => selectedSkills.includes(skill.id))
                        .map(skill => (
                          <span 
                            key={skill.id}
                            className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded mr-2 mb-1"
                          >
                            {skill.name}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0 ml-2 items-center">
                    <button 
                        onClick={() => handleEditClick(cls)}
                        className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700"
                        title="Edit Class"
                    >
                        <EditIcon />
                    </button>
                    <button 
                        onClick={() => handleDeleteClass(cls)}
                        className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-gray-700"
                        title="Delete Class"
                    >
                        <DeleteIcon />
                    </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}