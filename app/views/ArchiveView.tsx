'use client';

import { ArchiveProject as ArchiveProjectType } from '@/sanity/lib/client';
import { sanityLoader, urlFor } from '@/sanity/lib/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArchiveLightBox, ArchiveProject } from '../components';
import { GridRevealImage } from '../components/GridRevealImage';
import { useBreakpoint, useScrollToTop } from '../hooks';

type Props = { archiveProjects: ArchiveProjectType[] };

const ARCHIVE_BATCH_SIZE = 24;

export const ArchiveView = ({ archiveProjects }: Props) => {
  const { isCompact } = useBreakpoint();
  const [showLightBox, setShowLightBox] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState(ARCHIVE_BATCH_SIZE);

  const desktopScrollRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const total = archiveProjects.length;
  const visibleProjects = archiveProjects.slice(0, visibleCount);
  const thumbnailSizes =
    '(min-width:1280px) 16vw, (min-width:640px) 33vw, 50vw';
  useScrollToTop();

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || visibleCount >= total) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisibleCount((current) =>
          Math.min(current + ARCHIVE_BATCH_SIZE, total)
        );
      },
      {
        root: isCompact ? null : desktopScrollRef.current,
        rootMargin: '400px 0px',
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isCompact, total, visibleCount]);

  // Keep document scrolling enabled for the compact archive layout.
  useEffect(() => {
    if (!isCompact) return;

    const originalBodyOverflow = document.body.style.overflowY;
    const originalHtmlOverflow = document.documentElement.style.overflowY;
    const originalBodyTouchAction = document.body.style.touchAction;
    const originalHtmlTouchAction = document.documentElement.style.touchAction;

    document.body.style.setProperty('overflow-y', 'auto', 'important');
    document.documentElement.style.setProperty(
      'overflow-y',
      'auto',
      'important'
    );
    document.body.style.setProperty('touch-action', 'pan-y', 'important');
    document.documentElement.style.setProperty(
      'touch-action',
      'pan-y',
      'important'
    );

    return () => {
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
  }, [isCompact]);

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

  if (isCompact)
    return (
      <div className="relative xl:hidden min-h-screen">
        <h1 className="sr-only">Photography archive</h1>
        <div className="pt-[64px] sm:pt-[80px] grid grid-cols-6 gap-x-[20px] gap-y-[20px] px-[20px] sm:px-[24px] pb-[20px] items-start">
          {visibleProjects.map((project, index) => {
            const img = project.image;
            const alt = img?.alt || project.title;
            const src = img ? urlFor(img).url() : '';
            const aspect =
              img?.width && img?.height
                ? `${img.width} / ${img.height}`
                : '4 / 3';

            return (
              <button
                key={project._id}
                type="button"
                onClick={() => handleLightBoxOpen(index)}
                className="col-span-3 sm:col-span-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4"
                aria-label={`Open ${project.title}`}
              >
                <div
                  className="relative w-full overflow-hidden"
                  style={{ aspectRatio: aspect }}
                >
                  {img && (
                    <GridRevealImage
                      index={index}
                      immediate={index === 0}
                      src={src}
                      alt={alt}
                      fill
                      loader={sanityLoader}
                      sizes={thumbnailSizes}
                      placeholder={img.blurDataURL ? 'blur' : 'empty'}
                      blurDataURL={img.blurDataURL}
                      className="object-cover"
                      priority={index === 0}
                      loading={index < 4 ? 'eager' : 'lazy'}
                      fetchPriority={index < 4 ? 'high' : 'auto'}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {visibleCount < total && (
          <div ref={loadMoreRef} aria-hidden="true" className="h-px w-full" />
        )}

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
    <div
      ref={desktopScrollRef}
      className="hidden w-screen h-screen overflow-y-auto hide-scrollbar xl:grid xl:grid-cols-24 pt-[24px] px-[24px] pb-[100px]"
    >
      <h1 className="sr-only">Photography archive</h1>
      <div className="col-start-1 col-span-full xl:col-start-7 xl:col-span-18">
        <ul className="grid grid-cols-4 gap-x-[60px] gap-y-[65px]">
          {visibleProjects.map((project, index) => {
            const img = project.image;
            const alt = img?.alt || project.title;
            const src = img ? urlFor(img).url() : '';
            const aspect =
              img?.width && img?.height
                ? `${img.width} / ${img.height}`
                : '4 / 3';

            return (
              <li key={project._id}>
                <button
                  type="button"
                  onClick={() => handleLightBoxOpen(index)}
                  className="block w-full focus-visible:outline-2 focus-visible:outline-offset-4"
                  aria-label={`Open ${project.title}`}
                >
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ aspectRatio: aspect }}
                  >
                    {img && (
                      <GridRevealImage
                        index={index}
                        immediate={index === 0}
                        src={src}
                        alt={alt}
                        fill
                        loader={sanityLoader}
                        sizes={thumbnailSizes}
                        placeholder={img.blurDataURL ? 'blur' : 'empty'}
                        blurDataURL={img.blurDataURL}
                        className="object-cover"
                        priority={index === 0}
                        loading={index < 4 ? 'eager' : 'lazy'}
                        fetchPriority={index < 4 ? 'high' : 'auto'}
                      />
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {visibleCount < total && (
          <div ref={loadMoreRef} aria-hidden="true" className="h-px w-full" />
        )}
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
