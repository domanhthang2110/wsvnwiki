// src/components/editor/TiptapEditor.tsx
'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import { useEffect } from 'react';

// --- All your other Tiptap extension imports ---
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import Gapcursor from '@tiptap/extension-gapcursor';
// --- End imports ---

import { Toolbar } from './Toolbar';

interface TiptapEditorProps {
  content: string;
  onChange: (richText: string) => void;
  onImagePickerOpen: (editor: Editor) => void;
}

export default function TiptapEditor({ content, onChange, onImagePickerOpen}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      // Your full list of extensions
      StarterKit, Underline,       Image.configure({
        inline: true, // This allows images to be inline
        allowBase64: false, // Good practice if you're using URLs
        // You can add HTMLAttributes here if needed for inline images
        // HTMLAttributes: {
        //   class: 'inline-image', // Example class for styling
        // },
      }), Link, TextStyle, Color, TextAlign, FontFamily, Gapcursor
    ],
    content: content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        // --- THIS LINE IS UPDATED ---
        class: 'prose min-h-[300px] dark:prose-invert max-w-none focus:outline-none p-4 leading-normal',
        // Try 'leading-normal' (tighter) or 'leading-relaxed' (looser) to find what you like.
        // Also increased min-h-200 to min-h-[300px] for a better default editing area.
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  return (
      <div className="border border-neutral-700 bg-neutral-900 text-white rounded-lg overflow-hidden">
        <Toolbar editor={editor} onImagePickerOpen={() => {
          if (editor) {
            onImagePickerOpen(editor);
          }
        }} />
        <EditorContent editor={editor} />
      </div>
  );
}
