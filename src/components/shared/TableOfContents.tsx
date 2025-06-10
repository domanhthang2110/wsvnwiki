import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './TableOfContents.module.css';

interface Heading {
  id: string;
  text: string;
  level: number;
  node: HTMLElement;
}

interface TableOfContentsProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  onDebugIntersectingChange?: (ids: string[]) => void; // New prop for debug
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ contentRef, onDebugIntersectingChange }) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [trackerStyle, setTrackerStyle] = useState<{ top: string; height: string }>({ top: '0px', height: '0px' });
  const [isClickScrolling, setIsClickScrolling] = useState<boolean>(false);

  const tocNavRef = useRef<HTMLUListElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollLockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to generate a slug from text
  const slugify = (text: string) => {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

  // Automatic Header Detection
  useEffect(() => {
    if (!contentRef.current) {
      return;
    }

    const contentElement = contentRef.current;
    const detectedHeadings: Heading[] = [];
    const headingElements = contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6');

    headingElements.forEach((headingEl, index) => {
      const level = parseInt(headingEl.tagName.substring(1));
      let id = headingEl.id;
      if (!id) {
        id = slugify(headingEl.textContent || `heading-${index}`);
        headingEl.id = id; // Assign a unique ID if missing
      }
      detectedHeadings.push({
        id,
        text: headingEl.textContent || '',
        level,
        node: headingEl as HTMLElement,
      });
    });

    setHeadings(detectedHeadings);
  }, [contentRef.current]);

  // Set initial activeId to the first heading once headings are loaded
  useEffect(() => {
    if (headings.length > 0 && activeId === null) {
      setActiveId(headings[0].id);
    }
  }, [headings, activeId]); // Depend on headings and activeId

  // IntersectionObserver for Dynamic Highlighting
  useEffect(() => {
    if (headings.length === 0) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling) return;

        const intersectingEntries = entries.filter(entry => entry.isIntersecting);
        const intersectingIds = intersectingEntries.map(entry => entry.target.id);
        onDebugIntersectingChange?.(intersectingIds); // Emit debug info

        if (intersectingEntries.length > 0) {
          // Sort by boundingClientRect.top in ascending order to find the one closest to the top of the detection zone
          intersectingEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(intersectingEntries[0].target.id); // Pick the first intersecting header
        } else {
          // If no headings are currently intersecting the middle zone:
          const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 50); // 50px buffer
          const lastHeading = headings[headings.length - 1];

          if (isAtBottom && lastHeading) {
            setActiveId(lastHeading.id);
          } else {
            // Find the last heading that has passed the middle zone (scrolling upwards)
            const viewportCenter = window.innerHeight / 2;
            const lastPassedHeading = headings.slice().reverse().find(h => h.node.getBoundingClientRect().top < viewportCenter);

            if (lastPassedHeading) {
              setActiveId(lastPassedHeading.id);
            }
            // If activeId is already set and no new conditions met, it remains unchanged (empty space)
            // If headings.length is 0, activeId should be null, handled by initial render check.
          }
        }
      },
      {
        root: null, // viewport
        rootMargin: '-20% 0% -35% 0px', // Zone from example: 20% from top, 35% from bottom (45% middle zone)
        threshold: 0, // Any pixel of the heading must be visible to trigger
      }
    );

    headings.forEach((heading) => observer.observe(heading.node));
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [headings, isClickScrolling, activeId, onDebugIntersectingChange]); // activeId added back to dependencies

  // Update tracker bar style
  useEffect(() => {
    if (tocNavRef.current && activeId) {
      const activeListItem = tocNavRef.current.querySelector(`li[data-toc-id="${activeId}"]`) as HTMLLIElement;
      if (activeListItem) {
        setTrackerStyle({
          top: `${activeListItem.offsetTop}px`,
          height: `${activeListItem.offsetHeight}px`,
        });
      }
    }
  }, [activeId, headings]);

  // Smooth Scrolling on Click
  const handleClick = useCallback((id: string) => {
    const heading = headings.find((h) => h.id === id);
    if (heading) {
      setIsClickScrolling(true);
      setActiveId(id); // Immediately set active for visual feedback

      heading.node.scrollIntoView({ behavior: 'smooth' });

      if (scrollLockTimeoutRef.current) {
        clearTimeout(scrollLockTimeoutRef.current);
      }
      scrollLockTimeoutRef.current = setTimeout(() => {
        setIsClickScrolling(false);
        scrollLockTimeoutRef.current = null;
      }, 1000); // Adjust timeout based on scroll speed
    }
  }, [headings]);

  // Render null if no headers found
  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className={styles.tableOfContentsContainer} aria-label="Table of contents">
      <ul ref={tocNavRef} className={styles.tocList}>
        <div className={styles.trackerBar} style={trackerStyle}></div>
        {headings.map((heading) => (
          <li
            key={heading.id}
            data-toc-id={heading.id}
            className={`${styles.tocListItem} ${activeId === heading.id ? styles.active : ''}`}
            style={{ marginLeft: `${(heading.level - 1) * 15}px` }} // Indentation
          >
            <a href={`#${heading.id}`} onClick={(e) => { e.preventDefault(); handleClick(heading.id); }}>
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
