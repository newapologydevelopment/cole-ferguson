'use client';

import type { Project as ProjectType, ProjectView } from '@/types/project';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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
import { SingleImageView } from './SingleImageView';
import { ThreeImagesView } from './ThreeImagesView';
import { TwoImagesView } from './TwoImagesView';

interface Props {
  project: ProjectType;
  actualPhoto?: string | null;
  showIndicator?: boolean;
  priorityImages?: boolean;
}

const VIEW_CROSSFADE = {
  duration: 0.72,
  ease: 'linear' as const,
};

// ——— helpers ———
const normalizeViews = (project: ProjectType): ProjectView[] => {
  const base: ProjectView[] =
    project.views && project.views.length > 0
      ? project.views
      : project.images && project.images.length > 0
        ? [{ _type: 'singleView', images: [project.images[0]] }]
        : [];

  // Будь-який view з 1 зображенням → singleView (уніфікація)
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

export const Project: React.FC<Props> = ({
  project,
  actualPhoto,
  showIndicator = true,
  priorityImages = true,
}) => {
  const hydratedProject = useHydratedProjectViews(project, priorityImages);
  const views = useMemo(() => normalizeViews(hydratedProject), [hydratedProject]);
  const reduceMotion = useReducedMotion();

  const [index, setIndex] = useState(0);

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

  const current = views[index];

  // Indicator
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
    setUnderline({ left, width });
  }, [beforeCount, currentCount, totalImages]);

  useLayoutEffect(() => {
    measure();
  }, [measure, index]);
  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    const t = setTimeout(measure, 0);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(t);
    };
  }, [measure]);
  useEffect(() => {
    if (!showIndicator) return;
    const raf = window.requestAnimationFrame(() => measure());
    const t = setTimeout(measure, 0);
    return () => {
      window.cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [showIndicator, measure, beforeCount, currentCount, totalImages]);

  useEffect(() => {
    if (!priorityImages || views.length === 0) return;
    preloadInitialProjectViews(views);
  }, [priorityImages, views]);

  useEffect(() => {
    if (!priorityImages || views.length === 0) return;
    preloadAdjacentProjectViews(views, index);
  }, [index, priorityImages, views]);

  // ——— єдина точка рендеру view без дубляжу single ———
  const renderView = (v?: ProjectView | null) => {
    if (!v || !v.images || v.images.length === 0) return null;
    if (v._type === 'twoView' && v.images.length === 2) {
      return <TwoImagesView images={v.images} priority={priorityImages} />;
    }
    if (v._type === 'threeView' && v.images.length === 3) {
      return <ThreeImagesView images={v.images} priority={priorityImages} />;
    }
    // усе, що має 1 фото — завжди один шлях:
    if (v.images.length === 1) {
      return <SingleImageView image={v.images[0]} priority={priorityImages} />;
    }
    // (неочікуваний кейс)  — на всяк випадок покажемо перше як single
    return <SingleImageView image={v.images[0]} priority={priorityImages} />;
  };

  return (
    <div className="relative h-screen w-screen flex items-center justify-center select-none overflow-x-hidden">
      <div className="relative w-full h-full">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={`desktop-${index}`}
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: reduceMotion ? 1 : 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : VIEW_CROSSFADE
            }
          >
            <div className="pointer-events-none">
              {renderView(current) ?? (
                <div className="flex items-center justify-center h-full">
                  {project.title}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {showIndicator && totalImages > 0 && (
        <div
          className="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[70]"
          data-hide-cursor="true"
        >
          <div ref={digitsRef} className="relative flex gap-[4px] text-[12px]">
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
                  onClick={() => goToImage(i)}
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

      {/* Tablet title (desktop Project used on tablets): show title at the bottom like mobile */}
      {showIndicator && (
        <div className="fixed bottom-[25px] left-0 right-0 p-[20px] text-center z-[10] xl:hidden">
          {project.title}
        </div>
      )}

      <button
        type="button"
        aria-label="Previous"
        onClick={goPrev}
        disabled={!showIndicator}
        data-cursor="prev"
        className="absolute left-0 top-0 h-full w-1/2 focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-[-4px] prev-btn"
        style={{ background: 'transparent' }}
      />
      <button
        type="button"
        aria-label="Next"
        onClick={goNext}
        disabled={!showIndicator}
        data-cursor="next"
        className="absolute right-0 top-0 h-full w-1/2 focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-[-4px] next-btn"
        style={{ background: 'transparent' }}
      />
    </div>
  );
};
