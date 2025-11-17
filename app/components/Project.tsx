/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { urlFor } from '@/sanity/lib/image';
import type { Project as ProjectType, ProjectView } from '@/types/project';
import { AnimatePresence, motion } from 'framer-motion';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CursorLabel } from './CursorLabel';
import { SingleImageView } from './SingleImageView';
import { ThreeImagesView } from './ThreeImagesView';
import { TwoImagesView } from './TwoImagesView';

interface Props {
  project: ProjectType;
  actualPhoto?: string | null;
  showIndicator?: boolean;
}

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

export const Project: React.FC<Props> = ({
  project,
  actualPhoto,
  showIndicator = true,
}) => {
  const views = useMemo(() => normalizeViews(project), [project]);

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

  const current = views[index];

  // Indicator
  const imageCounts = views.map((v) => v.images?.length ?? 0);
  const totalImages = imageCounts.reduce((a, b) => a + b, 0);
  const beforeCount = imageCounts.slice(0, index).reduce((a, b) => a + b, 0);
  const currentCount = current?.images?.length ?? 0;

  const digitsRef = useRef<HTMLDivElement | null>(null);
  const digitRefs = useRef<(HTMLSpanElement | null)[]>([]);
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

  // ——— Прелоад найближчих кадрів (позакулісно) ———
  const preloadedUrlsRef = useRef<Set<string>>(new Set());

  const getFirstAssetRef = (v?: ProjectView | null): string | null => {
    const img = v?.images && v.images[0];
    const ref = img?.asset?._ref;
    return typeof ref === 'string' ? ref : null;
  };

  const getWidthFactor = (v?: ProjectView | null): number => {
    if (!v) return 0.6;
    if (v._type === 'threeView') return 0.28;
    if (v._type === 'twoView') return 0.42;
    return 0.6;
  };

  const buildCdnUrl = (assetRef: string, factor: number): string | null => {
    if (typeof window === 'undefined') return null;
    const w = Math.max(640, Math.round(window.innerWidth * factor));
    try {
      return urlFor({ _type: 'image', asset: { _ref: assetRef } })
        .width(w)
        .fit('max')
        .auto('format')
        .quality(75)
        .url();
    } catch {
      return null;
    }
  };

  const preloadView = useCallback(
    (vi: number) => {
      const v = views[vi];
      const ref = getFirstAssetRef(v);
      if (!ref) return;
      const url = buildCdnUrl(ref, getWidthFactor(v));
      if (!url) return;
      if (preloadedUrlsRef.current.has(url)) return;
      preloadedUrlsRef.current.add(url);
      const img = new Image();
      if (typeof (img as any).fetchPriority !== 'undefined') {
        (img as any).fetchPriority = 'low';
      }
      img.decoding = 'async';
      img.src = url;
    },
    [views]
  );

  // На старті: крім першого, одразу підтягуємо другий і останній
  useEffect(() => {
    if (views.length === 0) return;
    const preloadInitial = () => {
      if (views.length >= 2) preloadView(1);
      if (views.length >= 1) preloadView(views.length - 1);
    };
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(preloadInitial);
    } else {
      setTimeout(preloadInitial, 0);
    }
  }, [views, preloadView]);

  // На кожному кроці: підвантажити попередній і наступний
  useEffect(() => {
    if (views.length === 0) return;
    const next = (index + 1) % views.length;
    const prev = (index - 1 + views.length) % views.length;
    preloadView(next);
    preloadView(prev);
  }, [index, views.length, preloadView]);

  // ——— єдина точка рендеру view без дубляжу single ———
  const renderView = (v?: ProjectView | null) => {
    if (!v || !v.images || v.images.length === 0) return null;
    if (v._type === 'twoView' && v.images.length === 2) {
      return <TwoImagesView images={v.images} />;
    }
    if (v._type === 'threeView' && v.images.length === 3) {
      return <ThreeImagesView images={v.images} />;
    }
    // усе, що має 1 фото — завжди один шлях:
    if (v.images.length === 1) {
      return <SingleImageView image={v.images[0]} />;
    }
    // (неочікуваний кейс)  — на всяк випадок покажемо перше як single
    return <SingleImageView image={v.images[0]} />;
  };

  return (
    <div className="relative h-screen w-screen flex items-center justify-center select-none overflow-x-hidden cursor-none">
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`desktop-${index}`}
            className="absolute inset-0 z-0 pointer-events-none will-change-transform"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0.0, 0.2, 1] }}
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
          className="pointer-events-none fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[40]"
          data-hide-cursor="true"
        >
          <div ref={digitsRef} className="relative flex gap-[4px] text-[12px]">
            {Array.from({ length: totalImages }).map((_, i) => {
              const isActive =
                i >= beforeCount && i < beforeCount + currentCount;
              return (
                <span
                  key={i}
                  ref={(el) => {
                    digitRefs.current[i] = el;
                  }}
                  className={`inline-block px-[1px] ${isActive ? '-translate-y-[2px]' : ''}`}
                >
                  {i + 1}
                </span>
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
      <div className="fixed bottom-[25px] left-0 right-0 p-[20px] text-center z-[10] xl:hidden">
        {project.title}
      </div>

      <button
        type="button"
        aria-label="Previous"
        onClick={goPrev}
        className="absolute left-0 top-0 h-full w-1/2 cursor-none focus:outline-none prev-btn"
        style={{ background: 'transparent' }}
      />
      <button
        type="button"
        aria-label="Next"
        onClick={goNext}
        className="absolute right-0 top-0 h-full w-1/2 cursor-none focus:outline-none next-btn"
        style={{ background: 'transparent' }}
      />
      <CursorLabel />
    </div>
  );
};
