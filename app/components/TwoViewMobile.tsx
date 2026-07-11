'use client';

import { sanityLoader, urlFor } from '@/sanity/lib/image';
import type { ProjectImage } from '@/types/project';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type Props = {
  images: ProjectImage[];
  className?: string;
  disableFade?: boolean;
  priority?: boolean;
};

// Визначення aspect-ratio (аналогічно десктопній логіці)
type Ratio = '3:2' | '4:5' | '5:4';
const isRatio = (v: unknown): v is Ratio =>
  v === '3:2' || v === '4:5' || v === '5:4';
type WithWH = { width?: number | null; height?: number | null };
const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;
const hasWH = (x: unknown): x is WithWH => {
  if (!isObject(x)) return false;
  const { width, height } = x as { width?: unknown; height?: unknown };
  return typeof width === 'number' && typeof height === 'number';
};
type WithRatio = { ratio?: Ratio };
const hasRatio = (x: unknown): x is WithRatio => {
  if (!isObject(x)) return false;
  const { ratio } = x as { ratio?: unknown };
  return isRatio(ratio);
};
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

/**
 * Mobile TwoImagesView (fade in after layout)
 * — спочатку все рендериться непомітно, потім плавно проявляється
 */
export function TwoViewMobile({
  images,
  className,
  disableFade = false,
  priority = true,
}: Props) {
  const [a, b] = images ?? [];
  const [ready, setReady] = useState(disableFade ? true : false);

  const srcA = a?.asset?._ref
    ? urlFor({ _type: 'image', asset: { _ref: a.asset._ref } }).url()
    : '';
  const srcB = b?.asset?._ref
    ? urlFor({ _type: 'image', asset: { _ref: b.asset._ref } }).url()
    : '';

  const ra = getImageRatio(a);
  const rb = getImageRatio(b);
  const sameRatio = !!(ra && rb && ra === rb);
  const ASPECT_BY_RATIO: Record<Ratio, string> = {
    '3:2': 'aspect-[3/2]',
    '4:5': 'aspect-[4/5]',
    '5:4': 'aspect-[5/4]',
  };

  // однакова висота контейнерів для уникнення стрибків між різними aspect-ratio
  const PAIR_H = 'h-[clamp(220px,52vh,540px)]';
  const MIXED_H = 'h-[320px]';

  // після першого layout — показуємо блок (якщо fade не вимкнений)
  useEffect(() => {
    if (disableFade) return;
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [disableFade]);

  // 12-колонкова сітка для міксу 4:5 | 5:4 (5/7), інакше 8 колонок (4/4)
  const isMixed45 =
    (ra === '4:5' && rb === '5:4') || (ra === '5:4' && rb === '4:5');
  const gridCols = isMixed45 ? 'grid-cols-12' : 'grid-cols-8';
  let aCol = isMixed45 ? 'col-span-5' : 'col-span-4';
  let bCol = isMixed45 ? 'col-span-7' : 'col-span-4';
  if (isMixed45) {
    if (ra === '5:4' && rb === '4:5') {
      aCol = 'col-span-7';
      bCol = 'col-span-5';
    }
  }

  // висота: для міксу — фіксована 320px, для решти — як було (aspect або PAIR_H)
  const aHCls = isMixed45
    ? MIXED_H
    : sameRatio && ra
      ? ASPECT_BY_RATIO[ra]
      : PAIR_H;
  const bHCls = isMixed45
    ? MIXED_H
    : sameRatio && rb
      ? ASPECT_BY_RATIO[rb]
      : PAIR_H;

  return (
    <section
      className={`sm:hidden w-full h-full  overflow-hidden ${disableFade ? 'opacity-100' : 'transition-opacity duration-300 ease-out'} ${
        ready ? 'opacity-100' : disableFade ? 'opacity-100' : 'opacity-0'
      } ${className ?? ''}`}
      style={{ contain: 'layout paint' }}
    >
      <div className="h-full flex items-center">
        <div className={`grid ${gridCols} gap-x-[16px] w-full`}>
          {/* A */}
          <div className={aCol}>
            <div className={`relative w-full overflow-hidden ${aHCls} min-w-0`}>
              {srcA && (
                <Image
                  loader={sanityLoader}
                  src={srcA}
                  alt={a?.alt || ''}
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 768px) 50vw, 0px"
                  placeholder={a?.blurDataURL ? 'blur' : 'empty'}
                  blurDataURL={a?.blurDataURL}
                  priority={priority}
                  loading={priority ? 'eager' : 'lazy'}
                  fetchPriority={priority ? 'high' : 'low'}
                />
              )}
            </div>
          </div>

          {/* B */}
          <div className={bCol}>
            <div className={`relative w-full overflow-hidden ${bHCls} min-w-0`}>
              {srcB && (
                <Image
                  loader={sanityLoader}
                  src={srcB}
                  alt={b?.alt || ''}
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 768px) 50vw, 0px"
                  placeholder={b?.blurDataURL ? 'blur' : 'empty'}
                  blurDataURL={b?.blurDataURL}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
