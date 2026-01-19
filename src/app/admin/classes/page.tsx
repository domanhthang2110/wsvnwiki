// src/app/admin/classes/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { ClassItem, ClassFormData } from '@/types/classes';
// REMOVED: import { getClassesWithSkills } from '@/lib/data/classes';
// REMOVED: import { getSkills } from '@/lib/data/skills';
import { supabase } from '@/lib/supabase/client'; // Use new client path
import SkillSelectorModal from '@/components/features/admin/skills/SkillSelectorModal'; // Update path
import ClassForm from '@/components/features/admin/classes/ClassForm'; // Update path
import { SkillItem } from '@/types/skills'; // Import SkillItem
import { AlertTriangle } from 'lucide-react'; // Import icon for error message
import Image from 'next/image';

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SkillItem[]>([]);
  const [availableSkills, setAvailableSkills] = useState<SkillItem[]>([]);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [pageError, setPageError] = useState<string | null>(null); // New state for page-level errors
  const [assignedSkillIds, setAssignedSkillIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const newAssignedSkillIds = new Set<number>();
    classes.forEach(cls => {
      cls.skills?.forEach(skill => {
        newAssignedSkillIds.add(skill.id);
      });
    });
    setAssignedSkillIds(newAssignedSkillIds);
  }, [classes]);

  const fetchClasses = useCallback(async () => {
    // Use client-side supabase for fetching
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        skills:class_skills(
          skill:skills(*)
        )
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching classes:', error.message);
      setClasses([]); // Clear classes on error
      return;
    }

    const transformedData = data.map(cls => ({
      ...cls,
      skills: cls.skills?.map((s: { skill: SkillItem }) => s.skill as SkillItem) || []
    }));
    setClasses(transformedData);
  }, []); // No dependency on supabase here, as it's a constant client instance

  const fetchSkills = useCallback(async () => {
    // Use client-side supabase for fetching
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching skills:', error);
      setAvailableSkills([]); // Clear skills on error
      return;
    }
    setAvailableSkills(data as SkillItem[]);
  }, []); // No dependency on supabase here

  useEffect(() => {
    fetchClasses();
    fetchSkills();
  }, [fetchClasses, fetchSkills]);

  const handleSubmit = async (formData: ClassFormData): Promise<{ success: boolean; error?: string }> => {
    setPageError(null); // Clear previous page errors
    try {
      let classId: number;

      // Create an object with only the properties that belong to the 'classes' table
      const classTablePayload = {
        name: formData.name,
        description: formData.description,
        lore: formData.lore,
        image_assets: formData.image_assets, // Use the new image_assets object
      };

      // --- Handle Class Insert/Update ---
      if (editingClass) {
        const { error: updateError } = await supabase
          .from('classes')
          .update(classTablePayload)
          .eq('id', editingClass.id);
        if (updateError) {
          // Instead of throwing, return the error
          return { success: false, error: updateError.message };
        }
        classId = editingClass.id;
      } else {
        const { data, error: insertError } = await supabase
          .from('classes')
          .insert([classTablePayload])
          .select();

        if (insertError || !data || data.length === 0) {
          // Instead of throwing, return the error
          return { success: false, error: insertError?.message || 'Failed to create class: Unknown error' };
        }
        classId = data[0].id;
      }

      // --- Handle Skill Associations ---
      if (classId) {
        const { error: deleteSkillsError } = await supabase
          .from('class_skills')
          .delete()
          .eq('class_id', classId);
        if (deleteSkillsError) {
          return { success: false, error: deleteSkillsError.message };
        }
      }

      const skillAssociations = selectedSkills.map(skill => ({
        class_id: classId,
        skill_id: skill.id
      }));

      if (skillAssociations.length > 0) {
        const { error: upsertSkillsError } = await supabase
          .from('class_skills')
          .upsert(skillAssociations, {
            onConflict: 'class_id,skill_id'
          });
        if (upsertSkillsError) {
          return { success: false, error: upsertSkillsError.message };
        }
      }

      // --- Success Path ---
      await fetchClasses();
      setEditingClass(null);
      setSelectedSkills([]);
      return { success: true };
    } catch (error: unknown) {
      console.error('Unexpected error saving class:', error);

      let userMessage = 'An unexpected error occurred. Please try again.';

      if (error && typeof error === 'object' && 'message' in error) {
        const err = error as { message: string; code?: string };

        if (err.code === '23505') {
          if (err.message.includes('classes_name_key')) {
            userMessage = 'A class with this name already exists. Please choose a different name.';
          } else {
            userMessage = 'This entry would create a duplicate value. Please check your input.';
          }
        } else {
          userMessage = err.message;
        }
      }

      setPageError(userMessage);
      return { success: false, error: userMessage };
    }
  };

  const handleSkillSelect = useCallback((skillId: number) => {
    setSelectedSkills(prev => {
      const skill = availableSkills.find(s => s.id === skillId);
      if (!skill) return prev;
      return prev.some(s => s.id === skillId)
        ? prev.filter(s => s.id !== skillId)
        : [...prev, skill];
    });
  }, [availableSkills]);

  const handleDelete = async (classItem: ClassItem) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      await supabase
        .from('class_skills')
        .delete()
        .eq('class_id', classItem.id);

      await supabase
        .from('classes')
        .delete()
        .eq('id', classItem.id);

      await fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-100 mb-4">Manage Classes</h1>

      {pageError && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md flex items-center gap-2">
          <AlertTriangle size={20} />
          <span>Error: {pageError}</span>
        </div>
      )}

      <ClassForm
        initialData={editingClass}
        selectedSkills={selectedSkills}
        onSubmit={handleSubmit}
        onSkillSelect={() => setIsSkillModalOpen(true)}
        isEditing={!!editingClass}
      />

      <SkillSelectorModal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        skills={availableSkills}
        selectedSkills={selectedSkills.map(s => s.id)}
        onSkillToggle={handleSkillSelect}
        onConfirm={(ids) => {
          setSelectedSkills(availableSkills.filter(s => ids.includes(s.id)));
          setIsSkillModalOpen(false);
        }}
        assignedSkillIds={assignedSkillIds}
      />

      {/* Classes List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Available Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(cls => (
            <div key={cls.id} className="relative group">
              <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-all">
                <div className="flex items-start space-x-3">
                  {/* Class Logo (formerly Avatar) */}
                  <div className="w-12 h-12 flex-shrink-0 rounded bg-gray-700 relative overflow-hidden">
                    {cls.image_assets?.logo ? (
                      <Image
                        src={cls.image_assets.logo || ''}
                        alt={cls.name}
                        fill
                        className="object-cover rounded"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-full h-12 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No logo</span>
                      </div>
                    )}
                  </div>

                  {/* Class Info */}
                  <div className="flex-grow min-w-0">
                    <h3 className="text-lg font-medium text-gray-100">{cls.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{cls.description}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingClass(cls);
                        setSelectedSkills(cls.skills || []);
                      }}
                      className="p-1 text-blue-400 hover:text-blue-300"
                      title="Edit class"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(cls)}
                      className="p-1 text-red-400 hover:text-red-300"
                      title="Delete class"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Skills Section */}
                {cls.skills && cls.skills.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const btn = e.currentTarget;
                        const content = btn.nextElementSibling as HTMLElement;
                        const expanded = btn.getAttribute('aria-expanded') === 'true';

                        btn.setAttribute('aria-expanded', (!expanded).toString());
                        if (expanded) {
                          content.style.height = '0';
                        } else {
                          content.style.height = content.scrollHeight + 'px';
                        }
                      }}
                      className="w-full flex items-center justify-between text-sm font-medium text-gray-400 hover:text-gray-300"
                      aria-expanded="false"
                    >
                      <span>Skills ({cls.skills.length})</span>
                      <svg
                        className="w-4 h-4 transform transition-transform"
                        style={{
                          transform: 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-200"
                      style={{ height: '0' }}
                    >
                      <div className="flex flex-wrap gap-2 py-2">
                        {cls.skills.map(skill => (
                          <div
                            key={skill.id}
                            className="flex items-center gap-2 px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded"
                          >
                            {skill.icon_url ? (
                              <div className="w-4 h-4 relative overflow-hidden">
                                <Image
                                  src={skill.icon_url || ''}
                                  alt={skill.name || 'Skill icon'}
                                  fill
                                  className="object-cover rounded"
                                  draggable={false}
                                />
                              </div>
                            ) : (
                              <div className="w-4 h-4 bg-gray-600 rounded flex items-center justify-center">
                                <span className="text-[8px]">?</span>
                              </div>
                            )}
                            {skill.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
