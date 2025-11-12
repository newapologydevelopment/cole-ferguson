/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { urlFor } from "@/sanity/lib/image";
import type { Project, ProjectImage } from "@/types/project";
import Image from "next/image";

type Props = { project: Project | null };

type Dims = { w: number; h: number } | null;

const getRef = (img?: ProjectImage | null) =>
    (img as any)?.asset?._ref as string | undefined;

const getDims = (img?: ProjectImage | null): Dims => {
    if (!img) return null;

    const w = Number((img as any).width);
    const h = Number((img as any).height);
    if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
        return { w, h };
    }

    const ref = getRef(img);
    if (ref) {
        const m = ref.match(/-(\d+)x(\d+)-/);
        if (m) {
            const rw = Number(m[1]);
            const rh = Number(m[2]);
            if (rw > 0 && rh > 0) return { w: rw, h: rh };
        }
    }

    return null;
};

const isPortrait = (img?: ProjectImage | null) => {
    const d = getDims(img);
    return !!(d && d.h > d.w);
};

const isLandscape = (img?: ProjectImage | null) => {
    const d = getDims(img);
    return !!(d && d.w >= d.h);
};

const getAspectRatio = (img?: ProjectImage | null): number | null => {
    const d = getDims(img);
    if (!d || d.h === 0) return null;
    return d.w / d.h;
};

const hasSameAspectRatio = (img1: ProjectImage, img2: ProjectImage, tolerance: number = 0.05): boolean => {
    const ratio1 = getAspectRatio(img1);
    const ratio2 = getAspectRatio(img2);
    if (ratio1 === null || ratio2 === null) return false;
    return Math.abs(ratio1 - ratio2) <= tolerance;
};


const gatherImages = (p: Project | null): ProjectImage[] => {
    if (!p) return [];
    const allViews = p.views ?? [];
    const firstView = allViews[0]?.images ?? [];
    const restViews = allViews.slice(1).flatMap(v => v?.images ?? []);
    const fromRoot = p.images ?? [];

    const getRef = (img?: ProjectImage | null) =>
        (img as any)?.asset?._ref as string | undefined;

    const isValid = (img?: ProjectImage | null): img is ProjectImage => !!(img && getRef(img));

    const uniqByRef = (arr: ProjectImage[]) => {
        const seen = new Set<string>();
        return arr.filter(img => {
            const r = getRef(img);
            if (!r || seen.has(r)) return false;
            seen.add(r);
            return true;
        });
    };

    return uniqByRef([...firstView, ...restViews, ...fromRoot].filter(isValid));
};

export const GalleryListView = ({ project }: Props) => {
    const images = gatherImages(project);
    const first = images[0];
    if (!first) return null;

    const alt = (img?: ProjectImage | null) =>
        img?.alt?.trim() || project?.title || "Project image";

    const src = (img: ProjectImage) => urlFor(img).width(1600).url();

    if (isPortrait(first)) {
        return (
            <div className="relative w-full h-full overflow-hidden">
                <Image
                    fill
                    src={src(first)}
                    alt={alt(first)}
                    sizes="(max-width:768px) 100vw, 33vw"
                    placeholder={first.blurDataURL ? "blur" : "empty"}
                    blurDataURL={first.blurDataURL}
                    className="object-contain object-right"
                    loading="lazy"
                />
            </div>
        );
    }

    const landscapes = images.filter(isLandscape);
    let photos: ProjectImage[];
    
    // Якщо є 2+ landscape фото - перевіряємо aspect ratio
    if (landscapes.length >= 2) {
        const firstTwo = landscapes.slice(0, 2);
        // Якщо aspect ratio однакові - показуємо обидва, інакше тільки перше
        if (hasSameAspectRatio(firstTwo[0], firstTwo[1])) {
            photos = firstTwo;
        } else {
            photos = [firstTwo[0]];
        }
    } else {
        // Якщо менше 2 landscape - показуємо тільки одне фото
        const firstPortrait = images.find(isPortrait);
        photos = firstPortrait ? [firstPortrait] : [landscapes[0] ?? first].filter(Boolean) as ProjectImage[];
        if (photos.length === 0) photos.push(first);
    }

    // Якщо одне фото - показуємо на весь простір
    if (photos.length === 1) {
        return (
            <div className="relative w-full h-full overflow-hidden">
                <Image
                    fill
                    src={src(photos[0])}
                    alt={alt(photos[0])}
                    sizes="(max-width:768px) 100vw, 33vw"
                    placeholder={photos[0].blurDataURL ? "blur" : "empty"}
                    blurDataURL={photos[0].blurDataURL}
                    className="object-contain object-right"
                    loading="lazy"
                />
            </div>
        );
    }

    // Якщо 2 фото - показуємо обидва з однаковою висотою (50% кожне)
    return (
        <div className="relative flex h-full w-full flex-col gap-[24px]">
            {photos.map((img, i) => (
                <div 
                    key={getRef(img) ?? i} 
                    className="relative w-full overflow-hidden"
                    style={{ height: 'calc((100% - 24px) / 2)' }}
                >
                    <Image
                        fill
                        src={src(img)}
                        alt={alt(img)}
                        sizes="(max-width:768px) 100vw, 33vw"
                        placeholder={img.blurDataURL ? "blur" : "empty"}
                        blurDataURL={img.blurDataURL}
                        className="object-contain object-right"
                        loading="lazy"
                    />
                </div>
            ))}
        </div>
    );
};
