import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// Define a type for the items to be returned, similar to Supabase FileObject
interface LocalStorageItem {
  name: string;
  itemType: 'file' | 'folder';
  publicUrl?: string;
  thumbnailUrl?: string; // For consistency, though it will be same as publicUrl for local
  id: string; // Unique identifier, can be name for local files
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const relativePath = searchParams.get('path') || '';

    // Sanitize the relativePath to prevent directory traversal
    const normalizedRelativePath = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, '');

    const baseDir = path.join(process.cwd(), 'public', 'image');
    const targetPath = path.join(baseDir, normalizedRelativePath);

    // Ensure the targetPath is still within the baseDir after normalization
    if (!targetPath.startsWith(baseDir)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    let dirents;
    try {
      dirents = await fs.readdir(targetPath, { withFileTypes: true });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return NextResponse.json({ error: 'Directory not found' }, { status: 404 });
      }
      throw error;
    }

    const items: LocalStorageItem[] = [];

    for (const dirent of dirents) {
      if (dirent.name.startsWith('.')) { // Skip hidden files/folders
        continue;
      }

      const item: LocalStorageItem = {
        name: dirent.name,
        id: dirent.name, // Use name as ID for local files
        itemType: dirent.isDirectory() ? 'folder' : 'file',
      };

      if (dirent.isFile()) {
        // Construct public URL for local files
        const publicUrlPath = path.posix.join('/image', normalizedRelativePath, dirent.name);
        item.publicUrl = publicUrlPath;
        item.thumbnailUrl = publicUrlPath; // For local, thumbnail is just the full image
      }
      items.push(item);
    }

    // Sort items: folders first, then alphabetically by name
    items.sort((a, b) => {
      if (a.itemType === 'folder' && b.itemType === 'file') return -1;
      if (a.itemType === 'file' && b.itemType === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(items);

  } catch (error: any) {
    console.error('Error listing local media:', error);
    return NextResponse.json({ error: error.message || 'Failed to list local media' }, { status: 500 });
  }
}
