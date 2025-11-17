'use client';

import { cn } from '@/utils';
import { motion, useSpring } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface Props {
  titles: string[];
  activeIndex: number;
  showAll: boolean;
  onHoverChange: (isHovering: boolean) => void;
  onSelect: (index: number) => void;
}

export const NavigationHomePage = ({
  titles,
  activeIndex,
  showAll,
  onHoverChange,
  onSelect,
}: Props) => {
  const listRef = useRef<HTMLUListElement | null>(null);
  const [itemSpacing, setItemSpacing] = useState<number>(0);
  const [itemHeight, setItemHeight] = useState<number>(0);

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

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const offset = -(activeIndex * (itemSpacing || 0) + (itemHeight || 0) / 2);

  // плавний MotionValue замість перерендерів з animate
  const y = useSpring(0, { stiffness: 420, damping: 36, mass: 0.25 });
  useEffect(() => {
    const target = Number.isFinite(offset) ? offset : 0;
    y.set(target);
  }, [offset, y]);

  return (
    <motion.ul
      ref={listRef}
      className="flex flex-col gap-[6px] cursor-pointer will-change-transform"
      initial={false}
      style={{ y, transform: 'translateZ(0)' }}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      data-hide-cursor="true"
    >
      {titles.map((title, idx) => (
        <li
          key={title}
          className={cn(
            'transition-opacity hover:text-[#717171] transition-colors duration-300',
            idx === activeIndex || showAll ? 'opacity-100 ' : 'opacity-0'
          )}
          onClick={() => onSelect(idx)}
        >
          {title}
        </li>
      ))}
    </motion.ul>
  );
};
