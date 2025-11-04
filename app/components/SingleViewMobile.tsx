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
const hasRatio = (x: unknown): x is WithRatio => !!x && isRatio((x as any).ratio)

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

export function SingleViewMobile({ image }: { image: ProjectImage }) {
    const src = image?.asset?._ref
        ? urlFor({ _type: 'image', asset: { _ref: image.asset._ref } }).url()
        : ''

    const ratio = getImageRatio(image) ?? '3:2'
    // перетворюємо '3:2' -> '3 / 2' для CSS aspect-ratio
    const cssAspect = ratio.replace(':', ' / ')

    return (
        <div className="px-[20px] grid grid-cols-8 h-[100dvh] w-screen content-center items-center auto-rows-max overflow-hidden">
            <div
                className="relative flex items-center justify-center col-span-full w-full overflow-hidden"
                style={{ aspectRatio: cssAspect }}
            >
                {src ? (
                    <Image
                        src={src}
                        alt={image?.alt || ''}
                        fill
                        sizes="(min-width:1280px) 60vw, (min-width:768px) 80vw, 100vw"
                        placeholder={image?.blurDataURL ? 'blur' : 'empty'}
                        blurDataURL={image?.blurDataURL}
                        className="object-cover"
                        priority
                    />
                ) : null}
            </div>
        </div>
    )
}
