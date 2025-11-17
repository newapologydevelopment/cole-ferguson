'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface Props {
  close?: () => void;
  children: React.ReactNode;
}

export const ArchiveLightBox: React.FC<Props> = ({ close, children }) => {
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
    <div className="light-box text-primary-dark text-[12px] fixed inset-0 bg-white flex items-center justify-center z-[10060]">
      <div
        onClick={close}
        className="absolute top-[24px] right-[24px] cursor-pointer z-[102] hover:text-[#717171] transition-colors duration-300"
        data-hide-cursor="true"
      >
        Close
      </div>
      {children}
    </div>
  );
};
