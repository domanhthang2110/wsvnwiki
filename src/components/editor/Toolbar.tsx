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
    const previousText = editor.state.doc.textBetween(
      editor.state.selection.from, 
      editor.state.selection.to,
      ' '
    );
    
    // Get URL
    let url = window.prompt('Enter URL:', previousUrl || '');
    if (url === null) return; // User pressed Cancel

    // If URL is empty, remove the link
    if (url === '') {
      editor.chain().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:') && !url.startsWith('#')) {
      url = 'https://' + url;
    }

    // Get display text if no text is selected
    if (!previousText) {
      const displayText = window.prompt('Enter display text (leave empty to show URL):', '');
      if (displayText === null) return; // User pressed Cancel
      
      // Insert new text node with link
      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: 'text',
            marks: [{ type: 'link', attrs: { href: url } }],
            text: displayText || url
          }
        ])
        .run();
    } else {
      // Just set link on existing selection
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run();
    }
  };

  const handleImagePickerOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent any default button behavior (like form submission)
    event.stopPropagation(); // Stop the event from bubbling up to parent elements
    onImagePickerOpen();
  };

  // --- NEW FUNCTION TO HANDLE IMAGE FLOATING ---
  const handleImageFloat = (newFloat: 'left' | 'right' | 'none') => {
    if (!editor || !editor.isActive('custom-image')) { // Ensure this matches your custom image node name
        return;
    }
    const currentAttrs = editor.getAttributes('custom-image');
    // Set display to inline-block for floating, block for no float
    const newDisplay = newFloat === 'none' ? 'block' : 'inline-block';
    
    // Preserve existing width or use 'auto'. Floating often works best with a defined width.
    // If 'auto' causes issues, consider a default like '50%' or '300px'.
    const width = currentAttrs.width || 'auto'; 

    editor.chain().focus().updateAttributes('custom-image', { 
        float: newFloat, 
        display: newDisplay,
        width: width 
    }).run();
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
          className="bg-neutral-800 text-sm p-1 border border-neutral-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            value={editor.getAttributes('textStyle').color || '#ffffff'} // Default to white if no color is set
            className="w-6 h-6 border-none bg-transparent cursor-pointer p-0" // Ensure padding is 0 for better appearance
            aria-label="Text color picker"
          />
        </div>

        <Separator orientation="vertical" className="h-8 mx-1" />

        {/* --- Alignment Group (For Text) --- */}
        <Toggle type="button" size="sm" pressed={editor.isActive({ textAlign: 'left' })} onPressedChange={() => editor.chain().focus().setTextAlign('left').run()} title="Align Text Left"><AlignLeft className="h-4 w-4" /></Toggle>
        <Toggle type="button" size="sm" pressed={editor.isActive({ textAlign: 'center' })} onPressedChange={() => editor.chain().focus().setTextAlign('center').run()} title="Align Text Center"><AlignCenter className="h-4 w-4" /></Toggle>
        <Toggle type="button" size="sm" pressed={editor.isActive({ textAlign: 'right' })} onPressedChange={() => editor.chain().focus().setTextAlign('right').run()} title="Align Text Right"><AlignRight className="h-4 w-4" /></Toggle>

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

        {/* ---- NEW IMAGE FLOAT CONTROLS (Only visible when a 'custom-image' is selected) ---- */}
        {editor.isActive('custom-image') && ( // Ensure 'custom-image' matches your node name
          <>
            <Separator orientation="vertical" className="h-8 mx-1" />
            <Toggle 
              type="button" 
              size="sm" 
              pressed={editor.getAttributes('custom-image').float === 'left'} 
              onPressedChange={() => handleImageFloat('left')}
              title="Float Image Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Toggle>
            <Toggle 
              type="button" 
              size="sm" 
              pressed={
                editor.getAttributes('custom-image').float === 'none' || 
                editor.getAttributes('custom-image').float === undefined
              } 
              onPressedChange={() => handleImageFloat('none')}
              title="Image No Float / Block"
            >
              <AlignCenter className="h-4 w-4" /> {/* Using AlignCenter icon for 'no float' */}
            </Toggle>
            <Toggle 
              type="button" 
              size="sm" 
              pressed={editor.getAttributes('custom-image').float === 'right'} 
              onPressedChange={() => handleImageFloat('right')}
              title="Float Image Right"
            >
              <AlignRight className="h-4 w-4" />
            </Toggle>
          </>
        )}
        {/* ---- END NEW IMAGE FLOAT CONTROLS ---- */}
        
        <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().setHardBreak().run()} title="Hard Break (New Line)">
          <Minus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
