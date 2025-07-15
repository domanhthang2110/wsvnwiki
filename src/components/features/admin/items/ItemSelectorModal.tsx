import { useState, useMemo, useEffect, useCallback } from 'react';
import { Item } from '@/types/items';
import CompactItemCard from './CompactItemCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button/button';

interface ItemSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  selectedItems: number[];
  onConfirm: (selectedIds: number[]) => void;
}

export default function ItemSelectorModal({
  isOpen,
  onClose,
  items,
  selectedItems: initialSelectedItems, // Rename to avoid conflict with internal state
  onConfirm
}: ItemSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSelectedItems, setCurrentSelectedItems] = useState<number[]>(initialSelectedItems);
  const [isIdInputVisible, setIsIdInputVisible] = useState(false);
  const [idInputValue, setIdInputValue] = useState('');
  const [selectionNotification, setSelectionNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Update internal state if initialSelectedItems prop changes
  useEffect(() => {
    setCurrentSelectedItems(initialSelectedItems);
  }, [initialSelectedItems]);

  const handleSelectByIds = useCallback(() => {
    let parsedIds: number[] = [];
    let inputCount = 0;

    try {
      // Try parsing as JSON array
      const jsonAttempt = JSON.parse(idInputValue);
      if (Array.isArray(jsonAttempt)) {
        parsedIds = jsonAttempt.map(id => Number(id)).filter(id => !isNaN(id));
      } else {
        throw new Error('Not a JSON array');
      }
    } catch {
      // Fallback to comma-separated
      parsedIds = idInputValue.split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
        .map(s => Number(s))
        .filter(id => !isNaN(id));
    }

    inputCount = parsedIds.length;

    const newSelectedItems = new Set(currentSelectedItems);
    let selectedCount = 0;

    parsedIds.forEach(id => {
      const item = items.find(i => i.id === id);
      if (item) {
        newSelectedItems.add(id);
        selectedCount++;
      }
    });

    setCurrentSelectedItems(Array.from(newSelectedItems));
    setSelectionNotification({
      message: `${inputCount} ID${inputCount !== 1 ? 's' : ''} provided, ${selectedCount} item${selectedCount !== 1 ? 's' : ''} selected.`,
      type: 'success'
    });

    // Clear notification after 3 seconds
    setTimeout(() => setSelectionNotification(null), 3000);
  }, [idInputValue, items, currentSelectedItems]);

  useEffect(() => {
    if (selectionNotification) {
      const timer = setTimeout(() => {
        setSelectionNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [selectionNotification]);

  const handleItemToggle = (itemId: number) => {
    const itemToToggle = items.find(item => item.id === itemId);
    if (!itemToToggle) return;

    let newSelectedItems = [...currentSelectedItems];
    const isCurrentlySelected = newSelectedItems.includes(itemId);

    // Function to get the "base" name (without "Great" or "Lesser")
    const getBaseName = (name: string) => {
      let baseName = name;
      if (baseName.startsWith('Great ')) {
        baseName = baseName.substring('Great '.length);
      } else if (baseName.startsWith('Lesser ')) {
        baseName = baseName.substring('Lesser '.length);
      }
      return baseName;
    };

    const baseNameOfToggledItem = getBaseName(itemToToggle.name || '');
    const lesserItemName = `Lesser ${baseNameOfToggledItem}`;
    const lesserItem = items.find(item => item.name === lesserItemName);

    if (isCurrentlySelected) {
      // Deselect the item
      newSelectedItems = newSelectedItems.filter(id => id !== itemId);
      // Always deselect the "Lesser" counterpart if it exists and was selected
      if (lesserItem && newSelectedItems.includes(lesserItem.id)) {
        newSelectedItems = newSelectedItems.filter(id => id !== lesserItem.id);
      }
    } else {
      // Select the item
      newSelectedItems.push(itemId);
      // Always select the "Lesser" counterpart if it exists and is not already selected
      if (lesserItem && !newSelectedItems.includes(lesserItem.id)) {
        newSelectedItems.push(lesserItem.id);
      }
    }
    setCurrentSelectedItems(newSelectedItems); // Update internal state
  };

  const selectedItemObjects = useMemo(() => {
    const selected = items.filter(item => currentSelectedItems.includes(item.id));

    // Function to get the "base" name (without "Great" or "Lesser" prefixes)
    const getBaseName = (name: string) => {
      let baseName = name;
      if (baseName.startsWith('Great ')) {
        baseName = baseName.substring('Great '.length);
      } else if (baseName.startsWith('Lesser ')) {
        baseName = baseName.substring('Lesser '.length);
      }
      return baseName;
    };

    // Group items by their base name
    const groupedItems = new Map<string, Item[]>();
    selected.forEach(item => {
      const baseName = getBaseName(item.name || '');
      if (!groupedItems.has(baseName)) {
        groupedItems.set(baseName, []);
      }
      groupedItems.get(baseName)?.push(item);
    });

    // Sort groups and then items within groups
    const sortedGroups = Array.from(groupedItems.entries()).sort(([nameA], [nameB]) => nameA.localeCompare(nameB));

    const sortedSelectedItems: Item[] = [];
    sortedGroups.forEach(([, group]) => {
      group.sort((a, b) => {
        const aIsGreat = a.name?.startsWith('Great ');
        const bIsGreat = b.name?.startsWith('Great ');
        const aIsLesser = a.name?.startsWith('Lesser ');
        const bIsLesser = b.name?.startsWith('Lesser ');

        if (aIsGreat && !bIsGreat) return -1;
        if (!aIsGreat && bIsGreat) return 1;
        if (aIsLesser && !bIsLesser) return 1;
        if (!aIsLesser && bIsLesser) return -1;
        return a.name?.localeCompare(b.name || '') || 0;
      });
      sortedSelectedItems.push(...group);
    });

    return sortedSelectedItems;
  }, [items, currentSelectedItems]);

  const unselectedAndFilteredItems = useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return items.filter(item => 
      !currentSelectedItems.includes(item.id) &&
      (item.name?.toLowerCase().includes(lowerCaseQuery))
    );
  }, [items, currentSelectedItems, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex-grow">
            <h2 className="text-xl font-semibold text-gray-100">Select Items</h2>
            <p className="text-sm text-gray-400 mt-1">
              {currentSelectedItems.length} items selected
            </p>
            <Input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="mt-3 w-full bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="mt-3 flex items-center gap-2">
              <Button
                onClick={() => setIsIdInputVisible(prev => !prev)}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-md transition-colors"
              >
                {isIdInputVisible ? 'Hide ID Input' : 'Bulk Select by ID'}
              </Button>
              {selectionNotification && (
                <span className={`text-sm ${selectionNotification.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {selectionNotification.message}
                </span>
              )}
            </div>
            {isIdInputVisible && (
              <div className="mt-3">
                <textarea
                  placeholder="Enter item IDs, separated by commas or as a JSON array (e.g., 170, 199, 277 or [170, 199, 277])"
                  value={idInputValue}
                  onChange={(e) => setIdInputValue(e.target.value)}
                  className="w-full h-24 p-2 text-sm bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 resize-y"
                />
                <Button
                  onClick={handleSelectByIds}
                  className="mt-2 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Select from IDs
                </Button>
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors ml-4"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6 text-gray-400 hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {selectedItemObjects.length > 0 && (
            <div className="mb-4 pb-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Selected Items</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {selectedItemObjects.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => handleItemToggle(item.id)}
                    className="transform transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                  >
                    <CompactItemCard
                      item={item}
                      isSelected={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {unselectedAndFilteredItems.length === 0 && searchQuery !== '' ? (
            <p className="text-gray-400 text-center py-8">No items found matching your search.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {unselectedAndFilteredItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => handleItemToggle(item.id)}
                  className="transform transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                >
                  <CompactItemCard
                    item={item}
                    isSelected={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-between items-center bg-gray-900">
          <span className="text-sm text-gray-400">
            Click on an item card to select/deselect
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-gray-100 hover:bg-gray-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm(currentSelectedItems); // Pass the internal state
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Confirm Selection ({currentSelectedItems.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
