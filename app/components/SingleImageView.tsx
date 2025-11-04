/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { urlFor } from '@/sanity/lib/image'
import type { ProjectImage } from '@/types/project'
import Image from 'next/image'

type Ratio = '16:10' | '5:4' | '4:5' | '3:2' | '2:3' | '1:1'

const isRatio = (v: unknown): v is Ratio =>
    v === '16:10' || v === '5:4' || v === '4:5' || v === '3:2' || v === '2:3' || v === '1:1'

type WithWH = { width?: number | null; height?: number | null }
const hasWH = (x: unknown): x is WithWH =>
    !!x && typeof (x as any).width === 'number' && typeof (x as any).height === 'number'

type WithRatio = { ratio?: Ratio }
const hasRatio = (x: unknown): x is WithRatio =>
    !!x && isRatio((x as any).ratio)

function detectRatio(w?: number | null, h?: number | null): Ratio | null {
    if (!w || !h) return null
    const r = w / h
    const near = (x: number, y: number, eps = 0.03) => Math.abs(x - y) < eps
    if (near(r, 16 / 10)) return '16:10'
    if (near(r, 5 / 4)) return '5:4'
    if (near(r, 4 / 5)) return '4:5'
    if (near(r, 3 / 2)) return '3:2'
    if (near(r, 2 / 3)) return '2:3'
    if (near(r, 1 / 1)) return '1:1'
    return null
}

function getImageRatio(img: unknown): Ratio | null {
    if (hasRatio(img) && img.ratio) return img.ratio
    if (hasWH(img)) return detectRatio(img.width, img.height)
    return null
}

const SINGLE_LAYOUT = {
    '16:10': { wrap: 'col-span-14 col-start-6', aspect: 'aspect-[16/10]' },
    '5:4': { wrap: 'col-span-12 col-start-7', aspect: 'aspect-[5/4]', shift: 'translate-y-[60px]' },
    '4:5': { wrap: 'col-span-9 col-start-8', aspect: 'aspect-[4/5]' },
    '3:2': { wrap: 'col-span-14 col-start-6', aspect: 'aspect-[3/2]' },
    '2:3': { wrap: 'col-span-8 col-start-9', aspect: 'aspect-[2/3]' },
    '1:1': { wrap: 'col-span-10 col-start-8', aspect: 'aspect-[1/1]' },
} as const

type LayoutKey = keyof typeof SINGLE_LAYOUT
const FALLBACK: LayoutKey = '3:2'

export function SingleImageView({ image }: { image: ProjectImage }) {
    const src = image?.asset?._ref
        ? urlFor({ _type: 'image', asset: { _ref: image.asset._ref } }).url()
        : ''

    const ratio = getImageRatio(image) ?? FALLBACK
    const { wrap, aspect } = SINGLE_LAYOUT[ratio]

    return (
        <div className="px-[24px] grid grid-cols-24 h-screen w-screen content-center items-center auto-rows-max">
            <div className={`relative flex items-center justify-center ${wrap} ${aspect} translate-x-[30px]`}>
                {src ? (
                    <Image
                        key={image?.asset?._ref || 'single'}
                        src={src}
                        alt={image?.alt || ''}
                        fill
                        sizes="(min-width:1280px) 60vw, (min-width:768px) 70vw, 100vw"
                        placeholder={image?.blurDataURL ? 'blur' : 'empty'}
                        blurDataURL={image?.blurDataURL}
                        className="object-cover"
                        priority
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                    />
                ) : null}
            </div>
        </div>
    )
}
