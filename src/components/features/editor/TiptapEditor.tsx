// src/components/editor/TiptapEditor.tsx
'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image'; // Re-import Image
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
      }),
      Underline,
      Image.configure({ // Configure Image separately
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'inline-block align-bottom m-0',
        },
      }),
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

  // Add effect to update content when it changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-neutral-700 bg-neutral-900 text-white overflow-hidden rounded-md">
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
