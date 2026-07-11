/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { ArchiveProject as ArchiveProjectType } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { cn } from '@/utils';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { ArchiveLightBox, ArchiveProject } from '../components';
import { useBreakpoint, useScrollToTop } from '../hooks';

type Props = { archiveProjects: ArchiveProjectType[] };

export const ArchiveView = ({ archiveProjects }: Props) => {
  const { isMobile } = useBreakpoint();
  const [showLightBox, setShowLightBox] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number>(0);
  const [gridMode, setGridMode] = useState<1 | 2 | 4>(4);

  const colsWrapRef = useRef<HTMLDivElement | null>(null);
  const colBtnRefs = useRef<Record<1 | 2 | 4, HTMLButtonElement | null>>({
    1: null,
    2: null,
    4: null,
  });
  const [colsUnderline, setColsUnderline] = useState({ left: 0, width: 0 });

  const measureCols = () => {
    const wrap = colsWrapRef.current;
    const active = colBtnRefs.current[gridMode];
    if (!wrap || !active) return;
    const wr = wrap.getBoundingClientRect();
    const ar = active.getBoundingClientRect();
    const left = ar.left - wr.left;
    const width = ar.width;
    setColsUnderline((prev) =>
      prev.left === left && prev.width === width ? prev : { left, width }
    );
  };
  useLayoutEffect(() => {
    if (isMobile) measureCols();
  }, [gridMode, isMobile]);

  const total = archiveProjects.length;
  useScrollToTop();

  // Дозволяємо scroll на body для archive сторінки (на мобільних)
  useEffect(() => {
    if (!isMobile) return;

    // Зберігаємо оригінальні значення
    const originalBodyOverflow = document.body.style.overflowY;
    const originalHtmlOverflow = document.documentElement.style.overflowY;
    const originalBodyTouchAction = document.body.style.touchAction;
    const originalHtmlTouchAction = document.documentElement.style.touchAction;

    // Встановлюємо overflow: auto з !important
    document.body.style.setProperty('overflow-y', 'auto', 'important');
    document.documentElement.style.setProperty(
      'overflow-y',
      'auto',
      'important'
    );
    // Дозволяємо вертикальний pan для scroll
    document.body.style.setProperty('touch-action', 'pan-y', 'important');
    document.documentElement.style.setProperty(
      'touch-action',
      'pan-y',
      'important'
    );

    return () => {
      // Повертаємо оригінальні значення
      if (originalBodyOverflow) {
        document.body.style.overflowY = originalBodyOverflow;
      } else {
        document.body.style.removeProperty('overflow-y');
      }
      if (originalHtmlOverflow) {
        document.documentElement.style.overflowY = originalHtmlOverflow;
      } else {
        document.documentElement.style.removeProperty('overflow-y');
      }
      if (originalBodyTouchAction) {
        document.body.style.touchAction = originalBodyTouchAction;
      } else {
        document.body.style.removeProperty('touch-action');
      }
      if (originalHtmlTouchAction) {
        document.documentElement.style.touchAction = originalHtmlTouchAction;
      } else {
        document.documentElement.style.removeProperty('touch-action');
      }
    };
  }, [isMobile]);

  const goNext = useCallback(() => {
    setSelectedProject((prev) => {
      const i = typeof prev === 'number' ? prev : 0;
      return (i + 1) % total;
    });
  }, [total]);

  const goPrev = useCallback(() => {
    setSelectedProject((prev) => {
      const i = typeof prev === 'number' ? prev : 0;
      return (i - 1 + total) % total;
    });
  }, [total]);

  if (!archiveProjects?.length) return null;

  const handleLightBoxOpen = (projectIndex: number) => {
    setShowLightBox(true);
    setSelectedProject(projectIndex);
  };

  const itemSpan =
    gridMode === 1
      ? 'col-span-8'
      : gridMode === 2
        ? 'col-span-4'
        : 'col-span-2';

  if (isMobile)
    return (
      <div className="relative sm:hidden min-h-screen">
        <div className="bg-white z-[1000] fixed top-0 left-0 right-0 h-[83px]">
          <div className="pointer-events-auto">dfe</div>
        </div>
        <div className="fixed top-[48px] left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-[21px] text-[12px] sm:hidden bg-white pointer-events-none">
          <span>Columns</span>

          <div
            ref={colsWrapRef}
            className="relative flex gap-[8px] bg-white pointer-events-auto"
            role="tablist"
            aria-label="Columns"
          >
            {[1, 2, 4].map((n) => (
              <button
                key={n}
                ref={(el) => {
                  colBtnRefs.current[n as 1 | 2 | 4] = el;
                }}
                type="button"
                onClick={() => setGridMode(n as 1 | 2 | 4)}
                className={cn(
                  'relative inline-flex px-[2px] leading-none pb-[2px] transition-transform',
                  {
                    '-translate-y-[6px]': gridMode === (n as 1 | 2 | 4),
                  }
                )}
                aria-selected={gridMode === (n as 1 | 2 | 4)}
                role="tab"
              >
                {n}
              </button>
            ))}
            <motion.div
              className="absolute h-[1px] bg-black"
              style={{ bottom: 0 }}
              initial={false}
              animate={{ left: colsUnderline.left, width: colsUnderline.width }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 36,
                mass: 0.2,
              }}
            />
          </div>
        </div>

        <div className="pt-[83px] grid grid-cols-8 gap-x-[20px] gap-y-[20px] px-[20px] pb-[20px] items-start">
          {archiveProjects.map((project, index) => {
            const img = project.image;
            const alt = img?.alt || project.title;
            const src = img ? urlFor(img).width(800).url() : '';
            const aspect =
              img?.width && img?.height
                ? `${img.width} / ${img.height}`
                : '4 / 3';

            return (
              <button
                key={project._id}
                type="button"
                onClick={() => handleLightBoxOpen(index)}
                className={`cursor-pointer ${itemSpan}`}
              >
                <div
                  className="relative w-full overflow-hidden"
                  style={{ aspectRatio: aspect }}
                >
                  {img && (
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      sizes="(max-width:768px) 50vw, (max-width:1280px) 25vw, 20vw"
                      placeholder={img.blurDataURL ? 'blur' : 'empty'}
                      blurDataURL={img.blurDataURL}
                      className="object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {showLightBox && selectedProject !== null && (
          <ArchiveLightBox close={() => setShowLightBox(false)}>
            <ArchiveProject
              onNext={goNext}
              onPrev={goPrev}
              archiveProject={
                archiveProjects[selectedProject] as ArchiveProjectType
              }
            />
          </ArchiveLightBox>
        )}
      </div>
    );

  return (
    <div className="hidden w-screen h-screen overflow-y-auto hide-scrollbar sm:grid sm:grid-cols-24 pt-[108px] xl:pt-[24px] px-[24px] pb-[100px]">
      <div className="col-start-1 col-span-full xl:col-start-7 xl:col-span-18">
        <ul className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-[60px] gap-y-[65px]">
          {archiveProjects.map((project, index) => {
            const img = project.image;
            const alt = img?.alt || project.title;
            const src = img ? urlFor(img).width(800).url() : '';
            const aspect =
              img?.width && img?.height
                ? `${img.width} / ${img.height}`
                : '4 / 3';

            return (
              <li key={project._id} onClick={() => handleLightBoxOpen(index)}>
                <div
                  className="relative w-full overflow-hidden"
                  style={{ aspectRatio: aspect }}
                >
                  {img && (
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      sizes="(max-width:768px) 50vw, (max-width:1280px) 25vw, 20vw"
                      placeholder={img.blurDataURL ? 'blur' : 'empty'}
                      blurDataURL={img.blurDataURL}
                      className="object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {showLightBox && selectedProject !== null && (
        <ArchiveLightBox close={() => setShowLightBox(false)}>
          <ArchiveProject
            onNext={goNext}
            onPrev={goPrev}
            archiveProject={
              archiveProjects[selectedProject] as ArchiveProjectType
            }
          />
        </ArchiveLightBox>
      )}
    </div>
  );
};
