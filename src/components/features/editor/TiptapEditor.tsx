// src/components/editor/TiptapEditor.tsx
'use client';

import { useEffect, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import NextImageExtension from './extensions/NextImageExtension';
import IconFrameExtension from './extensions/IconFrameExtension';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import { CustomImageResize } from './CustomImageResize';
import { Toolbar } from './Toolbar';
import { FontSize } from './extensions/FontSize';
import { Maximize2, Minimize2 } from 'lucide-react';

interface TiptapEditorProps {
  content: string;
  onChange: (richText: string) => void;
  onImagePickerOpen: (editor: Editor) => void;
  onImageUrlOpen?: (editor: Editor) => void;
}

export default function TiptapEditor({ content, onChange, onImagePickerOpen, onImageUrlOpen }: TiptapEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ 
        dropcursor: { 
          color: '#68cef8', 
          width: 2 
        },
        // Ensure Heading extension is enabled and configured for all levels
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        // Configure paragraph behavior
        paragraph: {
          HTMLAttributes: {
            class: 'my-paragraph',
          },
        },
        // Ensure hard break is properly configured
        hardBreak: {
          keepMarks: false,
          HTMLAttributes: {
            class: 'my-hard-break',
          },
        },
      }),
      Underline,
      NextImageExtension,
      IconFrameExtension,
      CustomImageResize,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer nofollow',
        },
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'listItem'],
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none p-4 leading-normal [&_p]:my-0 [&_img]:my-0 [&_img]:mx-0 [&_img]:inline-block [&_img]:align-bottom min-h-[300px]',
      },
      handleKeyDown: (view, event) => {
        // Handle Enter key to create new paragraph
        if (event.key === 'Enter' && !event.shiftKey) {
          // Let TipTap handle normal Enter behavior (should create new paragraph)
          return false;
        }
        // Handle Shift+Enter to create line break
        if (event.key === 'Enter' && event.shiftKey) {
          // Insert hard break instead of new paragraph
          const { state, dispatch } = view;
          const hardBreak = state.schema.nodes.hardBreak.create();
          const tr = state.tr.replaceSelectionWith(hardBreak);
          dispatch(tr);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false, // Add this to prevent hydration mismatches
  });

  // Set default font and font size on editor initialization
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      // Only apply defaults if content is empty or doesn't have explicit styles
      const currentFontFamily = editor.getAttributes('textStyle').fontFamily;
      const currentFontSize = editor.getAttributes('textStyle').fontSize;

      if (!currentFontFamily) {
        editor.chain().focus().setFontFamily('Inter').run();
      }
      if (!currentFontSize) {
        editor.chain().focus().setMark('textStyle', { fontSize: '16px' }).run();
      }
    }
  }, [editor]);

  // Add effect to update content when it changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`border border-neutral-700 bg-neutral-900 text-white rounded-md ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none flex flex-col' : ''
    }`}>
      {editor && (
        <div className="flex items-center justify-between border-b border-neutral-700">
          <Toolbar 
            editor={editor} 
            onImagePickerOpen={() => {
              if (editor) {
                onImagePickerOpen(editor);
              }
            }}
            onImageUrlOpen={onImageUrlOpen ? () => {
              if (editor) {
                onImageUrlOpen(editor);
              }
            } : undefined}
          />
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      )}
      <div className={isFullscreen ? 'flex-1 overflow-auto' : ''}>
        <EditorContent 
          editor={editor} 
          className={isFullscreen ? 'h-full [&_.ProseMirror]:min-h-[calc(100vh-120px)]' : ''}
        />
      </div>
    </div>
  );
}
