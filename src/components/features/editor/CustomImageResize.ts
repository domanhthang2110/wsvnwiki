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
        default: null, // Remove default width
        parseHTML: (element) => {
          const width = element.getAttribute('width');
          return width
            ? `width: ${width}px; height: auto;`
            : `${element.style.cssText}`;
        },
        renderHTML: attributes => {
          return attributes.style ? { style: attributes.style } : {}; // Only render if style exists
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

      const isMobile = document.documentElement.clientWidth < 768;
      const dotPosition = isMobile ? '-8px' : '-4px';
      const dotsPosition = [
        `top: ${dotPosition}; left: ${dotPosition}; cursor: nwse-resize;`,
        `top: ${dotPosition}; right: ${dotPosition}; cursor: nesw-resize;`,
        `bottom: ${dotPosition}; left: ${dotPosition}; cursor: nesw-resize;`,
        `bottom: ${dotPosition}; right: ${dotPosition}; cursor: nwse-resize;`,
      ];

      // Create floating box for width input
      const $widthInputBox = document.createElement('div');
      $widthInputBox.setAttribute(
        'style',
        `position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 4px 8px; border: 1px solid #555; border-radius: 4px; margin-bottom: 5px; display: none; align-items: center; gap: 5px;`
      );
      $widthInputBox.classList.add('image-width-input-box');

      const $widthInput = document.createElement('input');
      $widthInput.type = 'number';
      $widthInput.setAttribute(
        'style',
        `width: 60px; padding: 2px; border: 1px solid #555; border-radius: 3px; background: #444; color: white;`
      );
      $widthInputBox.appendChild($widthInput);

      const $unitSpan = document.createElement('span');
      $unitSpan.textContent = 'px';
      $widthInputBox.appendChild($unitSpan);
      
      $container.appendChild($widthInputBox);

      const $dots: HTMLElement[] = [];
      Array.from({ length: 4 }, (_, index) => {
        const $dot = document.createElement('div');
        $dot.setAttribute(
          'style',
          `position: absolute; width: ${isMobile ? 16 : 9}px; height: ${isMobile ? 16 : 9}px; border: 1.5px solid #6C6C6C; border-radius: 50%; ${dotsPosition[index]} display: none;`
        );
        $container.appendChild($dot);
        $dots.push($dot);

        const handleResize = (clientX: number) => {
          if (!isResizing) return;
          const deltaX = index % 2 === 0 ? -(clientX - startX) : clientX - startX;
          const newWidth = startWidth + deltaX;
          $container.style.width = newWidth + 'px';
          $img.style.width = newWidth + 'px';
          $widthInput.value = Math.round(newWidth).toString(); // Update the input field
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
            dispatchNodeView(); // Save changes
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          };

          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        });

        // Touch events
        $dot.addEventListener('touchstart', (e) => {
          if (e.cancelable) {
            e.preventDefault();
          }
          isResizing = true;
          startX = e.touches[0].clientX;
          startWidth = $container.offsetWidth;

          const onTouchMove = (e: TouchEvent) => handleResize(e.touches[0].clientX);
          const onTouchEnd = () => {
            isResizing = false;
            dispatchNodeView(); // Save changes
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
          };

          document.addEventListener('touchmove', onTouchMove);
          document.addEventListener('touchend', onTouchEnd);
        }, { passive: false });
      });

      // Handle manual width input
      $widthInput.addEventListener('change', () => {
        const newWidth = parseInt($widthInput.value, 10);
        if (!isNaN(newWidth) && newWidth > 0) {
          $container.style.width = newWidth + 'px';
          $img.style.width = newWidth + 'px';
          dispatchNodeView(); // Save changes
        }
      });

      // Show handles and input box when image is clicked
      $container.addEventListener('click', () => {
        $container.style.position = 'relative';
        $container.style.border = '1px dashed #6C6C6C';
        $widthInputBox.style.display = 'flex';
        $widthInput.value = Math.round($container.offsetWidth).toString(); // Update value on click
        $dots.forEach($dot => $dot.style.display = 'block');
      });

      // Hide handles and input box when clicking outside
      let clickOutsideTimeout: NodeJS.Timeout | null = null;
      document.addEventListener('click', (e: MouseEvent) => {
        if (clickOutsideTimeout) {
          clearTimeout(clickOutsideTimeout);
          clickOutsideTimeout = null;
        }

        clickOutsideTimeout = setTimeout(() => {
          const $target = e.target as HTMLElement;
          if (!$container.contains($target)) {
            $container.style.border = 'none';
            $container.style.position = '';
            $widthInputBox.style.display = 'none';
            $dots.forEach($dot => $dot.style.display = 'none');
          }
        }, 100); // Delay by 100ms
      });

      return {
        dom: $container,
        update: (updatedNode) => {
          // If the node type or ID changes, we can't handle it, let Tiptap re-render
          // Assuming 'id' is a unique attribute for the node, if not, use another unique identifier
          if (updatedNode.type !== node.type || updatedNode.attrs.id !== node.attrs.id) {
            return false;
          }

          // Update the internal node reference
          node = updatedNode;

          // Update the container style if it has changed
          if (updatedNode.attrs.style !== $container.getAttribute('style')) {
            $container.setAttribute('style', updatedNode.attrs.style || '');
            const newWidthMatch = updatedNode.attrs.style.match(/width:\s*(\d+)px/);
            if (newWidthMatch && newWidthMatch[1]) {
              const newWidth = parseInt(newWidthMatch[1], 10);
              $img.style.width = newWidth + 'px';
              const $widthInput = $container.querySelector('input[type="number"]');
              if ($widthInput instanceof HTMLInputElement) {
                $widthInput.value = newWidth.toString();
              }
            }
          }
          // Always return true to indicate that we handled the update and prevent full re-render
          return true;
        },
      };
    };
  },
}).configure({
  inline: true,
});
