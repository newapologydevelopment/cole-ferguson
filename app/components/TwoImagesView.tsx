/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { urlFor } from '@/sanity/lib/image'
import type { ProjectImage } from '@/types/project'
import Image from 'next/image'

type Ratio = '3:2' | '4:5' | '5:4'

const isRatio = (v: unknown): v is Ratio =>
    v === '3:2' || v === '4:5' || v === '5:4'

type WithWH = { width?: number | null; height?: number | null }
const hasWH = (x: unknown): x is WithWH =>
    !!x &&
    typeof (x as any).width === 'number' &&
    typeof (x as any).height === 'number'

type WithRatio = { ratio?: Ratio }
const hasRatio = (x: unknown): x is WithRatio =>
    !!x && isRatio((x as any).ratio)

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

const LAYOUT = {
    '3:2|3:2': {
        a: 'col-span-8 col-start-5',
        b: 'col-span-8',
        aAspect: 'aspect-[3/2]',
        bAspect: 'aspect-[3/2]',
    },
    '4:5|4:5': {
        a: 'col-span-6 col-start-7',
        b: 'col-span-6',
        aAspect: 'aspect-[4/5]',
        bAspect: 'aspect-[4/5]',
    },
    '5:4|5:4': {
        a: 'col-span-8 col-start-5',
        b: 'col-span-8',
        aAspect: 'aspect-[5/4]',
        bAspect: 'aspect-[5/4]',
    },
} as const

type LayoutKey = keyof typeof LAYOUT
const FALLBACK_KEY: LayoutKey = '3:2|3:2'

const isLayoutKey = (s: string): s is LayoutKey => s in LAYOUT

export function TwoImagesView({ images }: { images: ProjectImage[] }) {
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
    if (ra && rb && ra === rb) {
        const k = `${ra}|${rb}`
        if (isLayoutKey(k)) key = k
    }

    const { a: aCls, b: bCls, aAspect, bAspect } = LAYOUT[key]

    return (
        <div className="px-[24px] grid grid-cols-24 h-screen w-screen content-center items-center auto-rows-max">
            {/* A */}
            <div className={`relative flex items-center justify-center ${aCls} ${aAspect}`}>
                {srcA ? (
                    <Image
                        src={srcA}
                        alt={a?.alt || ''}
                        fill
                        sizes="(min-width:1280px) 42vw, (min-width:768px) 50vw, 100vw"
                        placeholder={a?.blurDataURL ? 'blur' : 'empty'}
                        blurDataURL={a?.blurDataURL}
                        className="object-cover"
                        priority
                    />
                ) : null}
            </div>

            <div className="w-[60px]" />

            {/* B */}
            <div className={`relative flex items-center justify-center ${bCls} ${bAspect}`}>
                {srcB ? (
                    <Image
                        src={srcB}
                        alt={b?.alt || ''}
                        fill
                        sizes="(min-width:1280px) 42vw, (min-width:768px) 50vw, 100vw"
                        placeholder={b?.blurDataURL ? 'blur' : 'empty'}
                        blurDataURL={b?.blurDataURL}
                        className="object-cover"
                    />
                ) : null}
            </div>
        </div>
    )
}
