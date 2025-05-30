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
import { CustomImageResize } from './CustomImageResize';
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
      StarterKit.configure({
        dropcursor: {
          color: '#68cef8',
          width: 2,
        },
      }), 
      Underline,       
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'inline-block align-bottom m-0',
        },
      }), 
      CustomImageResize,
      Link, 
      TextStyle, 
      Color, 
      TextAlign, 
      FontFamily,
    ],
    content: content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose min-h-[300px] dark:prose-invert max-w-none focus:outline-none p-4 leading-normal [&_p]:my-0 [&_img]:my-0 [&_img]:mx-0 [&_img]:inline-block [&_img]:align-bottom',
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
      <div className="border border-neutral-700 bg-neutral-900 text-white overflow-hidden">
        <Toolbar editor={editor} onImagePickerOpen={() => {
          if (editor) {
            onImagePickerOpen(editor);
          }
        }} />
        <EditorContent editor={editor} />
      </div>
  );
}
