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

const TableOfContents: React.FC<TableOfContentsProps> = ({ contentRef }) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const tocNavRef = useRef<HTMLUListElement>(null);

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
  }, [contentRef]);


  // Smooth Scrolling on Click
  const handleClick = useCallback((id: string) => {
    const heading = headings.find((h) => h.id === id);
    if (heading) {
      heading.node.scrollIntoView({ behavior: 'smooth' });
    }
  }, [headings]);

  // Render null if no headers found
  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className={styles.tableOfContentsContainer} aria-label="Table of contents">
      <button onClick={() => setIsCollapsed(!isCollapsed)} className={styles.toggleButton}>
        <span>Mục lục</span>
        <span className={`${styles.arrow} ${isCollapsed ? styles.collapsed : ''}`}>▼</span>
      </button>
      {!isCollapsed && (
        <ul ref={tocNavRef} className={styles.tocList}>
          {headings.map((heading) => (
            <li
              key={heading.id}
              data-toc-id={heading.id}
              data-level={heading.level}
              className={styles.tocListItem}
              style={{ '--indent-level': heading.level - 1 } as React.CSSProperties}
            >
              <a href={`#${heading.id}`} onClick={(e) => { e.preventDefault(); handleClick(heading.id); }}>
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default TableOfContents;
