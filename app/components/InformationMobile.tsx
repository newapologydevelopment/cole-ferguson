"use client"
import { client } from "@/sanity/lib/client"
import { cn } from "@/utils"
import Image from "next/image"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface Props {
    isOpen: boolean
    onClose?: () => void
}

export const InformationMobile: React.FC<Props> = ({ isOpen, onClose }) => {
    const [mounted, setMounted] = useState(false)
    const [title, setTitle] = useState<string>("Cole is a photographer and director living in Los Angeles, California.")
    const [clients, setClients] = useState<string>("")
    const [publications, setPublications] = useState<string>("")
    const [contact, setContact] = useState<string>("")
    const [videoUrl, setVideoUrl] = useState<string>("")
    useEffect(() => { setMounted(true) }, [])
    useEffect(() => {
        // fetch information from Sanity (client-side)
        client.fetch<{ title?: string; clients?: string; publications?: string; contact?: string; video?: string; videoFileUrl?: string }>(
            `*[_type=="information"][0]{ title, clients, publications, contact, video, "videoFileUrl": videoFile.asset->url }`
        ).then((doc) => {
            if (!doc) return
            if (doc.title) setTitle(doc.title)
            if (typeof doc.clients === 'string') setClients(doc.clients)
            if (typeof doc.publications === 'string') setPublications(doc.publications)
            if (typeof doc.contact === 'string') setContact(doc.contact)
            const v = (doc.video && doc.video.trim()) || (doc.videoFileUrl && doc.videoFileUrl.trim()) || ""
            if (v) setVideoUrl(v)
        }).catch(() => { })
    }, [])
    if (!mounted) return null

    return createPortal(
        <div
            className={cn(
                "sm:hidden fixed inset-0 bg-white opacity-0 z-[99999] pointer-events-none transition-opacity duration-900 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
                { "opacity-100 pointer-events-auto": isOpen }
            )}
            style={{ willChange: 'opacity' }}
            onClick={onClose}
        >
            <button
                type="button"
                aria-label="Close information"
                onClick={(e) => { e.stopPropagation(); onClose?.() }}
                className="absolute right-[20px] top-[20px] z-[100000]"
            >
                Close
            </button>
            <div
                className="flex flex-col justify-between h-full pt-[80px] px-[20px] pb-[24px] text-[12px]"
                onClick={(e) => e.stopPropagation()}
            >
                <h1
                    className={cn(
                        "text-[21px] leading-[130%] transition-opacity duration-500",
                        isOpen ? "opacity-100" : "opacity-0"
                    )}
                    style={{ transitionDelay: isOpen ? '120ms' : '0ms' }}
                >
                    {title}
                </h1>

                <div
                    className={cn(
                        "flex flex-col gap-[24px] transition-opacity duration-500",
                        isOpen ? "opacity-100" : "opacity-0"
                    )}
                    style={{ transitionDelay: isOpen ? '200ms' : '0ms' }}
                >
                    <div className="grid grid-cols-8">
                        <h3 className="col-span-2">Clients</h3>
                        <p className="col-start-3 col-span-full whitespace-pre-line">{clients}</p>
                    </div>

                    <div className="grid grid-cols-8">
                        <h3 className="col-span-2">Publications</h3>
                        <p className="col-start-3 col-span-full whitespace-pre-line">{publications}</p>
                    </div>

                    <div className="grid grid-cols-8">
                        <h3 className="col-span-2">Contact</h3>
                        <p className="col-start-3 col-span-full whitespace-pre-line">{contact}</p>
                    </div>

                    <div className="grid grid-cols-8">
                        <div
                            className={cn(
                                'col-start-3 col-span-6 relative h-[195px] w-full overflow-hidden transition-opacity duration-500',
                                isOpen ? 'opacity-100' : 'opacity-0'
                            )}
                            style={{ transitionDelay: isOpen ? '280ms' : '0ms' }}
                        >
                            {videoUrl ? (
                                <video
                                    src={videoUrl}
                                    className='absolute inset-0 w-full h-full object-cover'
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    controls={false}
                                />
                            ) : (
                                <Image src="/video-mock.png" alt="Cole Ferguson Studio" fill className='object-cover' />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
