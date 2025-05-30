import ImageResize from "tiptap-extension-resize-image";

export const CustomImageResize = ImageResize.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: 'align-bottom inline',
        parseHTML: (element) => {
          const classAttr = element.getAttribute("class") || "";
          return classAttr.includes('align-bottom') ? classAttr : `${classAttr} align-bottom`.trim();
        },
        renderHTML: (attributes) => {
          return attributes.class ? { class: attributes.class } : { class: 'align-bottom' };
        },
      },
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          let style = attributes.style || '';
          style = style.replace(/display:\s*flex;?/g, 'display: inline-block;');
          style = style.replace(/vertical-align:[^;]+;?/g, '');
          if (!style.includes('display:')) {
            style = 'display: inline-block; ' + style;
          }
          return { style };
        },
      }
    };
  },
}).configure({
  inline: true,
});
