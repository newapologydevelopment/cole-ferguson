# Plan 004: Restore bounded intra-project view prefetch

> **Executor instructions**: Follow step by step. Verify each step. On STOP, report. Update `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- app/components/Project.tsx app/components/ProjectMobile.tsx`
> On mismatch, STOP. Also compare against staging prefetch if needed: `git show staging:app/components/Project.tsx`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: plans/001-mount-without-isready-gate.md
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-11

## Why this matters

Staging preloaded adjacent view CDN URLs with `new Image()` + `requestIdleCallback`. This branch removed that logic, so prev/next within a multi-view project cold-starts every transition. Restoring **bounded** prefetch (active project only, next/prev/last, `fetchPriority: 'low'`) recovers snappy intra-project navigation without reintroducing all-project eager loading.

## Current state

Branch `app/components/Project.tsx` — no preload helpers; `renderView` only:

```ts
const renderView = (v?: ProjectView | null) => {
  // TwoImagesView / ThreeImagesView / SingleImageView with priority={priorityImages}
};
```

Staging (reference — restore this pattern, adapted):

```ts
const preloadedUrlsRef = useRef<Set<string>>(new Set());
// buildCdnUrl via urlFor(...).width(w).fit('max').auto('format').quality(75)
// preloadView(vi) -> new Image(); fetchPriority='low'; decoding='async'; img.src=url
// idle: preload view 1 and last
// on index change: preload next and prev
```

`urlFor` lives at `@/sanity/lib/image`. Mobile: `app/components/ProjectMobile.tsx` also lacks prefetch.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 app/components/Project.tsx app/components/ProjectMobile.tsx` | exit 0 |

## Scope

**In scope**:
- `app/components/Project.tsx`
- `app/components/ProjectMobile.tsx`

**Out of scope**:
- Changing `sanityLoader` / `next.config.ts`
- Prefetching other projects’ assets from `Home`
- Re-adding default `priority={true}` on all views

## Git workflow

- Stay on Codex branch / advisor cut. **No `main`.**
- Commit: `Restore low-priority adjacent view prefetch`
- No push/PR unless asked.

## Steps

### Step 1: Restore desktop prefetch in `Project.tsx`

1. Import `urlFor` from `@/sanity/lib/image` if not already imported.
2. Port staging helpers: `getFirstAssetRef`, `getWidthFactor`, `buildCdnUrl`, `preloadView`, `preloadedUrlsRef`.
3. Idle-preload view `1` and last view when `views` change.
4. On `index` change, preload `(index±1) % length`.
5. Cap `preloadedUrlsRef` size at 24 URLs (delete oldest insertion order if using Set iteration, or switch to a small Map). Prevents unbounded growth on long view lists.
6. Only run when `priorityImages === true` (active / selection). When `priorityImages` is false (adjacent virtualized mount), skip prefetch entirely so neighbors do not warm their galleries.

**Verify**: `rg -n "preloadView|requestIdleCallback|new Image" app/components/Project.tsx` → all present; `rg -n "priorityImages" app/components/Project.tsx` → prefetch gated.

### Step 2: Mirror on `ProjectMobile.tsx`

Apply the same gated prefetch helpers (extract shared helper only if duplication exceeds ~40 lines and both files stay clear — prefer a tiny `app/components/prefetchProjectViews.ts` if extracting). Still gate on `priorityImages`.

**Verify**: mobile file (or shared helper) prefetches; lint clean.

### Step 3: Avoid duplicate full-res originals

`buildCdnUrl` must continue to set width from `window.innerWidth * factor` with factors ≈ `0.6` / `0.42` / `0.28` for single/two/three — matching staging. Do not prefetch bare untransformed URLs.

**Verify**: `rg -n "\.width\(|quality\(75\)|auto\('format'\)" app/components/Project.tsx` (or helper) → present.

### Step 4: Manual check

Open a project with ≥3 views. Click next twice. Second transition should not wait on a cold CDN hit as long as the first. Network: prefetch requests use low priority; only active project prefetches.

## Test plan

- Manual: project with one view — no errors; idle effect no-ops safely.
- Manual: inactive adjacent project mounted via ±2 window — no prefetch network spam.

## Done criteria

- [ ] Active `Project` / `ProjectMobile` prefetch next/prev (and initial 1 + last)
- [ ] Prefetch skipped when `priorityImages` is false
- [ ] URL set capped
- [ ] `npx tsc --noEmit` exits 0; lint in-scope exits 0
- [ ] Only in-scope files (optional shared helper under `app/components/`) modified
- [ ] `plans/README.md` 004 → DONE

## STOP conditions

- Prefetch URLs fight `sanityLoader` sizes so badly that images flicker/reload — report; consider matching loader width formula before shipping.
- Feels necessary to prefetch all views in the project — STOP; keep adjacent only.

## Maintenance notes

- If view image counts grow, consider prefetching all images in a two/three view, not just first — deferred.
- Reviewer: ensure `any` casts for `fetchPriority` match staging style or use proper typing without `@ts-ignore` sprawl.
