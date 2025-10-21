/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import type { ArchiveProject as ArchiveProjectType } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import Image from 'next/image'
import { CursorLabel } from './CursorLabel'

type Ratio = '16:10' | '5:4' | '4:5' | '3:2' | '2:3' | '1:1'

const isRatio = (v: unknown): v is Ratio =>
    v === '16:10' || v === '5:4' || v === '4:5' || v === '3:2' || v === '2:3' || v === '1:1'

type WithWH = { width?: number | null; height?: number | null }
const hasWH = (x: unknown): x is WithWH =>
    !!x && typeof (x as any).width === 'number' && typeof (x as any).height === 'number'

type WithRatio = { ratio?: Ratio }
const hasRatio = (x: unknown): x is WithRatio => !!x && isRatio((x as any).ratio)

// Спроба взяти розміри з image або з метаданих Sanity (asset.metadata.dimensions)
function detectRatio(w?: number | null, h?: number | null): Ratio | null {
    if (!w || !h) return null
    const r = w / h
    const near = (x: number, y: number, eps = 0.03) => Math.abs(x - y) < eps
    if (near(r, 16 / 10)) return '16:10'
    if (near(r, 5 / 4)) return '5:4'
    if (near(r, 4 / 5)) return '4:5'
    if (near(r, 3 / 2)) return '3:2'
    if (near(r, 2 / 3)) return '2:3'
    if (near(r, 1)) return '1:1'
    return null
}

function getImageRatio(img: any): Ratio | null {
    if (!img) return null
    if (hasRatio(img) && img.ratio) return img.ratio
    if (hasWH(img)) return detectRatio(img.width, img.height)

    // Sanity: пробуємо дістати з asset.metadata.dimensions
    const w = img?.asset?.metadata?.dimensions?.width
    const h = img?.asset?.metadata?.dimensions?.height
    if (typeof w === 'number' && typeof h === 'number') return detectRatio(w, h)

    return null
}

const SINGLE_LAYOUT = {
    '16:10': { wrap: 'col-span-14 col-start-7', aspect: 'aspect-[16/10]' },
    '5:4': { wrap: 'col-span-12 col-start-7', aspect: 'aspect-[5/4]' },
    '4:5': { wrap: 'col-span-8 col-start-9', aspect: 'aspect-[4/5]' },
    '3:2': { wrap: 'col-span-14 col-start-6', aspect: 'aspect-[3/2]' },
    '2:3': { wrap: 'col-span-6 col-start-10', aspect: 'aspect-[2/3]' },
    '1:1': { wrap: 'col-span-10 col-start-8', aspect: 'aspect-[1/1]' },
} as const

type LayoutKey = keyof typeof SINGLE_LAYOUT
const FALLBACK: LayoutKey = '3:2'

interface Props {
    archiveProject: ArchiveProjectType
    onPrev: () => void
    onNext: () => void
}

export const ArchiveProject: React.FC<Props> = ({ archiveProject, onPrev, onNext }) => {
    const ratio = getImageRatio(archiveProject.image) ?? FALLBACK
    const { wrap, aspect } = SINGLE_LAYOUT[ratio]

    // даємо великий оригінал; next/image сам даунскейлить. width/height тут не потрібні, бо fill.
    const src = urlFor(archiveProject.image).url()

    return (
        <section className="relative w-full min-h-screen flex items-center">
            <div className="px-[24px] grid grid-cols-24 w-full items-center content-center gap-y-[55px]">
                {/* Враппер з аспектом */}
                <div className={`relative flex items-center justify-center ${wrap} ${aspect}`}>
                    {src && (
                        <Image
                            src={src}
                            alt={archiveProject.image?.alt || archiveProject.title}
                            fill
                            sizes="(min-width:1280px) 60vw, (min-width:768px) 80vw, 100vw"
                            placeholder={archiveProject.image?.blurDataURL ? 'blur' : 'empty'}
                            blurDataURL={archiveProject.image?.blurDataURL}
                            className="object-cover"
                            priority
                        />
                    )}
                </div>

                <div className="col-span-24 flex justify-center">
                    <h1 className="text-center">{archiveProject.title}</h1>
                </div>
            </div>

            {/* Click areas Prev/Next поверх усього */}
            <button
                type="button"
                aria-label="Previous"
                onClick={onPrev}
                className="absolute left-0 top-0 h-full w-1/2 cursor-none focus:outline-none"
                style={{ background: 'transparent' }}
            />
            <button
                type="button"
                aria-label="Next"
                onClick={onNext}
                className="absolute right-0 top-0 h-full w-1/2 cursor-none focus:outline-none next-btn"
                style={{ background: 'transparent' }}
            />
            <CursorLabel />
        </section>
    )
}
