import ImageResize from "tiptap-extension-resize-image";

export const CustomImageResize = ImageResize.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: "float-bottom",
        parseHTML: (element) => element.getAttribute("class"),
        renderHTML: (attributes) => {
          return attributes.class ? { class: attributes.class } : {};
        },
      },
      style: {
        default: 'width: 100%; height: auto;',
        parseHTML: (element) => {
          const width = element.getAttribute('width');
          return width
            ? `width: ${width}px; height: auto;`
            : `${element.style.cssText}`;
        },
        renderHTML: attributes => {
          return { style: attributes.style };
        },
      },
    };
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      const { view } = editor;
      const $container = document.createElement('div');
      const $img = document.createElement('img');
      
      let isResizing = false;
      let startX: number, startWidth: number;

      $container.setAttribute('style', node.attrs.style || '');
      $container.appendChild($img);

      Object.entries(node.attrs).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        $img.setAttribute(key, value);
      });

      const dispatchNodeView = () => {
        if (typeof getPos === 'function') {
          const newAttrs = {
            ...node.attrs,
            style: `${$container.style.cssText}`,
          };
          view.dispatch(view.state.tr.setNodeMarkup(getPos(), null, newAttrs));
        }
      };

      $container.addEventListener('click', (e) => {
        const isMobile = document.documentElement.clientWidth < 768;
        const dotPosition = isMobile ? '-8px' : '-4px';
        const dotsPosition = [
          `top: ${dotPosition}; left: ${dotPosition}; cursor: nwse-resize;`,
          `top: ${dotPosition}; right: ${dotPosition}; cursor: nesw-resize;`,
          `bottom: ${dotPosition}; left: ${dotPosition}; cursor: nesw-resize;`,
          `bottom: ${dotPosition}; right: ${dotPosition}; cursor: nwse-resize;`,
        ];

        $container.setAttribute(
          'style',
          `position: relative; border: 1px dashed #6C6C6C; ${$container.style.cssText}`
        );

        Array.from({ length: 4 }, (_, index) => {
          const $dot = document.createElement('div');
          $dot.setAttribute(
            'style',
            `position: absolute; width: ${isMobile ? 16 : 9}px; height: ${isMobile ? 16 : 9}px; border: 1.5px solid #6C6C6C; border-radius: 50%; ${dotsPosition[index]}`
          );

          const handleResize = (clientX: number) => {
            if (!isResizing) return;
            const deltaX = index % 2 === 0 ? -(clientX - startX) : clientX - startX;
            const newWidth = startWidth + deltaX;
            $container.style.width = newWidth + 'px';
            $img.style.width = newWidth + 'px';
          };

          // Mouse events
          $dot.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isResizing = true;
            startX = e.clientX;
            startWidth = $container.offsetWidth;

            const onMouseMove = (e: MouseEvent) => handleResize(e.clientX);
            const onMouseUp = () => {
              isResizing = false;
              dispatchNodeView();
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          });

          // Touch events
          $dot.addEventListener('touchstart', (e) => {
            e.cancelable && e.preventDefault();
            isResizing = true;
            startX = e.touches[0].clientX;
            startWidth = $container.offsetWidth;

            const onTouchMove = (e: TouchEvent) => handleResize(e.touches[0].clientX);
            const onTouchEnd = () => {
              isResizing = false;
              dispatchNodeView();
              document.removeEventListener('touchmove', onTouchMove);
              document.removeEventListener('touchend', onTouchEnd);
            };

            document.addEventListener('touchmove', onTouchMove);
            document.addEventListener('touchend', onTouchEnd);
          }, { passive: false });

          $container.appendChild($dot);
        });
      });

      // Remove resize handles when clicking outside
      document.addEventListener('click', (e: MouseEvent) => {
        const $target = e.target as HTMLElement;
        if (!$container.contains($target)) {
          const containerStyle = $container.getAttribute('style');
          const newStyle = containerStyle?.replace('position: relative; border: 1px dashed #6C6C6C;', '');
          $container.setAttribute('style', newStyle || '');
          
          while ($container.childNodes.length > 1) {
            $container.removeChild($container.lastChild as Node);
          }
        }
      });

      return {
        dom: $container,
      };
    };
  },
}).configure({
  inline: true,
});
