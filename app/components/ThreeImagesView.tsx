'use client'

import { urlFor } from '@/sanity/lib/image'
import type { ProjectImage } from '@/types/project'
import Image from 'next/image'

export function ThreeImagesView({ images }: { images: ProjectImage[] }) {
    const [a, b, c] = images ?? []
    const srcA = a ? urlFor(a).url() : ''
    const srcB = b ? urlFor(b).url() : ''
    const srcC = c ? urlFor(c).url() : ''
    return (
        // 24‑колоночна сітка на всю ширину; внутрішня область 4..21 (18 колонок), 3×6 рівномірно по центру
        <section className="w-screen col-span-24 px-[24px]">
            <div className="grid w-full [grid-template-columns:repeat(24,minmax(0,1fr))] gap-x-[16px] md:gap-x-[32px]">
                <div className="grid col-start-[4] col-end-[22] [grid-template-columns:repeat(18,minmax(0,1fr))] gap-x-[16px] md:gap-x-[32px]">
                    {a && (
                        <div className="col-span-6">
                            <div className="relative w-full overflow-hidden" style={{ height: '420px' }}>
                                <Image
                                    src={srcA}
                                    alt={a.alt || ''}
                                    fill
                                    sizes="(min-width:1280px) 28vw, (min-width:768px) 33vw, 100vw"
                                    placeholder={a.blurDataURL ? 'blur' : 'empty'}
                                    blurDataURL={a.blurDataURL}
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    )}
                    {b && (
                        <div className="col-span-6">
                            <div className="relative w-full overflow-hidden" style={{ height: '420px' }}>
                                <Image
                                    src={srcB}
                                    alt={b.alt || ''}
                                    fill
                                    sizes="(min-width:1280px) 28vw, (min-width:768px) 33vw, 100vw"
                                    placeholder={b.blurDataURL ? 'blur' : 'empty'}
                                    blurDataURL={b.blurDataURL}
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    )}
                    {c && (
                        <div className="col-span-6">
                            <div className="relative w-full overflow-hidden" style={{ height: '420px' }}>
                                <Image
                                    src={srcC}
                                    alt={c.alt || ''}
                                    fill
                                    sizes="(min-width:1280px) 28vw, (min-width:768px) 33vw, 100vw"
                                    placeholder={c.blurDataURL ? 'blur' : 'empty'}
                                    blurDataURL={c.blurDataURL}
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
