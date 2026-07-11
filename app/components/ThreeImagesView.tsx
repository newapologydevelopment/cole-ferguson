/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { sanityLoader, urlFor } from '@/sanity/lib/image'
import type { ProjectImage } from '@/types/project'
import Image from 'next/image'

type Ratio = '3:2' | '4:5' | '5:4'
const isRatio = (v: unknown): v is Ratio => v === '3:2' || v === '4:5' || v === '5:4'

type WithWH = { width?: number | null; height?: number | null }
const hasWH = (x: unknown): x is WithWH =>
    !!x && typeof (x as any).width === 'number' && typeof (x as any).height === 'number'

type WithRatio = { ratio?: Ratio }
const hasRatio = (x: unknown): x is WithRatio => !!x && isRatio((x as any).ratio)

function detectRatio(w?: number | null, h?: number | null): Ratio | null {
    if (!w || !h) return null

    const rWH = w / h       // width / height
    const rHW = h / w       // height / width
    const near = (x: number, y: number, eps = 0.03) => Math.abs(x - y) < eps

    // 3:2 — неважливо, горизонт чи вертикаль, повертаємо просто '3:2'
    if (near(rWH, 3 / 2) || near(rHW, 3 / 2)) return '3:2'

    // 4:5
    if (near(rWH, 4 / 5) || near(rHW, 4 / 5)) return '4:5'

    // 5:4
    if (near(rWH, 5 / 4) || near(rHW, 5 / 4)) return '5:4'

    return null
}

function getImageRatio(img: unknown): Ratio | null {
    if (hasRatio(img) && img.ratio) return img.ratio
    if (hasWH(img)) return detectRatio(img.width, img.height)
    return null
}

// ——— Конфіг для трьох фото (однакове ратіо) ———
const LAYOUT3 = {
    '3:2|3:2|3:2': {
        a: 'col-span-6', b: 'col-span-6', c: 'col-span-6',
        aAspect: 'aspect-[4/5]', bAspect: 'aspect-[4/5]', cAspect: 'aspect-[4/5]',
    },
    '4:5|4:5|4:5': {
        a: 'col-span-6', b: 'col-span-6', c: 'col-span-6',
        aAspect: 'aspect-[4/5]', bAspect: 'aspect-[4/5]', cAspect: 'aspect-[4/5]',
    },
    '5:4|5:4|5:4': {
        a: 'col-span-6', b: 'col-span-6', c: 'col-span-6',
        aAspect: 'aspect-[5/4]', bAspect: 'aspect-[5/4]', cAspect: 'aspect-[5/4]',
    },
} as const

type LayoutKey3 = keyof typeof LAYOUT3
const FALLBACK_KEY_3: LayoutKey3 = '3:2|3:2|3:2'
const isLayoutKey3 = (s: string): s is LayoutKey3 => s in LAYOUT3

export function ThreeImagesView({ images, priority = true }: { images: ProjectImage[]; priority?: boolean }) {
    const showRatio = !true;
    const [a, b, c] = images ?? []

    const srcA = a?.asset?._ref ? urlFor({ _type: 'image', asset: { _ref: a.asset._ref } }).url() : ''
    const srcB = b?.asset?._ref ? urlFor({ _type: 'image', asset: { _ref: b.asset._ref } }).url() : ''
    const srcC = c?.asset?._ref ? urlFor({ _type: 'image', asset: { _ref: c.asset._ref } }).url() : ''

    const ra = getImageRatio(a)
    const rb = getImageRatio(b)
    const rc = getImageRatio(c)

    let key: LayoutKey3 = FALLBACK_KEY_3
    if (ra && rb && rc && ra === rb && rb === rc) {
        const k = `${ra}|${rb}|${rc}`
        if (isLayoutKey3(k)) key = k
    }

    const { a: aCls, b: bCls, c: cCls, aAspect, bAspect, cAspect } = LAYOUT3[key]
    const gapClass = key === '4:5|4:5|4:5' ? 'gap-x-[60px]' : 'gap-x-[0px]'

    return (
        <section className="w-screen h-screen px-[24px]">
            {/* 24-колонки; центр: 4..21 (18 колонок), 3×6; вертикально по центру */}
            <div className="grid grid-cols-24 h-full content-center items-center">
                <div className={`col-start-[4] col-end-[22] grid [grid-template-columns:repeat(18,minmax(0,1fr))] ${gapClass}`}>
                    {/* A */}
                    {a && (
                        <div className={aCls}>
                            <div className={`relative w-full overflow-hidden ${aAspect}`}>
                                {srcA && (
                                    <Image
                                        loader={sanityLoader}
                                        key={a?.asset?._ref || 'three-a'}
                                        src={srcA}
                                        alt={a.alt || ''}
                                        fill
                                        sizes="(min-width:1280px) 28vw, (min-width:768px) 33vw, 100vw"
                                        placeholder={a.blurDataURL ? 'blur' : 'empty'}
                                        blurDataURL={a.blurDataURL}
                                        className="object-contain"
                                        priority={priority}
                                        loading={priority ? 'eager' : 'lazy'}
                                        decoding="async"
                                        fetchPriority={priority ? 'high' : 'low'}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* B */}
                    {b && (
                        <div className={bCls}>
                            <div className={`relative w-full overflow-hidden ${bAspect}`}>
                                {srcB && (
                                    <Image
                                        loader={sanityLoader}
                                        key={b?.asset?._ref || 'three-b'}
                                        src={srcB}
                                        alt={b.alt || ''}
                                        fill
                                        sizes="(min-width:1280px) 28vw, (min-width:768px) 33vw, 100vw"
                                        placeholder={b.blurDataURL ? 'blur' : 'empty'}
                                        blurDataURL={b.blurDataURL}
                                        className="object-contain"
                                        priority={priority}
                                        loading={priority ? 'eager' : 'lazy'}
                                        decoding="async"
                                        fetchPriority={priority ? 'high' : 'low'}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* C */}
                    {c && (
                        <div className={cCls}>
                            <div className={`relative w-full overflow-hidden ${cAspect}`}>
                                {srcC && (
                                    <Image
                                        loader={sanityLoader}
                                        key={c?.asset?._ref || 'three-c'}
                                        src={srcC}
                                        alt={c.alt || ''}
                                        fill
                                        sizes="(min-width:1280px) 28vw, (min-width:768px) 33vw, 100vw"
                                        placeholder={c.blurDataURL ? 'blur' : 'empty'}
                                        blurDataURL={c.blurDataURL}
                                        className="object-contain"
                                        priority={priority}
                                        loading={priority ? 'eager' : 'lazy'}
                                        decoding="async"
                                        fetchPriority={priority ? 'high' : 'low'}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {showRatio && <div className='absolute bottom-20 right-20 bg-pink-200 text-[40px]'>{`${ra} | ${rb} | ${rc}`}</div>}
        </section>
    )
}
