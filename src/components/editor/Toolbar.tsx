// src/components/editor/Toolbar.tsx
'use client';

import React from 'react'; // Import React for React.MouseEvent
import { type Editor } from '@tiptap/react';
import {
  Bold, Strikethrough, Italic, List, ListOrdered, Heading2, Underline, Quote,
  Image as ImageIcon, Link as LinkIcon, Code, CornerUpLeft, CornerUpRight,
  AlignCenter, AlignLeft, AlignRight, Minus
} from 'lucide-react';

import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

type Props = { 
  editor: Editor | null;
  onImagePickerOpen: () => void;
};

export function Toolbar({ editor, onImagePickerOpen }: Props) {
  if (!editor) { return null; }

  const handleSetLink = () => {
    editor.chain().focus().run(); // Ensure editor has focus

    const previousUrl = editor.getAttributes('link').href;
    let url = window.prompt('Enter URL (leave blank to remove link):', previousUrl || '');

    if (url === null) { // User pressed Cancel
      return;
    }

    if (url === '') { // User wants to remove the link
      editor.chain().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Basic URL validation (optional, but good practice)
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:') && !url.startsWith('#')) {
        url = 'https://' + url;
    }
    
    editor.chain().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run();
  };

  const handleImagePickerOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent any default button behavior (like form submission)
    event.stopPropagation(); // Stop the event from bubbling up to parent elements
    onImagePickerOpen();
  };


  return (
    <div className="border-b border-neutral-700 p-2 flex items-center flex-wrap gap-1 bg-neutral-800">
      <div className="flex flex-wrap items-center gap-1 text-neutral-200">
        {/* --- History Group --- */}
        <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <CornerUpLeft className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <CornerUpRight className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* --- Font Family Dropdown --- */}
        <select
          value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          className="bg-neutral-800 text-sm p-1 border border-neutral-600 rounded"
          title="Font Family"
        >
          <option value="Inter">Inter</option>
          <option value="serif">Serif</option>
          <option value="monospace">Monospace</option>
          <option value="cursive">Cursive</option>
        </select>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* --- Mark Group --- */}
        <Toggle type="button" size="sm" pressed={editor.isActive('bold')} onPressedChange={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold className="h-4 w-4" /></Toggle>
        <Toggle type="button" size="sm" pressed={editor.isActive('italic')} onPressedChange={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic className="h-4 w-4" /></Toggle>
        <Toggle type="button" size="sm" pressed={editor.isActive('underline')} onPressedChange={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><Underline className="h-4 w-4" /></Toggle>
        <Toggle type="button" size="sm" pressed={editor.isActive('strike')} onPressedChange={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough"><Strikethrough className="h-4 w-4" /></Toggle>
        
        {/* --- Color Picker --- */}
        <div className="flex items-center px-2" title="Text Color">
          <input
            type="color"
            onInput={(event: React.ChangeEvent<HTMLInputElement>) => editor.chain().focus().setColor(event.target.value).run()}
            value={editor.getAttributes('textStyle').color || '#ffffff'}
            className="w-6 h-6 border-none bg-transparent cursor-pointer"
          />
        </div>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* --- Alignment Group --- */}
        <Toggle type="button" size="sm" pressed={editor.isActive({ textAlign: 'left' })} onPressedChange={() => editor.chain().focus().setTextAlign('left').run()} title="Align Left"><AlignLeft className="h-4 w-4" /></Toggle>
        <Toggle type="button" size="sm" pressed={editor.isActive({ textAlign: 'center' })} onPressedChange={() => editor.chain().focus().setTextAlign('center').run()} title="Align Center"><AlignCenter className="h-4 w-4" /></Toggle>
        <Toggle type="button" size="sm" pressed={editor.isActive({ textAlign: 'right' })} onPressedChange={() => editor.chain().focus().setTextAlign('right').run()} title="Align Right"><AlignRight className="h-4 w-4" /></Toggle>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* --- Block Group --- */}
        <Toggle type="button" size="sm" pressed={editor.isActive('heading', { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2"><Heading2 className="h-4 w-4" /></Toggle>
        <Toggle type="button" size="sm" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List"><List className="h-4 w-4" /></Toggle>
        <Toggle type="button" size="sm" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered List"><ListOrdered className="h-4 w-4" /></Toggle>
        <Toggle type="button" size="sm" pressed={editor.isActive('blockquote')} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote"><Quote className="h-4 w-4" /></Toggle>
        <Toggle type="button" size="sm" pressed={editor.isActive('codeBlock')} onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()} title="Code Block"><Code className="h-4 w-4" /></Toggle>
        
        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* --- Action Group --- */}
        <Button type="button" size="sm" variant="ghost" onClick={handleSetLink} title="Set Link"><LinkIcon className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={handleImagePickerOpen} title="Add Image">
            <ImageIcon className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().setHardBreak().run()} title="Hard Break">
          <Minus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
