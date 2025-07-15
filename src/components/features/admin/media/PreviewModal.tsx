'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CombinedStorageItem } from './MediaFileExplorer'; // Adjust path as needed
import { Switch } from '@/components/ui/Switch/switch'; // Import the Switch component
import Image from 'next/image';

// Icons
const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>;
const ResetZoomIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356-2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const PixelatedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM9 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM14 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;


interface PreviewModalProps {
  file: CombinedStorageItem;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ file, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [pixelated, setPixelated] = useState(false); // New state for pixelated rendering
  const lastMousePos = useRef({ x: 0, y: 0 });

  const isImage = file.name.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i);
  const isVideo = file.name.match(/\.(mp4|webm|ogg)$/i);

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(parseFloat(e.target.value));
    setPan({ x: 0, y: 0 }); // Reset pan on zoom change for simplicity
  };
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1 && isImage) { // Only allow dragging if zoomed in on an image
      setIsDragging(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      e.preventDefault(); // Prevent default drag behavior
    }
  }, [zoom, isImage]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4" 
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // End drag if mouse leaves window
    >
      <div 
        className="bg-white dark:bg-gray-800 p-2 sm:p-4 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] relative flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 z-50" // Adjusted position
          title="Close preview"
        >
          <CloseIcon/>
        </button>

        {isImage && (
          <div className="flex flex-col items-center mb-2 space-y-2">
            <div className="flex items-center space-x-2">
              <label htmlFor="zoom-slider" className="text-sm text-gray-700 dark:text-gray-300">Zoom ({zoom.toFixed(1)}x):</label>
              <input
                id="zoom-slider"
                type="range"
                min="0.5"
                max="10"
                step="0.1"
                value={zoom}
                onChange={handleZoomChange}
                className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <button onClick={handleResetZoom} className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600" title="Reset Zoom"><ResetZoomIcon/></button>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="pixelated-switch" className="text-sm text-gray-700 dark:text-gray-300">Pixelated Rendering <PixelatedIcon />:</label>
              <Switch
                id="pixelated-switch"
                checked={pixelated}
                onCheckedChange={setPixelated}
                aria-label="Toggle pixelated rendering"
                className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-400" // Custom colors for switch
              />
            </div>
          </div>
        )}

        <div className="flex-grow flex items-center justify-center overflow-hidden relative">
          {isImage && file.publicUrl && (
            <Image 
              src={file.publicUrl} 
              alt={file.name} 
              fill
              className="object-contain" 
              style={{ 
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                imageRendering: pixelated ? 'pixelated' : 'auto', 
              }}
              onMouseDown={handleMouseDown}
            />
          )}
          {isVideo && file.publicUrl && (
            <video src={file.publicUrl} controls autoPlay className="max-w-full max-h-full rounded">Your browser does not support the video tag.</video>
          )}
          {!isImage && !isVideo && (
            <p className="text-gray-500 dark:text-gray-400">No preview available for this file type.</p>
          )}
        </div>
        <p className="text-center text-xs sm:text-sm mt-2 text-gray-700 dark:text-gray-300 truncate">{file.name}</p>
      </div>
    </div>
  );
};

export default PreviewModal;
