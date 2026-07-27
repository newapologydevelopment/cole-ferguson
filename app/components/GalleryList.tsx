'use client';

import { Project } from '@/types';
import { cn } from '@/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBreakpoint, useScrollToTop } from '../hooks';

export type GalleryListItem = { title: string; images: number };

type Props = {
  items: Project[];
  archiveCount: number;
  className?: string;
  onHoverProject?: (project: Project | null) => void;
  onClick?: (project: Project) => void;
};

export const GalleryList: React.FC<Props> = ({
  items,
  archiveCount,
  className,
  onHoverProject,
  onClick,
}) => {
  const { isMobile } = useBreakpoint();
  const router = useRouter();
  useScrollToTop();

  const allProjects = items.map((project) => {
    const allImages = project.views?.flatMap((v) => v.images) || [];
    return { ...project, imageCount: allImages.length };
  });

  if (isMobile)
    return (
      <>
        <div
          className={cn(
            'fixed right-[20px] top-[84px] left-[20px] col-span-full col-start-1 self-center min-h-0 h-[calc(100dvh-84px)] flex flex-col pb-[20px] hide-scrollbar',
            className
          )}
        >
          <div className="flex items-center justify-between mb-[30px] shrink-0">
            <p>All</p>
            <div>{allProjects.length}</div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar scroll-smooth">
            <div className="flex flex-col gap-[7px]">
              {allProjects.map((project, i) => (
                <button
                  type="button"
                  key={project.title + i}
                  className="flex w-full items-center justify-between cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2"
                  onClick={() => onClick?.(project as Project)}
                >
                  <div>{project.title}</div>
                  <div>{project.imageCount}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-[46px] h-[47px] bg-gradient-to-t from-white to-transparent z-[10001]" />
          <div className="relative z-[10002] flex items-center justify-between mt-[20px] shrink-0">
            <button
              type="button"
              className="cursor-pointer"
              onClick={() => router.push('/archive')}
            >
              Archive
            </button>
            <div>{archiveCount}</div>
          </div>
        </div>
      </>
    );

  return (
    <>
      <div
        className={cn(
          'relative col-span-8 xl:col-span-4 col-start-1 xl:col-start-3 self-center h-[60vh] min-h-0 hidden sm:flex flex-col',
          className
        )}
      >
        <div className="flex items-center justify-between mb-[30px] shrink-0">
          <p>All</p>
          <div>{allProjects.length}</div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-[32px] h-[47px] bg-gradient-to-b from-white to-transparent z-10" />

        <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar scroll-smooth relative">
          <div className="flex flex-col gap-[7px] pb-[32px]">
            {allProjects.map((project, i) => (
              <button
                type="button"
                key={project.title + i}
                className="flex w-full items-center justify-between cursor-pointer text-left hover:text-[#717171] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2"
                onMouseEnter={() => onHoverProject?.(project as Project)}
                onClick={() => onClick?.(project as Project)}
              >
                <div>{project.title}</div>
                <div>{project.imageCount}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-[32px] h-[47px] bg-gradient-to-t from-white to-transparent z-10" />
        <div className="flex items-center justify-between mt-[20px] shrink-0">
          <Link
            href="/archive"
            className="hover:text-[#717171] transition-colors duration-300"
          >
            Archive
          </Link>
          <div>{archiveCount}</div>
        </div>
      </div>
    </>
  );
};
