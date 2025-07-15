'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { TalentFormData, TalentItem } from '@/types/talents';
import TalentCard from './TalentCard';

interface BulkTalentImportProps {
  onImportSuccess: () => void;
}

export default function BulkTalentImport({ onImportSuccess }: BulkTalentImportProps) {
  const [showImporter, setShowImporter] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [validatedTalents, setValidatedTalents] = useState<TalentFormData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleValidate = () => {
    setError(null);
    setValidatedTalents([]);

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

      const validated: TalentFormData[] = [];
      for (const item of data) {
        // Basic validation, can be expanded
        if (typeof item.name !== 'string' || !item.name) {
          throw new Error('Each talent must have a non-empty "name" property.');
        }
        validated.push(item as TalentFormData);
      }
      setValidatedTalents(validated);
    } catch (e: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      if (e instanceof Error) {
        errorMessage = e.message; 
      }
      setError(`Invalid JSON or data structure: ${errorMessage}`);
    }
  };

  const handleSubmit = async () => {
    if (validatedTalents.length === 0) {
      setError('No valid talents to submit.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from('talents').insert(validatedTalents);

    if (insertError) {
      setError(`Failed to insert talents: ${insertError.message}`);
    } else {
      setJsonInput('');
      setValidatedTalents([]);
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
          Import Talents from JSON
        </button>
      </div>
    );
  }

  return (
    <div className="my-6 p-6 border border-gray-700 rounded-lg bg-gray-800 shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">Bulk Import Talents</h2>
      <textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder="Paste your JSON array of talents here..."
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

      {validatedTalents.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Preview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {validatedTalents.map((talent, index) => (
              <TalentCard
                key={index}
                talent={talent as TalentItem}
                onEdit={() => {}}
                onDelete={() => {}}
                isSelected={false}
              />
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-6 py-2 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : `Submit ${validatedTalents.length} Talents`}
          </button>
        </div>
      )}
    </div>
  );
}
