'use client';

import React from 'react';
import parse, { Element, DOMNode, HTMLReactParserOptions } from 'html-react-parser';
import { FrameStyleType, FrameType } from '@/components/shared/IconFrame';
import { InlineIconFrame } from '@/components/shared/InlineIconFrame';

interface CustomContentRendererProps {
  content: string;
}

export function CustomContentRenderer({ content }: CustomContentRendererProps) {
  const options: HTMLReactParserOptions = {
    replace: (domNode: DOMNode) => {
      if (domNode instanceof Element && domNode.name === 'span' && domNode.attribs && domNode.attribs['data-icon-frame'] !== undefined) {
        const { 
          'data-src': src, 
          'data-alt': alt, 
          'data-size': size, 
          'data-style-type': styleType, 
          'data-frame-type': frameType 
        } = domNode.attribs;

        // Let React render the InlineIconFrame component (only spans, no divs)
        return (
          <span className="not-prose">
            <InlineIconFrame
              size={parseInt(size) || 64}
              styleType={(styleType as FrameStyleType) || 'yellow'}
              frameType={(frameType as FrameType) || 'regular'}
              contentImageUrl={src || null}
              altText={alt || 'Icon'}
            />
          </span>
        );
      }
    }
  };

  return <>{parse(content, options)}</>;
}