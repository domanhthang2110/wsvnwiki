// src/app/admin/classes/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { SkillItem } from '@/types/skills';
import { ClassItem, NewClassItem } from '@/types/classes';
import SkillSelectorModal from '@/components/admin/skills/SkillSelectorModal';
import ClassForm from '@/components/admin/classes/ClassForm';

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
        onSkillToggle={handleSkillSelect}
        onConfirm={(ids) => {
          setSelectedSkills(availableSkills.filter(s => ids.includes(s.id)));
          setIsSkillModalOpen(false);
        }}
      />

      {/* Classes List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Available Classes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(cls => (
            <div key={cls.id} className="relative group">
              <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-all">
                <div className="flex items-start space-x-3">
                  {/* Class Avatar */}
                  <div className="w-12 h-12 flex-shrink-0 rounded bg-gray-700">
                    {cls.avatar_url ? (
                      <img 
                        src={cls.avatar_url} 
                        alt={cls.name} 
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No icon</span>
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
                              <img 
                                src={skill.icon_url} 
                                alt={skill.name || 'Skill icon'} 
                                className="w-4 h-4 object-cover rounded"
                              />
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