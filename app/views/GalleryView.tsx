'use client';

import { Project as ProjectType } from '@/types';
import { cn, collectAllImages } from '@/utils';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  GalleryGridView,
  GalleryGridViewMobile,
  GalleryList,
  GalleryListView,
  LightBox,
  Project,
  ProjectMobile,
} from '../components';
import { useBreakpoint, useScrollToTop } from '../hooks';

export const GalleryView = ({
  projects,
  archiveCount = 0,
}: {
  projects: ProjectType[];
  archiveCount?: number;
}) => {
  const [view, setView] = useState('grid');
  const { isMobile, isCompact } = useBreakpoint();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [lightBoxOpen, setLightBoxOpen] = useState(false);
  const [listViewSelectedProject, setListViewSelectedProject] =
    useState<ProjectType | null>(projects[0]);
  const [actualPhoto, setActualPhoto] = useState<string | null>(null);
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const allImages = collectAllImages(projects);
  const tabsRef = useRef<HTMLDivElement>(null);
  const gridTabRef = useRef<HTMLButtonElement>(null);
  const listTabRef = useRef<HTMLButtonElement>(null);
  const [tabUnderline, setTabUnderline] = useState({ left: 0, width: 0 });

  useScrollToTop();

  const measureTabUnderline = useCallback(() => {
    const tabs = tabsRef.current;
    const active = view === 'grid' ? gridTabRef.current : listTabRef.current;
    if (!tabs || !active) return;

    const tabsRect = tabs.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    setTabUnderline({
      left: activeRect.left - tabsRect.left,
      width: activeRect.width,
    });
  }, [view]);

  useLayoutEffect(() => {
    measureTabUnderline();
  }, [isCompact, measureTabUnderline]);

  useEffect(() => {
    window.addEventListener('resize', measureTabUnderline);
    return () => window.removeEventListener('resize', measureTabUnderline);
  }, [measureTabUnderline]);

  const handleLightBoxOpen = (project: ProjectType) => {
    setLightBoxOpen(!lightBoxOpen);

    if (project) {
      setListViewSelectedProject(
        projects.find((p) => p._id === project._id) as ProjectType
      );
    }
  };

  if (isCompact)
    return (
      <div
        className="pt-[64px] xl:hidden h-[100dvh] w-full overflow-y-auto overscroll-contain hide-scrollbar text-[12px] text-primary-dark px-[20px] pb-[40px]"
        data-gallery-scroll
      >
        <h1 className="sr-only">Photography index</h1>
        <GalleryGridViewMobile
          items={allImages}
          projects={projects}
          selectedProject={selectedProject}
          onClick={handleLightBoxOpen}
          selectActualPhoto={setActualPhoto}
        />

        {lightBoxOpen && (
          <LightBox
            close={() => setLightBoxOpen(false)}
            title={listViewSelectedProject?.title || ''}
          >
            {isMobile ? (
              <ProjectMobile
                actualPhoto={actualPhoto}
                project={listViewSelectedProject as unknown as ProjectType}
                showIndicator={true}
                showBottomTitle={false}
              />
            ) : (
              <Project
                actualPhoto={actualPhoto}
                project={listViewSelectedProject as unknown as ProjectType}
              />
            )}
          </LightBox>
        )}
      </div>
    );

  return (
    <div
      ref={galleryScrollRef}
      className="hidden sm:grid grid-cols-24 w-full h-full overflow-y-auto overscroll-contain hide-scrollbar text-[12px] text-primary-dark p-[24px]"
      data-gallery-scroll
    >
      <h1 className="sr-only">Photography index</h1>
      <div className="hidden fixed z-[2] sm:block sm:top-[50px] sm:left-1/2 sm:-translate-x-1/2 xl:top-[50%] xl:translate-y-[-50%] xl:left-[24px] xl:translate-x-0">
        <div
          ref={tabsRef}
          className="relative flex gap-[15px]"
          role="group"
          aria-label="Gallery view"
        >
          <button
            ref={gridTabRef}
            type="button"
            className={cn(
              'min-h-[24px] cursor-pointer pb-[2px] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2',
              {
                'translate-y-[-4px]': view === 'grid',
              }
            )}
            onClick={() => setView('grid')}
            aria-pressed={view === 'grid'}
          >
            Grid
          </button>
          <button
            ref={listTabRef}
            type="button"
            className={cn(
              'min-h-[24px] cursor-pointer pb-[2px] transition-transform focus-visible:outline-2 focus-visible:outline-offset-2',
              {
                'translate-y-[-4px]': view === 'list',
              }
            )}
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
          >
            List
          </button>
          <motion.div
            className="absolute bottom-0 h-px bg-black"
            initial={false}
            animate={tabUnderline}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 36,
              mass: 0.2,
            }}
          />
        </div>
      </div>

      <AnimatePresence
        initial={false}
        mode="sync"
        onExitComplete={() => galleryScrollRef.current?.scrollTo({ top: 0 })}
      >
        <motion.div
          key={view}
          className="col-start-1 col-span-full row-start-1 grid grid-cols-24 min-h-full"
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={
            reduceMotion
              ? { opacity: 1, transition: { duration: 0 } }
              : {
                  opacity: 0,
                  transition: {
                    duration: 0.16,
                    ease: [0.4, 0, 1, 1],
                  },
                }
          }
          transition={{
            duration: reduceMotion ? 0 : 0.24,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {view === 'list' ? (
            <>
              <GalleryList
                items={projects}
                archiveCount={archiveCount}
                onHoverProject={(project) =>
                  setListViewSelectedProject(project)
                }
                onClick={handleLightBoxOpen}
              />
              <div className="col-start-12 col-span-13 h-full xl:flex hidden min-h-0">
                <GalleryListView project={listViewSelectedProject} />
              </div>
            </>
          ) : (
            <GalleryGridView
              items={allImages}
              projects={projects}
              selectedProject={selectedProject}
              onHoverProject={setSelectedProject}
              onClick={handleLightBoxOpen}
              selectActualPhoto={setActualPhoto}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {lightBoxOpen && (
        <LightBox
          close={() => setLightBoxOpen(false)}
          title={listViewSelectedProject?.title || ''}
        >
          <Project
            actualPhoto={actualPhoto}
            project={listViewSelectedProject as unknown as ProjectType}
          />
        </LightBox>
      )}
    </div>
  );
};
