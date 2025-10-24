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
    const photos =
        landscapes.length >= 2
            ? landscapes.slice(0, 2)
            : [landscapes[0] ?? first].filter(Boolean) as ProjectImage[];

    if (photos.length === 0) photos.push(first);

    return (
        <div className="relative flex h-full w-full flex-col gap-[24px]">
            {photos.map((img, i) => (
                <div key={getRef(img) ?? i} className="relative w-full flex-1 overflow-hidden">
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
