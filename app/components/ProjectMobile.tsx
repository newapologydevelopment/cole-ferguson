/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type { Project as ProjectType, ProjectView } from '@/types/project';
import { cn } from '@/utils';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useHydratedProjectViews } from '../hooks';
import {
  preloadAdjacentProjectViews,
  preloadInitialProjectViews,
} from './prefetchProjectViews';
import { SingleViewMobile } from './SingleViewMobile';
import { ThreeViewMobile } from './ThreeViewMobile';
import { TwoViewMobile } from './TwoViewMobile';

interface Props {
  project: ProjectType;
  actualPhoto?: string | null;
  showIndicator?: boolean;
  showBottomTitle?: boolean;
  priorityImages?: boolean;
}

const VIEW_CROSSFADE = {
  duration: 0.72,
  ease: 'linear' as const,
};

const normalizeViews = (project: ProjectType): ProjectView[] => {
  const base: ProjectView[] =
    project.views && project.views.length > 0
      ? project.views
      : project.images && project.images.length > 0
        ? [{ _type: 'singleView', images: [project.images[0]] }]
        : [];

  return base.map((v) => {
    const len = v.images?.length ?? 0;
    if (len === 1 && v._type !== 'singleView') {
      return { _type: 'singleView', images: v.images };
    }
    return v;
  });
};

const findViewIndexForImage = (
  views: ProjectView[],
  globalImageIndex: number
): number => {
  let accumulated = 0;

  for (let viewIndex = 0; viewIndex < views.length; viewIndex++) {
    const count = views[viewIndex].images?.length ?? 0;
    if (globalImageIndex < accumulated + count) return viewIndex;
    accumulated += count;
  }

  return Math.max(0, views.length - 1);
};

