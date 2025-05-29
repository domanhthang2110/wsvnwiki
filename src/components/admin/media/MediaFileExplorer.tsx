// src/components/admin/media/MediaFileExplorer.tsx
'use client';

import { useState, useEffect, useCallback, ChangeEvent, DragEvent, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Adjust path if needed
import type { FileObject } from '@supabase/storage-js';

// --- Icons ---
const FolderIcon = () => <span role="img" aria-label="folder" className="text-3xl sm:text-4xl">📁</span>;
const FileIcon = () => <span role="img" aria-label="file" className="text-3xl sm:text-4xl">📄</span>;
const GridViewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm8 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zm-8 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm8 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const ListViewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
const RenameIcon = () => <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>;
const DeleteIcon = () => <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const CloseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const SelectIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;


interface MediaFileExplorerProps {
  bucketName: string;
  initialPath?: string;
  onFileSelect?: (publicUrl: string, pathInBucket: string) => void;
  accept?: string;
  mode?: 'manage' | 'select'; // New prop, defaults to 'manage'
}

interface StorageItem extends FileObject {
  itemType: 'file' | 'folder';
  publicUrl?: string;
  thumbnailUrl?: string;
}

const formatPathForListing = (path: string): string => {
  if (path === "") return "";
  return path.endsWith('/') ? path : path + '/';
};
const normalizePath = (path: string): string => {
  // Cleans path: removes leading/trailing slashes, normalizes multiple slashes
  return path.split('/').filter(Boolean).join('/');
};

export default function MediaFileExplorer({
  bucketName,
  initialPath = "",
  onFileSelect,
  accept = "image/*,video/*,application/pdf",
  mode = 'manage',
}: MediaFileExplorerProps) {
  const [currentPath, setCurrentPath] = useState<string>(() => normalizePath(initialPath));
  const [items, setItems] = useState<StorageItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMessages, setUploadSuccessMessages] = useState<string[]>([]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectModeActive, setSelectModeActive] = useState(false); // Renamed for clarity with prop
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<StorageItem | null>(null);
  const [renamingItem, setRenamingItem] = useState<StorageItem | null>(null);
  const [newItemName, setNewItemName] = useState("");

  const fetchItems = useCallback(async () => {
    setLoadingItems(true);
    setItemsError(null);
    setItems([]);
    const pathToList = formatPathForListing(currentPath);

    try {
      const { data, error: listError } = await supabase.storage
        .from(bucketName)
        .list(pathToList, { sortBy: { column: 'name', order: 'asc' } });

      if (listError) throw listError;

      let processedItems: StorageItem[] = [];
      if (data) {
        for (const item of data) {
          if (item.name === '.emptyFolderPlaceholder') continue;
          
          const fullItemPathForURL = pathToList + item.name;
          if (item.id === null) { 
            processedItems.push({ ...item, name: item.name, itemType: 'folder' });
          } else { 
            const { data: publicURLData } = supabase.storage
              .from(bucketName)
              .getPublicUrl(fullItemPathForURL);
            
            let thumbnailUrl = undefined;
            if (publicURLData.publicUrl && item.name.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                thumbnailUrl = `${publicURLData.publicUrl}?width=150&height=150&resize=contain&quality=70`;
            }
            processedItems.push({ 
                ...item, name: item.name, itemType: 'file', 
                publicUrl: publicURLData.publicUrl, thumbnailUrl: thumbnailUrl
            });
          }
        }
      }
      processedItems.sort((a, b) => {
        if (a.itemType === 'folder' && b.itemType === 'file') return -1;
        if (a.itemType === 'file' && b.itemType === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
      setItems(processedItems);
    } catch (err: any) {
      setItemsError(err.message || "Failed to load media items.");
    } finally {
      setLoadingItems(false);
    }
  }, [bucketName, currentPath]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Adjust currentPath if initialPath prop changes (e.g. when used as a picker)
  useEffect(() => {
    setCurrentPath(normalizePath(initialPath));
  }, [initialPath]);

  const processAndUploadFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setIsUploading(true); setUploadError(null); setUploadSuccessMessages([]);
    const pathPrefixForUpload = currentPath ? `${currentPath}/` : "";
    const newSuccessMessages: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const fileExt = file.name.split('.').pop();
        const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
        const fullFilePathInBucket = `${pathPrefixForUpload}${uniqueFileName}`;
        const { error: uploadError } = await supabase.storage.from(bucketName).upload(fullFilePathInBucket, file, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;
        newSuccessMessages.push(`Uploaded: ${uniqueFileName}`);
      } catch (error: any) { setUploadError(prev => prev ? `${prev}\n${file.name} failed: ${error.message}` : `${file.name} failed: ${error.message}`); }
    }
    setUploadSuccessMessages(newSuccessMessages);
    if (newSuccessMessages.length > 0) setTimeout(() => setUploadSuccessMessages([]), 5000);
    setIsUploading(false); fetchItems();
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) processAndUploadFiles(event.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

const handleDragOver = (event: DragEvent<HTMLDivElement>) => { 
  event.preventDefault(); 
  event.stopPropagation(); 
  if (!isDraggingOver) setIsDraggingOver(true); // No mode check
};
  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => { 
  event.preventDefault(); 
  event.stopPropagation(); 
  if (event.currentTarget.contains(event.relatedTarget as Node)) return; 
  setIsDraggingOver(false); // No mode check
};
const handleDrop = (event: DragEvent<HTMLDivElement>) => { 
  event.preventDefault(); 
  event.stopPropagation(); 
  setIsDraggingOver(false); // No mode check
  if (event.dataTransfer.files?.length) { // Allow drop in any mode
    processAndUploadFiles(event.dataTransfer.files); 
  }
  event.dataTransfer.clearData(); 
};
  const triggerFileInput = () => fileInputRef.current?.click();

  const handleItemClick = (item: StorageItem) => {
    const fullItemPath = normalizePath(currentPath ? `${currentPath}/${item.name}` : item.name);
    if (item.itemType === 'folder') {
      setCurrentPath(fullItemPath);
      if (selectModeActive) { setSelectModeActive(false); setSelectedItems(new Set()); }
      return;
    }

    if (item.itemType === 'file' && item.publicUrl) {
      if (selectModeActive && mode === 'manage') {
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          if (newSet.has(fullItemPath)) newSet.delete(fullItemPath);
          else newSet.add(fullItemPath);
          return newSet;
        });
      } else { // Not in multi-select mode OR in 'select' prop mode
        if (onFileSelect) { // Primary action if onFileSelect is provided
          onFileSelect(item.publicUrl, fullItemPath);
        } else if (item.name.match(/\.(jpeg|jpg|gif|png|svg|webp|mp4|webm|ogg)$/i)) {
          setPreviewFile(item); // Fallback to preview if no onFileSelect
        }
      }
    }
  };
  
  const navigateToPathSegment = (segmentIndex: number | null) => { 
    if (selectModeActive && mode === 'manage') { setSelectModeActive(false); setSelectedItems(new Set());}
    if (segmentIndex === null) setCurrentPath("");
    else setCurrentPath(normalizePath(pathSegments.slice(0, segmentIndex + 1).join('/')));
  };
  const pathSegments = currentPath.split('/').filter(Boolean);

  const handleDeleteItem = async (itemToDelete: StorageItem) => {
    const fullPath = normalizePath(currentPath ? `${currentPath}/${itemToDelete.name}` : itemToDelete.name);
    if (!window.confirm(`Delete "${itemToDelete.name}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.storage.from(bucketName).remove([fullPath]);
      if (error) throw error;
      fetchItems(); 
    } catch (err: any) { alert(`Error deleting ${itemToDelete.name}: ${err.message}`); }
  };

  const handleMassDelete = async () => {
    if (selectedItems.size === 0) return;
    if (!window.confirm(`Delete ${selectedItems.size} selected item(s)? This cannot be undone.`)) return;
    try {
      const pathsToDelete = Array.from(selectedItems);
      const { error } = await supabase.storage.from(bucketName).remove(pathsToDelete);
      if (error) throw error;
      fetchItems(); setSelectedItems(new Set()); setSelectModeActive(false);
    } catch (err: any) { alert(`Error deleting items: ${err.message}`); }
  };

  const handleRenameItem = (item: StorageItem) => { setNewItemName(item.name); setRenamingItem(item); };
  const submitRename = async () => {
    if (!renamingItem || !newItemName.trim() || newItemName.trim() === renamingItem.name) { setRenamingItem(null); return; }
    const oldPath = normalizePath(currentPath ? `${currentPath}/${renamingItem.name}` : renamingItem.name);
    const newPath = normalizePath(currentPath ? `${currentPath}/${newItemName.trim()}` : newItemName.trim());
    try {
      const { error } = await supabase.storage.from(bucketName).move(oldPath, newPath);
      if (error) throw error;
      fetchItems();
    } catch (err: any) { alert(`Error renaming: ${err.message}`); } 
    finally { setRenamingItem(null); }
  };

  return (
    <div 
      className="border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave} 
      onDrop={handleDrop} 
    >
      {isDraggingOver && (
        <div className="absolute inset-0 bg-blue-500/60 dark:bg-blue-700/70 flex items-center justify-center z-30 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-500 pointer-events-none">
          <div className="text-center p-4 bg-black/30 backdrop-blur-sm rounded-md">
            <p className="text-white text-2xl font-semibold">Drop files here to upload</p>
            <p className="text-blue-100 dark:text-blue-200 text-md">to: /{bucketName}/{currentPath || '(root)'}</p>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-y-3 gap-x-2 pb-2 border-b dark:border-gray-600">
          <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200">
                  Bucket: <code className="text-sm bg-gray-100 dark:bg-gray-700 p-1 rounded">{bucketName}</code>
              </h3>
              <div className="flex items-center flex-wrap gap-x-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <button onClick={() => navigateToPathSegment(null)} className="hover:underline font-medium" title="Go to bucket root">🪣 Root</button>
                  {pathSegments.map((segment, index) => (
                      <span key={index} className="flex items-center gap-x-1">
                      <span className="text-gray-400 dark:text-gray-500">/</span>
                      <button onClick={() => navigateToPathSegment(index)} className="hover:underline" title={`Go to ${segment}`}>{segment}</button>
                      </span>
                  ))}
              </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
              <button onClick={() => setViewMode('grid')} title="Grid View" className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-blue-500 text-white dark:bg-blue-600' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}><GridViewIcon /></button>
              <button onClick={() => setViewMode('list')} title="List View" className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-blue-500 text-white dark:bg-blue-600' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}><ListViewIcon /></button>
                                <button onClick={triggerFileInput} disabled={isUploading || loadingItems} className="py-1.5 px-2 sm:px-3 text-white font-semibold rounded-md shadow-sm text-xs sm:text-sm disabled:opacity-50 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 flex items-center"><UploadIcon /> <span className="hidden sm:inline ml-1">Upload</span></button>
                  <input type="file" ref={fileInputRef} multiple accept={accept} onChange={handleFileInputChange} className="hidden" disabled={isUploading || loadingItems} />
              {mode === 'manage' && (
                <>
                  <button onClick={() => { setSelectModeActive(!selectModeActive); setSelectedItems(new Set()); }} className={`py-1.5 px-2 sm:px-3 font-semibold rounded-md shadow-sm text-xs sm:text-sm ${selectModeActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'} flex items-center`}><SelectIcon/> <span className="hidden sm:inline ml-1">{selectModeActive ? 'Cancel' : 'Select'}</span></button>
                </>
              )}
          </div>
        </div>
        
        {mode === 'manage' && selectModeActive && selectedItems.size > 0 && (
            <div className="my-2 p-2 bg-indigo-50 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-700 rounded-md flex items-center justify-between">
                <span className="text-sm text-indigo-700 dark:text-indigo-300">{selectedItems.size} item(s) selected.</span>
                <button onClick={handleMassDelete} className="py-1 px-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md text-xs">Delete Selected</button>
            </div>
        )}
        
        {(isUploading || uploadError || uploadSuccessMessages.length > 0) && (
          <div className="my-2 text-xs">
            {isUploading && <p className="text-blue-600 dark:text-blue-400 animate-pulse">Processing uploads...</p>}
            {uploadError && <p className="text-red-600 dark:text-red-400">Upload Error: {uploadError}</p>}
            {uploadSuccessMessages.length > 0 && ( <div className="p-1 bg-green-50 dark:bg-green-800 border border-green-200 dark:border-green-700 rounded-md"> {uploadSuccessMessages.map((msg, idx) => <p key={idx} className="text-green-700 dark:text-green-300">{msg}</p>)} </div> )}
          </div>
        )}

        {/* Gallery Content */}
        <div> {/* Added min-height to ensure dropzone is always available */}
            {loadingItems && <p className="text-center py-10 dark:text-gray-300">Loading items...</p>}
            {itemsError && <p className="text-center py-10 text-red-500 dark:text-red-400">Error: {itemsError}</p>}
            {!loadingItems && !itemsError && items.length === 0 && ( <p className="text-center py-10 text-gray-500 dark:text-gray-400">This folder is empty. Drag files here or use the 'Upload' button.</p> )}

            {!loadingItems && !itemsError && items.length > 0 && (
            viewMode === 'grid' ? (
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-start items-start">
                {items.map((item) => (
                    <div 
                    key={item.name + (item.itemType === 'folder' ? '_folder' : '_file')} 
                    className={`p-1.5 sm:p-2 w-full h-full max-w-20 max-h-20 border dark:border-gray-600 rounded-lg aspect-square flex flex-col items-center justify-center text-center group relative cursor-pointer
                                ${item.itemType === 'folder' ? 'bg-yellow-50 dark:bg-gray-700 hover:bg-yellow-100 dark:hover:bg-blue-900' 
                                                        : (selectModeActive ? 'hover:bg-gray-200 dark:hover:bg-gray-700' : (onFileSelect ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'bg-gray-50 dark:bg-gray-750'))}
                                ${selectModeActive && item.itemType === 'file' && selectedItems.has(normalizePath(currentPath ? `${currentPath}/${item.name}` : item.name)) ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-blue-400 dark:ring-offset-gray-800' : ''}
                                `}
                    onClick={() => handleItemClick(item)}
                    title={item.name}
                    >
                    <div className="text-3xl sm:text-4xl mb-1 flex-grow flex items-center justify-center overflow-hidden">
                        {item.itemType === 'folder' ? <FolderIcon /> : 
                        ( (item.thumbnailUrl || item.publicUrl) && (item.name.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i) ? 
                            <img src={item.thumbnailUrl || item.publicUrl} alt={item.name} className="max-w-full max-h-full object-contain" />
                            : <FileIcon /> ))}
                    </div>
                    <p className="text-[10px] sm:text-xs truncate w-full text-gray-700 dark:text-gray-300 group-hover:underline mt-auto flex-shrink-0 py-1">{item.name}</p>
                    
                    {item.itemType === 'file' && mode === 'manage' && !selectModeActive && (
                        <div className="absolute top-1 right-1 flex flex-col space-y-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button onClick={(e) => { e.stopPropagation(); handleRenameItem(item); }} className="p-1 bg-blue-500/80 text-white rounded-full shadow hover:bg-blue-600 text-xs" title="Rename"><RenameIcon/></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(item); }} className="p-1 bg-red-500/80 text-white rounded-full shadow hover:bg-red-600 text-xs" title="Delete"><DeleteIcon/></button>
                        </div>
                    )}
                    </div>
                ))}
                </div>
            ) : ( // List View
                <ul className="space-y-1">
                {items.map((item) => (
                    <li 
                    key={item.name + (item.itemType === 'folder' ? '_folder_list' : '_file_list')}
                    className={`flex items-center pb-1 dark:border-gray-700 rounded-md group relative cursor-pointer
                                ${item.itemType === 'folder' ? 'hover:bg-yellow-50 dark:hover:bg-blue-900' 
                                                        : (selectModeActive ? 'hover:bg-gray-200 dark:hover:bg-gray-700' : (onFileSelect ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''))}
                                ${selectModeActive && item.itemType === 'file' && selectedItems.has(normalizePath(currentPath ? `${currentPath}/${item.name}` : item.name)) ? 'bg-blue-100 dark:bg-blue-900' : ''}
                                `}
                    onClick={() => handleItemClick(item)}
                    title={item.name}
                    >
                    <span className="text-base mr-3">
                        {item.itemType === 'folder' ? <FolderIcon /> : 
                        ((item.thumbnailUrl || item.publicUrl) && item.name.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i) ? 
                            <img src={item.thumbnailUrl || item.publicUrl} alt="" className="w-7 h-7 object-contain rounded" /> 
                            : <FileIcon />)}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-grow">{item.name}</span>
                    {item.itemType === 'file' && mode === 'manage' && !selectModeActive && (
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                        <button onClick={(e) => { e.stopPropagation(); handleRenameItem(item); }} className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300" title="Rename"><RenameIcon/></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(item); }} className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" title="Delete"><DeleteIcon/></button>
                        </div>
                    )}
                    </li>
                ))}
                </ul>
            )
            )}
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4" onClick={() => setPreviewFile(null)}>
          <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 rounded-lg shadow-2xl max-w-4xl w-auto max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewFile(null)} className="absolute top-0 right-0 mt-2 mr-2 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 z-50" title="Close preview"><CloseIcon/></button>
            {previewFile.publicUrl && previewFile.name.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i) && (
              <img src={previewFile.publicUrl} alt={previewFile.name} className="max-w-full max-h-[calc(90vh-50px)] object-contain rounded" />
            )}
            {previewFile.publicUrl && previewFile.name.match(/\.(mp4|webm|ogg)$/i) && (
              <video src={previewFile.publicUrl} controls autoPlay className="max-w-full max-h-[calc(90vh-50px)] rounded">Your browser does not support the video tag.</video>
            )}
            <p className="text-center text-xs sm:text-sm mt-2 text-gray-700 dark:text-gray-300 truncate">{previewFile.name}</p>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {mode === 'manage' && renamingItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setRenamingItem(null)}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Rename Item</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current: <code className="text-xs">{renamingItem.name}</code></p>
                <input 
                    type="text" 
                    value={newItemName} 
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4"
                />
                <div className="flex justify-end space-x-3">
                    <button onClick={() => setRenamingItem(null)} className="py-2 px-4 text-sm rounded-md border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                    <button onClick={submitRename} className="py-2 px-4 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white">Rename</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}