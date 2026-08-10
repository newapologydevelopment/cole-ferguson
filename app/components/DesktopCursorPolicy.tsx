'use client';

import { useEffect } from 'react';

/**
 * Clears state left behind by older custom-cursor builds.
 * Native CSS and browser defaults own cursor presentation after this reset.
 */
export function DesktopCursorPolicy() {
  useEffect(() => {
    const restoreNativeCursor = () => {
      document.documentElement.classList.remove(
        'desktop-no-hand',
        'custom-cursor'
      );
      document.documentElement.style.removeProperty('cursor');
      document.body?.style.removeProperty('cursor');
    };

    restoreNativeCursor();
    window.addEventListener('pageshow', restoreNativeCursor);
    return () => window.removeEventListener('pageshow', restoreNativeCursor);
  }, []);

  return null;
}
