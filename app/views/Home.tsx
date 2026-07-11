'use client';

import { NavigationHomePage, Project, ProjectMobile } from '@/app/components';
import type { Project as ProjectType } from '@/types';
import { cn } from '@/utils';
import { useMotionValue } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useBreakpoint } from '../hooks';

export const Home = ({ projects }: { projects: ProjectType[] }) => {
  const projectTitles = useMemo(() => projects.map((p) => p.title), [projects]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const { isMobile, isReady } = useBreakpoint();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [selectionTarget, setSelectionTarget] = useState<number | null>(null);
  const navigationPosition = useMotionValue(0);

  // useScrollToTop();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const getScrollMetrics = () => {
      const first = sectionRefs.current[0];
      const second = sectionRefs.current[1];

      if (!first) {
        return {
          start: 0,
          step: el.clientHeight || window.innerHeight,
        };
      }

      return {
        start: first.offsetTop,
        step:
          (second ? second.offsetTop - first.offsetTop : first.offsetHeight) ||
          el.clientHeight ||
          window.innerHeight,
      };
    };

    let frame = 0;
    const update = () => {
      const y = el.scrollTop;
      const { start, step } = getScrollMetrics();

      if (!step) return;

      // The scroll container has responsive padding, so its clientHeight is not
      // the same as a project's actual snap interval. Using the real section
      // offsets prevents the active project from drifting one item behind.
      const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
      const rawIndex =
        y >= maxScroll - 1
          ? projects.length - 1
          : (y - start) / step;
      const idx = Math.round(rawIndex);
      navigationPosition.set(
        Math.max(0, Math.min(projects.length - 1, rawIndex))
      );

      const clampedIdx = Math.max(0, Math.min(projects.length - 1, idx));
      setActiveIndex((current) => current === clampedIdx ? current : clampedIdx);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();

    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [navigationPosition, projects.length]);

  const handleSelect = useCallback((idx: number) => {
    const el = scrollRef.current;
    const section = sectionRefs.current[idx];
    if (!el || !section) return;

    setSelectionTarget(idx);

    el.scrollTo({
      top: section.offsetTop,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    if (selectionTarget === null || activeIndex !== selectionTarget) return;
    setSelectionTarget(null);
  }, [activeIndex, selectionTarget]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        'h-[100dvh] snap-y snap-mandatory overflow-y-auto overflow-x-hidden px-[20px] sm:p-[24px] text-[12px] text-primary-dark'
      )}
    >
      <div
        className={cn(
          'fixed z-[2] top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-[8px]'
        )}
      >
        <NavigationHomePage
          titles={projectTitles}
          activeIndex={selectionTarget ?? activeIndex}
          position={navigationPosition}
          showAll={showAll}
          onHoverChange={setShowAll}
          onSelect={handleSelect}
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[3] hidden h-[104px] w-[260px] bg-gradient-to-b from-white from-55% to-transparent xl:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 left-0 z-[3] hidden h-[128px] w-[260px] bg-gradient-to-t from-white from-45% to-transparent xl:block"
      />
      {projects.map((project, i) => {
        const isActive = i === activeIndex;
        const isVisible = isActive || showAll;
        const isSelectionTarget = i === selectionTarget;
        const shouldRender =
          isReady && (Math.abs(i - activeIndex) <= 1 || isSelectionTarget);

        return (
          <div
            key={project._id}
            ref={(el) => {
              sectionRefs.current[i] = el;
            }}
            className={cn('snap-start h-full transition-opacity duration-300', {
              'opacity-100': isVisible,
              'opacity-0': !isVisible,
            })}
          >
            {shouldRender && (isMobile ? (
              <ProjectMobile
                project={project}
                showIndicator={isActive}
                showBottomTitle={isActive}
                priorityImages={isActive || isSelectionTarget}
              />
            ) : (
              <Project
                project={project}
                showIndicator={!showAll && isActive}
                priorityImages={isActive || isSelectionTarget}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};
