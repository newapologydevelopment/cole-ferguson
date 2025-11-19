/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { urlFor } from '@/sanity/lib/image';
import type { ProjectImage } from '@/types/project';
import Image from 'next/image';

type Ratio = '3:2' | '4:5' | '5:4';
const isRatio = (v: unknown): v is Ratio =>
  v === '3:2' || v === '4:5' || v === '5:4';

type WithWH = { width?: number | null; height?: number | null };
const hasWH = (x: unknown): x is WithWH =>
  !!x &&
  typeof (x as any).width === 'number' &&
  typeof (x as any).height === 'number';

type WithRatio = { ratio?: Ratio };
const hasRatio = (x: unknown): x is WithRatio =>
  !!x && isRatio((x as any).ratio);

function detectRatio(w?: number | null, h?: number | null): Ratio | null {
  if (!w || !h) return null;
  const r = w / h;
  const near = (x: number, y: number, eps = 0.03) => Math.abs(x - y) < eps;
  if (near(r, 3 / 2)) return '3:2';
  if (near(r, 4 / 5)) return '4:5';
  if (near(r, 5 / 4)) return '5:4';
  return null;
}
function getImageRatio(img: unknown): Ratio | null {
  if (hasRatio(img) && img.ratio) return img.ratio;
  if (hasWH(img)) return detectRatio(img.width, img.height);
  return null;
}

type Props = {
  images: ProjectImage[];
  /** 'cover' (кропить, але без спотворень) або 'contain' (без кропу з полями) */
  objectFit?: 'cover' | 'contain';
  className?: string;
};

/** 3 фото в один ряд (по 4 з 12 колонок), кожне з власним aspect-ratio */
export function ThreeViewMobile({
  images,
  objectFit = 'cover',
  className,
}: Props) {
  const [a, b, c] = images ?? [];
  const srcA = a?.asset?._ref
    ? urlFor({ _type: 'image', asset: { _ref: a.asset._ref } }).url()
    : '';
  const srcB = b?.asset?._ref
    ? urlFor({ _type: 'image', asset: { _ref: b.asset._ref } }).url()
    : '';
  const srcC = c?.asset?._ref
    ? urlFor({ _type: 'image', asset: { _ref: c.asset._ref } }).url()
    : '';

  const ra = (getImageRatio(a) ?? '3:2').replace(':', ' / ');
  const rb = (getImageRatio(b) ?? '3:2').replace(':', ' / ');
  const rc = (getImageRatio(c) ?? '3:2').replace(':', ' / ');

  return (
    <section
      className={`sm:hidden w-screen h-full px-[20px] ${className ?? ''}`}
    >
      {/* Центруємо блок по висоті, рядки автоматичні (max-content), а не фіксовані */}
      <div className="grid grid-cols-12 gap-x-[16px] h-full content-center">
        {/* A */}
        <div className="col-span-4 min-w-0">
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: ra }}
          >
            {srcA && (
              <Image
                src={srcA}
                alt={a?.alt || ''}
                fill
                className={
                  objectFit === 'cover' ? 'object-cover' : 'object-contain'
                }
                sizes="(max-width:768px) 33vw, 0px"
                placeholder={a?.blurDataURL ? 'blur' : 'empty'}
                blurDataURL={a?.blurDataURL}
                priority
              />
            )}
          </div>
        </div>

        {/* B */}
        <div className="col-span-4 min-w-0">
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: rb }}
          >
            {srcB && (
              <Image
                src={srcB}
                alt={b?.alt || ''}
                fill
                className={
                  objectFit === 'cover' ? 'object-cover' : 'object-contain'
                }
                sizes="(max-width:768px) 33vw, 0px"
                placeholder={b?.blurDataURL ? 'blur' : 'empty'}
                blurDataURL={b?.blurDataURL}
              />
            )}
          </div>
        </div>

        {/* C */}
        <div className="col-span-4 min-w-0">
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: rc }}
          >
            {srcC && (
              <Image
                src={srcC}
                alt={c?.alt || ''}
                fill
                className={
                  objectFit === 'cover' ? 'object-cover' : 'object-contain'
                }
                sizes="(max-width:768px) 33vw, 0px"
                placeholder={c?.blurDataURL ? 'blur' : 'empty'}
                blurDataURL={c?.blurDataURL}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
