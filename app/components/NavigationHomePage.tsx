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
  const hoverZoneRef = useRef<HTMLDivElement | null>(null);
  const isHoveringRef = useRef(false);
  const smoothTargetRef = useRef(0);
  const smoothFrameRef = useRef<number | null>(null);
  const isSmoothingRef = useRef(false);
  const lastClampedFloorRef = useRef<number | null>(null);
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
      const leadingGap = Math.max(
        0,
        (itemSpacing || 0) - (itemHeight || 0)
      );
      const offset =
        (viewportHeight || 0) / 2 -
        contentInset -
        value * (itemSpacing || 0) -
        (itemHeight || 0) / 2 -
        leadingGap;
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

    smoothTargetRef.current = Math.max(
      0,
      Math.min(finalAlignment, smoothTargetRef.current)
    );

    if (viewport.scrollTop > finalAlignment) {
      viewport.scrollTop = finalAlignment;
    }
  }, [itemHeight, itemSpacing, position, titles.length]);

  const animateToSmoothTarget = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || smoothFrameRef.current !== null) return;

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
  }, []);

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      const viewport = viewportRef.current;
      const hoverZone = hoverZoneRef.current;
      if (!viewport || !hoverZone || event.deltaY === 0) return;

      const rect = hoverZone.getBoundingClientRect();
      const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!isInside) return;

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

      animateToSmoothTarget();
    },
    [animateToSmoothTarget, itemHeight, itemSpacing, position, titles.length]
  );

  const handleMouseLeave = useCallback(() => {
    if (!isHoveringRef.current) return;
    isHoveringRef.current = false;
    onHoverChange(false);
    smoothTargetRef.current = 0;
    animateToSmoothTarget();
  }, [animateToSmoothTarget, onHoverChange]);

  useEffect(() => {
    const hoverZone = hoverZoneRef.current;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!hoverZone) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (!canHover.matches) return;

      const rect = hoverZone.getBoundingClientRect();
      const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (isInside === isHoveringRef.current) return;
      if (isInside) {
        isHoveringRef.current = true;
        onHoverChange(true);
      } else {
        handleMouseLeave();
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('blur', handleMouseLeave);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', handleMouseLeave);
    };
  }, [handleMouseLeave, onHoverChange]);

  useEffect(() => {
    const unsubscribe = position.on('change', (value) => {
      const floor = Math.floor(value);
      if (lastClampedFloorRef.current === floor) return;
      lastClampedFloorRef.current = floor;
      clampScroll();
    });
    clampScroll();
    return unsubscribe;
  }, [clampScroll, position]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    clampScroll();
  }, [clampScroll, itemHeight, itemSpacing, titles.length, viewportHeight]);

  useEffect(() => {
    return () => {
      if (smoothFrameRef.current !== null) {
        window.cancelAnimationFrame(smoothFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={hoverZoneRef}
      className="pointer-events-none flex h-[calc(100vh-48px)] w-[260px] items-center"
      data-hide-cursor="true"
    >
      <div
        ref={viewportRef}
        className="nav-project-list-viewport h-[calc(100vh-180px)] w-full overflow-y-auto overscroll-contain"
        onScroll={clampScroll}
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
                idx === activeIndex || showAll
                  ? 'pointer-events-auto opacity-100'
                  : 'pointer-events-none opacity-0'
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(idx)}
                aria-current={idx === activeIndex ? 'true' : undefined}
                tabIndex={idx === activeIndex || showAll ? 0 : -1}
                className="text-left focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {title}
              </button>
            </li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
};
