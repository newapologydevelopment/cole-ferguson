'use client';
import { useEffect, useRef, useState } from 'react';

export const CursorLabel = () => {
  const [enabled, setEnabled] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Enable custom cursor only on devices that support hover and fine pointer (desktops)
    const isCoarse =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(pointer: coarse)').matches;
    const noHover =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(hover: none)').matches;
    setEnabled(!(isCoarse || noHover));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    let latestEvent: MouseEvent | null = null;
    const move = (e: MouseEvent) => {
      latestEvent = e;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const event = latestEvent;
        const cursor = cursorRef.current;
        if (!event || !cursor) return;
        const blocked = document.elementFromPoint(event.clientX, event.clientY)
          ?.closest('[data-hide-cursor="true"]');
        cursor.textContent = event.clientX < window.innerWidth / 2 ? 'Prev.' : 'Next';
        cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
        cursor.style.opacity = blocked ? '0' : '1';
        document.body.style.cursor = blocked ? '' : 'none';
      });
    };
    window.addEventListener('mousemove', move);
    return () => {
      window.removeEventListener('mousemove', move);
      if (frame) cancelAnimationFrame(frame);
      document.body.style.cursor = '';
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed z-[200] text-[12px] capitalize tracking-wide select-none transition-opacity mix-blend-luminosity"
      style={{
        left: 0,
        top: 0,
        opacity: 0,
        willChange: 'transform, opacity',
      }}
    >
      Next
    </div>
  );
};
