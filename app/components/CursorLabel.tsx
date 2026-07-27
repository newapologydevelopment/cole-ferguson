'use client';
import { useEffect, useRef, useState } from 'react';

const CHROME_PAD = 28;

/** Four custom-cursor states — never a native cursor on desktop */
type CursorMode = 'solid' | 'outline' | 'prev' | 'next';

function isNavZoneEnabled(el: Element | null) {
  if (!el) return false;
  if (el instanceof HTMLButtonElement) return !el.disabled;
  const node = el as HTMLElement;
  return (
    !node.hasAttribute('disabled') && node.getAttribute('aria-disabled') !== 'true'
  );
}

function getCursorMode(x: number, y: number): CursorMode {
  const hit = document.elementFromPoint(x, y);

  // Interactive text/UI chrome → solid + outline
  if (hit?.closest('[data-hide-cursor="true"]')) return 'outline';

  // Explicit photo nav hit targets
  const prev = hit?.closest('[data-cursor="prev"]') ?? null;
  if (isNavZoneEnabled(prev)) return 'prev';
  const next = hit?.closest('[data-cursor="next"]') ?? null;
  if (isNavZoneEnabled(next)) return 'next';

  // Soft approach toward chrome → solid
  const zones = document.querySelectorAll('[data-hide-cursor="true"]');
  for (let i = 0; i < zones.length; i++) {
    const r = zones[i].getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) continue;
    if (
      x >= r.left - CHROME_PAD &&
      x <= r.right + CHROME_PAD &&
      y >= r.top - CHROME_PAD &&
      y <= r.bottom + CHROME_PAD
    ) {
      return 'solid';
    }
  }

  return 'solid';
}

function isDesktopPointer() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const noHover = window.matchMedia('(hover: none)').matches;
  return !(coarse || noHover);
}

export const CursorLabel = () => {
  const [enabled, setEnabled] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const sync = () => setEnabled(isDesktopPointer());
    sync();
    const coarse = window.matchMedia('(pointer: coarse)');
    const hover = window.matchMedia('(hover: none)');
    coarse.addEventListener('change', sync);
    hover.addEventListener('change', sync);
    return () => {
      coarse.removeEventListener('change', sync);
      hover.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    // Re-assert on mount; DesktopCursorPolicy owns the html classes
    document.documentElement.style.setProperty('cursor', 'none', 'important');
    document.body.style.setProperty('cursor', 'none', 'important');
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    let latestEvent: MouseEvent | null = null;
    let mode: CursorMode = 'solid';
    const cursor = cursorRef.current;
    if (cursor) {
      cursor.dataset.mode = 'solid';
      cursor.style.opacity = '1';
    }

    const apply = (event: MouseEvent) => {
      const cursorEl = cursorRef.current;
      const label = labelRef.current;
      if (!cursorEl || !label) return;

      const nextMode = getCursorMode(event.clientX, event.clientY);

      if (nextMode === 'prev') label.textContent = 'Prev.';
      else if (nextMode === 'next') label.textContent = 'Next';

      cursorEl.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
      cursorEl.style.opacity = '1';

      if (nextMode !== mode) {
        mode = nextMode;
        cursorEl.dataset.mode = mode;
      }

      // Re-assert every frame — Safari can restore native cursors on hover
      document.documentElement.style.setProperty('cursor', 'none', 'important');
      document.body.style.setProperty('cursor', 'none', 'important');
    };

    const move = (e: MouseEvent) => {
      latestEvent = e;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (latestEvent) apply(latestEvent);
      });
    };

    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseover', move, { passive: true, once: true });

    return () => {
      window.removeEventListener('mousemove', move);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      data-mode="solid"
      className="cursor-label pointer-events-none fixed select-none"
      style={{
        left: 0,
        top: 0,
        opacity: 1,
        transform: 'translate3d(-100px, -100px, 0)',
        willChange: 'transform, opacity',
      }}
    >
      <span ref={labelRef} className="cursor-label__text">
        Next
      </span>
      <span className="cursor-label__mark" aria-hidden />
    </div>
  );
};
