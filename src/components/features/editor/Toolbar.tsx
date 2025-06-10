// src/components/editor/Toolbar.tsx
'use client';

import React from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold, Strikethrough, Italic, List, ListOrdered, Heading2, Underline, Quote,
  Image as ImageIcon, Link as LinkIcon, Code, CornerUpLeft, CornerUpRight,
  AlignCenter, AlignLeft, AlignRight, Minus, AlignJustify
} from 'lucide-react';

import { Toggle } from '@/components/ui/Toggle/toggle';
import { Separator } from '@/components/ui/Separator/separator';
import { Button } from '@/components/ui/Button/button';

type Props = {
  editor: Editor | null;
  onImagePickerOpen: () => void;
};

export function Toolbar({ editor, onImagePickerOpen }: Props) {
  if (!editor) return null;

  // The link and image handlers remain the same...
  const handleSetLink = () => {
    editor.chain().focus().run();
    const previousUrl = editor.getAttributes('link').href;
    const previousText = editor.state.doc.textBetween( editor.state.selection.from, editor.state.selection.to, ' ' );
    let url = window.prompt('Enter URL:', previousUrl || '');
    if (url === null) return;
    if (url === '') { editor.chain().extendMarkRange('link').unsetLink().run(); return; }
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:') && !url.startsWith('#')) { url = 'https://' + url; }
    if (!previousText) {
      const displayText = window.prompt('Enter display text (leave empty to show URL):', '');
      if (displayText === null) return;
      editor.chain().focus().insertContent([{ type: 'text', marks: [{ type: 'link', attrs: { href: url } }], text: displayText || url }]).run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };
  const handleImagePickerOpen = (event: React.MouseEvent<HTMLButtonElement>) => { event.preventDefault(); event.stopPropagation(); onImagePickerOpen(); };
  const handleImageFloat = (newFloat: 'left' | 'right' | 'none') => {
    if (!editor || !editor.isActive('custom-image')) return;
    const currentAttrs = editor.getAttributes('custom-image');
    const newDisplay = newFloat === 'none' ? 'block' : 'inline-block';
    const width = currentAttrs.width || 'auto';
    editor.chain().focus().updateAttributes('custom-image', { float: newFloat, display: newDisplay, width: width }).run();
  };

  const fontSizes = [
    { label: '12px', value: '12px' }, { label: '14px', value: '14px' }, { label: '16px', value: '16px' },
    { label: '18px', value: '18px' }, { label: '20px', value: '20px' }, { label: '24px', value: '24px' },
    { label: '30px', value: '30px' }, { label: '36px', value: '36px' }, {label: '48px', value: '48px' },
    { label: '64px', value: '64px' }, { label: '72px', value: '72px' }, { label: '96px', value: '96px' }
  ];

  const fontFamilies = [
    { label: 'Inter', value: 'Inter' }, { label: 'Serif', value: 'serif' },
    { label: 'Monospace', value: 'monospace' }, { label: 'Cursive', value: 'cursive' },
  ];
  
  // Get the current font size from textStyle mark, default to '16px' if not set
  const currentFontSize = editor.getAttributes('textStyle').fontSize || '16px';

  // Get the current font family from textStyle mark, default to 'Inter' if not set
  const currentFontFamily = editor.getAttributes('textStyle').fontFamily || 'Inter';

  const headingOptions = [
    { label: 'Paragraph', value: 'paragraph' },
    { label: 'Heading 1', value: 'h1' },
    { label: 'Heading 2', value: 'h2' },
    { label: 'Heading 3', value: 'h3' },
    { label: 'Heading 4', value: 'h4' },
    { label: 'Heading 5', value: 'h5' },
    { label: 'Heading 6', value: 'h6' },
  ];

  const currentHeading = headingOptions.find(option => 
    option.value === 'paragraph' ? editor.isActive('paragraph') : editor.isActive('heading', { level: parseInt(option.value.substring(1)) })
  )?.value || 'paragraph';

  return (
    <div className="editor-toolbar p-2 flex items-center flex-wrap gap-1 bg-neutral-800 sticky top-0 z-10">
      {/* History Group */}
      <div className="flex items-center gap-1">
        <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><CornerUpLeft className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><CornerUpRight className="h-4 w-4" /></Button>
      </div>

      <Separator orientation="vertical" className="h-8 mx-1 bg-neutral-700" />

      {/* Heading Type Dropdown */}
      <div className="flex items-center gap-1">
        <select
          value={currentHeading}
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'paragraph') {
              editor.chain().focus().setParagraph().run();
            } else {
              // Cast to 'any' because Tiptap's 'Level' type is a literal union (1 | 2 | ... | 6)
              // and parseInt returns a generic 'number'.
              editor.chain().focus().toggleHeading({ level: parseInt(value.substring(1)) as any }).run();
            }
          }}
          className="bg-neutral-800 text-sm p-1 border border-neutral-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[120px]"
          title="Heading Type"
        >
          {headingOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>

      {/* Text Style Group */}
      <div className="flex items-center gap-1">
        {/* Font Family Dropdown */}
        <select
          value={currentFontFamily}
          onChange={(e) => {
            const value = e.target.value;
            editor.chain()
              .focus()
              .command(({ tr, state }) => {
                tr.setSelection(state.selection);
                return true;
              })
              .setFontFamily(value)
              .run(); // No removeEmptyTextStyle, always set a font
          }}
          className="bg-neutral-800 text-sm p-1 border border-neutral-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[100px]"
          title="Font Family"
        >
          {fontFamilies.map(font => <option key={font.value} value={font.value}>{font.label}</option>)}
        </select>

        {/* Font Size Dropdown */}
        <select
          value={currentFontSize}
          onChange={(e) => {
            const value = e.target.value;
            editor.chain()
              .focus()
              .command(({ tr, state }) => {
                tr.setSelection(state.selection);
                return true;
              })
              .setMark('textStyle', { fontSize: value }) // Always set a font size
              .run();
          }}
          className="bg-neutral-800 text-sm p-1 border border-neutral-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[80px]"
          title="Font Size"
        >
          {fontSizes.map(size => <option key={size.value} value={size.value}>{size.label}</option>)}
        </select>

        {/* Color Picker */}
        <div className="flex items-center px-2" title="Text Color">
          <input
            type="color"
            onInput={(event) => {
              editor.commands.setMark('textStyle', { color: (event.target as HTMLInputElement).value });
            }}
            value={editor.getAttributes('textStyle').color || '#ffffff'}
            className="w-6 h-6 border-none bg-transparent cursor-pointer p-0"
            aria-label="Text color picker"
          />
        </div>
      </div>

      <Separator orientation="vertical" className="h-8 mx-1 bg-neutral-700" />
      {/* Text Format Group */}
      <div className="flex items-center gap-1">
        <Toggle 
          type="button" 
          size="sm" 
          pressed={editor.isActive('bold')} 
          onPressedChange={() => {
            editor.chain()
              .focus()
              .command(({ tr, state }) => {
                tr.setSelection(state.selection);
                return true;
              })
              .toggleBold()
              .run();
          }} 
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle 
          type="button" 
          size="sm" 
          pressed={editor.isActive('italic')} 
          onPressedChange={() => {
            editor.chain()
              .focus()
              .command(({ tr, state }) => {
                tr.setSelection(state.selection);
                return true;
              })
              .toggleItalic()
              .run();
          }} 
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle 
          type="button" 
          size="sm" 
          pressed={editor.isActive('underline')} 
          onPressedChange={() => {
            editor.chain()
              .focus()
              .command(({ tr, state }) => {
                tr.setSelection(state.selection);
                return true;
              })
              .toggleUnderline()
              .run();
          }} 
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Toggle>
        <Toggle 
          type="button" 
          size="sm" 
          pressed={editor.isActive('strike')} 
          onPressedChange={() => {
            editor.chain()
              .focus()
              .command(({ tr, state }) => {
                tr.setSelection(state.selection);
                return true;
              })
              .toggleStrike()
              .run();
          }} 
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
      </div>
      <Separator orientation="vertical" className="h-8 mx-1 bg-neutral-700" />
      {/* Lists and Quote Group */}
      <div className="flex items-center gap-1">
        <Toggle type="button" size="sm" pressed={editor.isActive('bulletList')} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List"><List className="h-4 w-4" /></Toggle>
        <Toggle type="button" size="sm" pressed={editor.isActive('orderedList')} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List"><ListOrdered className="h-4 w-4" /></Toggle>
        <Toggle type="button" size="sm" pressed={editor.isActive('blockquote')} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()} title="Quote"><Quote className="h-4 w-4" /></Toggle>
      </div>
      <Separator orientation="vertical" className="h-8 mx-1 bg-neutral-700" />
      {/* Alignment Group */}
      <div className="flex items-center gap-1">
        <Toggle type="button" size="sm" pressed={editor.isActive({ textAlign: 'left' })} onPressedChange={() => editor.chain().focus().setTextAlign('left').run()} title="Align Left"><AlignLeft className="h-4 w-4" /></Toggle>
        <Toggle type="button" size="sm" pressed={editor.isActive({ textAlign: 'center' })} onPressedChange={() => editor.chain().focus().setTextAlign('center').run()} title="Align Center"><AlignCenter className="h-4 w-4" /></Toggle>
        <Toggle type="button" size="sm" pressed={editor.isActive({ textAlign: 'right' })} onPressedChange={() => editor.chain().focus().setTextAlign('right').run()} title="Align Right"><AlignRight className="h-4 w-4" /></Toggle>
        <Toggle type="button" size="sm" pressed={editor.isActive({ textAlign: 'justify' })} onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()} title="Justify"><AlignJustify className="h-4 w-4" /></Toggle>
      </div>
      <Separator orientation="vertical" className="h-8 mx-1 bg-neutral-700" />
      {/* Actions Group */}
      <div className="flex items-center gap-1">
        <Button type="button" size="sm" variant="ghost" onClick={handleSetLink} title="Set Link"><LinkIcon className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant="ghost" onClick={handleImagePickerOpen} title="Add Image"><ImageIcon className="h-4 w-4" /></Button>
      </div>
      {/* Float Controls for Images */}
      {editor.isActive('custom-image') && (
        <>
          <Separator orientation="vertical" className="h-8 mx-1 bg-neutral-700" />
          <div className="flex items-center gap-1">
            <Toggle type="button" size="sm" pressed={editor.getAttributes('custom-image').float === 'left'} onPressedChange={() => handleImageFloat('left')} title="Float Image Left"><AlignLeft className="h-4 w-4" /></Toggle>
            <Toggle type="button" size="sm" pressed={editor.getAttributes('custom-image').float === 'none' || editor.getAttributes('custom-image').float === undefined} onPressedChange={() => handleImageFloat('none')} title="No Float"><AlignCenter className="h-4 w-4" /></Toggle>
            <Toggle type="button" size="sm" pressed={editor.getAttributes('custom-image').float === 'right'} onPressedChange={() => handleImageFloat('right')} title="Float Image Right"><AlignRight className="h-4 w-4" /></Toggle>
          </div>
        </>
      )}
    </div>
  );
}
