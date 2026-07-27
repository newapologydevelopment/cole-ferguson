'use client';

import { urlFor } from '@/sanity/lib/image';
import type { Project, ProjectImage } from '@/types';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import type React from 'react';
import { PortfolioSanityImage } from './PortfolioSanityImage';

const getRef = (img?: ProjectImage | null) => img?.asset?._ref;
const toSource = (img: ProjectImage): SanityImageSource =>
  img as unknown as SanityImageSource;
const buildSrc = (img: ProjectImage) => urlFor(toSource(img)).url();

const alt = (project?: Project | null, img?: ProjectImage | null) =>
  (img?.alt && img.alt.trim()) || project?.title || 'Project image';

type Mode = 'single' | 'double' | undefined;

export function GalleryListView({ project }: { project: Project | null }) {
  const mode = project?.galleryListMode as Mode;
  const manual: ProjectImage[] = (project?.galleryListImages ?? []).filter(
    Boolean
  ) as ProjectImage[];

  const renderImage = (
    img: ProjectImage,
    index: number,
    style?: React.CSSProperties,
    sizes = '(min-width:1280px) 54vw, (min-width:768px) 50vw, 100vw'
  ) => {
    const width = img.width ?? 1600;
    const height = img.height ?? 1000;

    return (
      <div
        key={getRef(img) ?? index}
        className="relative flex w-full items-center justify-end overflow-hidden"
        style={style}
      >
        <PortfolioSanityImage
          src={buildSrc(img)}
          alt={alt(project, img)}
          width={width}
          height={height}
          sizes={sizes}
          sourceWidth={img.width}
          placeholder={img.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={img.blurDataURL}
          decoding="async"
          className="h-full w-auto object-contain object-right"
          loading="eager"
          fetchPriority="high"
        />
      </div>
    );
  };

  // single — одна фотка, займає всю висоту правої колонки
  if (mode === 'single' && manual.length === 1 && getRef(manual[0])) {
    const img = manual[0]!;

    return (
      <div className="flex h-full w-full items-center justify-end min-h-0">
        {renderImage(img, 0, { height: '100%' })}
      </div>
    );
  }

  // double — дві фотки, вся висота колонки, gap 24px,
  // кожна фотка має рівно (100% - 24px) / 2 по висоті
  if (
    mode === 'double' &&
    manual.length === 2 &&
    getRef(manual[0]) &&
    getRef(manual[1])
  ) {
    return (
      <div className="flex h-full w-full flex-col gap-[24px] min-h-0">
        {manual.map((img, i) =>
          renderImage(
            img,
            i,
            { height: 'calc((100% - 24px) / 2)' },
            '(min-width:1280px) 42vw, (min-width:768px) 42vw, 100vw'
          )
        )}
      </div>
    );
  }

  // фолбек — порожній стан
  return (
    <div className="h-full w-full min-h-0 text-[12px] leading-[1.4] text-neutral-500">
      {/* no gallery list images configured */}
    </div>
  );
}
