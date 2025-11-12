/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { sanityLoader, urlFor } from '@/sanity/lib/image'
import type { ProjectImage } from '@/types/project'
import Image from 'next/image'

type Ratio = '3:2' | '4:5' | '5:4' | '2:3'

const isRatio = (v: unknown): v is Ratio =>
    v === '3:2' || v === '4:5' || v === '5:4' || v === '2:3'

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
    if (near(r, 2 / 3)) return '2:3'
    return null
}

function getImageRatio(img: unknown): Ratio | null {
    if (hasRatio(img) && img.ratio) return img.ratio
    if (hasWH(img)) return detectRatio(img.width, img.height)
    return null
}

const LAYOUT = {
    '3:2|3:2': { a: 'col-span-9 col-start-4', b: 'col-span-9', shift: '-translate-x-[30px]' },
    '5:4|5:4': { a: 'col-span-9 col-start-4', b: 'col-span-9', shift: '-translate-x-[30px]' },
    '4:5|4:5': { a: 'col-span-6 col-start-7', b: 'col-span-6', shift: '-translate-x-[30px]' },
    '2:3|2:3': { a: 'col-span-6 col-start-7', b: 'col-span-6', shift: '-translate-x-[30px]' },
    '4:5|5:4': { a: 'col-span-6 col-start-5', b: 'col-span-9', shift: 'translate-x-[0px]' },
    '5:4|4:5': { a: 'col-span-9 col-start-5', b: 'col-span-6', shift: '-translate-x-[0px]' },
    '2:3|3:2': { a: 'col-span-6 col-start-5', b: 'col-span-9', shift: '-translate-x-[0px]' },
    '3:2|2:3': { a: 'col-span-9 col-start-5', b: 'col-span-6', shift: '-translate-x-[0px]' },
};

type LayoutKey = keyof typeof LAYOUT
const FALLBACK_KEY: LayoutKey = '3:2|3:2'
const isLayoutKey = (s: string): s is LayoutKey => s in LAYOUT

const ASPECT_BY_RATIO: Record<Ratio, string> = {
    '3:2': 'aspect-[3/2]',
    '4:5': 'aspect-[4/5]',
    '5:4': 'aspect-[5/4]',
    '2:3': 'aspect-[2/3]',
}

const PAIR_H = 'h-[clamp(360px,60vh,820px)]'

export function TwoImagesView({ images }: { images: ProjectImage[] }) {
    const showRatio = !true;
    
    const [a, b] = images ?? []

    const srcA = a?.asset?._ref
        ? urlFor({ _type: 'image', asset: { _ref: a.asset._ref } }).url()
        : ''
    const srcB = b?.asset?._ref
        ? urlFor({ _type: 'image', asset: { _ref: b.asset._ref } }).url()
        : ''

    const ra = getImageRatio(a)
    const rb = getImageRatio(b)

    let key: LayoutKey = FALLBACK_KEY
    if (ra && rb) {
        const k1 = `${ra}|${rb}`
        if (isLayoutKey(k1)) key = k1 as LayoutKey
        else {
            const k2 = `${rb}|${ra}`
            if (isLayoutKey(k2)) key = k2 as LayoutKey
        }
    }

    const { a: aCls, b: bCls, shift } = LAYOUT[key];
    const isMixed = !!(ra && rb && ra !== rb)

    const aAspect = !isMixed && ra ? ASPECT_BY_RATIO[ra] : ''
    const bAspect = !isMixed && rb ? ASPECT_BY_RATIO[rb] : ''

    const aHeight = isMixed ? PAIR_H : ''
    const bHeight = isMixed ? PAIR_H : ''

    return (
        <div className="px-[24px] grid grid-cols-24 w-screen md:min-h-screen content-center items-center">
            {/* A */}
            <div className={`relative min-w-0 ${aCls} ${aAspect} ${aHeight} ${shift || ''}`}>
                {srcA && (
                    <Image
                        loader={sanityLoader}
                        key={a?.asset?._ref || 'two-a'}
                        src={srcA}
                        alt={a?.alt || ''}
                        fill
                        sizes="(min-width:1280px) 42vw, (min-width:768px) 48vw, 100vw"
                        placeholder={a?.blurDataURL ? 'blur' : 'empty'}
                        blurDataURL={a?.blurDataURL}
                        className="object-contain"
                        priority
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                    />
                )}
            </div>

            <div className="w-[60px]" />

            {/* B */}
            <div className={`relative min-w-0 ${bCls} ${bAspect} ${bHeight} ${shift || ''}`}>
                {srcB && (
                    <Image
                        loader={sanityLoader}
                        key={b?.asset?._ref || 'two-b'}
                        src={srcB}
                        alt={b?.alt || ''}
                        fill
                        sizes="(min-width:1280px) 42vw, (min-width:768px) 48vw, 100vw"
                        placeholder={b?.blurDataURL ? 'blur' : 'empty'}
                        blurDataURL={b?.blurDataURL}
                        className="object-contain"
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                    />
                )}
            </div>
            {showRatio && <div className='absolute bottom-20 right-20 bg-pink-200 text-[40px]'>{`ra: ${ra}, rb: ${rb}`}</div>}
        </div>
    )
}
