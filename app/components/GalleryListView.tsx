'use client';

import { urlFor } from "@/sanity/lib/image";
import type { Project, ProjectImage } from "@/types/project";
import Image from "next/image";

type Props = { project: Project | null };

const gatherImages = (p: Project | null): ProjectImage[] => {
    const fromViews = p?.views?.[0]?.images ?? [];
    const fromRoot = p?.images ?? [];
    // пріоритезуємо images з першого view, потім кореневі
    return [...fromViews, ...fromRoot].filter(Boolean) as ProjectImage[];
};

const isPortrait = (img?: ProjectImage | null) =>
    !!(img?.width && img?.height && img.height > img.width);

const isLandscape = (img?: ProjectImage | null) =>
    !!(img?.width && img?.height && img.width >= img.height);

export const GalleryListView = ({ project }: Props) => {
    const images = gatherImages(project);
    const first = images[0];
    if (!first) return null;

    const alt = (img?: ProjectImage | null) =>
        img?.alt || project?.title || "Project image";
    const src = (img: ProjectImage) => urlFor(img).width(1600).url();

    // 1) Перше фото — портрет: показуємо лише його
    if (isPortrait(first)) {
        return (
            <div className="relative w-full h-full">
                <Image
                    fill
                    src={src(first)}
                    alt={alt(first)}
                    sizes="(max-width:768px) 100vw, 33vw"
                    placeholder={first.blurDataURL ? "blur" : "empty"}
                    blurDataURL={first.blurDataURL}
                    className="object-cover"
                    loading="lazy"
                />
            </div>
        );
    }

    // 2) Перше — альбом: беремо ПЕРШІ ДВІ альбомні
    const landscapes = images.filter(isLandscape).slice(0, 2);

    // якщо з якихось причин знайшли тільки одну — покажемо одну
    if (landscapes.length <= 1) {
        const only = landscapes[0] ?? first;
        return (
            <div className="relative w-full h-full">
                <Image
                    fill
                    src={src(only)}
                    alt={alt(only)}
                    sizes="(max-width:768px) 100vw, 33vw"
                    placeholder={only.blurDataURL ? "blur" : "empty"}
                    blurDataURL={only.blurDataURL}
                    className="object-cover"
                    loading="lazy"
                />
            </div>
        );
    }

    // дві альбомні — як у макеті: два блоки, 24px між ними
    return (
        <div className="relative flex h-full w-full flex-col gap-[24px]">
            {landscapes.map((img, i) => (
                <div key={i} className="relative w-full flex-1">
                    <Image
                        fill
                        src={src(img)}
                        alt={alt(img)}
                        sizes="(max-width:768px) 100vw, 33vw"
                        placeholder={img.blurDataURL ? "blur" : "empty"}
                        blurDataURL={img.blurDataURL}
                        className="object-cover"
                        loading="lazy"
                    />
                </div>
            ))}
        </div>
    );
};
