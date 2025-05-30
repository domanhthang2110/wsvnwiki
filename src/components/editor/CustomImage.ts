// FILE: components/editor/CustomImage.ts

import Image from '@tiptap/extension-image';
import { mergeAttributes, Node } from '@tiptap/core';

export const CustomImage = Image.extend({
  name: 'custom-image',

  addAttributes() {
    return {
      // Inherit the default attributes from the Image extension
      ...this.parent?.(),

      // Add our custom attributes
      float: {
        default: 'none',
        renderHTML: attributes => {
          // Only render the style if a float value is set
          if (attributes.float === 'none') {
            return {};
          }
          return {
            style: `float: ${attributes.float}`,
          };
        },
      },
      display: {
        default: 'block',
        renderHTML: attributes => {
          // Only render the style if a display value is set
          if (attributes.display === 'block') {
            return {};
          }
          return {
            style: `display: ${attributes.display}`,
          };
        },
      },
    };
  },

  // We are not using parseHTML here because `style` attributes are not
  // typically parsed by default for security reasons. The attributes
  // will be saved to the JSON/HTML document and re-rendered correctly.

  renderHTML({ HTMLAttributes }) {
    // The renderHTML method from the parent Image extension might be complex,
    // so we merge our attributes with its result.
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },
});