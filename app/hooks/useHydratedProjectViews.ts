'use client';

import type { Project as ProjectType } from '@/types/project';
import { useEffect, useMemo, useRef, useState } from 'react';

const MAX_HYDRATION_CACHE = 32;

type HydratedPayload = Pick<ProjectType, 'views' | 'images'>;

const hydrationCache = new Map<string, HydratedPayload>();
const pendingRequests = new Map<string, Promise<HydratedPayload | null>>();

function rememberHydration(projectId: string, payload: HydratedPayload) {
  hydrationCache.set(projectId, payload);
  if (hydrationCache.size <= MAX_HYDRATION_CACHE) return;
  const oldest = hydrationCache.keys().next().value;
  if (oldest) hydrationCache.delete(oldest);
}

async function fetchProjectViews(projectId: string): Promise<HydratedPayload | null> {
  const cached = hydrationCache.get(projectId);
  if (cached) return cached;

  const pending = pendingRequests.get(projectId);
  if (pending) return pending;

  const request = fetch(`/api/project-views/${projectId}`)
    .then((res) => {
      if (!res.ok) throw new Error(`Project hydration failed: ${res.status}`);
      return res.json();
    })
    .then((data: HydratedPayload | null) => {
      if (data) rememberHydration(projectId, data);
      return data;
    })
    .finally(() => {
      pendingRequests.delete(projectId);
    });

  pendingRequests.set(projectId, request);
  return request;
}

export function useHydratedProjectViews(
  project: ProjectType,
  enabled: boolean
): ProjectType {
  const [hydrated, setHydrated] = useState<ProjectType | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const projectRef = useRef(project);
  const retryCountRef = useRef(0);
  projectRef.current = project;

  useEffect(() => {
    setHydrated(null);
    setRetryVersion(0);
    retryCountRef.current = 0;
  }, [project._id]);

  useEffect(() => {
    if (!enabled) return;

    const hasViews = (project.views?.length ?? 0) > 0;
    const hasLegacyImages = (project.images?.length ?? 0) > 0;
    const viewCount = project.viewCount ?? project.views?.length ?? 0;
    const loadedViewCount = project.views?.length ?? 0;
    const viewsIncomplete = viewCount > loadedViewCount;
    const legacyOnlyNeedsViews = !hasViews && hasLegacyImages;

    if (!viewsIncomplete && !legacyOnlyNeedsViews) return;

    const cached = hydrationCache.get(project._id);
    if (cached) {
      const current = projectRef.current;
      setHydrated({
        ...current,
        views: cached.views ?? current.views,
        images: cached.images ?? current.images,
      });
      return;
    }

    let cancelled = false;

    let retryTimer: number | null = null;

    fetchProjectViews(project._id)
      .then((data) => {
        if (cancelled || !data) return;
        const current = projectRef.current;
        setHydrated({
          ...current,
          views: data.views ?? current.views,
          images: data.images ?? current.images,
        });
      })
      .catch(() => {
        if (cancelled || retryCountRef.current >= 2) return;
        retryCountRef.current += 1;
        retryTimer = window.setTimeout(() => {
          if (!cancelled) setRetryVersion((version) => version + 1);
        }, 800 * retryCountRef.current);
      });

    return () => {
      cancelled = true;
      if (retryTimer !== null) window.clearTimeout(retryTimer);
    };
  }, [enabled, project._id, project.images?.length, project.viewCount, project.views?.length, retryVersion]);

  return useMemo(() => hydrated ?? project, [hydrated, project]);
}
