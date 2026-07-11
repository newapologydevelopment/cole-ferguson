'use client';

import { cn } from '@/utils';
import { motion, MotionValue, useMotionValue, useSpring } from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

interface Props {
  titles: string[];
  activeIndex: number;
  position: MotionValue<number>;
  showAll: boolean;
  onHoverChange: (isHovering: boolean) => void;
  onSelect: (index: number) => void;
}

export const NavigationHomePage = ({
  titles,
  activeIndex,
  position,
  showAll,
  onHoverChange,
  onSelect,
}: Props) => {
  const listRef = useRef<HTMLUListElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const smoothTargetRef = useRef(0);
  const smoothFrameRef = useRef<number | null>(null);
  const isSmoothingRef = useRef(false);
  const [itemSpacing, setItemSpacing] = useState<number>(0);
  const [itemHeight, setItemHeight] = useState<number>(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const measure = () => {
    const el = listRef.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll('li')) as HTMLLIElement[];
    if (items.length >= 2) {
      const r0 = items[0].getBoundingClientRect();
      const r1 = items[1].getBoundingClientRect();
      setItemSpacing(r1.top - r0.top);
      setItemHeight(r0.height);
    } else if (items.length === 1) {
      const r = items[0].getBoundingClientRect();
      setItemSpacing(r.height);
      setItemHeight(r.height);
    }
  };

  useLayoutEffect(() => {
    measure();
  }, [titles.length]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const update = () => setViewportHeight(viewport.clientHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const targetY = useMotionValue(0);
  const contentInset = Math.max(0, (titles.length - 1) * (itemSpacing || 0));
  const y = useSpring(targetY, {
    stiffness: 190,
    damping: 28,
    mass: 0.65,
  });

  useEffect(() => {
    const update = (value: number) => {
      const offset =
        (viewportHeight || 0) / 2 -
        contentInset -
        value * (itemSpacing || 0) -
        (itemHeight || 0) / 2;
      targetY.set(Number.isFinite(offset) ? offset : 0);
    };

    update(position.get());
    return position.on('change', update);
  }, [contentInset, itemHeight, itemSpacing, position, targetY, viewportHeight]);

  const clampScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const remainingItems = Math.max(0, titles.length - 1 - position.get());
    const finalAlignment = Math.max(
      0,
      remainingItems * (itemSpacing || 0) - (itemHeight || 0) / 2
    );

    if (viewport.scrollTop > finalAlignment) {
      viewport.scrollTop = finalAlignment;
    }
  }, [itemHeight, itemSpacing, position, titles.length]);

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      const viewport = viewportRef.current;
      if (!viewport || event.deltaY === 0) return;

      event.preventDefault();

      if (!isSmoothingRef.current) {
        smoothTargetRef.current = viewport.scrollTop;
      }

      const delta =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? event.deltaY * 24
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? event.deltaY * viewport.clientHeight
            : event.deltaY;
      const finalAlignment = Math.max(
        0,
        Math.max(0, titles.length - 1 - position.get()) *
          (itemSpacing || 0) -
          (itemHeight || 0) / 2
      );

      smoothTargetRef.current = Math.max(
        0,
        Math.min(finalAlignment, smoothTargetRef.current + delta)
      );

      if (smoothFrameRef.current !== null) return;

      isSmoothingRef.current = true;
      const tick = () => {
        const current = viewport.scrollTop;
        const target = smoothTargetRef.current;
        const next = current + (target - current) * 0.18;

        viewport.scrollTop = next;

        if (Math.abs(target - next) < 0.5) {
          viewport.scrollTop = target;
          smoothFrameRef.current = null;
          isSmoothingRef.current = false;
          return;
        }

        smoothFrameRef.current = window.requestAnimationFrame(tick);
      };

      smoothFrameRef.current = window.requestAnimationFrame(tick);
    },
    [itemHeight, itemSpacing, position, titles.length]
  );

  useEffect(() => {
    const unsubscribe = position.on('change', clampScroll);
    clampScroll();
    return unsubscribe;
  }, [clampScroll, position]);

  useEffect(() => {
    return () => {
      if (smoothFrameRef.current !== null) {
        window.cancelAnimationFrame(smoothFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={viewportRef}
      className="nav-project-list-viewport h-[calc(100vh-180px)] w-[260px] overflow-y-auto overscroll-contain"
      onScroll={clampScroll}
      onWheel={handleWheel}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      data-hide-cursor="true"
    >
      <motion.ul
        ref={listRef}
        className="nav-project-list flex flex-col gap-[6px] cursor-pointer will-change-transform"
        initial={false}
        style={{
          y,
          transform: 'translateZ(0)',
          ['--nav-inset' as string]: `${contentInset}px`,
        }}
      >
        {titles.map((title, idx) => (
          <li
            key={title}
            className={cn(
              'transition-[opacity,color] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-[#717171]',
              idx === activeIndex || showAll ? 'opacity-100 ' : 'opacity-0'
            )}
            onClick={() => onSelect(idx)}
          >
            {title}
          </li>
        ))}
      </motion.ul>
    </div>
  );
};
