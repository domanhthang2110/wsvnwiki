'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import parse from 'html-react-parser';
import { TagRow } from '@/types/posts';
import TableOfContents from '@/components/shared/TableOfContents'; // Import the new TOC component

interface GuideContentRendererProps {
  content: string;
  title: string;
  featuredImageUrl?: string;
  tags: TagRow[];
}

export function GuideContentRenderer({ content, title, featuredImageUrl, tags }: GuideContentRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  // Removed: const [intersectingHeadersDebug, setIntersectingHeadersDebug] = useState<string[]>([]);
  // Removed: const handleDebugIntersectingChange = useCallback((ids: string[]) => { setIntersectingHeadersDebug(ids); }, []);

  // Removed: Effect to apply debug borders to headers
  useEffect(() => {
    if (!contentRef.current) return;

    const headingElements = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headingElements.forEach((headingEl: Element) => {
      // Removed debug borders
      (headingEl as HTMLElement).style.border = ''; 
      (headingEl as HTMLElement).style.boxSizing = '';
    });
  }, [contentRef.current]); // Only re-run when contentRef updates

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className="lg:w-3/4 relative">
          {featuredImageUrl && (
            <div className="relative w-full h-80 mb-8 rounded-lg overflow-hidden">
              <Image
                src={featuredImageUrl}
                alt={title || 'Featured image'}
                fill
                style={{ objectFit: 'cover' }}
                className="object-center"
              />
            </div>
          )}

          <h1 className="text-5xl font-extrabold mb-4">{title}</h1>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag: TagRow) => (
                <span
                  key={tag.id}
                  className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <div ref={contentRef} className="prose prose-lg dark:prose-invert max-w-none">
            {content && parse(content)}
          </div>
        </div>

        {/* Table of Contents / Minimap */}
        <div className="hidden lg:block lg:w-1/4">
          <div className="sticky top-24"> {/* Adjusted top for sticky */}
            <aside className="bg-card p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Table of Contents</h2>
              <TableOfContents contentRef={contentRef} /> {/* Removed onDebugIntersectingChange prop */}
            </aside>
          </div>
        </div>
      </div>

      {/* Removed Debug Overlay - Fixed to viewport */}
    </>
  );
}
