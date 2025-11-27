'use client';

import { useState, useMemo } from 'react';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

interface SortOption<T> {
  label: string;
  value: string;
  sortFn: (a: T, b: T) => number;
}

interface BulkAction<T> {
  label: string;
  action: (items: T[]) => void;
  variant?: 'default' | 'danger';
}

interface AdminDataTableProps<T extends { id: number }> {
  data: T[];
  loading: boolean;
  error: string | null;
  
  // Card rendering
  renderCard: (item: T, cardProps: {
    isSelected: boolean;
    isBulkMode: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onDuplicate?: () => void;
    onIconChange?: (newIconUrl: string) => void;
  }) => React.ReactNode;
  
  // Callbacks
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  onDuplicate?: (item: T) => void;
  onBulkDelete: (items: T[]) => void;
  onIconChange?: (item: T, newIconUrl: string) => void;
  onExport: () => void;
  
  // Table features
  searchFields: (keyof T)[];
  sortOptions: SortOption<T>[];
  bulkActions?: BulkAction<T>[];
  
  // Display options
  title: string;
  emptyMessage?: string;
  showStats?: boolean;
  statsRenderer?: (data: T[]) => React.ReactNode;
}

export default function AdminDataTable<T extends { id: number }>({
  data,
  loading,
  error,
  renderCard,
  onEdit,
  onDelete,
  onDuplicate,
  onBulkDelete,
  onIconChange,
  onExport,
  searchFields,
  sortOptions,
  bulkActions = [],
  title,
  emptyMessage = "No items found. Add your first item using the form above!",
  showStats = false,
  statsRenderer
}: AdminDataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(sortOptions[0]?.value || '');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = data.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(query);
        })
      );
    }

    // Apply sorting
    const sortOption = sortOptions.find(option => option.value === sortBy);
    if (sortOption) {
      filtered = [...filtered].sort(sortOption.sortFn);
    }

    return filtered;
  }, [data, searchQuery, sortBy, searchFields, sortOptions]);

  // Bulk mode handlers
  const enterBulkMode = () => setIsBulkMode(true);
  const exitBulkMode = () => {
    setIsBulkMode(false);
    setSelectedItems(new Set());
  };

  const toggleSelection = (itemId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    setSelectedItems(new Set(filteredAndSortedData.map(item => item.id)));
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  const handleBulkAction = (action: BulkAction<T>) => {
    const selectedItemsData = data.filter(item => selectedItems.has(item.id));
    action.action(selectedItemsData);
    exitBulkMode();
  };

  const defaultBulkActions: BulkAction<T>[] = [
    {
      label: `Delete Selected (${selectedItems.size})`,
      action: (items) => onBulkDelete(items),
      variant: 'danger'
    }
  ];

  const allBulkActions = [...defaultBulkActions, ...bulkActions];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
          {title}
        </h2>
        {!isBulkMode && (
          <button
            onClick={onExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            Export All as JSON
          </button>
        )}
      </div>

      {/* Stats */}
      {showStats && statsRenderer && !loading && !error && data.length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md shadow-sm">
          {statsRenderer(data)}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search and Sort */}
        <div className="flex gap-4 items-center flex-1">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 max-w-md p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk Mode Controls */}
        <div className="flex gap-2">
          {!isBulkMode ? (
            <button
              onClick={enterBulkMode}
              disabled={filteredAndSortedData.length === 0}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Select Multiple
            </button>
          ) : (
            <>
              <button
                onClick={selectAll}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
              >
                Deselect All
              </button>
              <button
                onClick={exitBulkMode}
                className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {isBulkMode && selectedItems.size > 0 && (
        <div className="flex gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
          <span className="text-blue-800 dark:text-blue-200 font-medium">
            {selectedItems.size} item(s) selected:
          </span>
          {allBulkActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleBulkAction(action)}
              className={`px-3 py-1 text-sm rounded-md ${
                action.variant === 'danger'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && <LoadingOverlay />}

      {/* Error State */}
      {error && (
        <div className="text-red-500 dark:text-red-400">
          Error: {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredAndSortedData.length === 0 && (
        <p className="text-center text-gray-600 dark:text-gray-400">
          {searchQuery ? `No items found matching "${searchQuery}".` : emptyMessage}
        </p>
      )}

      {/* Data Grid */}
      {!loading && !error && filteredAndSortedData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedData.map((item) => 
            renderCard(item, {
              isSelected: selectedItems.has(item.id),
              isBulkMode,
              onSelect: () => toggleSelection(item.id),
              onEdit: () => onEdit(item),
              onDelete: () => onDelete(item),
              onDuplicate: onDuplicate ? () => onDuplicate(item) : undefined,
              onIconChange: onIconChange ? (newIconUrl: string) => onIconChange(item, newIconUrl) : undefined
            })
          )}
        </div>
      )}
    </div>
  );
}