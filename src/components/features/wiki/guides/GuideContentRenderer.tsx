'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { TagRow } from '@/types/posts';
import TableOfContents from '@/components/shared/TableOfContents';
import classContentStyles from '@/components/features/wiki/classes/ClassContent.module.css';
import { CustomContentRenderer } from './CustomContentRenderer';

interface GuideContentRendererProps {
  content: string;
  title: string;
  featuredImageUrl?: string;
  tags: TagRow[];
}

export function GuideContentRenderer({ content, title, featuredImageUrl, tags }: GuideContentRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const headingElements = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headingElements.forEach((headingEl) => {
      (headingEl as HTMLElement).style.border = ''; 
      (headingEl as HTMLElement).style.boxSizing = '';
    });
  },);


  return (
    <div className="border-[#e6ce63] border-b-0 border-[7px] border-double flex flex-col flex-grow w-full text-white bg-gray-900">
      {/* Featured Image - Banner */}
      {featuredImageUrl && (
        <div className="relative w-full h-48 flex-shrink-0">
          <Image
            src={featuredImageUrl}
            alt={title || 'Featured image'}
            fill
            style={{ objectFit: 'cover' }}
            className="object-center"
            draggable={false}
          />
        </div>
      )}

      {/* Title and Tags Section */}
      <div className="p-4 lg:p-6 border-[3px] border-double border-[#e6ce63] shadow-lg bg-gray-800">
        <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-white">{title}</h1>
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: TagRow) => (
              <span
                key={tag.id}
                className="bg-blue-600 text-white text-xs lg:text-sm px-2 py-1 rounded"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Table of Contents - Mobile/Tablet (shown on smaller screens) */}
      <div className="lg:hidden p-4 border-[3px] border-double border-yellow-400 shadow-lg bg-gray-800">
        <h2 className="text-lg font-bold mb-3 text-yellow-400 flex items-center gap-2">
          📋 Table of Contents
        </h2>
        <TableOfContents contentRef={contentRef} />
      </div>

      <div className="flex flex-col lg:flex-row flex-grow">
        {/* Main Content */}
        <div className="lg:w-3/4 flex flex-col flex-grow">
          {/* Content */}
          <div className="flex-grow bg-gray-800">
            <div 
              ref={contentRef} 
              className="prose prose-lg prose-invert max-w-none text-white p-6"
            >
              {content && <CustomContentRenderer content={content} />}
            </div>
          </div>
        </div>

        {/* Table of Contents Sidebar - Desktop Only */}
        <div className="hidden lg:block lg:w-1/4 p-4 bg-gray-900">
          <div className="sticky top-6">
            <div className="p-4 border-[3px] border-double border-yellow-400 shadow-lg bg-gray-800">
              <h2 className="text-lg font-bold mb-4 text-yellow-400 flex items-center gap-2">
                📋 Table of Contents
              </h2>
              <TableOfContents contentRef={contentRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
