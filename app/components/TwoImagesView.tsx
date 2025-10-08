'use client'

import { urlFor } from '@/sanity/lib/image'
import type { ProjectImage } from '@/types/project'
import Image from 'next/image'

export function TwoImagesView({ images }: { images: ProjectImage[] }) {
    const [a, b] = images
    const srcA = a ? urlFor(a).url() : ''
    const srcB = b ? urlFor(b).url() : ''
    return (
        <div className="grid grid-cols-12 gap-[8px] md:gap-[16px] w-full h-full">
            {a && (
                <div className="col-span-12 md:col-span-5 flex items-center justify-center w-full">
                    <div className="relative h-[500px] w-full overflow-hidden">
                        <Image
                            src={srcA}
                            alt={a.alt || ''}
                            fill
                            sizes="(min-width:768px) 50vw, 100vw"
                            placeholder={a.blurDataURL ? 'blur' : 'empty'}
                            blurDataURL={a.blurDataURL}
                            className="object-cover"
                        />
                    </div>
                </div>
            )}
            {b && (
                <div className="col-span-12 md:col-span-7 flex items-center justify-center w-full">
                    <div className="relative h-[500px] w-full overflow-hidden">
                        <Image
                            src={srcB}
                            alt={b.alt || ''}
                            fill
                            sizes="(min-width:768px) 50vw, 100vw"
                            placeholder={b.blurDataURL ? 'blur' : 'empty'}
                            blurDataURL={b.blurDataURL}
                            className="object-cover"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
