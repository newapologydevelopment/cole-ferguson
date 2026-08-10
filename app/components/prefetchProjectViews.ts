'use client';

import {
  buildCanonicalSanityUrl,
  getPortfolioSizes,
  resolvePrefetchWidth,
  urlFor,
  type PortfolioViewType,
} from '@/sanity/lib/image';
import type { ProjectView } from '@/types/project';

const MAX_PRELOADED_URLS = 24;

const preloadedUrls = new Set<string>();

const getFirstAssetRef = (v?: ProjectView | null): string | null => {
  const img = v?.images && v.images[0];
  const ref = img?.asset?._ref;
  return typeof ref === 'string' ? ref : null;
};

const getViewType = (v?: ProjectView | null): PortfolioViewType => {
  if (v?._type === 'twoView') return 'twoView';
  if (v?._type === 'threeView') return 'threeView';
  return 'singleView';
};

const getSourceWidth = (v?: ProjectView | null): number | undefined => {
  const width = v?.images?.[0]?.width;
  return typeof width === 'number' ? width : undefined;
};

const buildCdnUrl = (assetRef: string, view: ProjectView): string | null => {
  if (typeof window === 'undefined') return null;

  const isMobile = window.innerWidth < 768;
  const viewType = getViewType(view);
  const sizes = getPortfolioSizes(viewType, isMobile);
  const width = resolvePrefetchWidth(sizes, {
    sourceWidth: getSourceWidth(view),
  });

  try {
    const baseUrl = urlFor({ _type: 'image', asset: { _ref: assetRef } }).url();
    return buildCanonicalSanityUrl(baseUrl, width, {
      sourceWidth: getSourceWidth(view),
    });
  } catch {
    return null;
  }
};

const rememberUrl = (url: string) => {
  preloadedUrls.add(url);
  if (preloadedUrls.size <= MAX_PRELOADED_URLS) return;
  const oldest = preloadedUrls.values().next().value;
  if (oldest) preloadedUrls.delete(oldest);
};

export const preloadProjectView = (views: ProjectView[], viewIndex: number) => {
  const v = views[viewIndex];
  const ref = getFirstAssetRef(v);
  if (!ref) return;

  const url = buildCdnUrl(ref, v);
  if (!url || preloadedUrls.has(url)) return;

  rememberUrl(url);
  const img = new Image();
  img.decoding = 'async';
  if ('fetchPriority' in img) {
    (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = 'low';
  }
  img.src = url;
};

export const preloadAdjacentProjectViews = (
  views: ProjectView[],
  activeIndex: number
) => {
  if (views.length === 0) return;

  const next = (activeIndex + 1) % views.length;
  const prev = (activeIndex - 1 + views.length) % views.length;
  preloadProjectView(views, next);
  preloadProjectView(views, prev);
};

export const preloadInitialProjectViews = (views: ProjectView[]) => {
  if (views.length === 0) return;

  const preloadInitial = () => {
    if (views.length >= 2) preloadProjectView(views, 1);
    if (views.length >= 1) preloadProjectView(views, views.length - 1);
  };

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(preloadInitial);
  } else {
    window.setTimeout(preloadInitial, 0);
  }
};
