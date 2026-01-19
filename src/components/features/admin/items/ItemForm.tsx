'use client';

import { FormEvent, useState, useEffect } from 'react';
import { Item } from '@/types/items';
import MediaFileExplorer from '@/components/features/admin/media/MediaFileExplorer';
import Image from 'next/image';

const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>;

export interface ItemFormProps {
  onSubmit: (itemData: Omit<Item, 'id' | 'created_at'>) => Promise<void>;
  isEditing: boolean;
  initialData: Item | null;
}

export default function ItemForm({ onSubmit, isEditing, initialData }: ItemFormProps) {
  const [formName, setFormName] = useState('');
  const [formIconUrl, setFormIconUrl] = useState('');
  const [formType, setFormType] = useState('simple');
  const [formDescription, setFormDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showIconPickerModal, setShowIconPickerModal] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [liveFormData, setLiveFormData] = useState<Omit<Item, 'id' | 'created_at'>>({
    name: '',
    icon_url: null,
    type: 'simple',
    description: null,
  });

  useEffect(() => {
    const itemDataToSubmit: Omit<Item, 'id' | 'created_at'> = {
      name: formName.trim(),
      icon_url: formIconUrl.trim() || null,
      type: formType,
      description: formDescription.trim() || null,
    };
    setLiveFormData(itemDataToSubmit);
  }, [formName, formIconUrl, formType, formDescription]);

  useEffect(() => {
    if (initialData) {
      setFormName(initialData.name || '');
      setFormIconUrl(initialData.icon_url || '');
      setFormType(initialData.type || 'simple');
      setFormDescription(initialData.description || '');
    } else {
      setFormName('');
      setFormIconUrl('');
      setFormType('simple');
      setFormDescription('');
    }
  }, [initialData]);

  const handleIconSelectedFromPicker = (publicUrl: string) => {
    setFormIconUrl(publicUrl);
    setShowIconPickerModal(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (!formName.trim()) throw new Error("Item name is required.");

      const itemDataToSubmit: Omit<Item, 'id' | 'created_at'> = {
        name: formName.trim(),
        icon_url: formIconUrl.trim() || null,
        type: formType,
        description: formDescription.trim() || null,
      };

      await onSubmit(itemDataToSubmit);

      if (!isEditing) {
        setFormName('');
        setFormIconUrl('');
        setFormType('simple');
        setFormDescription('');
      }
      setFormError(null);

    } catch (error: unknown) {
      let errorMessage = 'An error occurred while saving the item';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("ItemForm handleSubmit error:", errorMessage);
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6 p-3 border border-gray-700 rounded-lg bg-gray-800 shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">
        {isEditing ? `Edit Item: ${initialData?.name || ''}` : 'Create New Item'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="formName" className="block mb-1 text-sm font-medium text-gray-300">
            Item Name:
          </label>
          <input
            type="text"
            id="formName"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
            className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Item Icon:
          </label>
          {formIconUrl && (
            <div className="mb-2 relative w-16 h-16">
              <Image src={formIconUrl} alt="Selected item icon" fill className="object-contain rounded border p-1 border-gray-600 bg-gray-700" draggable={false} />
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowIconPickerModal(true)}
            className="py-2 px-3 text-sm font-medium rounded-md border border-gray-600 hover:bg-gray-700 text-gray-300"
          >
            {formIconUrl ? 'Change Icon' : 'Select Icon from Media'}
          </button>
        </div>

        <div>
          <label htmlFor="formType" className="block mb-1 text-sm font-medium text-gray-300">Type:</label>
          <input
            type="text"
            id="formType"
            value={formType}
            onChange={(e) => setFormType(e.target.value)}
            className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
          />
        </div>

        <div>
          <label htmlFor="formDescription" className="block mb-1 text-sm font-medium text-gray-300">Description:</label>
          <textarea
            id="formDescription"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={3}
            className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
          />
        </div>

        {formError && (
          <p className="text-red-400 mt-2">{formError}</p>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md disabled:opacity-50"
          >
            {isSubmitting
              ? (isEditing ? 'Saving Changes...' : 'Creating Item...')
              : (isEditing ? 'Save Changes' : 'Create Item')}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => onSubmit(initialData!)}
              className="py-2 px-4 text-gray-300 hover:bg-gray-700 font-medium rounded-lg border border-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowRawData(!showRawData)}
          className="text-xs text-gray-500 hover:text-gray-300 underline"
        >
          {showRawData ? 'Hide Raw Data' : 'Show Raw Data'}
        </button>

        {showRawData && (
          <div className="mt-2 p-4 bg-gray-900 border border-gray-700 rounded overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Raw Form Data</h3>
            <pre className="text-xs text-gray-300 bg-gray-800 p-2 rounded max-h-60 block w-full" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowX: 'hidden', boxSizing: 'border-box' }}>
              {JSON.stringify(liveFormData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {showIconPickerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4 transition-opacity duration-300">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-gray-100">Select Item Icon</h3>
              <button
                onClick={() => setShowIconPickerModal(false)}
                className="p-1 text-gray-400 hover:text-red-400"
                title="Close"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto min-h-[300px]">
              <MediaFileExplorer
                bucketName="media"
                initialPath="items"
                onFileSelect={handleIconSelectedFromPicker}
                mode="select"
                accept="image/*"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
