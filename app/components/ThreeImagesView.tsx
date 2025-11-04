/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { urlFor, sanityLoader } from '@/sanity/lib/image'
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
    const r = w / h
    const near = (x: number, y: number, eps = 0.03) => Math.abs(x - y) < eps
    if (near(r, 3 / 2)) return '3:2'
    if (near(r, 4 / 5)) return '4:5'
    if (near(r, 5 / 4)) return '5:4'
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
        aAspect: 'aspect-[3/2]', bAspect: 'aspect-[3/2]', cAspect: 'aspect-[3/2]',
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

export function ThreeImagesView({ images }: { images: ProjectImage[] }) {
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

    return (
        <section className="w-screen h-screen px-[24px]">
            {/* 24-колонки; центр: 4..21 (18 колонок), 3×6; вертикально по центру */}
            <div className="grid grid-cols-24 h-full content-center items-center">
                <div className="col-start-[4] col-end-[22] grid [grid-template-columns:repeat(18,minmax(0,1fr))] gap-x-[32px]">
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
                                        className="object-cover"
                                        loading="eager"
                                        decoding="async"
                                        fetchPriority="high"
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
                                        className="object-cover"
                                        loading="eager"
                                        decoding="async"
                                        fetchPriority="high"
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
                                        className="object-cover"
                                        loading="eager"
                                        decoding="async"
                                        fetchPriority="high"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
