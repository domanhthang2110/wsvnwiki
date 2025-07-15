import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import NextImage from 'next/image';
import React from 'react'; // Import React for JSX


const NextImageExtension = Node.create({
  name: 'image',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    };
  },

  inline() {
    return this.options.inline;
  },

  group: 'block',

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      class: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes];
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer((props) => {
      const { src, alt, title, class: className } = props.node.attrs;
      return (
        <span className={`relative inline-block align-bottom m-0 ${className || ''}`}>
          <NextImage
            src={src}
            alt={alt || ''}
            title={title || ''}
            width={500} // You might want to make these dynamic or use a loader
            height={300} // You might want to make these dynamic or use a loader
            className="object-contain"
          />
        </span>
      );
    });
  },
});

export default NextImageExtension;
