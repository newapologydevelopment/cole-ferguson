'use client';
import { useEffect, useState } from 'react';

export const CursorLabel = () => {
  const [pos, setPos] = useState({ x: 0, y: 0, label: 'Next', visible: true });
  const [enabled, setEnabled] = useState(false);

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
    const move = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const isBlocked = el?.closest('.ui-overlay, [data-hide-cursor="true"]');

      // Перевіряємо, чи курсор над кнопками Prev/Next
      const isOverPrevNext = el?.closest('.prev-btn, .next-btn');

      setPos({
        x: e.clientX,
        y: e.clientY,
        label: e.clientX < window.innerWidth / 2 ? 'Prev.' : 'Next',
        visible: !isBlocked && !!isOverPrevNext,
      });
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    if (pos.visible) {
      document.body.style.cursor = 'none';
    } else {
      document.body.style.cursor = '';
    }
    return () => {
      document.body.style.cursor = '';
    };
  }, [enabled, pos.visible]);

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed z-[200] text-[12px] capitalize tracking-wide select-none transition-opacity mix-blend-luminosity"
      style={{
        left: pos.x,
        top: pos.y,
        transform: 'translate(-50%, -50%)',
        opacity: pos.visible ? 1 : 0,
      }}
    >
      {pos.label}
    </div>
  );
};
