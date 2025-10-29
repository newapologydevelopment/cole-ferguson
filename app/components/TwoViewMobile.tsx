
'use client'

import { urlFor } from '@/sanity/lib/image'
import type { ProjectImage } from '@/types/project'
import Image from 'next/image'

type Props = {
    images: ProjectImage[]
    className?: string
}

/**
 * Mobile TwoImagesView:
 * - 2 рівні рядки у межах 100dvh (по 50% кожен)
 * - фото по центру, збереження аспект-рейтіо (object-contain)
 * - падінги 20px, 8-колонкова сітка
 */
export function TwoViewMobile({ images, className }: Props) {
    const [a, b] = images ?? []

    const srcA = a?.asset?._ref ? urlFor({ _type: 'image', asset: { _ref: a.asset._ref } }).url() : ''
    const srcB = b?.asset?._ref ? urlFor({ _type: 'image', asset: { _ref: b.asset._ref } }).url() : ''

    return (
        <section className={`sm:hidden w-screen h-[100dvh] px-[20px] ${className ?? ''}`}>
            {/* 2 рівні зони по висоті екрана */}
            <div className="grid grid-cols-8 gap-x-[16px] h-full">
                {/* A */}
                <div className="relative col-span-4">
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                        {srcA && (
                            <Image
                                src={srcA}
                                alt={a?.alt || ''}
                                fill
                                className="object-contain"   // зберігає аспект-рейтіо, без кропу
                                sizes="(max-width: 768px) 100vw, 0px"
                                placeholder={a?.blurDataURL ? 'blur' : 'empty'}
                                blurDataURL={a?.blurDataURL}
                                priority
                            />
                        )}
                    </div>
                </div>

                {/* B */}
                <div className="relative col-span-4">
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                        {srcB && (
                            <Image
                                src={srcB}
                                alt={b?.alt || ''}
                                fill
                                className="object-contain"   // зберігає аспект-рейтіо, без кропу
                                sizes="(max-width: 768px) 100vw, 0px"
                                placeholder={b?.blurDataURL ? 'blur' : 'empty'}
                                blurDataURL={b?.blurDataURL}
                            />
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
