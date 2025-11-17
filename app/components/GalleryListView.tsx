'use client';

import { urlFor } from '@/sanity/lib/image';
import type { Project, ProjectImage } from '@/types';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import Image from 'next/image';

const getRef = (img?: ProjectImage | null) => img?.asset?._ref;
const toSource = (img: ProjectImage): SanityImageSource =>
  img as unknown as SanityImageSource;
const src = (img: ProjectImage) => urlFor(toSource(img)).width(1600).url();
const alt = (project?: Project | null, img?: ProjectImage | null) =>
  (img?.alt && img.alt.trim()) || project?.title || 'Project image';

export function GalleryListView({ project }: { project: Project | null }) {
  const mode = project?.galleryListMode as 'single' | 'double' | undefined;
  const manual: ProjectImage[] = (project?.galleryListImages ?? []).filter(
    Boolean
  ) as ProjectImage[];

  // Якщо є валідний ручний вибір — рендеримо
  if (mode === 'single' && manual.length === 1 && getRef(manual[0])) {
    const img = manual[0]!;
    return (
      <div className="relative w-full h-full overflow-hidden">
        <Image
          fill
          src={src(img)}
          alt={alt(project, img)}
          sizes="(max-width:768px) 100vw, 33vw"
          placeholder={img.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={img.blurDataURL}
          className="object-contain object-right"
          loading="lazy"
        />
      </div>
    );
  }

  if (
    mode === 'double' &&
    manual.length === 2 &&
    getRef(manual[0]) &&
    getRef(manual[1])
  ) {
    return (
      <div className="relative flex h-full w-full flex-col gap-[24px]">
        {manual.map((img, i) => (
          <div
            key={getRef(img) ?? i}
            className="relative w-full overflow-hidden"
            style={{ height: 'calc((100% - 24px) / 2)' }}
          >
            <Image
              fill
              src={src(img)}
              alt={alt(project, img)}
              sizes="(max-width:768px) 100vw, 33vw"
              placeholder={img.blurDataURL ? 'blur' : 'empty'}
              blurDataURL={img.blurDataURL}
              className="object-contain object-right"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    );
  }

  // Фолбек — якщо немає валідних даних: показуємо діагностику JSON
  return (
    <div className="h-full w-full overflow-auto p-[12px] text-[12px] leading-[1.4]">
      {/* <div className="mb-[8px] font-semibold">GalleryListView debug</div> */}
      {/* <pre className="whitespace-pre-wrap break-words">
        {JSON.stringify(
          {
            galleryListMode: project?.galleryListMode,
            galleryListImages: (project?.galleryListImages ?? []).map(
              (i: ProjectImage) => ({
                _ref: i?.asset?._ref,
                alt: i?.alt ?? '',
                width: i?.width,
                height: i?.height,
              })
            ),
            title: project?.title,
            _id: project?._id,
          },
          null,
          2
        )}
      </pre> */}
    </div>
  );
}
