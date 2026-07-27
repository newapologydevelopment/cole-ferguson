'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Link from 'next/link';
import { useRef } from 'react';
import { useDialogFocus } from '../hooks';

interface Props {
  title?: string;
  close?: () => void;
  children: React.ReactNode;
}

export const LightBox: React.FC<Props> = ({ close, children, title }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useDialogFocus(boxRef, close);

  useGSAP(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline();

    // Загальний fade/scale контейнера
    tl.fromTo(
      boxRef.current,
      { scale: 0.95, opacity: 0 },
      { scale: 1, opacity: 1, ease: 'power1.inOut', duration: 0.25 }
    );

    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    const titleEl = titleRef.current;

    if (titleEl) {
      if (isMobile) {
        // На мобільному: тайтл рухається вниз до позиції тайтлу ProjectMobile (над індикатором)
        const topBase = 24; // початковий top із класу
        const titleH = titleEl.getBoundingClientRect().height || 0;
        const bottomOffset = 48; // ще трохи вище
        const deltaY = Math.max(
          0,
          window.innerHeight - bottomOffset - titleH - topBase
        );
        tl.set(titleEl, { y: 0, opacity: 0 });
        tl.to(
          titleEl,
          {
            y: deltaY,
            opacity: 1,
            ease: 'power2.out',
            duration: 0.6,
          },
          0.05
        );
      } else {
        // Десктоп: як було — з середини до верху
        const startY = Math.max(0, window.innerHeight / 2 - 24);
        tl.set(titleEl, { y: startY, opacity: 1 });
        tl.to({}, { duration: 0.6 });
        tl.to(titleEl, {
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          duration: 0.6,
        });
      }
    }

    tl.fromTo(
      contentRef.current,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, ease: 'power2.out', duration: 0.6 }
    );

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  });

  return (
    <div
      ref={boxRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'gallery-lightbox-title' : undefined}
      aria-label={title ? undefined : 'Project lightbox'}
      tabIndex={-1}
      className="light-box fixed inset-0 z-[10050] flex items-center justify-center bg-white text-primary-dark text-[12px]"
    >
      <button
        type="button"
        onClick={close}
        className="absolute right-[20px] top-[20px] sm:right-6 sm:top-6 z-[102] cursor-pointer hover:text-[#717171] transition-colors duration-300"
        aria-label="Close lightbox"
        data-hide-cursor="true"
      >
        Close
      </button>
      <Link
        href="/"
        className="absolute left-[20px] top-[20px] sm:left-[24px] sm:top-[24px] z-[102] hover:text-[#717171] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2"
        data-hide-cursor="true"
      >
        Cole Ferguson
      </Link>

      <p
        id="gallery-lightbox-title"
        ref={titleRef}
        className="light-box-title absolute top-[24px] left-1/2 -translate-x-1/2 w-full text-center opacity-0 will-change-transform"
      >
        {title}
      </p>

      <div
        ref={contentRef}
        className="light-box-content w-full h-full flex items-center justify-center p-[20px]"
      >
        {children}
      </div>
    </div>
  );
};
