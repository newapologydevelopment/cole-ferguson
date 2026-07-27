'use client';

import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { cn } from '@/utils';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useBreakpoint, useDialogFocus } from '../hooks';
import { CopyableContact } from './CopyableContact';

export function InfoShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { isCompact } = useBreakpoint();
  const [videoHover, setVideoHover] = useState(false);
  const touchStartY = useRef(0);
  const infoPanelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
    setShowVideo(false);
  }, [pathname]);

  const [info, setInfo] = useState({
    title:
      'Cole is a photographer and director living in Los Angeles, California.',
    clients:
      'Nike, Louis Vuitton, Dior, VEVO, Disney, Island Records, Hollywood Records, Red Bull, Vuori, LifeStraw, Olipop, Whitespace, Guayaki Yerba Mate',
    publications:
      "Vanity Fair, Vogue Greece, HYPEBEAST, Men's Health, Vman, People Magazine, US Weekly, E News, Surfing Magazine, Complex, RAP",
    contact: 'studio@coleferguson.com\n@coleferguson',
    videoUrl: '',
    coverImage: null as string | null,
    videoCredit: '',
  });
  const [showVideo, setShowVideo] = useState(false);
  const [allowVideoOverflow, setAllowVideoOverflow] = useState(false);
  const [videoPlaybackBlocked, setVideoPlaybackBlocked] = useState(false);
  const [videoAspectRatio, setVideoAspectRatio] = useState(4 / 3);
  const videoButtonRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeInfo = useCallback(() => setOpen(false), []);
  useDialogFocus(infoPanelRef, closeInfo, open && !showVideo);

  const attemptVideoPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    const playback = video.play();
    if (playback) {
      void playback
        .then(() => setVideoPlaybackBlocked(false))
        .catch(() => setVideoPlaybackBlocked(true));
    }
  }, []);

  useEffect(() => {
    if (!open || !info.videoUrl) return;
    attemptVideoPlayback();
  }, [attemptVideoPlayback, info.videoUrl, open]);

  useEffect(() => {
    if (showVideo) {
      setAllowVideoOverflow(true);
      return;
    }

    const timer = window.setTimeout(() => setAllowVideoOverflow(false), 500);
    return () => window.clearTimeout(timer);
  }, [showVideo]);

  useEffect(() => {
    if (!showVideo) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showVideo]);

  useEffect(() => {
    // fetch once on mount
    client
      .fetch<{
        title?: string;
        clients?: string;
        publications?: string;
        contact?: string;
        video?: string;
        videoFileUrl?: string;
        cover?: { asset?: { _ref?: string } };
        videoCredit?: string;
      }>(
        `*[_type=="information"][0]{ title, clients, publications, contact, video, "videoFileUrl": videoFile.asset->url, cover, videoCredit }`
      )
      .then((doc) => {
        if (!doc) return;
        let coverImageUrl: string | null = null;
        if (doc.cover?.asset?._ref) {
          coverImageUrl = urlFor({
            _type: 'image',
            asset: { _ref: doc.cover.asset._ref },
          })
            .width(800)
            .quality(95)
            .auto('format')
            .fit('max')
            .url();
        }
        setInfo((prev) => ({
          title:
            typeof doc.title === 'string' && doc.title.trim()
              ? doc.title
              : prev.title,
          clients: typeof doc.clients === 'string' ? doc.clients : prev.clients,
          publications:
            typeof doc.publications === 'string'
              ? doc.publications
              : prev.publications,
          contact: typeof doc.contact === 'string' ? doc.contact : prev.contact,
          videoUrl:
            (doc.video && doc.video.trim()) ||
            (doc.videoFileUrl && doc.videoFileUrl.trim()) ||
            prev.videoUrl,
          coverImage: coverImageUrl || prev.coverImage,
          videoCredit:
            typeof doc.videoCredit === 'string' && doc.videoCredit.trim()
              ? doc.videoCredit
              : '',
        }));
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const openHandler = () => setOpen(true);
    const closeHandler = () => setOpen(false);
    const toggleHandler = () => setOpen((o) => !o);
    window.addEventListener('infoshell:open', openHandler as EventListener);
    window.addEventListener('infoshell:close', closeHandler as EventListener);
    window.addEventListener('infoshell:toggle', toggleHandler as EventListener);
    return () => {
      window.removeEventListener(
        'infoshell:open',
        openHandler as EventListener
      );
      window.removeEventListener(
        'infoshell:close',
        closeHandler as EventListener
      );
      window.removeEventListener(
        'infoshell:toggle',
        toggleHandler as EventListener
      );
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('infoshell:state', { detail: { open } })
    );
  }, [open]);

  useEffect(() => {
    if (showVideo) return;

    if (!open) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0) setOpen(false);
    };
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dy = e.touches[0].clientY - touchStartY.current;
      if (dy > 8) setOpen(false);
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [open, showVideo]);

  useGSAP(() => {
    if (isCompact) return;
    const tl = gsap.timeline();
    tl.to(
      '.text',
      {
        height: open ? '48vh' : '0',
        duration: 0.5,
        ease: 'power2.inOut',
      },
      '<'
    )
      .to(
        '.text-info',
        {
          opacity: open ? 1 : 0,
          duration: 0.5,
          ease: 'power2.inOut',
        },
        '<'
      );

    const indexContainer = document.querySelector(
      '[data-index-container]'
    ) as HTMLElement | null;
    const indexLink = document.querySelector(
      '[data-index-link]'
    ) as HTMLElement | null;
    const informationControl = document.querySelector(
      '[data-information-control]'
    ) as HTMLElement | null;
    const brandHeader = document.querySelector(
      '[data-brand-header]'
    ) as HTMLElement | null;
    if (indexContainer && indexLink && informationControl && brandHeader) {
      if (open) {
        const getTextRect = (element: HTMLElement) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return range.getBoundingClientRect();
        };
        const headerTextRect = getTextRect(brandHeader);
        const indexTextRect = getTextRect(indexLink);
        const informationRect = informationControl.getBoundingClientRect();
        const currentIndexY = Number(gsap.getProperty(indexLink, 'y')) || 0;
        const indexTargetY =
          currentIndexY + headerTextRect.bottom + 11 - indexTextRect.top;
        const informationTargetTop = window.innerHeight * 0.5 + 6;

        gsap.set(indexContainer, {
          zIndex: 10002,
          pointerEvents: 'auto',
        });
        gsap.to(indexLink, {
          y: indexTargetY,
          duration: 0.5,
          ease: 'power2.inOut',
        });
        gsap.to(informationControl, {
          y: informationTargetTop - informationRect.top,
          duration: 0.5,
          ease: 'power2.inOut',
        });
      } else {
        gsap.to([indexLink, informationControl], {
          y: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            gsap.set(indexContainer, { zIndex: 3 });
          },
        });
      }
    }
  }, [isCompact, open]);

  useGSAP(() => {
    const videoEl = videoButtonRef.current;
    if (!videoEl) return;

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const rect = videoEl.getBoundingClientRect();

    const widthScale = (viewportWidth * 0.46) / rect.width;
    const heightScale = (viewportHeight * 0.72) / rect.height;
    const scale = Math.min(widthScale, heightScale);

    const targetX = viewportWidth / 2 - (rect.left + rect.width / 2);
    const targetY = viewportHeight / 2 - (rect.top + rect.height / 2);

    if (showVideo) {
      gsap.to(videoEl, {
        x: targetX,
        y: targetY,
        scale,
        transformOrigin: 'center center',
        zIndex: 10052,
        duration: 0.5,
        ease: 'power2.inOut',
      });

      gsap.to('.video-bg', {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.inOut',
      });

      const videoButton = videoEl;
      if (videoButton) {
        videoButton.classList.add('show-text');
        gsap.set(videoButton, {
          '--after-scale': 1 / scale,
        });
        gsap.to(videoButton, {
          '--after-opacity': 1,
          duration: 0.5,
          delay: 0.3,
          ease: 'power2.inOut',
        });
      }
    } else {
      gsap.to(videoEl, {
        x: 0,
        y: 0,
        scale: 1,
        transformOrigin: 'center center',
        duration: 0.5,
        ease: 'power2.inOut',
        clearProps: 'transform,zIndex',
      });

      gsap.to('.video-bg', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
      });

      const videoButton = videoEl;
      if (videoButton) {
        videoButton.classList.remove('show-text');
        gsap.set(videoButton, {
          '--after-opacity': 0,
          '--after-scale': 1,
        });
      }
    }
  }, [showVideo]);

  // Fade out the grid container while video is shown
  useGSAP(() => {
    const selector = '[data-index-container]';
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return;
    if (showVideo) {
      gsap.set(el, { pointerEvents: 'none' });
      gsap.to(el, { opacity: 0, duration: 0.25, ease: 'power2.out' });
    } else {
      gsap.to(el, {
        opacity: 1,
        duration: 0.25,
        ease: 'power2.out',
        onComplete: () => {
          gsap.set(el, { pointerEvents: 'auto' });
        },
      });
    }
  }, [showVideo]);

  if (isCompact) return <>{children}</>;

  return (
    <>
      <div className="relative">
        <div
          className={cn(
            'fixed top-[24px] left-[24px] w-[200px] h-[40px] bg-white opacity-0 z-[10059] video-bg',
            {
              'pointer-events-auto cursor-default': showVideo,
              'pointer-events-none': !showVideo,
            }
          )}
          onClick={(e) => e.stopPropagation()}
        />
        {showVideo && (
          <button
            type="button"
            className="fixed right-[20px] top-[20px] sm:right-6 sm:top-6 z-[10061] cursor-pointer video-bg hover:text-[#717171] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label="Close video"
            data-hide-cursor="true"
            onClick={() => setShowVideo(false)}
          >
            Close
          </button>
        )}

        <div
          className={cn('transition-transform duration-500', {
            '-translate-y-[80vh]': open,
            'pointer-events-none': open,
          })}
        >
          <div
            className={cn(
              'fixed inset-0 bg-white opacity-0 z-[10059] video-bg',
              {
                'pointer-events-auto cursor-default': showVideo,
                'pointer-events-none': !showVideo,
              }
            )}
            onClick={(e) => e.stopPropagation()}
          />
          {children}
        </div>

        <div
          ref={infoPanelRef}
          className={cn(
            'fixed left-0 right-0 bottom-0 transition-[height] duration-500 z-[30] hidden sm:block',
            {
              'pointer-events-auto': open && !showVideo,
              'pointer-events-none': !open || showVideo,
            }
          )}
          style={{ height: open ? '100vh' : '0' }}
          role="dialog"
          aria-modal="true"
          aria-label="Information"
          aria-hidden={!open}
          tabIndex={-1}
          onClick={() => {
            if (open) setOpen(false);
          }}
          data-hide-cursor="true"
        >
          <div
            className={cn(
              'h-full px-[24px] bg-white text-left text-[12px] text-primary-dark hidden sm:block',
              allowVideoOverflow ? 'overflow-visible' : 'overflow-auto'
            )}
          >
            <div
              className={cn(
                'h-0 absolute left-0 right-0 bottom-[24px] grid grid-cols-8 px-[24px] text',
                allowVideoOverflow ? 'overflow-visible' : 'overflow-hidden'
              )}
            >
              <div className="sm:col-start-1 xl:col-start-2 col-end-[-1] flex flex-col justify-between text-info opacity-0">
                <h1 className="text-[64px] leading-[115%] whitespace-pre-line">
                  {info.title}
                </h1>

                <div className="grid grid-cols-20 gap-x-[32px]">
                  <div className="col-start-1 col-span-5 flex flex-col gap-[24px] self-end">
                    <h3>Clients</h3>
                    <p className="text-[16px] leading-[1.5] whitespace-pre-line">
                      {info.clients}
                    </p>
                  </div>

                  <div className="col-span-5 col-start-7 flex flex-col gap-[24px] self-end">
                    <h3>Publications</h3>
                    <p className="text-[16px] leading-[1.5] whitespace-pre-line">
                      {info.publications}
                    </p>
                  </div>

                  <div className="col-span-3 col-start-13 flex flex-col justify-end gap-[24px] self-end min-h-[124px]">
                    <h3>Contact</h3>
                    <p className="text-[16px] leading-[1.5]">
                      <CopyableContact
                        contact={info.contact}
                        lowerEmailOnDesktop
                      />
                    </p>
                  </div>

                  <div
                    className={cn(
                      'fixed inset-0 bg-white opacity-0 z-[60] video-bg',
                      {
                        'pointer-events-auto cursor-default': showVideo,
                        'pointer-events-none': !showVideo,
                      }
                    )}
                    onClick={(e) => e.stopPropagation()}
                  />

                  <button
                    ref={videoButtonRef}
                    type="button"
                    className="video-button absolute bottom-0 right-[24px] z-[60] w-[194px] pointer-events-auto"
                    style={{
                      aspectRatio: showVideo ? videoAspectRatio : 4 / 3,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      attemptVideoPlayback();
                      if (!showVideo) {
                        setAllowVideoOverflow(true);
                        setShowVideo(true);
                      }
                    }}
                    onMouseEnter={() => setVideoHover(true)}
                    onMouseLeave={() => setVideoHover(false)}
                    data-video-credit={info.videoCredit}
                  >
                    {info.videoUrl && (open || showVideo) && (
                      <video
                        ref={videoRef}
                        src={info.videoUrl}
                        poster={info.coverImage ?? undefined}
                        preload="metadata"
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls={false}
                        disablePictureInPicture
                        disableRemotePlayback
                        controlsList="nodownload noplaybackrate nofullscreen"
                        tabIndex={-1}
                        onLoadedMetadata={(event) => {
                          const { videoWidth, videoHeight } =
                            event.currentTarget;
                          if (videoWidth > 0 && videoHeight > 0) {
                            setVideoAspectRatio(videoWidth / videoHeight);
                          }
                          attemptVideoPlayback();
                        }}
                        onCanPlay={attemptVideoPlayback}
                        onPlay={() => setVideoPlaybackBlocked(false)}
                        onPause={() => {
                          if (showVideo) setVideoPlaybackBlocked(true);
                        }}
                        className={cn(
                          'video-button-video video-no-controls pointer-events-none relative select-none transition-opacity duration-300',
                          {
                            'opacity-30 cursor-pointer':
                              videoHover && !showVideo,
                            'is-playing': showVideo,
                            'object-contain': showVideo,
                            'object-cover': !showVideo,
                          }
                        )}
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    )}
                    <div
                      className={cn(
                        'w-full h-full absolute inset-0 flex items-center justify-center text-[12px] opacity-0 transition-opacity duration-300 cursor-pointer',
                        {
                          'opacity-100':
                            (videoHover && !showVideo) ||
                            (videoPlaybackBlocked && showVideo),
                        }
                      )}
                    >
                      {videoPlaybackBlocked && showVideo ? 'Play' : 'Expand'}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
