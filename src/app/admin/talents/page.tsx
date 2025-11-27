'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { TalentItem } from '@/types/talents';
import TalentForm from '@/components/features/admin/talents/TalentForm';
import TalentCardNew from '@/components/features/admin/talents/TalentCardNew';
import BulkTalentImport from '@/components/features/admin/talents/BulkTalentImport';
import AdminDataTable from '@/components/features/admin/shared/AdminDataTable';

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
        const { error: updateError } = await supabase
          .from('talents')
          .update(dataFromForm)
          .eq('id', selectedTalent.id);

        if (updateError) {
          console.error("Supabase UPDATE error:", updateError);
          throw updateError; 
        }
        
        setSelectedTalent(null);
      
      } else {
        // ---- CREATING NEW TALENT ----
        const { error: insertError } = await supabase
          .from('talents')
          .insert([dataFromForm]);

        if (insertError) {
          console.error("Supabase INSERT error:", insertError);
          throw insertError; 
        }
      }
      
      await fetchTalents();

    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Error saving talent (in AdminTalentsPage):', errorMessage);
      throw new Error(errorMessage); 
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
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Error deleting talent:', errorMessage);
      alert(`Failed to delete talent: ${errorMessage}`);
    }
  };

  const handleBulkDelete = async (talentsToDelete: TalentItem[]) => {
    if (!window.confirm(`Are you sure you want to delete ${talentsToDelete.length} talent(s)?`)) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('talents')
        .delete()
        .in('id', talentsToDelete.map(t => t.id));

      if (deleteError) throw deleteError;
      await fetchTalents();

      // Clear selection if any selected talent was deleted
      if (selectedTalent && talentsToDelete.some(t => t.id === selectedTalent.id)) {
        setSelectedTalent(null);
      }
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Error bulk deleting talents:', errorMessage);
      alert(`Failed to delete talents: ${errorMessage}`);
    }
  };

  const handleIconChange = async (talent: TalentItem, newIconUrl: string) => {
    try {
      const { error: updateError } = await supabase
        .from('talents')
        .update({ icon_url: newIconUrl })
        .eq('id', talent.id);

      if (updateError) throw updateError;
      
      // Update local state immediately without reloading
      setTalents(prevTalents =>
        prevTalents.map(t =>
          t.id === talent.id ? { ...t, icon_url: newIconUrl } : t
        )
      );
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Error updating talent icon:', errorMessage);
      alert(`Failed to update icon: ${errorMessage}`);
    }
  };

  const handleDuplicate = async (talent: TalentItem) => {
    try {
      // Create a copy of the talent with modified name and without id/created_at
      const duplicatedTalent = {
        name: `${talent.name} (Copy)`,
        icon_url: talent.icon_url,
        max_level: talent.max_level,
        description: talent.description,
        knowledge_levels: talent.knowledge_levels,
        parameters_definition: talent.parameters_definition,
        level_values: talent.level_values,
      };

      const { error: insertError } = await supabase
        .from('talents')
        .insert([duplicatedTalent]);

      if (insertError) throw insertError;
      
      await fetchTalents();
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Error duplicating talent:', errorMessage);
      alert(`Failed to duplicate talent: ${errorMessage}`);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(talents, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'talents.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sortOptions = [
    {
      label: 'Name (A-Z)',
      value: 'name-asc',
      sortFn: (a: TalentItem, b: TalentItem) => a.name.localeCompare(b.name)
    },
    {
      label: 'Name (Z-A)',
      value: 'name-desc',
      sortFn: (a: TalentItem, b: TalentItem) => b.name.localeCompare(a.name)
    },
    {
      label: 'Max Level (Low to High)',
      value: 'level-asc',
      sortFn: (a: TalentItem, b: TalentItem) => a.max_level - b.max_level
    },
    {
      label: 'Max Level (High to Low)',
      value: 'level-desc',
      sortFn: (a: TalentItem, b: TalentItem) => b.max_level - a.max_level
    },
    {
      label: 'Newest',
      value: 'date-desc',
      sortFn: (a: TalentItem, b: TalentItem) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    },
    {
      label: 'Oldest',
      value: 'date-asc',
      sortFn: (a: TalentItem, b: TalentItem) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
  ];

  const renderTalentStats = (talents: TalentItem[]) => (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Talent Overview</h3>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-1">
          <span className="text-gray-700 dark:text-gray-300">Total:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{talents.length}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-gray-700 dark:text-gray-300">Normal:</span>
          <span className="font-bold text-green-600 dark:text-green-400">
            {talents.length}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-gray-700 dark:text-gray-300">Avg Max Level:</span>
          <span className="font-bold text-purple-600 dark:text-purple-400">
            {talents.length > 0 ? (talents.reduce((sum, t) => sum + t.max_level, 0) / talents.length).toFixed(1) : 0}
          </span>
        </div>
      </div>
    </div>
  );

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

      <AdminDataTable
        data={talents}
        loading={listLoading}
        error={listError}
        title="Existing Talents"
        searchFields={['name', 'description']}
        sortOptions={sortOptions}
        showStats={true}
        statsRenderer={renderTalentStats}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onBulkDelete={handleBulkDelete}
        onIconChange={handleIconChange}
        onExport={handleExport}
        renderCard={(talent, cardProps) => (
          <TalentCardNew
            key={talent.id}
            talent={talent}
            {...cardProps}
          />
        )}
      />
    </>
  );
}
