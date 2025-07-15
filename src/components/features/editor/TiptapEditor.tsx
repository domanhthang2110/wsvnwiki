// src/components/editor/TiptapEditor.tsx
'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import NextImageExtension from './extensions/NextImageExtension';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import { CustomImageResize } from './CustomImageResize';
import { Toolbar } from './Toolbar';
import { FontSize } from './extensions/FontSize';

interface TiptapEditorProps {
  content: string;
  onChange: (richText: string) => void;
  onImagePickerOpen: (editor: Editor) => void;
}

export default function TiptapEditor({ content, onChange, onImagePickerOpen }: TiptapEditorProps) {
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
      }),
      Underline,
      NextImageExtension,
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
        class: 'prose min-h-[300px] dark:prose-invert max-w-none focus:outline-none p-4 leading-normal [&_p]:my-0 [&_img]:my-0 [&_img]:mx-0 [&_img]:inline-block [&_img]:align-bottom',
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

  return (
    <div className="border border-neutral-700 bg-neutral-900 text-white rounded-md">
      {editor && (
        <Toolbar 
          editor={editor} 
          onImagePickerOpen={() => {
            if (editor) {
              onImagePickerOpen(editor);
            }
          }} 
        />
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
