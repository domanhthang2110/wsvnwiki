'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import parse from 'html-react-parser';
import { TagRow } from '@/types/posts';
import TableOfContents from '@/components/shared/TableOfContents';
import classContentStyles from '@/components/features/wiki/classes/ClassContent.module.css';

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
    headingElements.forEach((headingEl: Element) => {
      (headingEl as HTMLElement).style.border = ''; 
      (headingEl as HTMLElement).style.boxSizing = '';
    });
  },);

  return (
    <div className={`${classContentStyles.pixelBackground} border-[#e6ce63] border-b-0 border-[7px] border-double flex flex-col flex-grow w-full text-white`}>
      {/* Featured Image - Full Width Banner */}
      {featuredImageUrl && (
        <div className="relative w-full h-80 flex-shrink-0">
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

      <div className="flex flex-col lg:flex-row flex-grow">
        {/* Main Content */}
        <div className="lg:w-3/4 flex flex-col flex-grow">
          {/* Title and Tags Section - Dark Blue like classes page */}
          <div className="p-6 border-[3px] border-double border-[#e6ce63] shadow-lg" style={{ backgroundColor: '#1e3a8a' }}>
            <h1 className="text-4xl font-bold mb-4 text-white">{title}</h1>
            
            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: TagRow) => (
                  <span
                    key={tag.id}
                    className="text-white text-sm px-3 py-1 rounded"
                    style={{ backgroundColor: '#cc7722' }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content with darker background - no gap, no padding around wrapper */}
          <div className="flex-grow" style={{ backgroundColor: '#1a1a1a' }}>
            <div 
              ref={contentRef} 
              className="prose prose-lg prose-invert max-w-none text-white p-6"
              style={{
              } as React.CSSProperties}
            >
              {content && parse(content)}
            </div>
          </div>
        </div>

        {/* Table of Contents Sidebar */}
        <div className="lg:w-1/4 p-4">
          <div className="sticky top-6">
            <div className="p-4 border-[3px] border-double border-yellow-400 shadow-lg" style={{ backgroundColor: '#3e2e2b' }}>
              <h2 className="text-lg font-bold mb-4 text-yellow-300 flex items-center gap-2">
                📋 Mục lục
              </h2>
              <TableOfContents contentRef={contentRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
