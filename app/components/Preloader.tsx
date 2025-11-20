'use client';

import { client } from '@/sanity/lib/client';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Props {
  onDone?: () => void;
  durationMs?: number;
  fadeOutMs?: number;
}

const LOCAL_FALLBACK = [
  '/preloader_images/1.png',
  '/preloader_images/2.png',
  '/preloader_images/3.png',
  '/preloader_images/4.png',
  '/preloader_images/5.png',
  '/preloader_images/6.png',
  '/preloader_images/7.png',
  '/preloader_images/8.png',
  '/preloader_images/9.png',
  '/preloader_images/10.png',
];

export const Preloader = ({
  onDone,
  durationMs = 3000,
  fadeOutMs = 400,
}: Props) => {
  const [remoteImages, setRemoteImages] = useState<string[] | null>(null);
  const images = useMemo(() => {
    if (remoteImages === null) return LOCAL_FALLBACK;
    return remoteImages.length > 0 ? remoteImages : LOCAL_FALLBACK;
  }, [remoteImages]);

  // Завантаження зображень з Sanity (неблокуюче)
  useEffect(() => {
    let cancelled = false;
    client
      .fetch<{ images?: { url?: string }[] }>(
        `*[_type == "preloader"][0]{ images[]{ "url": asset->url } }`
      )
      .then((doc) => {
        if (cancelled) return;
        const urls = doc?.images?.map((i) => i?.url).filter(Boolean) as
          | string[]
          | undefined;
        setRemoteImages(urls && urls.length > 0 ? urls : []);
      })
      .catch(() => {
        if (!cancelled) setRemoteImages([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (images.length === 0) return;

    // Рівномірний інтервал для переключення кадрів
    const frameInterval = Math.max(
      50,
      Math.floor((durationMs - fadeOutMs) / images.length)
    );

    // Переключення кадрів
    intervalRef.current = window.setInterval(() => {
      setIdx((prev) => {
        const next = prev + 1;
        if (next >= images.length) {
          // Останній кадр - починаємо fade out
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setFading(true);
          fadeTimerRef.current = window.setTimeout(() => {
            setVisible(false);
            onDone?.();
          }, fadeOutMs);
          return prev; // Залишаємося на останньому кадрі
        }
        return next;
      });
    }, frameInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
    };
  }, [images.length, durationMs, fadeOutMs, onDone]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 bg-white flex items-center justify-center z-[2147483647]"
      style={{
        opacity: fading ? 0 : 1,
        transition: fading ? `opacity ${fadeOutMs}ms ease-out` : 'none',
      }}
    >
      <Image
        src={images[idx]}
        alt="preloader"
        width={57}
        height={72}
        priority
        className="object-contain"
        style={{ maxWidth: '57px', height: 'auto' }}
      />
    </div>
  );
};
