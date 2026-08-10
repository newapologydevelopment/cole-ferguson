'use client';
import { useEffect, useRef, useState } from 'react';

type CursorMode = 'prev' | 'next' | null;

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

  const prev = hit?.closest('[data-cursor="prev"]') ?? null;
  if (isNavZoneEnabled(prev)) return 'prev';
  const next = hit?.closest('[data-cursor="next"]') ?? null;
  if (isNavZoneEnabled(next)) return 'next';

  return null;
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
    document.documentElement.classList.toggle(
      'carousel-cursor-enabled',
      enabled
    );
    return () => {
      document.documentElement.classList.remove('carousel-cursor-enabled');
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    let latestEvent: MouseEvent | null = null;
    let mode: CursorMode = null;
    const cursor = cursorRef.current;
    if (cursor) {
      cursor.dataset.mode = 'next';
      cursor.style.opacity = '0';
    }

    const apply = (event: MouseEvent) => {
      const cursorEl = cursorRef.current;
      const label = labelRef.current;
      if (!cursorEl || !label) return;

      const nextMode = getCursorMode(event.clientX, event.clientY);

      if (nextMode === 'prev') label.textContent = 'Prev.';
      else if (nextMode === 'next') label.textContent = 'Next';

      cursorEl.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
      cursorEl.style.opacity = nextMode ? '1' : '0';

      if (nextMode !== mode) {
        mode = nextMode;
        if (mode) cursorEl.dataset.mode = mode;
      }
    };

    const move = (e: MouseEvent) => {
      latestEvent = e;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (latestEvent) apply(latestEvent);
      });
    };

    const leave = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = '0';
    };

    window.addEventListener('mousemove', move, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave);

    return () => {
      window.removeEventListener('mousemove', move);
      document.documentElement.removeEventListener('mouseleave', leave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      data-mode="next"
      aria-hidden="true"
      className="cursor-label pointer-events-none fixed select-none"
      style={{
        left: 0,
        top: 0,
        opacity: 0,
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
