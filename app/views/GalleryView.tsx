/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client';

import { Project as ProjectType } from '@/types';
import { cn, collectAllImages } from '@/utils';
import { motion } from 'framer-motion';
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
  const { isMobile } = useBreakpoint();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [lightBoxOpen, setLightBoxOpen] = useState(false);
  const [listViewSelectedProject, setListViewSelectedProject] =
    useState<ProjectType | null>(projects[0]);
  const [actualPhoto, setActualPhoto] = useState<string | null>(null);
  const allImages = collectAllImages(projects);

  // console.log('projects at gallery view:', projects)

  useScrollToTop();

  const mobileTabsWrapRef = useRef<HTMLDivElement | null>(null);
  const mobileGridRef = useRef<HTMLDivElement | null>(null);
  const mobileListRef = useRef<HTMLDivElement | null>(null);
  const [mobileUnderline, setMobileUnderline] = useState({ left: 0, width: 0 });
  const measureMobile = useCallback(() => {
    const wrap = mobileTabsWrapRef.current;
    const active =
      view === 'grid' ? mobileGridRef.current : mobileListRef.current;
    if (!wrap || !active) return;
    const wr = wrap.getBoundingClientRect();
    const ar = active.getBoundingClientRect();
    const left = ar.left - wr.left;
    const width = ar.width;
    setMobileUnderline((prev) =>
      prev.left === left && prev.width === width ? prev : { left, width }
    );
  }, [view]);
  useLayoutEffect(() => {
    measureMobile();
  }, [measureMobile]);
  useEffect(() => {
    const onResize = () => measureMobile();
    window.addEventListener('resize', onResize);
    const id = window.requestAnimationFrame(measureMobile);
    const ro = mobileTabsWrapRef.current
      ? new ResizeObserver(() => measureMobile())
      : null;
    if (mobileTabsWrapRef.current && ro) ro.observe(mobileTabsWrapRef.current);
    // after fonts load — recalc
    // @ts-ignore
    if (document?.fonts?.ready) {
      // @ts-ignore
      document.fonts.ready.then(() => measureMobile()).catch(() => {});
    }
    return () => {
      window.removeEventListener('resize', onResize);
      window.cancelAnimationFrame(id);
      if (ro && mobileTabsWrapRef.current) ro.disconnect();
    };
  }, [measureMobile]);

  // underline (desktop)
  const deskTabsWrapRef = useRef<HTMLDivElement | null>(null);
  const deskGridRef = useRef<HTMLDivElement | null>(null);
  const deskListRef = useRef<HTMLDivElement | null>(null);
  const [deskUnderline, setDeskUnderline] = useState({ left: 0, width: 0 });
  const measureDesk = () => {
    const wrap = deskTabsWrapRef.current;
    const active = view === 'grid' ? deskGridRef.current : deskListRef.current;
    if (!wrap || !active) return;
    const wr = wrap.getBoundingClientRect();
    const ar = active.getBoundingClientRect();
    const left = ar.left - wr.left;
    const width = ar.width;
    setDeskUnderline((prev) =>
      prev.left === left && prev.width === width ? prev : { left, width }
    );
  };
  useLayoutEffect(() => {
    measureDesk();
  }, [view]);
  useEffect(() => {
    const onResize = () => measureDesk();
    window.addEventListener('resize', onResize);
    const id = window.requestAnimationFrame(measureDesk);
    return () => {
      window.removeEventListener('resize', onResize);
      window.cancelAnimationFrame(id);
    };
  }, []);

  const handleLightBoxOpen = (project: ProjectType) => {
    setLightBoxOpen(!lightBoxOpen);

    if (project) {
      setListViewSelectedProject(
        projects.find((p) => p._id === project._id) as ProjectType
      );
    }
  };

  if (isMobile)
    return (
      <div className="pt-[83px] xl:hidden h-[100dvh] w-full text-[12px] text-primary-dark px-[20px] pb-[40px]">
        {/* MOBILE VIEW SWITCH — full-width white bar tight under mobile menu */}
        <div className="fixed z-[2] top-[40px] left-0 right-0 bg-white">
          <div
            ref={mobileTabsWrapRef}
            className="relative flex justify-center gap-[15px] py-[10px]"
          >
            <div
              ref={mobileGridRef}
              className={cn('cursor-pointer transition-transform', {
                'translate-y-[-4px]': view === 'grid',
              })}
              onClick={() => setView('grid')}
            >
              Grid
            </div>
            <div
              ref={mobileListRef}
              className={cn('cursor-pointer transition-transform', {
                'translate-y-[-4px]': view === 'list',
              })}
              onClick={() => setView('list')}
            >
              List
            </div>
            <motion.div
              className="absolute h-[1px] bg-black"
              style={{ bottom: 8 }}
              initial={false}
              animate={{
                left: mobileUnderline.left,
                width: mobileUnderline.width,
              }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 36,
                mass: 0.2,
              }}
            />
          </div>
        </div>

        {view === 'list' && (
          <GalleryList
            items={projects}
            archiveCount={archiveCount}
            onHoverProject={(project) => setListViewSelectedProject(project)}
            onClick={handleLightBoxOpen}
          />
        )}

        {view === 'grid' && (
          <GalleryGridViewMobile
            items={allImages}
            projects={projects}
            selectedProject={selectedProject}
            onClick={handleLightBoxOpen}
            selectActualPhoto={setActualPhoto}
          />
        )}

        {lightBoxOpen && (
          <LightBox
            close={() => setLightBoxOpen(false)}
            title={listViewSelectedProject?.title || ''}
          >
            <ProjectMobile
              actualPhoto={actualPhoto}
              project={listViewSelectedProject as unknown as ProjectType}
              showIndicator={true}
              showBottomTitle={false}
            />
          </LightBox>
        )}
      </div>
    );

  return (
    <div className="hidden sm:grid grid-cols-24 w-full h-full text-[12px] text-primary-dark p-[24px] ">
      <div className="hidden fixed z-[2] sm:block sm:top-[50px] sm:left-1/2 sm:-translate-x-1/2 xl:top-[50%] xl:translate-y-[-50%] xl:left-[24px] xl:translate-x-0">
        <div ref={deskTabsWrapRef} className="relative flex gap-[15px]">
          <div
            ref={deskGridRef}
            className={cn('cursor-pointer transition-transform', {
              'translate-y-[-4px]': view === 'grid',
            })}
            onClick={() => setView('grid')}
          >
            Grid
          </div>
          <div
            ref={deskListRef}
            className={cn('cursor-pointer transition-transform', {
              'translate-y-[-4px]': view === 'list',
            })}
            onClick={() => setView('list')}
          >
            List
          </div>
          <motion.div
            className="absolute h-[1px] bg-black"
            style={{ bottom: -2 }}
            initial={false}
            animate={{ left: deskUnderline.left, width: deskUnderline.width }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 36,
              mass: 0.2,
            }}
          />
        </div>
      </div>

      {view === 'list' && (
        <GalleryList
          items={projects}
          archiveCount={archiveCount}
          onHoverProject={(project) => setListViewSelectedProject(project)}
          onClick={handleLightBoxOpen}
        />
      )}

      {view === 'grid' && (
        <GalleryGridView
          items={allImages}
          projects={projects}
          selectedProject={selectedProject}
          onHoverProject={setSelectedProject}
          onClick={handleLightBoxOpen}
          selectActualPhoto={setActualPhoto}
        />
      )}

      {view === 'list' && (
        <div className="col-start-12 col-span-13 h-full xl:flex hidden min-h-0">
          <GalleryListView project={listViewSelectedProject} />
        </div>
      )}

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
