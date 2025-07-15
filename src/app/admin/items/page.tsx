'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Item } from '@/types/items';
import ItemForm from '@/components/features/admin/items/ItemForm';
import ItemCard from '@/components/features/admin/items/ItemCard';
import BulkItemImport from '@/components/features/admin/items/BulkItemImport';
import LongButton from '@/components/ui/LongButton';

export default function AdminItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('name-asc');

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

  const handleIconChange = async (itemId: number, newIconUrl: string) => {
    try {
      const { error: updateError } = await supabase
        .from('items')
        .update({ icon_url: newIconUrl })
        .eq('id', itemId);

      if (updateError) {
        throw updateError;
      }
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, icon_url: newIconUrl } : item
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

  const sortedAndFilteredItems = items
    .filter(item =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOrder) {
        case 'name-asc':
          return a.name?.localeCompare(b.name || '') || 0;
        case 'name-desc':
          return b.name?.localeCompare(a.name || '') || 0;
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
        Manage Items
      </h1>

      <div className="flex justify-center mb-4">
        <BulkItemImport onImportSuccess={fetchItems} />
        <LongButton
            width={200}
            text="Export All Items (JSON)"
            onClick={handleExportJson}
            className="ml-4"
        />
      </div>

      <div id="itemForm">
        <ItemForm
          onSubmit={handleItemSubmit}
          initialData={selectedItem}
          isEditing={!!selectedItem}
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Existing Items
        </h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
          />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="date-desc">Newest</option>
            <option value="date-asc">Oldest</option>
          </select>
        </div>
      </div>
      
      {listLoading && (
        <div className="text-center text-gray-600 dark:text-gray-400">
          Loading items...
        </div>
      )}
      
      {listError && (
        <div className="text-red-500 dark:text-red-400">
          Error: {listError}
        </div>
      )}
      
      {!listLoading && !listError && items.length === 0 && (
        <p className="text-center text-gray-600 dark:text-gray-400">
          No items found. Add your first item using the form above!
        </p>
      )}

      {!listLoading && !listError && sortedAndFilteredItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAndFilteredItems.map((item) => (
            <ItemCard 
              key={item.id} 
              item={item} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onIconChange={handleIconChange}
              isSelected={selectedItem?.id === item.id}
            />
          ))}
        </div>
      )}
    </>
  );
}
