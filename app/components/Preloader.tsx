'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  onDone?: () => void;
  durationMs?: number;
  fadeOutMs?: number;
}

const LOCAL_FALLBACK = [
  '/preloader_images/1.webp',
  '/preloader_images/2.webp',
  '/preloader_images/3.webp',
  '/preloader_images/4.webp',
  '/preloader_images/5.webp',
  '/preloader_images/6.webp',
  '/preloader_images/7.webp',
  '/preloader_images/8.webp',
  '/preloader_images/9.webp',
  '/preloader_images/10.webp',
];

export const Preloader = ({
  onDone,
  durationMs = 1400,
  fadeOutMs = 320,
}: Props) => {
  const images = LOCAL_FALLBACK;

  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);
  const [remainingFramesReady, setRemainingFramesReady] = useState(
    images.length <= 1
  );
  const frameTimerRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const warmedRef = useRef<HTMLImageElement[]>([]);

  const warmRemainingFrames = useCallback(async () => {
    await Promise.allSettled(
      images.slice(1).map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new window.Image();
            img.decoding = 'async';
            if ('fetchPriority' in img) {
              (
                img as HTMLImageElement & { fetchPriority?: string }
              ).fetchPriority = 'auto';
            }

            const finish = async () => {
              try {
                await img.decode();
              } catch {
                // A load/error event is enough to release the sequence. The
                // gate's failsafe still guarantees that the page can proceed.
              }
              resolve();
            };

            img.onload = () => void finish();
            img.onerror = () => resolve();
            img.src = src;
            warmedRef.current.push(img);

            if (img.complete) void finish();
          })
      )
    );
  }, [images]);

  useEffect(() => {
    if (!firstFrameLoaded) return;
    let cancelled = false;

    void warmRemainingFrames().then(() => {
      if (!cancelled) setRemainingFramesReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [firstFrameLoaded, warmRemainingFrames]);

  useEffect(() => {
    if (
      images.length === 0 ||
      !firstFrameLoaded ||
      !remainingFramesReady
    ) {
      return;
    }

    const frameInterval = Math.max(
      50,
      Math.floor((durationMs - fadeOutMs) / images.length)
    );

    if (idx < images.length - 1) {
      frameTimerRef.current = window.setTimeout(() => {
        setIdx((current) => Math.min(current + 1, images.length - 1));
      }, frameInterval);
    } else {
      // Hold the final frame for the same interval as every other frame before
      // fading. A state-driven timeout ensures React paints each index once;
      // a repeating interval could batch multiple ticks after a main-thread
      // stall and visually skip frames.
      frameTimerRef.current = window.setTimeout(() => {
        frameTimerRef.current = null;
        setFading(true);
        fadeTimerRef.current = window.setTimeout(() => {
          setVisible(false);
          onDone?.();
        }, fadeOutMs);
      }, frameInterval);
    }

    return () => {
      if (frameTimerRef.current) {
        clearTimeout(frameTimerRef.current);
        frameTimerRef.current = null;
      }
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
      warmedRef.current = [];
    };
  }, [
    images.length,
    idx,
    durationMs,
    fadeOutMs,
    firstFrameLoaded,
    onDone,
    remainingFramesReady,
  ]);

  if (!visible) return null;

  return (
    <>
      {images.slice(1).map((src) => (
        <link
          key={src}
          rel="preload"
          as="image"
          href={src}
          fetchPriority="low"
        />
      ))}
      <div
        className="fixed inset-0 bg-white flex items-center justify-center z-[2147483647]"
        style={{
          opacity: fading ? 0 : 1,
          transition: fading ? `opacity ${fadeOutMs}ms cubic-bezier(0.22, 1, 0.36, 1)` : 'none',
          willChange: fading ? 'opacity' : 'auto',
        }}
      >
        <div className="relative h-[72px] w-[57px]">
          <Image
            src={images[idx]}
            alt="preloader"
            fill
            unoptimized
            priority
            loading="eager"
            sizes="57px"
            className="object-contain"
            onLoad={() => {
              if (idx === 0) setFirstFrameLoaded(true);
            }}
            onError={() => {
              if (idx === 0) setFirstFrameLoaded(true);
            }}
          />
        </div>
      </div>
    </>
  );
};
