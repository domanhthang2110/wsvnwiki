// src/app/admin/media/page.tsx
'use client';

import MediaFileExplorer from '@/components/features/admin/media/MediaFileExplorer';

export default function AdminMediaPage() {
  const handleFileSelectedOnPage = (publicUrl: string, pathInBucket: string) => {
    console.log('File selected on AdminMediaPage:', { publicUrl, pathInBucket });
    alert(`File selected: ${pathInBucket}`);
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">
        Media Management
      </h1>
      
      <MediaFileExplorer 
        bucketName="media" // YOUR BUCKET NAME
        initialPath=""    // Start at the root, or "general", "classes", etc.
        onFileSelect={handleFileSelectedOnPage} 
        accept="image/*, video/*, application/pdf" 
      />
    </div>
  );
}
