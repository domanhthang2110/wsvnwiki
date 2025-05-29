'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { SkillItem } from '@/types/skills';
import SkillForm from '@/components/admin/skills/SkillForm';
import SkillCard from '@/components/admin/skills/SkillCard';

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);

  const fetchSkills = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    const { data, error: fetchError } = await supabase
      .from('skills')
      .select('*')
      .order('name', { ascending: true });

    if (fetchError) {
      setListError(fetchError.message);
      console.error("Error fetching skills:", fetchError.message);
    } else if (data) {
      setSkills(data as SkillItem[]);
    }
    setListLoading(false);
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

// Inside src/app/admin/skills/page.tsx

  const handleSkillSubmit = async (dataFromForm: Omit<SkillItem, 'id' | 'created_at'>) => {
    // The SkillForm's onSubmit prop is expected to handle its own isSubmitting and formError states.
    // This parent function will just perform the Supabase operation and refresh data.

    try {
      if (selectedSkill && selectedSkill.id) {
        // ---- EDITING EXISTING SKILL ----
        const { data: updateData, error: updateError } = await supabase
          .from('skills')
          .update(dataFromForm) // dataFromForm should not contain 'id' or 'created_at' due to Omit type
          .eq('id', selectedSkill.id)
          .select(); // Optional: get the updated row back

        if (updateError) {
          // The error will be caught by SkillForm's handleSubmit if we re-throw
          // or if SkillForm's onSubmit prop returns a Promise that rejects.
          console.error("Supabase UPDATE error:", updateError);
          throw updateError; 
        }
        
        // Optionally, provide feedback to the user
        // alert('Skill updated successfully!'); // Or use a toast notification system

        setSelectedSkill(null); // Reset editing state
      
      } else {
        // ---- CREATING NEW SKILL ----
        const { data: insertData, error: insertError } = await supabase
          .from('skills')
          .insert([dataFromForm]) // .insert() expects an array
          .select(); // Optional: get the inserted row back

        if (insertError) {
          console.error("Supabase INSERT error:", insertError);
          throw insertError; 
        }

        // Optionally, provide feedback
        // alert('Skill created successfully!');
        // Form clearing is typically handled by the SkillForm component itself upon successful submission.
      }
      
      await fetchSkills(); // Refresh skills list on success

    } catch (error: any) {
      console.error('Error saving skill (in AdminSkillsPage):', error.message);
      // This error is re-thrown so that the catch block in SkillForm's handleSubmit
      // can set its local formError state.
      throw error; 
    }
    // The SkillForm's finally block (if it has one in its handleSubmit)
    // should handle setting its own isSubmitting state back to false.
  };

  const handleEdit = async (skill: SkillItem): Promise<void> => {
    setSelectedSkill(skill);
    // Scroll to form
    document.getElementById('skillForm')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (skill: SkillItem) => {
    if (!window.confirm(`Are you sure you want to delete "${skill.name}"?`)) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('skills')
        .delete()
        .eq('id', skill.id);

      if (deleteError) throw deleteError;
      await fetchSkills();

      if (selectedSkill?.id === skill.id) {
        setSelectedSkill(null);
      }
    } catch (error: any) {
      console.error('Error deleting skill:', error.message);
      alert(`Failed to delete skill: ${error.message}`);
    }
  };

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
        Manage Skills
      </h1>

      <div id="skillForm">
        <SkillForm 
          onSubmit={handleSkillSubmit} 
          initialData={selectedSkill}
          isEditing={!!selectedSkill}
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Existing Skills
        </h2>
      </div>
      
      {listLoading && (
        <div className="text-center text-gray-600 dark:text-gray-400">
          Loading skills...
        </div>
      )}
      
      {listError && (
        <div className="text-red-500 dark:text-red-400">
          Error: {listError}
        </div>
      )}
      
      {!listLoading && !listError && skills.length === 0 && (
        <p className="text-center text-gray-600 dark:text-gray-400">
          No skills found. Add your first skill using the form above!
        </p>
      )}

      {!listLoading && !listError && skills.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <SkillCard 
              key={skill.id} 
              skill={skill} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </>
  );
}