'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Link from 'next/link';
import { useRef } from 'react';
import { useDialogFocus } from '../hooks';

interface Props {
  close?: () => void;
  children: React.ReactNode;
}

export const ArchiveLightBox: React.FC<Props> = ({ close, children }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  useDialogFocus(boxRef, close);
  useGSAP(() => {
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    if (isMobile) {
      gsap.fromTo(
        '.light-box',
        { opacity: 0, scale: 1 },
        { opacity: 1, ease: 'power1.out', duration: 0.25 }
      );
    } else {
      gsap.fromTo(
        '.light-box',
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, ease: 'power1.inOut', duration: 0.2 }
      );
    }
  }, []);

  return (
    <div
      ref={boxRef}
      role="dialog"
      aria-modal="true"
      aria-label="Archive project"
      tabIndex={-1}
      className="light-box text-primary-dark text-[12px] fixed inset-0 bg-white flex items-center justify-center z-[10060]"
    >
      <button
        type="button"
        onClick={close}
        className="absolute top-[24px] right-[24px] cursor-pointer z-[102] hover:text-[#717171] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2"
        data-hide-cursor="true"
        aria-label="Close archive project"
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
      {children}
    </div>
  );
};
