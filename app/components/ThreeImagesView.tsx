'use client'

import { urlFor } from '@/sanity/lib/image'
import type { ProjectImage } from '@/types/project'
import Image from 'next/image'

export function ThreeImagesView({ images }: { images: ProjectImage[] }) {
    const [a, b, c] = images
    const srcA = a ? urlFor(a).url() : ''
    const srcB = b ? urlFor(b).url() : ''
    const srcC = c ? urlFor(c).url() : ''
    return (
        <div className="grid grid-cols-12 gap-[16px] md:gap-[32px] w-full h-full">
            {a && (
                <div className="col-span-12 md:col-span-4 flex items-center justify-center w-full h-full">
                    <Image
                        src={srcA}
                        alt={a.alt || ''}
                        width={a.width ?? 1200}
                        height={a.height ?? 800}
                        placeholder={a.blurDataURL ? 'blur' : 'empty'}
                        blurDataURL={a.blurDataURL}
                        className="max-w-full max-h-[842px] object-contain"
                    />
                </div>
            )}
            {b && (
                <div className="col-span-12 md:col-span-4 flex items-center justify-center w-full h-full">
                    <Image
                        src={srcB}
                        alt={b.alt || ''}
                        width={b.width ?? 1200}
                        height={b.height ?? 800}
                        placeholder={b.blurDataURL ? 'blur' : 'empty'}
                        blurDataURL={b.blurDataURL}
                        className="max-w-full max-h-[842px] object-contain"
                    />
                </div>
            )}
            {c && (
                <div className="col-span-12 md:col-span-4 flex items-center justify-center w-full h-full">
                    <Image
                        src={srcC}
                        alt={c.alt || ''}
                        width={c.width ?? 1200}
                        height={c.height ?? 800}
                        placeholder={c.blurDataURL ? 'blur' : 'empty'}
                        blurDataURL={c.blurDataURL}
                        className="max-w-full max-h-[842px] object-contain"
                    />
                </div>
            )}
        </div>
    )
}
