'use client';

import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { cn } from '@/utils';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { useBreakpoint } from '../hooks';

export function InfoShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { isMobile } = useBreakpoint();
  const [videoHover, setVideoHover] = useState(false);
  // const [showVideo, setShowVideo] = useState(false)
  const touchStartY = useRef(0);

  // Sanity information (desktop content)
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
  });
  const [showVideo, setShowVideo] = useState(false);
  const videoButtonRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
      }>(
        `*[_type=="information"][0]{ title, clients, publications, contact, video, "videoFileUrl": videoFile.asset->url, cover }`
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
        }));
      })
      .catch(() => {});
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
    const tl = gsap.timeline();
    tl.to(
      '.text',
      {
        height: open ? '48vh' : '0',
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
      )
      .to(
        '.text-btn',
        {
          paddingTop: open ? '38vh' : '0',
          duration: 0.5,
          ease: 'power2.inOut',
        },
        '<'
      );

    const indexContainer = document.querySelector(
      '[data-index-container]'
    ) as HTMLElement | null;
    const brandHeader = document.querySelector(
      '[data-brand-header]'
    ) as HTMLElement | null;
    if (indexContainer && brandHeader) {
      if (open) {
        const headerBottom = brandHeader.getBoundingClientRect().bottom;
        const indexRect = indexContainer.getBoundingClientRect();
        const wrapperDelta = -0.8 * window.innerHeight;
        const gap = 8;
        const targetTop = headerBottom + gap;
        const finalWithoutExtra = indexRect.top + wrapperDelta;
        const extraDelta = targetTop - finalWithoutExtra;

        gsap.set(indexContainer, { zIndex: 40 });
        gsap.to(indexContainer, {
          y: extraDelta,
          duration: 0.5,
          ease: 'power2.inOut',
        });
      } else {
        gsap.to(indexContainer, {
          y: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            gsap.set(indexContainer, { zIndex: 3 });
          },
        });
      }
    }
  }, [open]);

  useGSAP(() => {
    const videoEl = videoButtonRef.current;
    if (!videoEl) return;

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const rect = videoEl.getBoundingClientRect();

    const targetSize = viewportWidth * 0.46;
    const scale = targetSize / rect.width;

    const targetX = viewportWidth / 2 - (rect.left + rect.width / 2);
    const targetY = viewportHeight / 2 - (rect.top + rect.height / 2);

    if (showVideo) {
      document.body.style.overflow = 'hidden';

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
      document.body.style.overflow = 'auto';

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

  if (isMobile) return <div className="sm:hidden p-20px">{children}</div>;

  return (
    <>
      <div className="relative">
        <div className="fixed top-[24px] left-[24px] w-[200px] h-[40px] bg-white opacity-0 pointer-events-none z-[10059] video-bg" />
        <button
          type="button"
          className="fixed right-[20px] top-[20px] sm:right-6 sm:top-6 z-[102] opacity-0 cursor-pointer video-bg hover:text-[#717171] transition-colors duration-300"
          aria-label="Close lightbox"
          data-hide-cursor="true"
          onClick={() => setShowVideo(false)}
        >
          Close
        </button>

        <div
          className={cn('transition-transform duration-500', {
            '-translate-y-[80vh]': open,
            'pointer-events-none': open,
          })}
        >
          <div className="fixed inset-0 bg-white opacity-0 pointer-events-none z-[10059] video-bg" />
          {children}
        </div>

        <div
          className="fixed left-0 right-0 bottom-0 transition-[height] duration-500 cursor-pointer z-[30] hidden sm:block"
          style={{ height: open ? '88vh' : '0' }}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          role="button"
          data-hide-cursor="true"
        >
          <div className="h-full overflow-auto px-[24px] bg-white text-left text-[12px] text-primary-dark hidden sm:block">
            <div
              className="pt-[-24px] text-btn hidden xl:block"
              data-hide-cursor="true"
            >
              Information
            </div>

            <div className="h-[50vh] absolute left-0 right-0 bottom-[24px] grid grid-cols-8 px-[24px] text">
              <div className="sm:col-start-1 xl:col-start-2 col-end-[-1] flex flex-col justify-between text-info opacity-0">
                <h1 className="text-[64px] leading-[115%] whitespace-pre-line">
                  {info.title}
                </h1>

                <div className="grid grid-cols-20 gap-x-[32px]">
                  <div className="col-start-1 col-span-5 flex flex-col gap-[12px] self-end">
                    <h3>Clients</h3>
                    <p className="text-[16px] whitespace-pre-line">
                      {info.clients}
                    </p>
                  </div>

                  <div className="col-span-5 col-start-7 flex flex-col gap-[12px] self-end">
                    <h3>Publications</h3>
                    <p className="text-[16px] whitespace-pre-line">
                      {info.publications}
                    </p>
                  </div>

                  <div className="col-span-3 col-start-13 flex flex-col justify-between self-end min-h-[124px]">
                    <h3>Contact</h3>
                    <p className="text-[16px] whitespace-pre-line">
                      {info.contact}
                    </p>
                  </div>

                  <div className="fixed inset-0 bg-white opacity-0 pointer-events-none z-[60] video-bg" />

                  <button
                    ref={videoButtonRef}
                    type="button"
                    className="video-button absolute bottom-[0] right-[24px] w-[194px] aspectRatio-[4/3] z-[60] pointer-events-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowVideo(true);
                    }}
                    onMouseEnter={() => setVideoHover(true)}
                    onMouseLeave={() => setVideoHover(false)}
                  >
                    {info.videoUrl && (
                      <video
                        ref={videoRef}
                        src={info.videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls={false}
                        className={cn(
                          'video-button-video relative transition-opacity duration-300',
                          {
                            'opacity-30 cursor-pointer':
                              videoHover && !showVideo,
                            'is-playing': showVideo,
                          }
                        )}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                    <div
                      className={cn(
                        'w-full h-full absolute inset-0 flex items-center justify-center text-[12px] opacity-0 transition-opacity duration-300',
                        {
                          'opacity-100': videoHover && !showVideo,
                        }
                      )}
                    >
                      Expand
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
