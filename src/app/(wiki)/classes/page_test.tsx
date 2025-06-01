'use client';

import { useState } from 'react';
import IconFrame, { FrameStyleType } from '@/components/wiki/IconFrame';
import MediaFileExplorer from '@/components/admin/media/MediaFileExplorer';

export default function ClassesPage() {
  const [selectedIcon, setSelectedIcon] = useState('/icon_frame.png'); // Default icon
  const [frameStyle, setFrameStyle] = useState<FrameStyleType>('yellow');
  const [iconSize, setIconSize] = useState(44); // STEP 1: Add state for the icon size
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const handleFileSelect = (publicUrl: string) => {
    setSelectedIcon(publicUrl);
    setShowMediaPicker(false);
  };

  const frameStyles: FrameStyleType[] = ['yellow', 'red', 'green'];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Icon Frame Test Component</h1>
      
      <div className="space-y-6">
        {/* Frame Style Selector */}
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Frame Style</h2>
          <div className="flex gap-4">
            {frameStyles.map(style => (
              <label key={style} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="frameStyle"
                  value={style}
                  checked={frameStyle === style}
                  onChange={(e) => setFrameStyle(e.target.value as FrameStyleType)}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="capitalize">{style}</span>
              </label>
            ))}
          </div>
        </div>

        {/* STEP 2: Add the slider control for size */}
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Size Control</h2>
            <div className="flex items-center gap-4 max-w-sm">
                <input
                    type="range"
                    min="44" // Minimum size (original)
                    max="220" // Maximum size (5x original)
                    step="1" // Increment step
                    value={iconSize}
                    onChange={(e) => setIconSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <span className="font-mono text-sm p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                    {iconSize}px
                </span>
            </div>
        </div>

        {/* Icon Frame Display */}
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Preview</h2>
          <div className="flex items-center gap-4">
            <IconFrame
              contentImageUrl={selectedIcon}
              styleType={frameStyle}
              size={iconSize} // STEP 3: Pass the size state to the component
              altText="Selected icon"
            />
            <button
              onClick={() => setShowMediaPicker(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg self-start"
            >
              Change Icon
            </button>
          </div>
        </div>

        {/* Media Picker Modal */}
        {showMediaPicker && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Select Icon Image</h3>
                <button
                  onClick={() => setShowMediaPicker(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  ×
                </button>
              </div>
              <div className="h-[60vh] overflow-y-auto">
                <MediaFileExplorer
                  bucketName="media"
                  onFileSelect={handleFileSelect}
                  mode="select"
                  accept="image/*"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}