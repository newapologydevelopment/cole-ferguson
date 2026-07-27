'use client';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { cn } from '@/utils';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDialogFocus } from '../hooks';
import { CopyableContact } from './CopyableContact';

interface Props {
  isOpen: boolean;
  onClose?: () => void;
}

export const InformationMobile: React.FC<Props> = ({ isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState<string>(
    'Cole is a photographer and director living in Los Angeles, California.'
  );
  const [clients, setClients] = useState<string>('');
  const [publications, setPublications] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [coverImage, setCoverImage] = useState<string>('/video-mock.png');
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    // fetch information from Sanity (client-side)
    client
      .fetch<{
        title?: string;
        clients?: string;
        publications?: string;
        contact?: string;
        video?: string;
        videoFileUrl?: string;
        cover?: { asset?: { _ref?: string } };
      }>(
        `*[_type=="information"][0]{ title, clients, publications, contact, video, "videoFileUrl": videoFile.asset->url, cover }`
      )
      .then((doc) => {
        if (!doc) return;
        if (doc.title) setTitle(doc.title);
        if (typeof doc.clients === 'string') setClients(doc.clients);
        if (typeof doc.publications === 'string')
          setPublications(doc.publications);
        if (typeof doc.contact === 'string') setContact(doc.contact);
        const v =
          (doc.video && doc.video.trim()) ||
          (doc.videoFileUrl && doc.videoFileUrl.trim()) ||
          '';
        if (v) setVideoUrl(v);
        if (doc.cover?.asset?._ref) {
          setCoverImage(
            urlFor({
              _type: 'image',
              asset: { _ref: doc.cover.asset._ref },
            })
              .width(1200)
              .quality(85)
              .auto('format')
              .fit('max')
              .url()
          );
        }
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (!isOpen || !videoUrl) return;

    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    void video.play().catch(() => {
      // Mobile browsers can reject autoplay; native controls remain available.
    });
  }, [isOpen, videoUrl]);
  useDialogFocus(dialogRef, onClose, isOpen);
  if (!mounted) return null;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Information"
      aria-hidden={!isOpen}
      tabIndex={-1}
      className={cn(
        'xl:hidden fixed inset-0 overflow-y-auto overscroll-contain bg-white opacity-0 z-[99999] pointer-events-none transition-opacity duration-900 ease-[cubic-bezier(0.22,0.61,0.36,1)]',
        { 'opacity-100 pointer-events-auto': isOpen }
      )}
      style={{
        willChange: 'opacity',
        visibility: isOpen ? 'visible' : 'hidden',
      }}
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close information"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
        className="fixed right-[20px] top-[20px] sm:right-[24px] sm:top-[24px] z-[100000]"
      >
        Close
      </button>
      <div
        className="flex min-h-full flex-col justify-between gap-[48px] pt-[80px] sm:pt-[96px] px-[20px] sm:px-[24px] pb-[24px] text-[12px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h1
          className={cn(
            'max-w-[760px] text-[21px] sm:text-[32px] leading-[130%] transition-opacity duration-500',
            isOpen ? 'opacity-100' : 'opacity-0'
          )}
          style={{ transitionDelay: isOpen ? '120ms' : '0ms' }}
        >
          {title}
        </h1>

        <div
          className={cn(
            'flex flex-col gap-[24px] sm:gap-[32px] transition-opacity duration-500',
            isOpen ? 'opacity-100' : 'opacity-0'
          )}
          style={{ transitionDelay: isOpen ? '200ms' : '0ms' }}
        >
          <div className="grid grid-cols-8">
            <h3 className="col-span-2">Clients</h3>
            <p className="col-start-3 col-span-full whitespace-pre-line">
              {clients}
            </p>
          </div>

          <div className="grid grid-cols-8">
            <h3 className="col-span-2">Publications</h3>
            <p className="col-start-3 col-span-full whitespace-pre-line">
              {publications}
            </p>
          </div>

          <div className="grid grid-cols-8">
            <h3 className="col-span-2">Contact</h3>
            <p className="col-start-3 col-span-full">
              <CopyableContact contact={contact} />
            </p>
          </div>

          <div className="grid grid-cols-8">
            <div
              className={cn(
                'col-start-3 col-span-6 relative h-[195px] sm:h-[280px] md:h-[320px] lg:h-[360px] w-full overflow-hidden transition-opacity duration-500',
                isOpen ? 'opacity-100' : 'opacity-0'
              )}
              style={{ transitionDelay: isOpen ? '280ms' : '0ms' }}
            >
              {videoUrl && isOpen ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  poster={coverImage}
                  className="absolute inset-0 h-full w-full select-none object-contain"
                  preload="metadata"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  disablePictureInPicture
                  controlsList="nodownload noplaybackrate"
                  onCanPlay={(event) => {
                    event.currentTarget.muted = true;
                    event.currentTarget.defaultMuted = true;
                    void event.currentTarget.play().catch(() => {
                      // Native controls remain available if Safari blocks autoplay.
                    });
                  }}
                />
              ) : (
                <Image
                  src={coverImage}
                  alt="Cole Ferguson Studio"
                  fill
                  className="object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
