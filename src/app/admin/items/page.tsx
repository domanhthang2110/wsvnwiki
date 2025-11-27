'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Item } from '@/types/items';
import ItemForm from '@/components/features/admin/items/ItemForm';
import ItemCardNew from '@/components/features/admin/items/ItemCardNew';
import BulkItemImport from '@/components/features/admin/items/BulkItemImport';
import AdminDataTable from '@/components/features/admin/shared/AdminDataTable';
import LongButton from '@/components/ui/LongButton';

export default function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const fetchItems = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    const { data, error: fetchError } = await supabase
      .from('items')
      .select('*')
      .order('name', { ascending: true });

    if (fetchError) {
      setListError(fetchError.message);
      console.error("Error fetching items:", fetchError.message);
    } else if (data) {
      setItems(data as Item[]);
    }
    setListLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleItemSubmit = async (dataFromForm: Omit<Item, 'id' | 'created_at'>) => {
    try {
      if (selectedItem && selectedItem.id) {
        // ---- EDITING EXISTING ITEM ----
        const { error: updateError } = await supabase
          .from('items')
          .update(dataFromForm)
          .eq('id', selectedItem.id);

        if (updateError) {
          console.error("Supabase UPDATE error:", updateError);
          throw updateError; 
        }
        
        setSelectedItem(null);
      
      } else {
        // ---- CREATING NEW ITEM ----
        const { error: insertError } = await supabase
          .from('items')
          .insert([dataFromForm]);

        if (insertError) {
          console.error("Supabase INSERT error:", insertError);
          throw insertError; 
        }
      }
      
      await fetchItems();

    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Error saving item (in AdminItemsPage):', errorMessage);
      throw new Error(errorMessage); 
    }
  };

  const handleExportJson = () => {
    if (items.length === 0) {
      alert('No items to export.');
      return;
    }

    const jsonString = JSON.stringify(items, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'items.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEdit = async (item: Item): Promise<void> => {
    setSelectedItem(item);
    document.getElementById('itemForm')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (item: Item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .eq('id', item.id);

      if (deleteError) throw deleteError;
      await fetchItems();

      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
      }
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Error deleting item:', errorMessage);
      alert(`Failed to delete item: ${errorMessage}`);
    }
  };

  const handleBulkDelete = async (itemsToDelete: Item[]) => {
    if (!window.confirm(`Are you sure you want to delete ${itemsToDelete.length} item(s)?`)) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .in('id', itemsToDelete.map(i => i.id));

      if (deleteError) throw deleteError;
      await fetchItems();

      // Clear selection if any selected item was deleted
      if (selectedItem && itemsToDelete.some(i => i.id === selectedItem.id)) {
        setSelectedItem(null);
      }
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Error bulk deleting items:', errorMessage);
      alert(`Failed to delete items: ${errorMessage}`);
    }
  };

  const handleIconChange = async (item: Item, newIconUrl: string) => {
    try {
      const { error: updateError } = await supabase
        .from('items')
        .update({ icon_url: newIconUrl })
        .eq('id', item.id);

      if (updateError) throw updateError;
      
      // Update local state immediately without reloading
      setItems(prevItems =>
        prevItems.map(i =>
          i.id === item.id ? { ...i, icon_url: newIconUrl } : i
        )
      );
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Error updating item icon:', errorMessage);
      alert(`Failed to update icon: ${errorMessage}`);
    }
  };


  const sortOptions = [
    {
      label: 'Name (A-Z)',
      value: 'name-asc',
      sortFn: (a: Item, b: Item) => (a.name || '').localeCompare(b.name || '')
    },
    {
      label: 'Name (Z-A)',
      value: 'name-desc',
      sortFn: (a: Item, b: Item) => (b.name || '').localeCompare(a.name || '')
    },
    {
      label: 'Type (A-Z)',
      value: 'type-asc',
      sortFn: (a: Item, b: Item) => (a.type || '').localeCompare(b.type || '')
    },
    {
      label: 'Newest',
      value: 'date-desc',
      sortFn: (a: Item, b: Item) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    },
    {
      label: 'Oldest',
      value: 'date-asc',
      sortFn: (a: Item, b: Item) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
  ];

  const renderItemStats = (items: Item[]) => (
    <div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Item Overview</h3>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-1">
          <span className="text-gray-700 dark:text-gray-300">Total:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{items.length}</span>
        </div>
        {/* Type breakdown */}
        {Object.entries(
          items.reduce((acc, item) => {
            const type = item.type || 'Unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([type, count]) => (
          <div key={type} className="flex items-center space-x-1">
            <span className="text-gray-700 dark:text-gray-300 capitalize">{type}:</span>
            <span className="font-bold text-green-600 dark:text-green-400">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
        Manage Items
      </h1>

      <div className="flex justify-center mb-4">
        <BulkItemImport onImportSuccess={fetchItems} />
      </div>

      <div id="itemForm">
        <ItemForm
          onSubmit={handleItemSubmit}
          initialData={selectedItem}
          isEditing={!!selectedItem}
        />
      </div>

      <AdminDataTable
        data={items}
        loading={listLoading}
        error={listError}
        title="Existing Items"
        searchFields={['name', 'type', 'description']}
        sortOptions={sortOptions}
        showStats={true}
        statsRenderer={renderItemStats}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onIconChange={handleIconChange}
        onExport={handleExportJson}
        renderCard={(item, cardProps) => (
          <ItemCardNew
            key={item.id}
            item={item}
            {...cardProps}
          />
        )}
      />
    </>
  );
}
