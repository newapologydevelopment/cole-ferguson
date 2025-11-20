'use client';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useBreakpoint } from '../hooks';
import { InformationMobile } from './InformationMobile';

export const MenuMobile = () => {
  const [open, setOpen] = useState(false);
  const [informationOpen, setInformationOpen] = useState(false);
  const pathname = usePathname();
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    setOpen(false);
    setInformationOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!informationOpen) return;

    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0].clientY;
      const diff = startY - endY;

      if (diff > 50) {
        setInformationOpen(false);
      }
    };

    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [informationOpen]);

  return (
    <>
      <div className="fixed left-0 right-0 top-[0] flex items-center justify-between px-[20px] sm:px-[24px] pt-[20px] sm:pt-[24px] pb-[4px] sm:pb-[8px] bg-white z-[10040] xl:hidden pointer-events-none">
        <Link
          href="/"
          className="text-[12px] text-primary-dark relative inline-flex items-center pointer-events-auto"
        >
          <span
            className="relative inline-block overflow-hidden"
            style={{ minWidth: 96 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                
                <motion.span
                  key="cf"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.4, 0.0, 0.2, 1] }}
                  className="absolute left-0 top-0"
                >
                  CF
                </motion.span>
              ) : (
                <motion.span
                  key="full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.4, 0.0, 0.2, 1] }}
                  className="absolute left-0 top-0"
                >
                  Cole Ferguson
                </motion.span>
              )}
            </AnimatePresence>
            <span className="invisible">Cole Ferguson</span>
          </span>
        </Link>
        <div
          onClick={() => setOpen(!open)}
          className=" text-[12px] text-primary-dark bg-white z-[1] relative pointer-events-auto"
        >
          {!open ? 'Menu' : 'Close'}
        </div>
      </div>
      <div className="fixed left-0 right-0 top-0 h-[64px] bg-white md:hidden pointer-events-none" />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: -24 }}
            animate={{ y: 0 }}
            exit={{ y: -24 }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 36,
              mass: 0.25,
            }}
            className="xl:hidden fixed left-[20px] sm:left-[24px] right-[20px] sm:right-[24px] top-[40px] sm:top-[48px] text-[12px] text-primary-dark z-[9998] bg-white will-change-transform pointer-events-auto"
          >
            <div className="flex items-center justify-between relative">
              <Link
                href="/gallery"
                className="py-3 z-[4]"
                onClick={() => setInformationOpen(false)}
              >
                Index
              </Link>

              <Link
                href="/archive"
                className="absolute text-center w-full z-[2]"
                onClick={() => {
                  setInformationOpen(false);
                }}
              >
                Archive
              </Link>
              <button
                type="button"
                className="z-[2]"
                onClick={() => {
                  setOpen(false);
                  if (isMobile) {
                    setInformationOpen(true);
                  } else {
                    window.dispatchEvent(new Event('infoshell:open'));
                  }
                }}
              >
                Information
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Завжди змонтований оверлей, показ/приховування через CSS-транзішени всередині */}
      <InformationMobile
        isOpen={informationOpen}
        onClose={() => setInformationOpen(false)}
      />
    </>
  );
};
