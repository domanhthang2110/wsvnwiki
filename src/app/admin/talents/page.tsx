'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { TalentItem } from '@/types/talents';
import TalentForm from '@/components/features/admin/talents/TalentForm';
import TalentCard from '@/components/features/admin/talents/TalentCard';
import BulkTalentImport from '@/components/features/admin/talents/BulkTalentImport';

export default function AdminTalentsPage() {
  const [talents, setTalents] = useState<TalentItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedTalent, setSelectedTalent] = useState<TalentItem | null>(null);

  const fetchTalents = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    const { data, error: fetchError } = await supabase
      .from('talents')
      .select('*')
      .order('name', { ascending: true });

    if (fetchError) {
      setListError(fetchError.message);
      console.error("Error fetching talents:", fetchError.message);
    } else if (data) {
      setTalents(data as TalentItem[]);
    }
    setListLoading(false);
  }, []);

  useEffect(() => {
    fetchTalents();
  }, [fetchTalents]);

  const handleTalentSubmit = async (dataFromForm: Omit<TalentItem, 'id' | 'created_at'>) => {
    try {
      if (selectedTalent && selectedTalent.id) {
        // ---- EDITING EXISTING TALENT ----
        const { data: updateData, error: updateError } = await supabase
          .from('talents')
          .update(dataFromForm)
          .eq('id', selectedTalent.id)
          .select();

        if (updateError) {
          console.error("Supabase UPDATE error:", updateError);
          throw updateError; 
        }
        
        setSelectedTalent(null);
      
      } else {
        // ---- CREATING NEW TALENT ----
        const { data: insertData, error: insertError } = await supabase
          .from('talents')
          .insert([dataFromForm])
          .select();

        if (insertError) {
          console.error("Supabase INSERT error:", insertError);
          throw insertError; 
        }
      }
      
      await fetchTalents();

    } catch (error: any) {
      console.error('Error saving talent (in AdminTalentsPage):', error.message);
      throw error; 
    }
  };

  const handleEdit = async (talent: TalentItem): Promise<void> => {
    setSelectedTalent(talent);
    document.getElementById('talentForm')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (talent: TalentItem) => {
    if (!window.confirm(`Are you sure you want to delete "${talent.name}"?`)) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('talents')
        .delete()
        .eq('id', talent.id);

      if (deleteError) throw deleteError;
      await fetchTalents();

      if (selectedTalent?.id === talent.id) {
        setSelectedTalent(null);
      }
    } catch (error: any) {
      console.error('Error deleting talent:', error.message);
      alert(`Failed to delete talent: ${error.message}`);
    }
  };

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
        Manage Talents
      </h1>

      <BulkTalentImport onImportSuccess={fetchTalents} />

      <div id="talentForm">
        <TalentForm 
          onSubmit={handleTalentSubmit} 
          initialData={selectedTalent}
          isEditing={!!selectedTalent}
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Existing Talents
        </h2>
      </div>
      
      {listLoading && (
        <div className="text-center text-gray-600 dark:text-gray-400">
          Loading talents...
        </div>
      )}
      
      {listError && (
        <div className="text-red-500 dark:text-red-400">
          Error: {listError}
        </div>
      )}
      
      {!listLoading && !listError && talents.length === 0 && (
        <p className="text-center text-gray-600 dark:text-gray-400">
          No talents found. Add your first talent using the form above!
        </p>
      )}

      {!listLoading && !listError && talents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {talents.map((talent) => (
            <TalentCard 
              key={talent.id} 
              talent={talent} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              isSelected={selectedTalent?.id === talent.id}
            />
          ))}
        </div>
      )}
    </>
  );
}
