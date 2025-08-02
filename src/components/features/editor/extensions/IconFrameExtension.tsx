import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react';
import React, { useState, useEffect } from 'react';
import IconFrame, { FrameStyleType, FrameType } from '@/components/shared/IconFrame';
import MediaFileExplorer from '@/components/features/admin/media/MediaFileExplorer';

interface IconFrameNodeViewProps extends ReactNodeViewProps {
  node: ReactNodeViewProps['node'] & {
    attrs: {
      src: string | null;
      alt: string;
      size: number;
      styleType: FrameStyleType;
      frameType: FrameType;
    };
  };
}

const IconFrameNodeView: React.FC<IconFrameNodeViewProps> = ({ node, updateAttributes, deleteNode }) => {
  const [showMediaExplorer, setShowMediaExplorer] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const { src, alt, size, styleType, frameType } = node.attrs;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleImageSelect = (publicUrl: string) => {
    updateAttributes({ src: publicUrl });
    setShowMediaExplorer(false);
  };

  const handleStyleChange = (newStyleType: FrameStyleType) => {
    updateAttributes({ styleType: newStyleType });
    setShowContextMenu(false);
  };

  const handleFrameTypeChange = (newFrameType: FrameType) => {
    updateAttributes({ frameType: newFrameType });
    setShowContextMenu(false);
  };

  const handleSizeChange = (newSize: number) => {
    updateAttributes({ size: newSize });
    setShowContextMenu(false);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(false);
    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showContextMenu]);

  return (
    <NodeViewWrapper 
      className="inline-block relative cursor-pointer"
      onContextMenu={handleContextMenu}
      data-drag-handle
    >
      <IconFrame
        size={size || 64}
        styleType={styleType || 'yellow'}
        frameType={frameType || 'regular'}
        contentImageUrl={src}
        altText={alt || 'Icon'}
      />

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="fixed z-50 bg-gray-800 border border-gray-600 rounded-md shadow-lg py-2 min-w-[200px]"
          style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
        >
          <div className="px-3 py-1 text-xs text-gray-400 border-b border-gray-600 mb-1">
            Icon Frame Options
          </div>
          
          <button
            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700"
            onClick={() => setShowMediaExplorer(true)}
          >
            Change Icon
          </button>

          <div className="border-t border-gray-600 mt-1 pt-1">
            <div className="px-3 py-1 text-xs text-gray-400">Style</div>
            {(['yellow', 'red', 'green'] as FrameStyleType[]).map((style) => (
              <button
                key={style}
                className={`w-full px-3 py-1 text-left text-sm hover:bg-gray-700 ${
                  styleType === style ? 'text-yellow-400' : 'text-white'
                }`}
                onClick={() => handleStyleChange(style)}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-600 mt-1 pt-1">
            <div className="px-3 py-1 text-xs text-gray-400">Frame Type</div>
            {(['regular', 'key', 'lesser'] as FrameType[]).map((type) => (
              <button
                key={type}
                className={`w-full px-3 py-1 text-left text-sm hover:bg-gray-700 ${
                  frameType === type ? 'text-yellow-400' : 'text-white'
                }`}
                onClick={() => handleFrameTypeChange(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-600 mt-1 pt-1">
            <div className="px-3 py-1 text-xs text-gray-400">Size</div>
            {[32, 48, 64, 80, 96].map((sizeOption) => (
              <button
                key={sizeOption}
                className={`w-full px-3 py-1 text-left text-sm hover:bg-gray-700 ${
                  size === sizeOption ? 'text-yellow-400' : 'text-white'
                }`}
                onClick={() => handleSizeChange(sizeOption)}
              >
                {sizeOption}px
              </button>
            ))}
          </div>

          <div className="border-t border-gray-600 mt-1 pt-1">
            <button
              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700"
              onClick={() => {
                deleteNode();
                setShowContextMenu(false);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Media Explorer Modal */}
      {showMediaExplorer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Select Icon</h3>
              <button onClick={() => setShowMediaExplorer(false)} className="p-1 text-gray-500 hover:text-red-500">✕</button>
            </div>
            <div className="flex-grow overflow-y-auto min-h-[300px]">
              <MediaFileExplorer bucketName="media" onFileSelect={handleImageSelect} mode="select" accept="image/*" />
            </div>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
};

const IconFrameExtension = Node.create({
  name: 'iconFrame',

  addOptions() {
    return {
      inline: true,
      HTMLAttributes: {},
    };
  },

  inline() {
    return this.options.inline;
  },

  group: 'inline',

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: 'Icon',
      },
      size: {
        default: 64,
      },
      styleType: {
        default: 'yellow',
      },
      frameType: {
        default: 'regular',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-icon-frame]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const element = node as HTMLElement;

          return {
            src: element.getAttribute('data-src') || null,
            alt: element.getAttribute('data-alt') || 'Icon',
            size: parseInt(element.getAttribute('data-size') || '64'),
            styleType: element.getAttribute('data-style-type') || 'yellow',
            frameType: element.getAttribute('data-frame-type') || 'regular',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-icon-frame': '',
        'data-src': node.attrs.src || '',
        'data-alt': node.attrs.alt || 'Icon',
        'data-size': node.attrs.size || 64,
        'data-style-type': node.attrs.styleType || 'yellow',
        'data-frame-type': node.attrs.frameType || 'regular',
        class: 'icon-frame-wrapper',
      }),
    ];
  },


  addNodeView() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ReactNodeViewRenderer(IconFrameNodeView as React.ComponentType<any>);
  },
});

export default IconFrameExtension;