# Plan 011: Image `onError` fallbacks on portfolio views

> **Executor instructions**: Follow step by step. Verify each step. On STOP, report. Update `plans/README.md` when done.
>
> **Drift check (run first)**: `git diff --stat 0426b50..HEAD -- app/components/SingleImageView.tsx app/components/TwoImagesView.tsx app/components/ThreeImagesView.tsx app/components/SingleViewMobile.tsx app/components/TwoViewMobile.tsx app/components/ThreeViewMobile.tsx`
> On mismatch, STOP.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `0426b50`, 2026-07-11

## Why this matters

Portfolio image components render `null` when `src` is missing and have no `onError` when Sanity CDN 404s/times out. Users see a permanent blank project with no recovery. A minimal fallback (retry once with a simpler URL, then a neutral placeholder) makes failures visible and recoverable.

## Current state

`SingleImageView.tsx:57-85` — builds `src` from `urlFor(...).url()`; if falsy, renders `null` inside the aspect box; no `onError`.

Same pattern in two/three desktop and mobile views (`fetchPriority` / `priority` props present).

There is no shared image error component yet. Match existing styling: white/minimal, no new card UI, no emoji.

## Commands you will need

| Purpose | Command | Expected |
|---------|---------|----------|
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Lint | `npm run lint -- --max-warnings=0 app/components/SingleImageView.tsx app/components/TwoImagesView.tsx app/components/ThreeImagesView.tsx app/components/SingleViewMobile.tsx app/components/TwoViewMobile.tsx app/components/ThreeViewMobile.tsx` | exit 0 |

## Scope

**In scope**:
- The six view components listed above
- Optional new helper `app/components/PortfolioImage.tsx` or `app/components/sanityImageFallback.ts` if it reduces duplication

**Out of scope**:
- Gallery grid components
- Archive images
- Preloader images
- Toast/notification systems

## Git workflow

- Codex branch. **No `main`.**
- Commit: `Add portfolio image error fallbacks`
- No push/PR unless asked.

## Steps

### Step 1: Add a tiny reusable client image wrapper

Create `app/components/PortfolioSanityImage.tsx` (`'use client'`) that wraps `next/image` and:

1. Accepts the same props the views pass today (`loader`, `src`, `alt`, `fill`, `sizes`, `placeholder`, `blurDataURL`, `className`, `priority`, `loading`, `decoding`, `fetchPriority`).
2. On first `onError`, if `src` is non-empty, retry once by setting local state `attempt` and appending a cache-buster query (`cb=1`) **or** re-request via `urlFor` width 1200 quality 70 if original came from loader — keep it simple: retry same `src` once is enough.
3. On second failure, render an empty `div` with `aria-hidden` filling the parent (`bg-transparent` or very light `#f3f3f3`) so layout does not collapse — no error copy required unless easy (`sr-only` “Image unavailable”).

**Verify**: file exists; exports a component used by at least one view.

### Step 2: Swap `<Image>` for the wrapper in all six views

Replace `next/image` usages that load Sanity assets in those files with `PortfolioSanityImage`. Keep layout wrappers unchanged.

For missing `src` (no asset ref), render the same empty fallback box instead of `null` so aspect shells remain.

**Verify**: `rg -n "from 'next/image'|from \"next/image\"" app/components/SingleImageView.tsx app/components/TwoImagesView.tsx app/components/ThreeImagesView.tsx app/components/SingleViewMobile.tsx app/components/TwoViewMobile.tsx app/components/ThreeViewMobile.tsx` → no direct next/image imports left (wrapper imports it).

### Step 3: Typecheck + lint

**Verify**: `npx tsc --noEmit` → 0; lint on touched files → 0.

### Step 4: Manual failure check

Temporarily break one `src` in DevTools (block `cdn.sanity.io`) or force `onError` — fallback box appears; console should not throw. Restore network — new navigations load again (component remount on view change).

## Test plan

- Manual: happy path unchanged for single/two/three desktop + mobile.
- Manual: missing asset ref — no crash, shell remains.

## Done criteria

- [ ] Shared error/retry wrapper exists
- [ ] Six portfolio view files use it
- [ ] Missing src does not hard-crash / does not leave zero-size collapse if parent has aspect class
- [ ] `tsc` + lint exit 0
- [ ] Only in-scope files modified
- [ ] `plans/README.md` 011 → DONE

## STOP conditions

- Wrapper typing fights `next/image` props excessively — use a narrow prop type with the fields listed in Step 1; do not `any` the whole app.
- Tempted to add global error toasts — STOP; out of scope.

## Maintenance notes

- Plan 005 priority rules must still apply through the wrapper (`priority` / `fetchPriority` passthrough).
- Reviewer: ensure no layout shift beyond existing aspect boxes.
