import { useEffect } from 'react';

interface UseDpadNavigationOptions {
  containerSelector?: string;
  itemSelector?: string;
  onEnter?: (element: HTMLElement) => void;
  enabled?: boolean;
}

/**
 * Android TV / Keyboard D-Pad Navigation Hook
 * Enables spatial keyboard navigation (Up, Down, Left, Right, Enter) for Smart TVs and controllers.
 */
export function useDpadNavigation({
  containerSelector = '[data-dpad-container]',
  itemSelector = '[data-dpad-item]',
  onEnter,
  enabled = true,
}: UseDpadNavigationOptions = {}) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
      if (!validKeys.includes(e.key)) return;

      const items = Array.from(
        document.querySelectorAll<HTMLElement>(`${containerSelector} ${itemSelector}, ${itemSelector}`)
      ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);

      if (items.length === 0) return;

      const currentIndex = activeEl ? items.indexOf(activeEl) : -1;

      if (e.key === 'Enter') {
        if (activeEl && items.includes(activeEl)) {
          if (onEnter) onEnter(activeEl);
          else activeEl.click();
        }
        return;
      }

      e.preventDefault();

      if (currentIndex === -1) {
        items[0].focus();
        return;
      }

      // Simple 1D & 2D spatial jumping
      let nextIndex = currentIndex;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % items.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + items.length) % items.length;
      }

      if (items[nextIndex]) {
        items[nextIndex].focus();
        items[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [containerSelector, itemSelector, onEnter, enabled]);
}
