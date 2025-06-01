// src/app/admin/classes/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { SkillItem } from '@/types/skills';
import { ClassItem, NewClassItem } from '@/types/classes';
import SkillSelectorModal from '@/components/admin/skills/SkillSelectorModal';
import ClassForm from '@/components/admin/classes/ClassForm';
import ClassCard from '@/components/admin/classes/ClassCard';

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SkillItem[]>([]);
  const [availableSkills, setAvailableSkills] = useState<SkillItem[]>([]);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  
  const fetchClasses = useCallback(async () => {
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
      console.error('Error fetching classes:', error);
      return;
    }

    // Transform the data to match our ClassItem type
    const transformedData = data.map(cls => ({
      ...cls,
      skills: cls.skills?.map((s: any) => s.skill) || []
    }));

    setClasses(transformedData);
  }, []);

  const fetchSkills = useCallback(async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching skills:', error);
      return;
    }
    setAvailableSkills(data);
  }, []);

  useEffect(() => {
    fetchClasses();
    fetchSkills();
  }, [fetchClasses, fetchSkills]);

  const handleSubmit = async (formData: NewClassItem) => {
    try {
      let classId: number;
      
      if (editingClass) {
        // Update existing class
        await supabase
          .from('classes')
          .update(formData)
          .eq('id', editingClass.id);
        classId = editingClass.id;
      } else {
        // Insert new class and get the new ID
        const { data, error } = await supabase
          .from('classes')
          .insert([formData])
          .select();
        
        if (error || !data || data.length === 0) {
          throw new Error('Failed to create class');
        }
        classId = data[0].id;
      }
      
      // Delete all existing skill associations for this class
      if (classId) {
        await supabase
          .from('class_skills')
          .delete()
          .eq('class_id', classId);
      }

      // Add new skill associations
      const skillAssociations = selectedSkills.map(skill => ({
        class_id: classId,
        skill_id: skill.id
      }));

      if (skillAssociations.length > 0) {
        // Using upsert to handle the composite key
        await supabase
          .from('class_skills')
          .upsert(skillAssociations, {
            onConflict: 'class_id,skill_id'
          });
      }

      await fetchClasses();
      setEditingClass(null);
      setSelectedSkills([]);
    } catch (error) {
      console.error('Error saving class:', error);
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
      // First delete the skill associations
      await supabase
        .from('class_skills')
        .delete()
        .eq('class_id', classItem.id);

      // Then delete the class
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
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-100 mb-8">Manage Classes</h1>

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
        onSkillToggle={(id) => {
          const skill = availableSkills.find(s => s.id === id);
          if (!skill) return;
          setSelectedSkills(prev =>
            prev.some(s => s.id === id)
              ? prev.filter(s => s.id !== id)
              : [...prev, skill]
          );
        }}
        onConfirm={() => setIsSkillModalOpen(false)}
      />

      {/* Classes Grid */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Available Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(cls => (
            <ClassCard
              key={cls.id}
              classItem={cls}
              onEdit={(cls) => {
                setEditingClass(cls);
                setSelectedSkills(cls.skills || []);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}