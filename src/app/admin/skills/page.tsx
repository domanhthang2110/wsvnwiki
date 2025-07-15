'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { SkillItem } from '@/types/skills';
import { Item } from '@/types/items';
import SkillForm from '@/components/features/admin/skills/SkillForm';
import SkillCard from '@/components/features/admin/skills/SkillCard';
import BulkSkillImport from '@/components/features/admin/skills/BulkSkillImport';
import ItemSelectorModal from '@/components/features/admin/items/ItemSelectorModal';
import ClassHeader from '@/components/features/admin/skills/ClassHeader';

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});

  // Initialize all classes as expanded by default
  useEffect(() => {
    if (skills.length > 0) {
      const initialExpandedState: Record<string, boolean> = {};
      const uniqueClassNames = new Set(skills.map(skill => skill.className || 'Uncategorized'));
      uniqueClassNames.forEach(name => {
        initialExpandedState[name] = name === 'Uncategorized';
      });
      setExpandedClasses(initialExpandedState);
    }
  }, [skills]);

  const toggleClassExpansion = useCallback((className: string) => {
    setExpandedClasses(prev => ({
      ...prev,
      [className]: !prev[className]
    }));
  }, []);

  const fetchSkills = useCallback(async () => {
    setListLoading(true);
    setListError(null);

    // Fetch skills
    const { data: skillsData, error: skillsError } = await supabase
      .from('skills')
      .select(`
        *,
        items:skill_items(
          item:items(*)
        )
      `)
      .order('name', { ascending: true });

    if (skillsError) {
      setListError(skillsError.message);
      console.error("Error fetching skills:", skillsError.message);
      setListLoading(false);
      return;
    }

    // Fetch classes
    const { data: classesData, error: classesError } = await supabase
      .from('classes')
      .select('id, name, image_assets');

    if (classesError) {
      setListError(classesError.message);
      console.error("Error fetching classes:", classesError.message);
      setListLoading(false);
      return;
    }

    // Fetch class_skills relationships
    const { data: classSkillsData, error: classSkillsError } = await supabase
      .from('class_skills')
      .select('class_id, skill_id');

    if (classSkillsError) {
      setListError(classSkillsError.message);
      console.error("Error fetching class_skills:", classSkillsError.message);
      setListLoading(false);
      return;
    }

    // Create a map from class_id to class_name and icon_url
    const classIdToInfoMap = new Map<number, { name: string, iconUrl: string | null }>();
    classesData.forEach(cls => {
      const iconUrl = (cls.image_assets as any)?.logo || null; // Use 'logo' as per ClassContent.tsx
      classIdToInfoMap.set(cls.id, { name: cls.name, iconUrl });
    });

    // Create a map from skill_id to class_name and icon_url
    const skillIdToClassInfoMap = new Map<number, { name: string, iconUrl: string | null }>();
    classSkillsData.forEach(cs => {
      const classInfo = classIdToInfoMap.get(cs.class_id);
      if (classInfo) {
        skillIdToClassInfoMap.set(cs.skill_id, classInfo);
      }
    });

    // Transform skills data to include className
    const transformedData = skillsData.map(skill => ({
      ...skill,
      items: skill.items?.map((i: { item: Item }) => i.item as Item) || [],
      className: skillIdToClassInfoMap.get(skill.id)?.name || null, // Assign class name
      classIconUrl: skillIdToClassInfoMap.get(skill.id)?.iconUrl || null // Assign class icon URL
    }));

    setSkills(transformedData);
    setListLoading(false);
  }, []);

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching items:', error);
      setAvailableItems([]);
      return;
    }
    setAvailableItems(data as Item[]);
  }, []);

  useEffect(() => {
    fetchSkills();
    fetchItems();
  }, [fetchSkills, fetchItems]);

  const handleSkillSubmit = async (dataFromForm: Omit<SkillItem, 'id' | 'created_at'>) => {
    try {
      let skillId: number;

      // Destructure to remove client-side properties
      const { className, classIconUrl, ...dbData } = dataFromForm;

      if (selectedSkill && selectedSkill.id) {
        const { error: updateError } = await supabase
          .from('skills')
          .update(dbData)
          .eq('id', selectedSkill.id);
        if (updateError) {
          throw updateError;
        }
        skillId = selectedSkill.id;
      } else {
        const { data, error: insertError } = await supabase
          .from('skills')
          .insert([dbData])
          .select();
        
        if (insertError || !data || data.length === 0) {
          throw insertError || new Error('Failed to create skill');
        }
        skillId = data[0].id;
      }

      if (skillId) {
        await supabase
          .from('skill_items')
          .delete()
          .eq('skill_id', skillId);

        const itemAssociations = selectedItems.map(item => ({
          skill_id: skillId,
          item_id: item.id
        }));

        if (itemAssociations.length > 0) {
          await supabase
            .from('skill_items')
            .upsert(itemAssociations);
        }
      }

      await fetchSkills();
      setSelectedSkill(null);
      setSelectedItems([]);
    } catch (error: any) {
      console.error('Error saving skill:', error.message);
      throw error;
    }
  };

  const handleEdit = async (skill: SkillItem): Promise<void> => {
    setSelectedSkill(skill);
    setSelectedItems(skill.items || []);
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

  const handleIconChange = async (skillId: number, newIconUrl: string) => {
    try {
      const { error } = await supabase
        .from('skills')
        .update({ icon_url: newIconUrl })
        .eq('id', skillId);

      if (error) throw error;

      setSkills(prevSkills =>
        prevSkills.map(skill =>
          skill.id === skillId ? { ...skill, icon_url: newIconUrl } : skill
        )
      );
    } catch (error: any) {
      console.error('Error updating skill icon:', error.message);
      alert(`Failed to update icon: ${error.message}`);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(skills, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'skills.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const skillTypeCounts = skills.reduce((acc, skill) => {
    const type = skill.skill_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
        Manage Skills
      </h1>

      <BulkSkillImport onImportSuccess={fetchSkills} />

      <div id="skillForm" className="max-w-full overflow-hidden">
        <SkillForm 
          onSubmit={handleSkillSubmit} 
          initialData={selectedSkill}
          isEditing={!!selectedSkill}
          selectedItems={selectedItems}
          onItemSelect={() => setIsItemModalOpen(true)}
        />
      </div>

      <ItemSelectorModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        items={availableItems}
        selectedItems={selectedItems.map(i => i.id)}
        onConfirm={(ids) => {
          setSelectedItems(availableItems.filter(i => ids.includes(i.id)));
          setIsItemModalOpen(false);
        }}
      />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Existing Skills
        </h2>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          Export All as JSON
        </button>
      </div>

      {!listLoading && !listError && skills.length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md shadow-sm mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Skill Type Overview</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(skillTypeCounts).sort(([typeA], [typeB]) => typeA.localeCompare(typeB)).map(([type, count]) => (
              <div key={type} className="flex items-center space-x-1">
                <span className="text-gray-700 dark:text-gray-300">{type}:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{count}</span>
              </div>
            ))}
            <div className="flex items-center space-x-1">
              <span className="text-gray-700 dark:text-gray-300">Total:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{skills.length}</span>
            </div>
          </div>
        </div>
      )}
      
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
        <div className="space-y-8">
          {Object.entries(
            skills.reduce((acc, skill) => {
              const className = skill.className || 'Uncategorized';
              if (!acc[className]) {
                acc[className] = [];
              }
              acc[className].push(skill);
              return acc;
            }, {} as Record<string, SkillItem[]>)
          )
            .sort(([nameA], [nameB]) => {
              if (nameA === 'Uncategorized') return -1;
              if (nameB === 'Uncategorized') return 1;
              return nameA.localeCompare(nameB);
            })
            .map(([className, classSkills]) => (
              <div key={className}>
                <ClassHeader
                  className={className}
                  classIconUrl={classSkills[0]?.classIconUrl || null} // Assuming all skills in a group have the same classIconUrl
                  isExpanded={expandedClasses[className]}
                  onToggle={() => toggleClassExpansion(className)}
                />
                {expandedClasses[className] && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {classSkills.map((skill) => (
                      <SkillCard 
                        key={skill.id} 
                        skill={skill} 
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onIconChange={handleIconChange}
                        isSelected={selectedSkill?.id === skill.id}
                        className={skill.className || undefined} // Pass the class name, convert null to undefined
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </>
  );
}
