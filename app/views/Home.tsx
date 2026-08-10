'use client';

import { NavigationHomePage, Project, ProjectMobile } from '@/app/components';
import type { Project as ProjectType } from '@/types';
import { cn } from '@/utils';
import { useMotionValue } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useBreakpoint } from '../hooks';

const LIVE_RADIUS = 2;
const STICKY_TTL_MS = 800;
const MAX_STICKY_INDICES = 5;
const SELECTION_TIMEOUT_MS = 1200;
const SELECTION_ARM_MS = 100;

export const Home = ({ projects }: { projects: ProjectType[] }) => {
  const projectTitles = useMemo(() => projects.map((p) => p.title), [projects]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const metricsRef = useRef({ start: 0, step: 0, maxScroll: 0 });
  const stickyRef = useRef<Map<number, number>>(new Map());
  const selectionTimerRef = useRef<number | null>(null);
  const selectionArmedAtRef = useRef(0);

  const { isMobile } = useBreakpoint();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [selectionTarget, setSelectionTarget] = useState<number | null>(null);
  const [stickyVersion, setStickyVersion] = useState(0);
  const navigationPosition = useMotionValue(0);

  const clearSelectionTimer = useCallback(() => {
    if (selectionTimerRef.current === null) return;
    window.clearTimeout(selectionTimerRef.current);
    selectionTimerRef.current = null;
  }, []);

  const clearSelectionTarget = useCallback(() => {
    clearSelectionTimer();
    setSelectionTarget(null);
  }, [clearSelectionTimer]);

  const armSelectionTarget = useCallback(
    (idx: number) => {
      clearSelectionTimer();
      selectionArmedAtRef.current = Date.now();
      setSelectionTarget(idx);
      selectionTimerRef.current = window.setTimeout(() => {
        setSelectionTarget((current) => (current === idx ? null : current));
        selectionTimerRef.current = null;
      }, SELECTION_TIMEOUT_MS);
    },
    [clearSelectionTimer]
  );

  const markStickyIndex = useCallback((idx: number) => {
    const sticky = stickyRef.current;
    sticky.set(idx, Date.now() + STICKY_TTL_MS);

    if (sticky.size <= MAX_STICKY_INDICES) return;

    const oldest = [...sticky.entries()].sort((a, b) => a[1] - b[1])[0]?.[0];
    if (oldest !== undefined) sticky.delete(oldest);
  }, []);

  const isStickyIndex = useCallback((idx: number) => {
    const expiry = stickyRef.current.get(idx);
    if (!expiry) return false;
    if (Date.now() >= expiry) {
      stickyRef.current.delete(idx);
      return false;
    }
    return true;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const refreshMetrics = () => {
      const first = sectionRefs.current[0];
      const second = sectionRefs.current[1];

      if (!first) {
        metricsRef.current = {
          start: 0,
          step: el.clientHeight || window.innerHeight,
          maxScroll: Math.max(0, el.scrollHeight - el.clientHeight),
        };
        return;
      }

      metricsRef.current = {
        start: first.offsetTop,
        step:
          (second ? second.offsetTop - first.offsetTop : first.offsetHeight) ||
          el.clientHeight ||
          window.innerHeight,
        maxScroll: Math.max(0, el.scrollHeight - el.clientHeight),
      };
    };

    let frame = 0;
    const update = () => {
      const y = el.scrollTop;
      const { start, step, maxScroll } = metricsRef.current;

      if (!step) return;

      const rawIndex =
        y >= maxScroll - 1
          ? projects.length - 1
          : (y - start) / step;
      const idx = Math.round(rawIndex);
      navigationPosition.set(
        Math.max(0, Math.min(projects.length - 1, rawIndex))
      );

      const clampedIdx = Math.max(0, Math.min(projects.length - 1, idx));
      setActiveIndex((current) => {
        if (current === clampedIdx) return current;

        markStickyIndex(current);
        if (Math.abs(clampedIdx - current) === 1) {
          markStickyIndex(clampedIdx);
        }

        if (
          selectionTarget !== null &&
          Date.now() - selectionArmedAtRef.current > SELECTION_ARM_MS &&
          Math.abs(clampedIdx - selectionTarget) > 1
        ) {
          clearSelectionTarget();
        }

        return clampedIdx;
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    const refreshAndUpdate = () => {
      refreshMetrics();
      onScroll();
    };

    refreshAndUpdate();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(refreshAndUpdate);
    });

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', refreshAndUpdate, { passive: true });

    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', refreshAndUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [
    clearSelectionTarget,
    markStickyIndex,
    navigationPosition,
    projects.length,
    selectionTarget,
  ]);

  useEffect(() => {
    const timeoutIds: number[] = [];

    const sweep = () => {
      const now = Date.now();
      let changed = false;

      stickyRef.current.forEach((expiry, idx) => {
        if (now >= expiry) {
          stickyRef.current.delete(idx);
          changed = true;
        }
      });

      if (changed) setStickyVersion((v) => v + 1);
    };

    const scheduleSweep = () => {
      const nextExpiry = Math.min(
        ...[...stickyRef.current.values()],
        Number.POSITIVE_INFINITY
      );
      if (!Number.isFinite(nextExpiry)) return;

      const delay = Math.max(0, nextExpiry - Date.now());
      const timeoutId = window.setTimeout(() => {
        sweep();
        scheduleSweep();
      }, delay);
      timeoutIds.push(timeoutId);
    };

    sweep();
    scheduleSweep();

    return () => {
      timeoutIds.forEach((id) => window.clearTimeout(id));
    };
  }, [activeIndex, stickyVersion]);

  const handleSelect = useCallback(
    (idx: number) => {
      const el = scrollRef.current;
      const section = sectionRefs.current[idx];
      if (!el || !section) return;

      armSelectionTarget(idx);

      el.scrollTo({
        top: section.offsetTop,
        behavior: 'smooth',
      });
    },
    [armSelectionTarget]
  );

  useEffect(() => {
    if (selectionTarget === null || activeIndex !== selectionTarget) return;
    clearSelectionTarget();
  }, [activeIndex, clearSelectionTarget, selectionTarget]);

  useEffect(() => {
    return () => clearSelectionTimer();
  }, [clearSelectionTimer]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        'h-[100dvh] snap-y snap-mandatory overflow-y-auto overflow-x-hidden px-[20px] sm:p-[24px] text-[12px] text-primary-dark'
      )}
    >
      <h1 className="sr-only">Cole Ferguson photography portfolio</h1>
      <div
        className={cn(
          'pointer-events-none fixed z-[80] top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-[8px]'
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
        data-hide-cursor="true"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 left-0 z-[3] hidden h-[128px] w-[260px] bg-gradient-to-t from-white from-45% to-transparent xl:block"
        data-hide-cursor="true"
      />
      {projects.map((project, i) => {
        const isActive = i === activeIndex;
        const isVisible = isActive || showAll;
        const isSelectionTarget = i === selectionTarget;
        const isInLiveWindow = Math.abs(i - activeIndex) <= LIVE_RADIUS;
        const shouldRender =
          isInLiveWindow || isSelectionTarget || isStickyIndex(i);

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
