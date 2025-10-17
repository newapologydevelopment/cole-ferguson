// 'use client'

// import { urlFor } from '@/sanity/lib/image'
// import type { ProjectImage } from '@/types/project'
// import Image from 'next/image'

// export function TwoImagesView({ images }: { images: ProjectImage[] }) {
//     const [a, b] = images ?? []
//     const srcA = a ? urlFor(a).url() : ''
//     const srcB = b ? urlFor(b).url() : ''

//     return (
//         <section className="w-full px-[24px]">
//             {/* 24 колонки на всю ширину екрана */}
//             <div className="grid w-full gap-x-[16px] md:gap-x-[32px] [grid-template-columns:repeat(24,minmax(0,1fr))]">
//                 {/* Робоча область: колонки 4..21 (18 колонок) */}
//                 <div className="col-start-[4] col-end-[22] grid gap-x-[16px] md:gap-x-[32px] [grid-template-columns:repeat(18,minmax(0,1fr))]">
//                     {/* Ліва картинка: 9 колонок */}
//                     {a && (
//                         <div className="col-span-9">
//                             <div className="relative w-full aspect-[16/10] overflow-hidden">
//                                 <Image
//                                     src={srcA}
//                                     alt={a.alt || ''}
//                                     fill
//                                     sizes="(min-width:1280px) 42vw, (min-width:768px) 50vw, 100vw"
//                                     placeholder={a.blurDataURL ? 'blur' : 'empty'}
//                                     blurDataURL={a.blurDataURL}
//                                     className="object-cover"
//                                     priority
//                                 />
//                             </div>
//                         </div>
//                     )}

//                     {/* Права картинка: 9 колонок */}
//                     {b && (
//                         <div className="col-span-9">
//                             <div className="relative w-full aspect-[16/10] overflow-hidden">
//                                 <Image
//                                     src={srcB}
//                                     alt={b.alt || ''}
//                                     fill
//                                     sizes="(min-width:1280px) 42vw, (min-width:768px) 50vw, 100vw"
//                                     placeholder={b.blurDataURL ? 'blur' : 'empty'}
//                                     blurDataURL={b.blurDataURL}
//                                     className="object-cover"
//                                 />
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </section>
//     )
// }
'use client'

import { urlFor } from '@/sanity/lib/image'
import type { ProjectImage } from '@/types/project'
import Image from 'next/image'

export function TwoImagesView({ images }: { images: ProjectImage[] }) {
    const [a, b] = images ?? []
    const srcA = a ? urlFor(a).url() : ''
    const srcB = b ? urlFor(b).url() : ''

    return (
        <section className="w-screen px-[24px] flex gap-[60px] ">
            <div className="relative w-full aspect-[16/10] overflow-hidden">
                <Image
                    src={srcA}
                    alt={a.alt || ''}
                    fill
                    sizes="(min-width:1280px) 22vw, (min-width:768px) 50vw, 100vw"
                    placeholder={a.blurDataURL ? 'blur' : 'empty'}
                    blurDataURL={a.blurDataURL}
                    className="object-cover"
                    priority
                />
            </div>

            <div className="relative w-full aspect-[16/10] overflow-hidden">
                <Image
                    src={srcB}
                    alt={b.alt || ''}
                    fill
                    sizes="(min-width:1280px) 22vw, (min-width:768px) 50vw, 100vw"
                    placeholder={b.blurDataURL ? 'blur' : 'empty'}
                    blurDataURL={b.blurDataURL}
                    className="object-cover"
                />
            </div>
        </section>
    )
}
