'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Item } from '@/types/items';
import ItemCard from './ItemCard';

interface BulkItemImportProps {
  onImportSuccess: () => void;
}

export default function BulkItemImport({ onImportSuccess }: BulkItemImportProps) {
  const [showImporter, setShowImporter] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [validatedItems, setValidatedItems] = useState<Omit<Item, 'id' | 'created_at'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleValidate = () => {
    setError(null);
    setValidatedItems([]);

    if (!jsonInput.trim()) {
      setError('JSON input cannot be empty.');
      return;
    }

    try {
      const data = JSON.parse(jsonInput);
      if (!Array.isArray(data)) {
        setError('The root of the JSON data must be an array.');
        return;
      }

      const validated: Omit<Item, 'id' | 'created_at'>[] = [];
      for (const item of data) {
        // Basic validation, can be expanded
        if (typeof item.name !== 'string' || !item.name) {
          throw new Error('Each item must have a non-empty "name" property.');
        }
        validated.push(item as Omit<Item, 'id' | 'created_at'>);
      }
      setValidatedItems(validated);
    } catch (e: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      setError(`Invalid JSON or data structure: ${errorMessage}`);
    }
  };

  const handleSubmit = async () => {
    if (validatedItems.length === 0) {
      setError('No valid items to submit.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from('items').insert(validatedItems);

    if (insertError) {
      setError(`Failed to insert items: ${insertError.message}`);
    } else {
      setJsonInput('');
      setValidatedItems([]);
      setShowImporter(false);
      onImportSuccess();
    }
    setIsSubmitting(false);
  };

  if (!showImporter) {
    return (
      <div className="my-4">
        <button
          onClick={() => setShowImporter(true)}
          className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md"
        >
          Import Items from JSON
        </button>
      </div>
    );
  }

  return (
    <div className="my-6 p-6 border border-gray-700 rounded-lg bg-gray-800 shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">Bulk Import Items</h2>
      <textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder="Paste your JSON array of items here..."
        className="w-full h-48 p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
      />
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={handleValidate}
          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md"
        >
          Validate
        </button>
        <button
          onClick={() => setShowImporter(false)}
          className="py-2 px-4 text-gray-300 hover:bg-gray-700 font-medium rounded-lg border border-gray-600"
        >
          Cancel
        </button>
      </div>

      {error && <p className="text-red-400 mt-4">{error}</p>}

      {validatedItems.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Preview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {validatedItems.map((item, index) => (
              <ItemCard
                key={index}
                item={item as Item}
                onEdit={() => {}}
                onDelete={() => {}}
                onIconChange={() => {}}
                isSelected={false}
              />
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-6 py-2 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : `Submit ${validatedItems.length} Items`}
          </button>
        </div>
      )}
    </div>
  );
}
