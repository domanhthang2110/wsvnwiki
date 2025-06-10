'use client';

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils'; // Assuming cn utility exists for class concatenation

interface Header {
  id: string;
  text: string;
  level: number;
}

interface GuideTableOfContentsProps {
  headers: Header[];
}

export function GuideTableOfContents({ headers }: GuideTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const isScrollingToAnchor = useRef(false); // New ref to track manual scrolling

  useEffect(() => {
    // Initialize activeId to the first header if available
    if (headers.length > 0 && activeId === null) {
      setActiveId(headers[0].id);
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Ignore updates if we are currently scrolling to an anchor
      if (isScrollingToAnchor.current) {
        return;
      }

      let newActiveId: string | null = null;
      let minTop = Infinity;
      let maxBottom = -Infinity; // To detect elements near the bottom of the viewport

      const intersectingHeaders = entries.filter(entry => entry.isIntersecting);

      if (intersectingHeaders.length > 0) {
        // Sort by their position in the document (top of bounding box)
        intersectingHeaders.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        // Primary Rule: Highlight the heading closest to the top of the viewport
        for (let i = 0; i < intersectingHeaders.length; i++) {
          const entry = intersectingHeaders[i];
          const rect = entry.boundingClientRect;

          // If the header's top is at or above the viewport top (or very close to it)
          // and its bottom is still in view, it's a strong candidate.
          if (rect.top <= 0 && rect.bottom > 0) {
            // This header is currently "active" as its top has passed the viewport top
            // or it's at the very top. We want the one that is highest on the screen
            // but still visible.
            newActiveId = entry.target.id;
            break; // Found the highest one, prioritize it
          } else if (rect.top > 0 && rect.top < minTop) {
            // This header is below the top of the viewport but is the highest visible one
            minTop = rect.top;
            newActiveId = entry.target.id;
          }
        }

        // Fallback: If no header is found by the "closest to top" rule,
        // check if we are near the bottom of the page and highlight the last header.
        // This handles cases where the last header might be short and not reach the top threshold.
        const isNearPageBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 100); // 100px buffer
        if (newActiveId === null && isNearPageBottom && headers.length > 0) {
          newActiveId = headers[headers.length - 1].id;
        }
      }

      // Persistence: If no new active header is found, retain the last active one.
      if (newActiveId === null && headers.length > 0) {
        newActiveId = activeId; // Keep the last active one
      } else if (newActiveId === null && headers.length === 0) {
        newActiveId = null; // No headers at all
      }
      
      // Only update if the activeId has actually changed
      if (newActiveId !== activeId) {
        setActiveId(newActiveId);
      }
    };

    // Observe elements with a rootMargin that covers the entire viewport
    // and a threshold of 0 to detect entry/exit immediately.
    observer.current = new IntersectionObserver(observerCallback, {
      rootMargin: '0px 0px 0px 0px', // Observe the entire viewport
      threshold: 0, // Trigger as soon as any part of the element enters/exits
    });

    // Observe all headers
    headers.forEach(header => {
      const element = document.getElementById(header.id);
      if (element) {
        observer.current?.observe(element);
      }
    });

    return () => {
      observer.current?.disconnect();
    };
  }, [headers]); // Removed activeId from dependencies to prevent infinite loops from setActiveId within callback

  // Handle click on TOC item to scroll smoothly and update activeId
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    isScrollingToAnchor.current = true; // Set flag to true
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setActiveId(id); // Immediately set active for better UX

    // Reset flag after a short delay (e.g., 500ms for smooth scroll)
    setTimeout(() => {
      isScrollingToAnchor.current = false;
    }, 700); // Adjust delay based on scroll speed
  };

  return (
    <nav className="space-y-2">
      <ul className="relative">
        {/* Vertical bar */}
        <div
          className="absolute left-0 top-0 h-full w-0.5 bg-border"
          aria-hidden="true"
        />
        {headers.map((header) => (
          <li key={header.id} className={`relative ml-${(header.level - 1) * 4}`}>
            <a
              href={`#${header.id}`}
              onClick={(e) => handleClick(e, header.id)}
              className={cn(
                "block py-1 pl-4 text-muted-foreground hover:text-primary transition-colors text-lg",
                activeId === header.id && "text-primary font-semibold"
              )}
            >
              {header.text}
            </a>
            {activeId === header.id && (
              <div className="absolute left-0 top-0 h-full w-0.5 bg-primary -translate-x-0.5 transition-all duration-300 ease-in-out" />
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
