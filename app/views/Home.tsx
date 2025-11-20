'use client';

import { NavigationHomePage, Project, ProjectMobile } from '@/app/components';
import type { Project as ProjectType } from '@/types';
import { cn } from '@/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useBreakpoint } from '../hooks';

export const Home = ({ projects }: { projects: ProjectType[] }) => {
  const projectTitles = useMemo(() => projects.map((p) => p.title), [projects]);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const { isMobile } = useBreakpoint();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  // useScrollToTop();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const getSectionHeight = () => el.clientHeight || window.innerHeight;

    const onScroll = () => {
      const y = el.scrollTop;
      const h = getSectionHeight();

      if (!h) return;

      const rawIndex = y / h;
      const idx = Math.round(rawIndex);

      const clampedIdx = Math.max(0, Math.min(projects.length - 1, idx));
      setActiveIndex(clampedIdx);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      el.removeEventListener('scroll', onScroll);
    };
  }, [projects.length]);

  const handleSelect = useCallback((idx: number) => {
    const el = scrollRef.current;
    if (!el) return;

    const h = el.clientHeight || window.innerHeight;

    el.scrollTo({
      top: idx * h,
      behavior: 'smooth',
    });
  }, []);

  return (
    <div
      className={cn(
        'relative h-[100dvh] overflow-hidden px-[20px] sm:p-[24px] text-[12px] text-primary-dark'
      )}
    >
      <div
        className={cn(
          'fixed z-[2] top-[50%] translate-y-[-25%] mt-[40px] hidden xl:flex flex-col gap-[8px]'
        )}
      >
        <NavigationHomePage
          titles={projectTitles}
          activeIndex={activeIndex}
          showAll={showAll}
          onHoverChange={setShowAll}
          onSelect={handleSelect}
        />
      </div>

      <div
        ref={scrollRef}
        className={cn(
          'absolute inset-0 overflow-y-auto snap-y snap-mandatory pointer-events-auto'
        )}
      >
        {projects.map((project, i) => {
          const isActive = i === activeIndex;
          const isVisible = isActive || showAll;

          return (
            <section
              key={project._id}
              ref={(el) => {
                sectionRefs.current[i] = el;
              }}
              className={cn(
                'snap-start h-full transition-opacity duration-300',
                {
                  'opacity-100': isVisible,
                  'opacity-0': !isVisible,
                }
              )}
            >
              {isMobile ? (
                // <div
                //   className={cn(
                //     'h-[100dvh] bg-yellow-200 flex items-center justify-center'
                //   )}
                // >
                //   {project.title}
                //   {/* тут можеш підставити свій ProjectMobile коли буде готовий */}
                // </div>
                <ProjectMobile project={project} />
              ) : (
                <Project
                  project={project}
                  showIndicator={!showAll && isActive}
                />
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