export const ProjectMobile: React.FC<Props> = ({
  project,
  actualPhoto,
  showIndicator = true,
  showBottomTitle = true,
  priorityImages = true,
}) => {
  // стабільний ключ проєкту
  const projectKey =
    project?._id || (project as any)?.slug || project?.title || 'project';
  const hydratedProject = useHydratedProjectViews(project, priorityImages);
  const views = useMemo(() => normalizeViews(hydratedProject), [hydratedProject]);
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const pathname = usePathname();
  const isNotHomePage = pathname !== '/';

  // коли змінився проєкт — скидаємо індекс
  useEffect(() => {
    setIndex(0);
  }, [projectKey]);

  const current = views[index];
  const viewKey = `${projectKey}-${index}`;

  // синхронізація з обраним фото
  useEffect(() => {
    if (!actualPhoto || views.length === 0) return;
    const idx = views.findIndex((v) =>
      v.images?.some((img) => img?.asset?._ref === actualPhoto)
    );
    if (idx !== -1) setIndex(idx);
  }, [actualPhoto, views]);

  const goPrev = useCallback(() => {
    if (views.length === 0) return;
    setIndex((i) => (i - 1 + views.length) % views.length);
  }, [views.length]);

  const goNext = useCallback(() => {
    if (views.length === 0) return;
    setIndex((i) => (i + 1) % views.length);
  }, [views.length]);

  const goToImage = useCallback(
    (globalImageIndex: number) => {
      if (views.length === 0) return;
      const nextIndex = findViewIndexForImage(views, globalImageIndex);
      if (nextIndex === index) return;

      setIndex(nextIndex);
    },
    [index, views]
  );

  // індикатор (логіка ідентична десктопу)
  const imageCounts = views.map((v) => v.images?.length ?? 0);
  const loadedImageTotal = imageCounts.reduce((a, b) => a + b, 0);
  const expectedViewCount = hydratedProject.viewCount ?? views.length;
  const hasAllViews = views.length >= expectedViewCount;
  const totalImages = hasAllViews
    ? (hydratedProject.imageCount ?? loadedImageTotal)
    : loadedImageTotal;
  const beforeCount = imageCounts.slice(0, index).reduce((a, b) => a + b, 0);
  const currentCount = current?.images?.length ?? 0;

  const digitsRef = useRef<HTMLDivElement | null>(null);
  const digitRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  // скидаємо refs коли змінюється кількість цифр
  useEffect(() => {
    digitRefs.current = [];
  }, [totalImages]);

  // єдине місце вимірювання + resize-слухач
  const measure = useCallback(() => {
    if (!digitsRef.current || totalImages === 0 || currentCount === 0) return;
    const start = beforeCount;
    const end = beforeCount + currentCount - 1;
    const startEl = digitRefs.current[start];
    const endEl = digitRefs.current[end];
    if (!startEl || !endEl) return;
    const wrapRect = digitsRef.current.getBoundingClientRect();
    const sRect = startEl.getBoundingClientRect();
    const eRect = endEl.getBoundingClientRect();
    const left = sRect.left - wrapRect.left;
    const width = eRect.right - sRect.left;
    setUnderline((prev) =>
      prev.left === left && prev.width === width ? prev : { left, width }
    );
  }, [beforeCount, currentCount, totalImages]);

  useLayoutEffect(() => {
    if (!showIndicator) return;
    measure();
  }, [measure, showIndicator, index, totalImages, beforeCount, currentCount]);

  useEffect(() => {
    if (!showIndicator) return;
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measure, showIndicator]);

  useEffect(() => {
    if (!priorityImages || views.length === 0) return;
    preloadInitialProjectViews(views);
  }, [priorityImages, views]);

  useEffect(() => {
    if (!priorityImages || views.length === 0) return;
    preloadAdjacentProjectViews(views, index);
  }, [index, priorityImages, views]);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const onTouchEnd = () => {
    const dx = touchStartX.current - touchEndX.current;
    const threshold = 48;
    if (dx > threshold) goNext();
    else if (dx < -threshold) goPrev();
  };

  const renderView = (v?: ProjectView | null) => {
    if (!v || !v.images || v.images.length === 0) return null;
    if (v._type === 'twoView' && v.images.length === 2)
      return <TwoViewMobile images={v.images} disableFade priority={priorityImages} />;
    if (v._type === 'threeView' && v.images.length === 3)
      return <ThreeViewMobile images={v.images} priority={priorityImages} />;
    return <SingleViewMobile image={v.images[0]} priority={priorityImages} />;
  };

  return (
    <div
      className={cn('relative w-full h-full', {
        'h-[100dvh]': isNotHomePage,
        'h-full': !isNotHomePage,
      })}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: 'pan-y', WebkitTapHighlightColor: 'transparent' }}
    >
      {/* STAGE */}
      <div className="relative w-full h-full">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={viewKey}
            className={cn('absolute inset-0', {
              'pointer-events-none': !isNotHomePage,
              'pointer-events-auto': isNotHomePage,
            })}
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: reduceMotion ? 1 : 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : VIEW_CROSSFADE
            }
          >
            <div className={cn('h-full w-full', {
              'pointer-events-none': !isNotHomePage,
              'pointer-events-auto': isNotHomePage,
            })}>
              {renderView(current) ?? (
                <div className="flex items-center justify-center h-full p-[20px]">
                  {project.title}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {showIndicator && totalImages > 0 && (
        <div className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[70]">
          <div
            ref={digitsRef}
            className="relative flex gap-[4px] text-[12px] pb-[2px] leading-none"
          >
            {Array.from({ length: totalImages }).map((_, i) => {
              const isActive =
                i >= beforeCount && i < beforeCount + currentCount;
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to image ${i + 1}`}
                  aria-current={isActive ? 'true' : undefined}
                  ref={(el) => {
                    digitRefs.current[i] = el;
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToImage(i);
                  }}
                  className={`inline-block px-[1px] cursor-pointer transition-[color,transform] duration-200 hover:text-[#717171] ${isActive ? '-translate-y-[2px]' : ''}`}
                >
                  {i + 1}
                </button>
              );
            })}
            {currentCount > 0 && (
              <motion.div
                className="absolute h-[1px] bg-black"
                style={{ bottom: 0 }}
                initial={false}
                animate={{ left: underline.left, width: underline.width }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 36,
                  mass: 0.2,
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* TAP ЗОНИ */}
      <button
        type="button"
        aria-label="Previous"
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        className="pointer-events-auto absolute left-[6px] top-0 h-full w-[calc(50%-6px)] z-[60] focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-[-4px]"
        style={{ background: 'transparent' }}
      />
      <button
        type="button"
        aria-label="Next"
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        className="pointer-events-auto absolute right-0 top-0 h-full w-1/2 z-[60] focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-[-4px]"
        style={{ background: 'transparent' }}
      />

      {/* титул */}
      {showBottomTitle && (
        <div className="fixed bottom-[25px] left-0 right-0 p-[20px] text-center z-[10] pointer-events-none">
          {project.title}
        </div>
      )}
    </div>
  );
};
